import { User } from "../entities/user.entity";
import { IUserLogin, IUserSignup } from "../types";
import { ConflictError, UnauthorizedError } from "../utils/error";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import userRepository, {
  UserRepository,
} from "../repositories/user.repository";

export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async signup(data: IUserSignup) {
    const { name, email, password } = data;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser)
      throw new ConflictError("User with that email already exists");

    const newUser = new User();
    newUser.name = name;
    newUser.email = email;
    newUser.password = password;

    await this.userRepository.save(newUser);

    return newUser;
  }

  async login(data: IUserLogin) {
    const { email, password } = data;

    const user = await this.userRepository.findOne({
      where: {
        email,
      },
    });

    if (!user) throw new UnauthorizedError("Invalid login credentials");

    const isCorrect = await bcrypt.compare(password, user.password);
    if (!user || !isCorrect)
      throw new UnauthorizedError("Invalid login credentials");

    const token = jwt.sign({ id: user.id }, JWT_SECRET, {
      expiresIn: "1d",
    });

    return { user, token };
  }
}

export default new AuthService(userRepository);
