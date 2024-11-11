import { Field, ID, ObjectType } from "type-graphql";
import {
  AfterUpdate,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@ObjectType()
export abstract class AbstractEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field()
  @CreateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;

  @Field()
  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;

  @AfterUpdate()
  protected setUpdatedAt() {
    this.updatedAt = new Date();
  }
}
