import { BaseAuthService } from "./BaseAuthService.ts";
import { User } from "../../models/userSchema.ts";
import type { IAuthData } from "../../types/index.ts";

export class UserAuthService extends BaseAuthService {
  constructor(role: "user"|"admin" = "user") {
    super(User, role);
  }


  protected validateRegistrationData(data: IAuthData): string | null {
    const { name, email, phone, password, role } = data;
    if (!name || !email || !phone || !password || !role) {
      return "Name, email, phone, password, and role are required";
    }
    return null;
  }

  protected createEntity(data: IAuthData, hashedPassword: string) {
    return new User({
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: hashedPassword,
      role: data.role,
      status: "active"
    });
  }
}