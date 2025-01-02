import {
  CreateSpeakerInput,
  UpdateSpeakerInput,
} from "../graphql/typeDefs/speaker.types";
import speakerRepository, {
  SpeakerRepository,
} from "../repositories/speaker.repository";
import { Speaker } from "../entities/speaker.entity";
import { NotFoundError } from "../utils/error";

export class SpeakerService {
  constructor(private readonly speakerRepository: SpeakerRepository) {}

  async createSpeaker(data: CreateSpeakerInput) {
    const newSpeaker = new Speaker();

    newSpeaker.name = data.name;
    newSpeaker.bio = data.bio;
    newSpeaker.expertise = data?.expertise;
    newSpeaker.socialLinks = data?.socialLinks;

    return await this.speakerRepository.save(newSpeaker);
  }

  async getSpeaker(id: string) {
    const speaker = await this.speakerRepository.findOne({
      where: {
        id,
      },
    });

    return speaker ? speaker : null;
  }

  async deleteSpeaker(id: string) {
    const speaker = await this.speakerRepository.findOneAndSoftDelete({
      id,
    });

    if (!speaker) throw new NotFoundError("Speaker not found");

    return speaker;
  }
  async updateSpeaker(data: UpdateSpeakerInput, id: string) {
    const speaker = await this.speakerRepository.findOneAndUpdate(
      {
        id,
      },
      data
    );

    if (!speaker) throw new NotFoundError("Speaker not found");

    return speaker;
  }
}

export default new SpeakerService(speakerRepository);
