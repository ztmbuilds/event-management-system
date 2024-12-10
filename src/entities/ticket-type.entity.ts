import { Entity, Column, ManyToOne, OneToMany } from "typeorm";
import { ObjectType, Field, Float, Int } from "type-graphql";
import { AbstractEntity } from "./abstract.entity";
import { Event } from "./event.entity";
import { Attendee } from "./attendee.entity";

@ObjectType()
@Entity("ticket_types")
export class TicketType extends AbstractEntity {
  @Field()
  @Column({ type: "varchar", length: 255 })
  name: string;

  @Field()
  @Column({ type: "text" })
  description: string;

  @Field(() => Float)
  @Column({ type: "numeric", precision: 10, scale: 2 })
  price: string;

  @Field()
  @Column({ type: "int" })
  totalQuantity: number;

  @Field()
  @Column({ type: "int" })
  availableQuantity: number;

  @Field()
  @Column({ type: "timestamptz" })
  saleStartDate: Date;

  @Field()
  @Column({ type: "timestamptz" })
  saleEndDate: Date;

  @Field(() => [String], { nullable: true })
  @Column({ type: "varchar", array: true, nullable: true })
  benefits: string[];

  @Field(() => [String], { nullable: true })
  @Column({ type: "varchar", array: true, nullable: true })
  restrictions: string[];

  @Field(() => Event)
  @ManyToOne(() => Event, (event) => event.tickets, { nullable: false })
  event: Event;

  @Column()
  eventId: string;

  @Field(() => [Attendee])
  @OneToMany(() => Attendee, (attendee) => attendee.ticket)
  attendees: Attendee[];
}
