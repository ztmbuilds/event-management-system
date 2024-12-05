import { Column, Entity, ManyToMany } from "typeorm";
import { ObjectType, Field, ID } from "type-graphql";
import { AbstractEntity } from "./abstract.entity";
import { Session } from "./session.entity";

@ObjectType()
export class SocialLink {
  @Field()
  platform: string;

  @Field()
  url: string;
}

@ObjectType()
@Entity("speakers")
export class Speaker extends AbstractEntity {
  @Field()
  @Column({ type: "varchar", length: 255 })
  name: string;

  @Field({ nullable: true })
  @Column({ type: "text", nullable: true })
  bio: string;

  // @Field({ nullable: true })
  // @Column({ type: "varchar", length: 255, nullable: true })
  // profileImage: string;

  @Field(() => [String], { nullable: true })
  @Column({ type: "varchar", array: true, nullable: true, default: [] })
  expertise: string[];

  @Field(() => [SocialLink], { nullable: true })
  @Column({ type: "jsonb", nullable: true })
  socialLinks: { platform: string; url: string }[];

  @Field(() => [Session])
  @ManyToMany(() => Session, (session) => session.speakers)
  sessions: Session[];
}
