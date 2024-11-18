import { Field, InputType, Int, ObjectType } from "type-graphql";
import { Organizer } from "../../entities/organizers.entity";
import { IsNotEmpty, MaxLength } from "class-validator";

@InputType()
export class CreateOrganizerInput {
  @IsNotEmpty()
  @MaxLength(255)
  @Field()
  name: string;

  @IsNotEmpty()
  @Field()
  description: string;
}

@InputType()
export class UpdateOrganizerInput {
  @MaxLength(255)
  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  description: string;
}

@ObjectType()
export class GetAllOrganizers {
  @Field(() => [Organizer])
  organizers: Organizer[];

  @Field(() => Int)
  count: number;
}
