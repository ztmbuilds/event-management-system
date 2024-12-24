import { Payment } from "../entities/payment.entity";
import { TicketType } from "../entities/ticket-type.entity";

export interface IUserSignup {
  name: string;
  email: string;
  password: string;
}

export interface IUserLogin {
  email: string;
  password: string;
}

export interface PaginatedArgs<E> {
  page?: number;
  size?: number;
  order?: "ASC" | "DESC";
  orderBy?: E;
}

export abstract class AbstractPaymentService<T> {
  abstract initializePayment(
    ticketType: TicketType,
    email: string
  ): Promise<{ payment: Payment; data: T }>;
  abstract verifyPaymentWebhook(event: PaystackWebhookEvent): Promise<void>;
  abstract verifyPayment(reference: string): Promise<void | Payment>;
}

export enum PROVIDERS {
  PAYSTACK = "paystack",
}

export interface PaystackWebhookEvent {
  event: string;
  data: {
    status: string;
    reference: string;
    amount: number;
  };
}
