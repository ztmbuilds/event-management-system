import { Payment } from "../entities/payment.entity";
import { AbstractRepository } from "./abstract.repository";

export class PaymentRepository extends AbstractRepository<Payment> {}

export default new PaymentRepository(Payment);
