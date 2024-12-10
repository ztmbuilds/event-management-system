import { Resolver, Query, Mutation, Arg, Authorized } from "type-graphql";
import { Speaker } from "../../entities/speaker.entity";
import speakerService, { SpeakerService } from "../../services/speaker.service";
import {
  CreateSpeakerInput,
  UpdateSpeakerInput,
} from "../typeDefs/speaker.types";
import { Roles } from "../../entities/user.entity";

@Resolver(() => Speaker)
export class SpeakerResolver {
  private speakerService: SpeakerService;
  constructor() {
    this.speakerService = speakerService;
  }

  @Query(() => Speaker, { nullable: true })
  async speaker(@Arg("id") id: string) {
    return await this.speakerService.getSpeaker(id);
  }

  @Authorized([Roles.ORGANIZER])
  @Mutation(() => Speaker)
  async createSpeaker(@Arg("data") data: CreateSpeakerInput) {
    return await this.speakerService.createSpeaker(data);
  }

  @Authorized([Roles.ORGANIZER])
  @Mutation(() => Speaker)
  async updateSpeaker(
    @Arg("data") data: UpdateSpeakerInput,
    @Arg("id") id: string
  ) {
    return await this.speakerService.updateSpeaker(data, id);
  }
}
