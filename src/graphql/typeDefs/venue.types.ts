import { Field, InputType, ObjectType } from "type-graphql";
import { Min, MaxLength } from "class-validator";

@InputType()
export class CreateVenueInput {
  @MaxLength(255)
  @Field()
  name: string;

  @Min(2)
  @Field()
  capacity: number;

  @MaxLength(255)
  @Field()
  address: string;
}

@InputType()
export class UpdateVenueInput {
  @MaxLength(255)
  @Field()
  name?: string;

  @Min(2)
  @Field()
  capacity?: number;

  @MaxLength(1000)
  @Field()
  address?: string;
}
