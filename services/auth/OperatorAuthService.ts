import { BaseAuthService } from "./BaseAuthService.ts";
import { Operator } from "../../models/operatorSchema.ts";
import type { IAuthData } from "../../types/index.ts";

export class OperatorAuthService extends BaseAuthService {
  constructor() {
    super(Operator, "operator");
  }

  protected validateRegistrationData(data: IAuthData): string | null {
    const { company_name, email, phone, password } = data;
    if (!company_name || !email || !phone || !password) {
      return "Company name, email, phone, and password are required";
    }
    return null;
  }

  protected createEntity(data: IAuthData, hashedPassword: string) {
    return new Operator({
      company_name: data.company_name,
      email: data.email,
      phone: data.phone,
      password: hashedPassword,
      verification_status: "pending"
    });
  }
}