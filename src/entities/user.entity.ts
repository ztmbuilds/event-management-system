import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
} from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import { AbstractEntity } from "./abstract.entity";
import { Attendee } from "./attendee.entity";
import * as bcrypt from "bcryptjs";
import { Organizer } from "./organizers.entity";

@ObjectType()
@Entity("users")
export class User extends AbstractEntity {
  @Field()
  @Column({ type: "varchar", length: 255 })
  name: string;

  @Field()
  @Column({ type: "varchar", length: 255, unique: true })
  email: string;

  @Column({ type: "varchar", length: 255 })
  password: string;

  @OneToOne(() => Organizer, (organizer) => organizer.user)
  @JoinColumn()
  organizerProfile: Organizer;

  @Field(() => [Attendee])
  @OneToMany(() => Attendee, (attendee) => attendee.user)
  attendeeRecords: Attendee[];

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }
}
