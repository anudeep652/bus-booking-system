import type { TAuthData } from "../../../types/index.ts";
import { Model } from "mongoose";
import {
  hashPassword,
  comparePassword,
  signJwt,
} from "../../../utils/authUtils.ts";
import { BaseAuthService } from "../BaseAuthService.ts";

jest.mock("../../../utils/authUtils.ts", () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
  signJwt: jest.fn(),
}));
const mockSave = jest.fn();
const mockFindOne = jest.fn();
const mockModel = {
  findOne: mockFindOne,
} as unknown as Model<any>;

class MockAuthService extends BaseAuthService {
  public validateRegistrationDataMock = jest.fn();
  public createEntityMock = jest.fn();

  constructor(role: string = "testRole") {
    super(mockModel, role);
  }

  protected validateRegistrationData(data: TAuthData): string | null {
    return this.validateRegistrationDataMock(data);
  }

  protected createEntity(data: TAuthData, hashedPassword: string): any {
    return this.createEntityMock(data, hashedPassword);
  }

  public getModel(): Model<any> {
    return this.model;
  }
  public getRole(): string {
    return this.role;
  }
}

export { MockAuthService, mockSave, mockFindOne, mockModel };

describe("BaseAuthService", () => {
  let service: MockAuthService;
  const testRole = "user";
  const mockPassword = "password123";
  const mockHashedPassword = "hashedPassword123";
  const mockEmail = "test@example.com";
  const mockToken = "mockJwtToken";
  const mockEntityId = "mockEntityId123";

  const mockAuthData: TAuthData = {
    email: mockEmail,
    password: mockPassword,
    name: "Test User",
  };

  const mockEntity = {
    _id: mockEntityId,
    email: mockEmail,
    password: mockHashedPassword,
    // other fields...
    save: mockSave,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (hashPassword as jest.Mock).mockResolvedValue(mockHashedPassword);
    (comparePassword as jest.Mock).mockResolvedValue(true);
    (signJwt as jest.Mock).mockReturnValue(mockToken);
    mockFindOne.mockResolvedValue(mockEntity);
    mockSave.mockResolvedValue(mockEntity);

    service = new MockAuthService(testRole);

    service.validateRegistrationDataMock.mockReturnValue(null);
    service.createEntityMock.mockReturnValue(mockEntity);
  });

  describe("Constructor", () => {
    it("should initialize model and role correctly", () => {
      expect((service as any).model).toBe(mockModel);
      expect((service as any).role).toBe(testRole);
    });
  });

  describe("register", () => {
    it("should successfully register an entity", async () => {
      const result = await service.register(mockAuthData);

      expect(service.validateRegistrationDataMock).toHaveBeenCalledWith(
        mockAuthData
      );
      expect(hashPassword).toHaveBeenCalledWith(mockPassword);
      expect(service.createEntityMock).toHaveBeenCalledWith(
        mockAuthData,
        mockHashedPassword
      );
      expect(mockSave).toHaveBeenCalledTimes(1);
      expect(signJwt).toHaveBeenCalledWith(mockEntityId, testRole);

      expect(result).toEqual({
        success: true,
        message: `${testRole} registered successfully`,
        token: mockToken,
        statusCode: 201,
      });
    });

    it("should return validation error if validateRegistrationData fails", async () => {
      const validationErrorMessage = "Invalid registration data";
      service.validateRegistrationDataMock.mockReturnValue(
        validationErrorMessage
      );

      const result = await service.register(mockAuthData);

      expect(service.validateRegistrationDataMock).toHaveBeenCalledWith(
        mockAuthData
      );
      expect(hashPassword).not.toHaveBeenCalled();
      expect(service.createEntityMock).not.toHaveBeenCalled();
      expect(mockSave).not.toHaveBeenCalled();
      expect(signJwt).not.toHaveBeenCalled();

      expect(result).toEqual({
        success: false,
        message: validationErrorMessage,
        statusCode: 400,
      });
    });

    it("should return 500 error if hashPassword fails", async () => {
      const hashError = new Error("Hashing failed");
      (hashPassword as jest.Mock).mockRejectedValue(hashError);

      const result = await service.register(mockAuthData);

      expect(service.validateRegistrationDataMock).toHaveBeenCalledWith(
        mockAuthData
      );
      expect(hashPassword).toHaveBeenCalledWith(mockPassword);
      expect(service.createEntityMock).not.toHaveBeenCalled();
      expect(mockSave).not.toHaveBeenCalled();
      expect(signJwt).not.toHaveBeenCalled();

      expect(result).toEqual({
        success: false,
        message: hashError.message,
        statusCode: 500,
      });
    });

    it("should return 500 error if createEntity throws (less common)", async () => {
      const createError = new Error("Entity creation failed");
      service.createEntityMock.mockImplementation(() => {
        throw createError;
      });

      const result = await service.register(mockAuthData);

      expect(service.validateRegistrationDataMock).toHaveBeenCalledWith(
        mockAuthData
      );
      expect(hashPassword).toHaveBeenCalledWith(mockPassword);
      expect(service.createEntityMock).toHaveBeenCalledWith(
        mockAuthData,
        mockHashedPassword
      );
      expect(mockSave).not.toHaveBeenCalled();
      expect(signJwt).not.toHaveBeenCalled();

      expect(result).toEqual({
        success: false,
        message: createError.message,
        statusCode: 500,
      });
    });

    it("should return 500 error if entity.save fails", async () => {
      const saveError = new Error("Database save failed");
      mockSave.mockRejectedValue(saveError);
      service.createEntityMock.mockReturnValue({
        ...mockEntity,
        save: mockSave,
      });

      const result = await service.register(mockAuthData);

      expect(service.validateRegistrationDataMock).toHaveBeenCalledWith(
        mockAuthData
      );
      expect(hashPassword).toHaveBeenCalledWith(mockPassword);
      expect(service.createEntityMock).toHaveBeenCalledWith(
        mockAuthData,
        mockHashedPassword
      );
      expect(mockSave).toHaveBeenCalledTimes(1);
      expect(signJwt).not.toHaveBeenCalled();

      expect(result).toEqual({
        success: false,
        message: saveError.message,
        statusCode: 500,
      });
    });

    it("should return 500 error if signJwt fails", async () => {
      const signError = new Error("JWT signing failed");
      (signJwt as jest.Mock).mockImplementation(() => {
        throw signError;
      });

      const result = await service.register(mockAuthData);

      expect(service.validateRegistrationDataMock).toHaveBeenCalledWith(
        mockAuthData
      );
      expect(hashPassword).toHaveBeenCalledWith(mockPassword);
      expect(service.createEntityMock).toHaveBeenCalledWith(
        mockAuthData,
        mockHashedPassword
      );
      expect(mockSave).toHaveBeenCalledTimes(1);
      expect(signJwt).toHaveBeenCalledWith(mockEntityId, testRole);

      expect(result).toEqual({
        success: false,
        message: signError.message,
        statusCode: 500,
      });
    });
  });

  describe("login", () => {
    it("should successfully log in a user", async () => {
      const result = await service.login(mockEmail, mockPassword);

      expect(mockFindOne).toHaveBeenCalledWith({ email: mockEmail });
      expect(comparePassword).toHaveBeenCalledWith(
        mockPassword,
        mockHashedPassword
      );
      expect(signJwt).toHaveBeenCalledWith(mockEntityId, testRole);

      expect(result).toEqual({
        success: true,
        message: "Login successful",
        token: mockToken,
        statusCode: 200,
      });
    });

    it("should return 400 if email is missing", async () => {
      const result = await service.login("", mockPassword);

      expect(mockFindOne).not.toHaveBeenCalled();
      expect(comparePassword).not.toHaveBeenCalled();
      expect(signJwt).not.toHaveBeenCalled();

      expect(result).toEqual({
        success: false,
        message: "Email and password are required",
        statusCode: 400,
      });
    });

    it("should return 400 if password is missing", async () => {
      const result = await service.login(mockEmail, "");

      expect(mockFindOne).not.toHaveBeenCalled();
      expect(comparePassword).not.toHaveBeenCalled();
      expect(signJwt).not.toHaveBeenCalled();

      expect(result).toEqual({
        success: false,
        message: "Email and password are required",
        statusCode: 400,
      });
    });

    it("should return 401 if user is not found", async () => {
      mockFindOne.mockResolvedValue(null); // Simulate user not found

      const result = await service.login(mockEmail, mockPassword);

      expect(mockFindOne).toHaveBeenCalledWith({ email: mockEmail });
      expect(comparePassword).not.toHaveBeenCalled();
      expect(signJwt).not.toHaveBeenCalled();

      expect(result).toEqual({
        success: false,
        message: "No user with the given email found",
        statusCode: 401,
      });
    });

    it("should return 401 if password comparison fails", async () => {
      (comparePassword as jest.Mock).mockResolvedValue(false); // Simulate wrong password

      const result = await service.login(mockEmail, mockPassword);

      expect(mockFindOne).toHaveBeenCalledWith({ email: mockEmail });
      expect(comparePassword).toHaveBeenCalledWith(
        mockPassword,
        mockHashedPassword
      );
      expect(signJwt).not.toHaveBeenCalled();

      expect(result).toEqual({
        success: false,
        message: "Invalid credentials",
        statusCode: 401,
      });
    });

    it("should return 500 error if findOne fails", async () => {
      const findError = new Error("Database find failed");
      mockFindOne.mockRejectedValue(findError);

      const result = await service.login(mockEmail, mockPassword);

      expect(mockFindOne).toHaveBeenCalledWith({ email: mockEmail });
      expect(comparePassword).not.toHaveBeenCalled();
      expect(signJwt).not.toHaveBeenCalled();

      expect(result).toEqual({
        success: false,
        message: findError.message,
        statusCode: 500,
      });
    });

    it("should return 500 error if comparePassword fails", async () => {
      const compareError = new Error("Comparison failed");
      (comparePassword as jest.Mock).mockRejectedValue(compareError);

      const result = await service.login(mockEmail, mockPassword);

      expect(mockFindOne).toHaveBeenCalledWith({ email: mockEmail });
      expect(comparePassword).toHaveBeenCalledWith(
        mockPassword,
        mockHashedPassword
      );
      expect(signJwt).not.toHaveBeenCalled();

      expect(result).toEqual({
        success: false,
        message: compareError.message,
        statusCode: 500,
      });
    });

    it("should return 500 error if signJwt fails", async () => {
      const signError = new Error("JWT signing failed");
      (signJwt as jest.Mock).mockImplementation(() => {
        throw signError;
      });
      mockFindOne.mockResolvedValue(mockEntity);
      (comparePassword as jest.Mock).mockResolvedValue(true);

      const result = await service.login(mockEmail, mockPassword);

      expect(mockFindOne).toHaveBeenCalledWith({ email: mockEmail });
      expect(comparePassword).toHaveBeenCalledWith(
        mockPassword,
        mockHashedPassword
      );
      expect(signJwt).toHaveBeenCalledWith(mockEntityId, testRole);

      expect(result).toEqual({
        success: false,
        message: signError.message,
        statusCode: 500,
      });
    });

    it("should return 500 error if signJwt fails", async () => {
      mockFindOne.mockResolvedValue(mockEntity);
      (comparePassword as jest.Mock).mockResolvedValue(true);

      const signError = new Error("JWT signing failed");
      (signJwt as jest.Mock).mockImplementation(() => {
        throw signError;
      });

      const result = await service.login(mockEmail, mockPassword);

      expect(mockFindOne).toHaveBeenCalledWith({ email: mockEmail });
      expect(comparePassword).toHaveBeenCalledWith(
        mockPassword,
        mockHashedPassword
      );
      expect(signJwt).toHaveBeenCalledWith(mockEntityId, testRole);

      expect(result).toEqual({
        success: false,
        message: signError.message,
        statusCode: 500,
      });
    });
  });
});
