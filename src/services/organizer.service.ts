import { EntityManager, Repository, Not, IsNull } from "typeorm";
import { Organizer } from "../entities/organizers.entity";
import UserService from "./user.service";
import { ConflictError, ForbiddenError, NotFoundError } from "../utils/error";
import {
  CreateOrganizerInput,
  UpdateOrganizerInput,
} from "../graphql/typeDefs/organizer.types";
import { Roles } from "../entities/user.entity";
import { User } from "../entities/user.entity";
import organizerRepository, {
  OrganizerRepository,
} from "../repositories/organizer.repository";
import { TransactionHandler } from "../utils/transaction";

export class OrganizerService {
  constructor(private readonly organizerRepository: OrganizerRepository) {}

  async createOrganizerProfile(data: CreateOrganizerInput, userId: string) {
    const { name, description } = data;

    const user = await UserService.getUser(
      { id: userId },
      {
        role: true,
        id: true,
      }
    );

    if (user.role === Roles.ORGANIZER)
      throw new ConflictError("Organizer profile already exists for this user");

    const transactionHandler = new TransactionHandler();
    await transactionHandler.startTransaction();

    return transactionHandler.executeInTransaction(
      async (transactionalEntityManager) => {
        const newOrganizer = new Organizer();

        newOrganizer.description = description;
        newOrganizer.name = name;

        const savedOrganizer = await transactionalEntityManager.save(
          Organizer,
          newOrganizer
        );

        user.role = Roles.ORGANIZER;
        user.organizerProfileId = newOrganizer.id;

        await transactionalEntityManager.save(User, user);

        return savedOrganizer;
      }
    );
  }

  async getOrganizerDetails(organizerId: string) {
    const organizer = await this.organizerRepository.findOne({
      where: {
        id: organizerId,
      },
    });

    if (!organizer) throw new NotFoundError("No organizer found");

    return organizer;
  }

  async updateOrganizerDetails(
    organizerId: string,
    userId: string,
    data: UpdateOrganizerInput
  ) {
    const user = await UserService.getUser(
      { id: userId },
      {
        organizerProfileId: true,
        role: true,
      }
    );

    if (
      user.role !== Roles.ORGANIZER ||
      user.organizerProfileId !== organizerId
    ) {
      throw new ForbiddenError(
        "User does not have permission to update organizer details"
      );
    }

    // const updateData: Partial<UpdateOrganizerInput> = {};

    // if (data.name !== undefined) updateData.name = data.name;
    // if (data.description !== undefined)
    //   updateData.description = data.description;

    // organizer.name = updateData.name;
    // organizer.description = updateData.description;

    // return await this.organizerRepository.save(organizer);

    const updatedOrganizer = await this.organizerRepository.findOneAndUpdate(
      {
        id: organizerId,
      },
      data
    );

    if (!updatedOrganizer) throw new NotFoundError("No organizer found");

    return updatedOrganizer;
  }

  async getAllOrganizers() {
    return await this.organizerRepository.find();
  }

  async deleteProfile(
    organizerId: string,
    transactionalEntityManager: EntityManager
  ) {
    const organizer = await this.organizerRepository.findOne({
      where: {
        id: organizerId,
      },
      select: {
        id: true,
      },
    });

    if (!organizer) throw new NotFoundError("Organizer profile not found");

    await transactionalEntityManager.softRemove(organizer);
  }

  async restoreProfile(
    organizationId: string,
    transactionalEntityManager: EntityManager
  ) {
    const softDeletedOrganizerProfile = await this.organizerRepository.findOne({
      where: {
        id: organizationId,
        deletedAt: Not(IsNull()),
      },
      otherOptions: {
        withDeleted: true,
      },
    });

    if (!softDeletedOrganizerProfile)
      throw new NotFoundError("No inactive organization found");

    await transactionalEntityManager
      .getRepository(Organizer)
      .createQueryBuilder()
      .restore()
      .where("id = :id", { id: organizationId })
      .execute();
  }
}

export default new OrganizerService(organizerRepository);
