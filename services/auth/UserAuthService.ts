import { BaseAuthService } from "./BaseAuthService";
import { User } from "../../models/userSchema";
import type { TAuthData } from "../../types/index";

export class UserAuthService extends BaseAuthService {
  constructor(role: "user" | "admin" = "user") {
    super(User, role);
  }

  protected validateRegistrationData(data: TAuthData): string | null {
    const { name, email, phone, password, role } = data;
    if (!name || (!email && !phone) || !password || !role) {
      return "Name, email, phone, password, and role are required";
    }
    return null;
  }

  protected createEntity(data: TAuthData, hashedPassword: string) {
    return new User({
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: hashedPassword,
      role: data.role,
      status: "active",
    });
  }
}
