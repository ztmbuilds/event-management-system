import { Column, Entity, OneToMany } from "typeorm";
import { Field, ObjectType } from "type-graphql";
import { AbstractEntity } from "./abstract.entity";
import { Event } from "./event.entity";

@ObjectType()
@Entity("venues")
export class Venue extends AbstractEntity {
  @Field()
  @Column({ type: "varchar", length: 255 })
  name: string;

  @Field()
  @Column({ type: "int" })
  capacity: number;

  @Field()
  @Column({ type: "text" })
  address: string;

  @Field(() => [Event])
  @OneToMany(() => Event, (event) => event.venue)
  events: Event[];
}
