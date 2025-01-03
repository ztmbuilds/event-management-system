import { PaymentRepository } from "../src/repositories/payment.repository";
import { PaymentService } from "../src/services/payment.service";
import { PROVIDERS } from "../src/types";
import { TicketType } from "../src/entities/ticket-type.entity";
import { PaystackService } from "../src/services/paystack.service";

import { mockQueryRunner, mockManager } from "./mocks/transaction";
import { Payment } from "../src/entities/payment.entity";
jest.mock("../src/database", () => ({
  AppDataSource: {
    createQueryRunner: jest.fn().mockImplementation(() => mockQueryRunner),
  },
}));

const mockPaystackTransaction = {
  initialize: jest.fn(),
  verify: jest.fn(),
};
jest.mock("paystack-sdk", () => {
  return {
    Paystack: jest.fn().mockImplementation(() => {
      return {
        transaction: mockPaystackTransaction,
      };
    }),
  };
});

const mockPaymentRepository = jest.fn();

describe("Payment Service", () => {
  let paymentService: PaymentService;
  let ticketType = new TicketType();
  beforeEach(() => {
    const data: Partial<TicketType> = {
      availableQuantity: 3,
      price: "1000",
      id: "id",
    };
    Object.assign(ticketType, data);
    paymentService = new PaymentService(
      mockPaymentRepository as unknown as PaymentRepository
    );
  });

  describe("initialize payment", () => {
    it("should initialize Payment for a ticketType if ticketType is found and payment method is valid", async () => {
      mockManager.findOne.mockResolvedValueOnce(ticketType);
      mockPaystackTransaction.initialize.mockResolvedValueOnce({
        status: true,
        data: {
          reference: "reference",
        },
      });
      const paystackInitializePayment = jest.spyOn(
        PaystackService.prototype,
        "initializePayment"
      );

      await paymentService.initializePaymentForTicketType(
        "id",
        "email",
        PROVIDERS.PAYSTACK
      );
      expect(paystackInitializePayment).toHaveBeenCalledWith(
        ticketType,
        "email"
      );
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(ticketType.availableQuantity).toEqual(2);
    });

    it("should throw error and rollback if ticketType is not found", async () => {
      mockManager.findOne.mockResolvedValueOnce(null);

      const paystackInitializePayment = jest.spyOn(
        PaystackService.prototype,
        "initializePayment"
      );

      await expect(
        paymentService.initializePaymentForTicketType(
          "id",
          "email",
          PROVIDERS.PAYSTACK
        )
      ).rejects.toThrow();

      expect(paystackInitializePayment).not.toHaveBeenCalled();
      expect(ticketType.availableQuantity).toEqual(3);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });

    it("should throw error and rollback if provider is unsupported", async () => {
      mockManager.findOne.mockResolvedValueOnce(ticketType);

      const paystackInitializePayment = jest.spyOn(
        PaystackService.prototype,
        "initializePayment"
      );
      await expect(
        paymentService.initializePaymentForTicketType(
          "id",
          "email",
          "stripe" as PROVIDERS
        )
      ).rejects.toThrow();

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(paystackInitializePayment).not.toHaveBeenCalled();
      expect(ticketType.availableQuantity).toEqual(3);
      expect(mockManager.save).not.toHaveBeenCalled();
    });
  });

  describe("verify payment", () => {
    it("should throw error if provider is unsupported", async () => {
      const paystackVerifyPayment = jest.spyOn(
        PaystackService.prototype,
        "verifyPayment"
      );

      await expect(
        paymentService.verifyPaymentForTicketType(
          "reference",
          "stripe" as PROVIDERS
        )
      ).rejects.toThrow();

      expect(paystackVerifyPayment).not.toHaveBeenCalled();
    });

    it("should verify and return payment if provider is supported ", async () => {
      mockPaystackTransaction.verify.mockResolvedValueOnce({
        status: true,
        data: {
          status: "success",
          amount: 1000,
        },
      });

      mockManager.findOne.mockResolvedValueOnce({}).mockResolvedValueOnce({
        price: "1000",
      });

      const result = (await paymentService.verifyPaymentForTicketType(
        "reference",
        PROVIDERS.PAYSTACK
      )) as Payment;

      expect(result.status).toBeDefined();
      expect(result.code).toBeDefined();
      expect(mockManager.save).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });
  });
});
