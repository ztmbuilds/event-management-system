import { UserRepository } from "../src/repositories/user.repository";
import { UserService } from "../src/services/user.service";
import { Roles, User } from "../src/entities/user.entity";
import { Organizer } from "../src/entities/organizers.entity";

import { mockQueryRunner, mockManager } from "./mocks/transaction";

jest.mock("../src/database", () => ({
  AppDataSource: {
    createQueryRunner: jest.fn().mockImplementation(() => mockQueryRunner),
  },
}));

describe("User Service", () => {
  let userService: UserService;
  const mockUserRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findPaginated: jest.fn(),
    findOneAndDelete: jest.fn(),
    findOneAndSoftDelete: jest.fn(),
  } as unknown as jest.Mocked<UserRepository>;

  let firstUserData = {
    name: "zeal",
    organizerProfile: {},
    organizerProfileId: "org-123",
    role: Roles.ORGANIZER,
  };
  let firstUser: User;

  beforeEach(() => {
    jest.clearAllMocks();
    firstUser = new User();
    Object.assign(firstUser, firstUserData);
    userService = new UserService(mockUserRepository);
  });
  describe("delete organizer profile", () => {
    it("shoud delete organizerProfile, and return updated user if found", async () => {
      mockManager.findOne.mockResolvedValueOnce(firstUser);

      (firstUser.organizerProfile as Organizer).deletedAt = new Date();

      mockManager.softRemove.mockResolvedValueOnce(firstUser.organizerProfile);

      await expect(userService.deleteOrganizerProfile("id")).resolves.toEqual(
        firstUser
      );

      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();

      expect(mockManager.softRemove).toHaveBeenCalledWith(
        firstUser.organizerProfile
      );
      expect(firstUser.role).toEqual(Roles.ATTENDEE);
      expect(firstUser.organizerProfileId).not.toBeNull();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it("should throw error and rollback if user not found", async () => {
      mockManager.findOne.mockResolvedValueOnce(null);

      await expect(userService.deleteOrganizerProfile("id")).rejects.toThrow();
      expect(mockManager.softRemove).not.toHaveBeenCalled();
      expect(mockManager.save).not.toHaveBeenCalled();

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });

  it("should throw error and rollback if user does not have an organizer profile", async () => {
    delete firstUser.organizerProfile;
    delete firstUser.organizerProfileId;
    mockManager.findOne.mockResolvedValueOnce(firstUser);

    await expect(userService.deleteOrganizerProfile("id")).rejects.toThrow();
    expect(mockManager.softRemove).not.toHaveBeenCalled();
    expect(mockManager.save).not.toHaveBeenCalled();

    expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    expect(mockQueryRunner.release).toHaveBeenCalled();
  });

  describe("restore organizer profile", () => {
    it("should throw error and rollback if no organizerProfile found", async () => {
      delete firstUser.organizerProfile;
      delete firstUser.organizerProfileId;
      mockManager.findOne.mockResolvedValueOnce(firstUser);
      await expect(userService.restoreOrganizerProfile("id")).rejects.toThrow();
      expect(mockManager.restore).not.toHaveBeenCalled();
      expect(mockManager.save).not.toHaveBeenCalled();

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it("should throw error and rollback if no user found", async () => {
      mockManager.findOne.mockResolvedValueOnce(null);
      await expect(userService.restoreOrganizerProfile("id")).rejects.toThrow();
      expect(mockManager.restore).not.toHaveBeenCalled();
      expect(mockManager.save).not.toHaveBeenCalled();

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });
});
