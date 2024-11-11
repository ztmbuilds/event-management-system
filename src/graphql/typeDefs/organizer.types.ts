import { Field, InputType, Int, ObjectType } from "type-graphql";
import { Organizer } from "../../entities/organizers.entity";

@InputType()
export class CreateOrganizerInput {
  @Field()
  name: string;

  @Field()
  description: string;
}

@InputType()
export class UpdateOrganizerInput {
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
