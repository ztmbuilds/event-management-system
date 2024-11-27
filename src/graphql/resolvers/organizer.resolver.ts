import {
  Resolver,
  Query,
  Mutation,
  Arg,
  Ctx,
  FieldResolver,
  Authorized,
  ResolverInterface,
  Root,
} from "type-graphql";
import organizerService, {
  OrganizerService,
} from "../../services/organizer.service";
import { Organizer } from "../../entities/organizers.entity";
import { Event } from "../../entities/event.entity";
import {
  CreateOrganizerInput,
  UpdateOrganizerInput,
} from "../typeDefs/organizer.types";
import { MyContext } from "../../utils/context";
import { User } from "../../entities/user.entity";

@Resolver(() => Organizer)
export class OrganizerResolver implements ResolverInterface<Organizer> {
  organizerService: OrganizerService;
  constructor() {
    this.organizerService = organizerService;
  }

  @Query(() => Organizer)
  async organizer(@Arg("id") id: string) {
    return await this.organizerService.getOrganizerDetails(id);
  }

  @Query(() => [Organizer])
  async organizers() {
    return await this.organizerService.getAllOrganizers();
  }

  @Authorized(["ATTENDEE"])
  @Mutation(() => Organizer)
  async createOrganizerProfile(
    @Arg("data") data: CreateOrganizerInput,
    @Ctx() ctx: MyContext
  ) {
    return await this.organizerService.createOrganizerProfile(data, ctx.id);
  }

  @Authorized(["ORGANIZER"])
  @Mutation(() => Organizer)
  async updateOrganizerProfile(
    @Arg("id") id: string,
    @Arg("data") data: UpdateOrganizerInput,
    @Ctx() ctx: MyContext
  ) {
    return await this.organizerService.updateOrganizerDetails(id, ctx.id, data);
  }

  @FieldResolver(() => User)
  async user(@Root() organizer: Organizer, @Ctx() ctx: MyContext) {
    if (ctx.role !== "ADMIN") {
      return null;
    }
    return ctx.loaders.userLoader.load(organizer.id);
  }

  @FieldResolver(() => [Event])
  async events(@Root() organizer: Organizer, @Ctx() ctx: MyContext) {
    return ctx.loaders.eventsByOrganizerIdLoader.load(organizer.id);
  }
}
