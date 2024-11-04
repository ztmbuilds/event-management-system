import { Arg, Mutation, Resolver, Query } from "type-graphql";
import { SignupInput, LoginInput, LoginResponse } from "../typeDefs/auth.types";
import { User } from "../../entities/user.entity";
import { AuthService } from "../../services/auth.service";

@Resolver()
export class AuthResolver {
  private authService: AuthService;
  constructor() {
    this.authService = new AuthService();
  }
  @Query(() => String)
  hello() {
    return "Hello World!";
  }

  @Mutation(() => User)
  async signup(@Arg("data") data: SignupInput) {
    return await this.authService.signup(data);
  }

  @Mutation(() => LoginResponse)
  async login(@Arg("data") data: LoginInput) {
    return await this.authService.login(data);
  }
}
