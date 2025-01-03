import { Mutation, Query, Resolver, Arg } from "type-graphql";
import {
  InitializePaymentInput,
  InitializePaymentPayStackResponse,
} from "../typeDefs/payment.types";
import paymentService, { PaymentService } from "../../services/payment.service";
import { PROVIDERS } from "../../types";
import { Payment } from "../../entities/payment.entity";

@Resolver()
export class PaymentResolver {
  private readonly paymentService: PaymentService;
  constructor() {
    this.paymentService = paymentService;
  }
  @Query(() => String)
  hello() {
    return "hello";
  }

  @Mutation(() => InitializePaymentPayStackResponse)
  async initializePaymentForTicketType(
    @Arg("data") data: InitializePaymentInput
  ) {
    const { email, ticketTypeId, provider } = data;
    return await this.paymentService.initializePaymentForTicketType(
      ticketTypeId,
      email,
      provider
    );
  }

  @Mutation(() => Payment)
  async verifyPaymentForTicketType(
    @Arg("reference") reference: string,
    @Arg("provider", () => PROVIDERS) provider: PROVIDERS
  ) {
    return await this.paymentService.verifyPaymentForTicketType(
      reference,
      provider
    );
  }
}
