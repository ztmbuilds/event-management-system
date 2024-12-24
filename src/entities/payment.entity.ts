import { Column, Entity, ManyToOne } from "typeorm";
import { AbstractEntity } from "./abstract.entity";

import { TicketType } from "./ticket-type.entity";
import { Attendee } from "./attendee.entity";
import { PROVIDERS } from "../types";
import { Field, ObjectType, registerEnumType } from "type-graphql";

export enum PaymentStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
}

registerEnumType(PaymentStatus, {
  name: "PaymentStatus",
});

registerEnumType(PROVIDERS, {
  name: "PROVIDERS",
});

@ObjectType()
@Entity("payments")
export class Payment extends AbstractEntity {
  @Field()
  @Column()
  email: string;

  @Field(() => Attendee, { nullable: true })
  @ManyToOne(() => Attendee, { nullable: true })
  attendee: Attendee;

  @Column({ nullable: true })
  attendeeId: string;

  @Field(() => TicketType)
  @ManyToOne(() => TicketType)
  ticketType: TicketType;

  @Column()
  ticketTypeId: string;

  @Field()
  @Column({ type: "numeric", precision: 10, scale: 2 })
  amount: string;

  @Field(() => PaymentStatus)
  @Column({
    type: "enum",
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Field(() => PROVIDERS)
  @Column({
    type: "enum",
    enum: PROVIDERS,
  })
  provider: PROVIDERS;

  @Field()
  @Column()
  tx_reference: string;

  @Field()
  @Column()
  provider_reference: string;

  @Column({ type: "jsonb" })
  metadata: object;

  @Field({ nullable: true })
  @Column({ nullable: true })
  code: string;
}
