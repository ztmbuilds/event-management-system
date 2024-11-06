import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { ObjectType, Field, ID, registerEnumType } from "type-graphql";
import { AbstractEntity } from "./abstract.entity";
import { Event } from "./event.entity";
import { Speaker } from "./speaker.entity";
import { Attendee } from "./attendee.entity";

export enum SessionStatus {
  SCHEDULED = "SCHEDULED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

registerEnumType(SessionStatus, {
  name: "SessionStatus",
});

@ObjectType()
@Entity("sessions")
export class Session extends AbstractEntity {
  @Field()
  @Column({ type: "varchar", length: 255 })
  title: string;

  @Field()
  @Column({ type: "text" })
  description: string;

  @Field()
  @Column({ type: "timestamptz" })
  startTime: Date;

  @Field()
  @Column({ type: "timestamptz" })
  endTime: Date;

  @Field()
  @Column({ type: "int", default: 0 })
  attendeeCount: number;

  @Field(() => SessionStatus)
  @Column({
    type: "enum",
    enum: SessionStatus,
    default: SessionStatus.SCHEDULED,
  })
  status: SessionStatus;

  @Field(() => Event)
  @ManyToOne(() => Event, (event) => event.sessions, { nullable: false })
  event: Event;

  @Column()
  eventId: string;

  @Field(() => [Speaker])
  @ManyToMany(() => Speaker, (speaker) => speaker.sessions)
  @JoinTable({
    name: "session_speakers",
    joinColumn: { name: "session_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "speaker_id", referencedColumnName: "id" },
  })
  speakers: Speaker[];

  @Field(() => [Attendee])
  @ManyToMany(() => Attendee, (attendee) => attendee.sessions)
  attendees: Attendee[];
}
