import { Speaker } from "../entities/speaker.entity";
import { AbstractRepository } from "./abstract.repository";

export class SpeakerRepository extends AbstractRepository<Speaker> {}

export default new SpeakerRepository(Speaker);
