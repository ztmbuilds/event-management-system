import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
} from "typeorm";
import { ObjectType, Field, ID, registerEnumType } from "type-graphql";
import { AbstractEntity } from "./abstract.entity";
import { Attendee } from "./attendee.entity";
import * as bcrypt from "bcryptjs";
import { Organizer } from "./organizers.entity";

export enum Roles {
  ORGANIZER = "ORGANIZER",
  ADMIN = "ADMIN",
  ATTENDEE = "ATTENDEE",
}

registerEnumType(Roles, {
  name: "Roles",
});

@Entity("users")
@ObjectType()
export class User extends AbstractEntity {
  @Field()
  @Column({ type: "varchar", length: 255 })
  name: string;

  @Field()
  @Column({ type: "varchar", length: 255, unique: true })
  email: string;

  @Column({ type: "varchar", length: 255 })
  password: string;

  @Field(() => Roles)
  @Column({ type: "enum", enum: Roles, default: Roles.ATTENDEE })
  role: string;

  @OneToOne(() => Organizer, (organizer) => organizer.user, {
    cascade: ["soft-remove"],
    onDelete: "SET NULL",
  })
  @JoinColumn()
  organizerProfile: Organizer;

  @Column({ type: "uuid", nullable: true })
  organizerProfileId: string;

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
