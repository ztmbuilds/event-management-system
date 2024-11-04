import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { AbstractEntity } from "./abstract.entity";
import { Venue } from "./venue.entity";
import { Session } from "./session.entity";
import { TicketType } from "./ticket-type.entity";
import { Attendee } from "./attendee.entity";
import { Organizer } from "./organizers.entity";
import { Field, ID, ObjectType, registerEnumType } from "type-graphql";

export enum EventStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  CANCELLED = "CANCELLED",
  SOLD_OUT = "SOLD_OUT",
  COMPLETED = "COMPLETED",
}

registerEnumType(EventStatus, {
  name: "EventStatus",
});

@ObjectType()
@Entity("events")
export class Event extends AbstractEntity {
  @Field()
  @Column({ type: "varchar", length: 255 })
  title: string;

  @Field()
  @Column({ type: "text" })
  description: string;

  @Field()
  @Column({ type: "timestamptz" })
  startDate: Date;

  @Field()
  @Column({ type: "timestamptz" })
  endDate: Date;

  @Field(() => EventStatus)
  @Column({
    type: "enum",
    enum: EventStatus,
    default: EventStatus.DRAFT,
  })
  status: EventStatus;

  @Field()
  @Column({ type: "int" })
  capacity: number;

  @Field(() => [String], { nullable: true })
  @Column({ type: "varchar", array: true, nullable: true })
  tags: string[];

  @Field(() => Venue)
  @ManyToOne(() => Venue, (venue) => venue.events, { nullable: false })
  venue: Venue;

  @Field(() => [Session])
  @OneToMany(() => Session, (session) => session.event, { nullable: false })
  sessions: Session[];

  @Field(() => [TicketType])
  @OneToMany(() => TicketType, (ticket) => ticket.event)
  tickets: TicketType[];

  @Field(() => [Attendee])
  @OneToMany(() => Attendee, (attendee) => attendee.event)
  attendees: Attendee[];

  @Field(() => Organizer)
  @ManyToOne(() => Organizer, (organizer) => organizer.events)
  organizer: Organizer;
}
