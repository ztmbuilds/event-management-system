import { Paystack } from "paystack-sdk";
import { Payment, PaymentStatus } from "../entities/payment.entity";
import {
  AbstractPaymentService,
  PROVIDERS,
  PaystackWebhookEvent,
} from "../types";
import { PaystackTransactionInitializedData } from "../graphql/typeDefs/payment.types";
import { PAYSTACK_SECRET_KEY } from "../config";
import {
  BadRequestError,
  ConflictError,
  InternalServerError,
  NotFoundError,
} from "../utils/error";
import paymentRepository, {
  PaymentRepository,
} from "../repositories/payment.repository";
import { v4 as uuidv4 } from "uuid";
import crypto from "node:crypto";
import { TicketType } from "../entities/ticket-type.entity";
import { TransactionHandler } from "../utils/transaction";

export class PaystackService
  implements AbstractPaymentService<PaystackTransactionInitializedData>
{
  readonly paystack: Paystack;

  constructor(private readonly paymentRepository: PaymentRepository) {
    this.paystack = new Paystack(PAYSTACK_SECRET_KEY);
  }
  async initializePayment(ticketType: TicketType, email: string) {
    const response = await this.paystack.transaction.initialize({
      email,
      amount: `${Number(ticketType.price) * 100}`, //Paystack expects amount in kobo,
      currency: "NGN",
    });

    if (!response.status) throw new InternalServerError();

    const payment = new Payment();
    payment.email = email;
    payment.amount = ticketType.price;
    payment.ticketTypeId = ticketType.id;
    payment.provider_reference = response.data.reference;
    payment.provider = PROVIDERS.PAYSTACK;
    payment.tx_reference = `pst-${uuidv4()}-${Date.now()}`;
    payment.metadata = response;

    return { payment, data: response.data };
  }

  async verifyPaymentWebhook(event: PaystackWebhookEvent) {
    try {
      if (event.event !== "charge.success") {
        return; // only working with 'Transaction successful' event for now so acknowledge everything else
      }
      const reference = event.data.reference;

      const transactionHandler = new TransactionHandler();
      await transactionHandler.startTransaction("SERIALIZABLE");
      transactionHandler.executeInTransaction(
        async (transactionalEntityManager) => {
          const payment = await transactionalEntityManager.findOne(Payment, {
            where: {
              provider_reference: reference,
            },
          });

          payment.code = String(crypto.randomBytes(4).toString("hex"));
          payment.status = PaymentStatus.COMPLETED;

          await transactionalEntityManager.save(payment);
        }
      );
    } catch (err) {
      console.error("Error verifying payment webhook:", err);
      throw err;
    }
  }

  async verifyPayment(reference: string) {
    const response = await this.paystack.transaction.verify(reference);

    if (!response.status) throw new InternalServerError();

    const transactionHandler = new TransactionHandler();

    await transactionHandler.startTransaction("SERIALIZABLE");

    return transactionHandler.executeInTransaction(
      async (transactionalEntityManager) => {
        const payment = await transactionalEntityManager.findOne(Payment, {
          where: {
            provider_reference: reference,
          },
        });

        if (!payment) throw new NotFoundError("Payment not found");

        const status = response.data.status;

        const failed = ["abandoned", "failed", "reversed"];
        const pending = ["ongoing", "pending", "processing", "queued"];

        payment.status =
          status === "success"
            ? PaymentStatus.COMPLETED
            : pending.includes(status)
            ? PaymentStatus.PENDING
            : failed.includes(status)
            ? PaymentStatus.FAILED
            : PaymentStatus.FAILED;

        const ticketType = await transactionalEntityManager.findOne(
          TicketType,
          {
            where: {
              id: payment.ticketTypeId,
            },
          }
        );

        if (!ticketType) throw new NotFoundError("No ticketType found");

        if (payment.status === PaymentStatus.FAILED) {
          ticketType.availableQuantity += 1;
        }

        if (response.data.amount < Number(ticketType.price))
          throw new ConflictError("Amount paid is less than ticketType price");

        payment.code = String(crypto.randomBytes(4).toString("hex"));

        await transactionalEntityManager.save(ticketType);
        await transactionalEntityManager.save(payment);

        return payment;
      }
    );
  }
}

export default new PaystackService(paymentRepository);
