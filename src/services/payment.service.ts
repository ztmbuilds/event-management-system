import { TicketType } from "../entities/ticket-type.entity";
import { AbstractPaymentService, PROVIDERS } from "../types";
import { PaystackTransactionInitializedData } from "../graphql/typeDefs/payment.types";
import { BadRequestError, NotFoundError } from "../utils/error";
import { TransactionHandler } from "../utils/transaction";
import { PaystackService } from "./paystack.service";
import paymentRepositorty, {
  PaymentRepository,
} from "../repositories/payment.repository";

interface PaymentServices {
  [PROVIDERS.PAYSTACK]: AbstractPaymentService<PaystackTransactionInitializedData>;
}
export class PaymentService {
  private readonly paymentServices: PaymentServices;
  private readonly paymentRepository: PaymentRepository;

  constructor() {
    this.paymentServices = {
      [PROVIDERS.PAYSTACK]: new PaystackService(),
    };

    this.paymentRepository = paymentRepositorty;
  }

  async initializePaymentForTicketType(
    ticketTypeId: string,
    email: string,
    provider: PROVIDERS
  ) {
    const transactionHandler = new TransactionHandler();
    await transactionHandler.startTransaction("SERIALIZABLE");

    return transactionHandler.executeInTransaction(
      async (transactionalEntityManager) => {
        const ticketType = await transactionalEntityManager.findOne(
          TicketType,
          {
            where: {
              id: ticketTypeId,
            },
          }
        );

        if (!ticketType) throw new NotFoundError("ticketType not found");

        const providerService = this.paymentServices[provider];

        if (!providerService)
          throw new BadRequestError("Unsupported payment method");

        const { payment, data } = await providerService.initializePayment(
          ticketType,
          email
        );

        ticketType.availableQuantity -= 1;

        await transactionalEntityManager.save(ticketType);
        await transactionalEntityManager.save(payment);

        return { payment, data };
      }
    );
  }

  async verifyPaymentForTicketType(reference: string, provider: PROVIDERS) {
    const providerService = this.paymentServices[provider];

    if (!providerService)
      throw new BadRequestError("Unsupported payment method");

    return await providerService.verifyPayment(reference);
  }

  async getPaymentByCode(code: string) {
    const payment = await this.paymentRepository.findOne({
      where: {
        code,
      },
    });
    return payment ? payment : null;
  }
}
