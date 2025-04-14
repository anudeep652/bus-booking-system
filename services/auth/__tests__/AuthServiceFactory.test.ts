import { AuthServiceFactory } from "../AuthServiceFactory.ts";
import { UserAuthService } from "../UserAuthService.ts";
import { OperatorAuthService } from "../OperatorAuthService.ts";

jest.mock("../UserAuthService");
jest.mock("../OperatorAuthService");

describe("AuthServiceFactory", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a UserAuthService", () => {
    // Act
    const service = AuthServiceFactory.createAuthService("user");

    // Assert
    expect(service).toBeInstanceOf(UserAuthService);
    expect(UserAuthService).toHaveBeenCalledTimes(1);
    expect(UserAuthService).toHaveBeenCalledWith();
  });

  it("should create an OperatorAuthService", () => {
    // Act
    const service = AuthServiceFactory.createAuthService("operator");

    // Assert
    expect(service).toBeInstanceOf(OperatorAuthService);
    expect(OperatorAuthService).toHaveBeenCalledTimes(1);
  });

  it("should create a UserAuthService with admin parameter", () => {
    // Act
    const service = AuthServiceFactory.createAuthService("admin");

    // Assert
    expect(service).toBeInstanceOf(UserAuthService);
    expect(UserAuthService).toHaveBeenCalledTimes(1);
    expect(UserAuthService).toHaveBeenCalledWith("admin");
  });

  it("should throw error for unknown service type", () => {
    // Act & Assert
    expect(() => {
      // @ts-ignore - Testing invalid input
      AuthServiceFactory.createAuthService("unknown");
    }).toThrow("Unknown auth service type: unknown");
  });
});
