import type { IAuthService } from "../../types/index.ts";
import { UserAuthService } from "./UserAuthService.ts";
import { OperatorAuthService } from "./OperatorAuthService.ts";

export class AuthServiceFactory {
  static createAuthService(type: "user" | "operator" | "admin"): IAuthService {
    switch (type) {
      case "user":
        return new UserAuthService();
      case "admin":
        return new UserAuthService("admin");
      case "operator":
        return new OperatorAuthService();
      default:
        throw new Error(`Unknown auth service type: ${type}`);
    }
  }
}