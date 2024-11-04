import { Column, Entity, OneToMany, OneToOne } from "typeorm";
import { Field, ObjectType } from "type-graphql";
import { AbstractEntity } from "./abstract.entity";
import { Event } from "./event.entity";
import { User } from "./user.entity";

@ObjectType()
@Entity("organizers")
export class Organizer extends AbstractEntity {
  @Field()
  @Column({ type: "varchar", length: 255 })
  name: string;

  @Field({ nullable: true })
  @Column({ type: "text", nullable: true })
  description: string;

  @OneToOne(() => User, (user) => user.organizerProfile, { nullable: false })
  user: User;

  @Field(() => [Event])
  @OneToMany(() => Event, (event) => event.organizer)
  events: Event[];
}
