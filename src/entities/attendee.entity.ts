import { AbstractEntity } from "./abstract.entity";
import {
  ManyToOne,
  Entity,
  JoinColumn,
  Column,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { User } from "./user.entity";
import { Event } from "./event.entity";
import { TicketType } from "./ticket-type.entity";
import { Session } from "./session.entity";
import { ObjectType, registerEnumType, Field, ID } from "type-graphql";

export enum CheckinStatus {
  NOT_CHECKED_IN = "NOT_CHECKED_IN",
  CHECKED_IN = "CHECKED_IN",
  CANCELLED = "CANCELLED",
}

registerEnumType(CheckinStatus, {
  name: "CheckinStatus",
});

@ObjectType()
@Entity("attendees")
export class Attendee extends AbstractEntity {
  @Field(() => User)
  @ManyToOne(() => User, (user) => user.attendeeRecords, { nullable: false })
  @JoinColumn()
  user: User;

  @Column()
  userId: string;

  @Field(() => Event)
  @ManyToOne(() => Event, (event) => event.attendees, { nullable: false })
  @JoinColumn()
  event: Event;

  @Column()
  eventId: string;

  @Field(() => TicketType)
  @ManyToOne(() => TicketType, (ticketType) => ticketType.attendees, {
    nullable: false,
  })
  ticketType: TicketType;

  @Column()
  ticketTypeId: string;

  @Field(() => CheckinStatus)
  @Column({
    type: "enum",
    enum: CheckinStatus,
    default: CheckinStatus.NOT_CHECKED_IN,
  })
  checkInStatus: CheckinStatus;

  @Field(() => [Session])
  @ManyToMany(() => Session, (session) => session.attendees)
  @JoinTable({
    name: "attendees_sessions",
    joinColumn: { name: "attendee_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "session_id", referencedColumnName: "id" },
  })
  sessions: Session[];
}
