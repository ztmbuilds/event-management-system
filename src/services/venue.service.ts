import { Venue } from "../entities/venue.entity";
import {
  CreateVenueInput,
  UpdateVenueInput,
} from "../graphql/typeDefs/venue.types";
import venueRepository, {
  VenueRepository,
} from "../repositories/venue.repository";
import { NotFoundError } from "../utils/error";

export class VenueService {
  private readonly venueRepository: VenueRepository;
  constructor() {
    this.venueRepository = venueRepository;
  }

  async createVenue(data: CreateVenueInput) {
    const newVenue = new Venue();

    Object.assign(newVenue, data);
    await this.venueRepository.save(newVenue);

    return newVenue;
  }

  async getVenue(id: string) {
    const venue = await this.venueRepository.findOne({ where: { id } });

    if (!venue) throw new NotFoundError("No venue found");

    return venue;
  }

  async getVenueDetails(id: string) {
    const venue = await this.venueRepository.findOne({ where: { id } });

    if (!venue) return null;

    return venue;
  }

  async getAllVenues() {
    return await this.venueRepository.find();
  }

  async updateVenue(id: string, data: UpdateVenueInput) {
    const updatedVenue = await this.venueRepository.findOneAndUpdate(
      { id },
      data
    );

    if (!updatedVenue) throw new NotFoundError("No venue found");

    return updatedVenue;
  }
}

export default new VenueService();
