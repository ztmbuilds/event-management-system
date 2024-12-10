import {
  IsArray,
  IsDecimal,
  IsInt,
  IsISO8601,
  IsOptional,
  MaxLength,
  Min,
  Validate,
} from "class-validator";
import {
  ArgsType,
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from "type-graphql";
import {
  AvailableQuantityValidator,
  SaleEndDateValidator,
  StartDateValidator,
} from "../../utils/customValidator";
import { FilterArgs, Pagination } from "./index.types";
import { TicketType } from "../../entities/ticket-type.entity";

@InputType()
export class CreateTicketTypeInput {
  @MaxLength(255)
  @Field()
  name: string;

  @MaxLength(1000)
  @Field()
  description: string;

  @IsDecimal()
  @Field()
  price: string;

  @IsInt()
  @Min(1)
  @Field()
  totalQuantity: number;

  @IsInt()
  @Min(1)
  @Validate(AvailableQuantityValidator)
  @Field()
  availableQuantity: number;

  @IsISO8601()
  @Validate(StartDateValidator)
  @Field()
  saleStartDate: string;

  @IsISO8601()
  @Validate(SaleEndDateValidator)
  @Field()
  saleEndDate: string;

  @IsArray()
  @Field(() => [String], { nullable: true })
  benefits: string[];

  @IsArray()
  @Field(() => [String], { nullable: true })
  restrictions: string[];
}

@InputType()
export class UpdateTicketTypeInput {
  @IsOptional()
  @MaxLength(255)
  @Field()
  name: string;

  @IsOptional()
  @MaxLength(1000)
  @Field()
  description: string;

  @IsOptional()
  @IsDecimal()
  @Field()
  price: string;

  @IsOptional()
  @IsArray()
  @Field(() => [String], { nullable: true })
  benefits: string[];

  @IsOptional()
  @IsArray()
  @Field(() => [String], { nullable: true })
  restrictions: string[];
}

@InputType()
export class UpdateTicketTypeSaleDatesInput {
  @IsISO8601()
  @Validate(StartDateValidator)
  @Field()
  saleStartDate: string;

  @IsISO8601()
  @Validate(SaleEndDateValidator)
  @Field()
  saleEndDate: string;
}

@InputType()
export class UpdateTicketTypeQuantityInput {
  @IsInt()
  @Min(1)
  @Field()
  totalQuantity: number;

  @IsInt()
  @Min(1)
  @Validate(AvailableQuantityValidator)
  @Field()
  availableQuantity: number;
}
