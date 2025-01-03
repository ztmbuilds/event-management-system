import { IUserLogin, IUserSignup } from "../src/types/index";
import { UserRepository } from "../src/repositories/user.repository";
import { AuthService } from "../src/services/auth.service";
import { User } from "../src/entities/user.entity";
import { ConflictError, UnauthorizedError } from "../src/utils/error";
import bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";

jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

jest.mock("../src/database", () => ({
  AppDataSource: {
    createQueryRunner: jest.fn(),
  },
}));

describe("Auth Service", () => {
  let authService: AuthService;

  const mockUserRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findPaginated: jest.fn(),
    findOneAndDelete: jest.fn(),
    findOneAndSoftDelete: jest.fn(),
  } as unknown as jest.Mocked<UserRepository>;

  beforeEach(() => {
    authService = new AuthService(mockUserRepository);
  });
  describe("signup", () => {
    let data: IUserSignup = {
      name: "user",
      email: "test@test.org",
      password: "password",
    };

    const newUser = new User();
    Object.assign(newUser, data);

    let error: any;
    it("should create a new User if user does not already exist", async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(null);
      mockUserRepository.save.mockResolvedValueOnce(newUser);

      const result = await authService.signup(data);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: {
          email: data.email,
        },
      });
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result).toEqual(newUser);
    });

    it("should throw an error if user already exists", async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(newUser);

      try {
        await authService.signup(data);
      } catch (err) {
        error = err;
      }

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: {
          email: data.email,
        },
      });
      expect(mockUserRepository.save).not.toHaveBeenCalled();
      expect(error).toBeInstanceOf(ConflictError);
    });
  });

  describe("login", () => {
    let data: IUserLogin;
    let user: User;
    let error: any;
    beforeEach(() => {
      data = {
        email: "test@test.org",
        password: "password",
      };

      user = new User();
      Object.assign(user, data);
    });

    it("should throw an unauthorized error if user is not  found ", async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(null);

      try {
        await authService.login(data);
      } catch (err) {
        error = err;
      }
      expect(jwt.sign).not.toHaveBeenCalled();
      expect(error).toBeInstanceOf(UnauthorizedError);
    });

    it("should throw an unauthorized error if user is found but password does not match user password", async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(user);

      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      try {
        await authService.login(data);
      } catch (err) {
        error = err;
      }

      expect(jwt.sign).not.toHaveBeenCalled();
      expect(error).toBeInstanceOf(UnauthorizedError);
    });

    it("should return a user and token if user is found and password is correct", async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(user);

      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);

      (jwt.sign as jest.Mock).mockImplementationOnce(() => "tokenString");

      const { user: existingUser, token } = await authService.login(data);

      expect(existingUser).not.toBeNull();
      expect(existingUser).toEqual(user);
      expect(token).not.toBeNull();
    });
  });
});
