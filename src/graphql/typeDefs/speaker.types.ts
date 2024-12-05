import { IsArray, IsOptional, IsUrl, MaxLength } from "class-validator";
import { InputType, Field } from "type-graphql";

@InputType()
class SocialLinkInput {
  @Field()
  platform: string;

  @IsUrl()
  @Field()
  url: string;
}

@InputType()
export class CreateSpeakerInput {
  @MaxLength(255)
  @Field()
  name: string;

  @MaxLength(1000)
  @Field()
  bio: string;

  @IsOptional()
  @IsArray()
  @Field(() => [String], { nullable: true })
  expertise?: string[];

  @IsOptional()
  @IsArray()
  @Field(() => [SocialLinkInput], { nullable: true })
  socialLinks?: SocialLinkInput[];
}

@InputType()
export class UpdateSpeakerInput {
  @IsOptional()
  @MaxLength(255)
  @Field({ nullable: true })
  name?: string;

  @IsOptional()
  @MaxLength(1000)
  @Field({ nullable: true })
  bio?: string;

  @IsOptional()
  @IsArray()
  @Field(() => [String], { nullable: true })
  expertise?: string[];

  @IsOptional()
  @IsArray()
  @Field(() => [SocialLinkInput], { nullable: true })
  socialLinks?: SocialLinkInput[];
}
