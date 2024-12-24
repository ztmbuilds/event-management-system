import { IsEmail } from "class-validator";
import { Field, InputType, ObjectType, registerEnumType } from "type-graphql";
import { PROVIDERS } from "../../types";
import { Payment } from "../../entities/payment.entity";

registerEnumType(PROVIDERS, {
  name: "PROVIDERS",
});

@InputType()
export class InitializePaymentInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  ticketTypeId: string;

  @Field(() => PROVIDERS)
  provider: PROVIDERS;
}

@ObjectType()
export class PaystackTransactionInitializedData {
  @Field()
  authorization_url: string;

  @Field()
  access_code: string;

  @Field()
  reference: string;
}

@ObjectType()
export class InitializePaymentPayStackResponse {
  @Field()
  payment: Payment;

  @Field(() => PaystackTransactionInitializedData)
  data: PaystackTransactionInitializedData;
}
