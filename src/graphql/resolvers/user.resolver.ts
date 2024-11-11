import { Arg, Authorized, Ctx, Mutation, Resolver } from "type-graphql";
import userService from "../../services/user.service";
import { User } from "../../entities/user.entity";
import { MyContext } from "../../utils/context";

@Resolver()
export class UserResolver {
  userService = userService;
  constructor() {
    this.userService = userService;
  }

  @Authorized(["ORGANIZER"])
  @Mutation(() => User)
  async deleteOrganizerProfile(@Ctx() ctx: MyContext) {
    await this.userService.deleteOrganizerProfile(ctx.id);
  }
  @Mutation(() => User)
  async restoreOrganizerProfile(@Ctx() ctx: MyContext) {
    return await this.userService.restoreOrganizerProfile(ctx.id);
  }
}
