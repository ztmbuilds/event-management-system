import {
  Resolver,
  Query,
  Mutation,
  Arg,
  Ctx,
  FieldResolver,
  Authorized,
} from "type-graphql";
import organizerService, {
  OrganizerService,
} from "../../services/organizer.service";
import { Organizer } from "../../entities/organizers.entity";
import {
  CreateOrganizerInput,
  GetAllOrganizers,
  UpdateOrganizerInput,
} from "../typeDefs/organizer.types";
import { MyContext } from "../../utils/context";

@Resolver(() => Organizer)
export class OrganizerResolver {
  organizerService: OrganizerService;
  constructor() {
    this.organizerService = organizerService;
  }

  @Query(() => Organizer)
  async organizer(@Arg("id") id: string) {
    return await this.organizerService.getOrganizerDetails(id);
  }

  @Query(() => GetAllOrganizers)
  async organizers() {
    const [organizers, count] = await this.organizerService.getAllOrganizers();

    return {
      organizers,
      count,
    };
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
}
