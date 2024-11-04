import { Field, InputType, ObjectType } from "type-graphql";
import { User } from "../../entities/user.entity";
import { IUserSignup, IUserLogin } from "../../types";

//inputs
@InputType()
export class SignupInput implements IUserSignup {
  @Field()
  name: string;
  @Field()
  email: string;
  @Field()
  password: string;
}

@InputType()
export class LoginInput implements IUserLogin {
  @Field()
  email: string;

  @Field()
  password: string;
}

@ObjectType()
export class LoginResponse {
  @Field(() => User)
  user: User;

  @Field()
  token: string;
}
