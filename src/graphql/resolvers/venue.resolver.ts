import {
  Mutation,
  Resolver,
  Query,
  Arg,
  Ctx,
  Authorized,
  FieldResolver,
  Root,
} from "type-graphql";
import venueService, { VenueService } from "../../services/venue.service";
import { CreateVenueInput, UpdateVenueInput } from "../typeDefs/venue.types";
import { Venue } from "../../entities/venue.entity";
import { MyContext } from "../../utils/context";
import { Roles } from "../../entities/user.entity";
import { Event } from "../../entities/event.entity";

@Resolver(() => Venue)
export class VenueResolver {
  venueService: VenueService;

  constructor() {
    this.venueService = venueService;
  }

  @Query(() => Venue, { nullable: true })
  async venue(@Arg("id") id: string) {
    return await this.venueService.getVenueDetails(id);
  }

  @Query(() => [Venue])
  async venues() {
    return await this.venueService.getAllVenues();
  }

  @Mutation(() => Venue)
  async createVenue(@Arg("data") data: CreateVenueInput) {
    return await this.venueService.createVenue(data);
  }

  @Authorized([Roles.ORGANIZER, Roles.ADMIN])
  @Mutation(() => Venue)
  async updateVenue(
    @Arg("data") data: UpdateVenueInput,
    @Ctx() ctx: MyContext
  ) {
    return await this.venueService.updateVenue(ctx.id, data);
  }

  @FieldResolver(() => [Event])
  async events(@Root() venue: Venue, @Ctx() ctx: MyContext) {
    return ctx.loaders.eventsByVenueIdLoader.load(venue.id);
  }
}
