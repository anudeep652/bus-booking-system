import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import { hashPassword, comparePassword, signJwt } from "../authUtils.ts";

jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

const originalEnv = process.env;
const setEnvVariable = (key: string, value: string | undefined) => {
  if (value === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = value;
  }
};

describe("authUtils", () => {
  const mockPassword = "plainPassword123";
  const mockSalt = "$2a$10$someRandomSaltValue";
  const mockHash = "$2a$10$someRandomSaltValueSomeHash";
  const mockJwtSecret = "test-jwt-secret";
  const defaultJwtSecret = "secret";
  const mockToken = "mock.jwt.token";
  const mockObjectId = new Types.ObjectId();
  const mockRole = "admin";

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };

    (bcrypt.genSalt as jest.Mock).mockResolvedValue(mockSalt);
    (bcrypt.hash as jest.Mock).mockResolvedValue(mockHash);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue(mockToken);
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("hashPassword", () => {
    it("should generate salt and hash the password successfully", async () => {
      const hashedPassword = await hashPassword(mockPassword);

      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith(mockPassword, mockSalt);
      expect(hashedPassword).toBe(mockHash);
    });

    it("should throw an error if bcrypt.genSalt fails", async () => {
      const saltError = new Error("Salt generation failed");
      (bcrypt.genSalt as jest.Mock).mockRejectedValue(saltError);

      try {
        await hashPassword(mockPassword);
        throw new Error("Test failed: hashPassword did not throw.");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe(saltError.toString()); // Error constructor takes string
        expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
        expect(bcrypt.hash).not.toHaveBeenCalled();
      }
    });

    it("should throw an error if bcrypt.hash fails", async () => {
      const hashError = new Error("Hashing failed");
      (bcrypt.hash as jest.Mock).mockRejectedValue(hashError);

      await expect(hashPassword(mockPassword)).rejects.toThrow(
        hashError.toString()
      );
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith(mockPassword, mockSalt);
    });
  });

  describe("comparePassword", () => {
    it("should return true if passwords match", async () => {
      const isMatch = await comparePassword(mockPassword, mockHash);

      expect(bcrypt.compare).toHaveBeenCalledWith(mockPassword, mockHash);
      expect(isMatch).toBe(true);
    });

    it("should return false if passwords do not match", async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const isMatch = await comparePassword("wrongPassword", mockHash);

      expect(bcrypt.compare).toHaveBeenCalledWith("wrongPassword", mockHash);
      expect(isMatch).toBe(false);
    });

    it("should throw an error if bcrypt.compare fails", async () => {
      const compareError = new Error("Compare failed");
      (bcrypt.compare as jest.Mock).mockRejectedValue(compareError);

      await expect(comparePassword(mockPassword, mockHash)).rejects.toThrow(
        compareError.toString()
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(mockPassword, mockHash);
    });
  });

  describe("signJwt", () => {
    it("should sign a JWT using JWT_SECRET from environment", () => {
      setEnvVariable("JWT_SECRET", mockJwtSecret);

      const token = signJwt(mockObjectId, mockRole);

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: mockObjectId, role: mockRole },
        mockJwtSecret,
        { expiresIn: "1d" }
      );
      expect(token).toBe(mockToken);
    });

    it("should sign a JWT using the default secret if JWT_SECRET is not set", () => {
      setEnvVariable("JWT_SECRET", undefined);

      const token = signJwt(mockObjectId, mockRole);

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: mockObjectId, role: mockRole },
        defaultJwtSecret,
        { expiresIn: "1d" }
      );
      expect(token).toBe(mockToken);
    });

    it("should sign a JWT using the default secret if JWT_SECRET is an empty string", () => {
      setEnvVariable("JWT_SECRET", "");

      const token = signJwt(mockObjectId, mockRole);

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: mockObjectId, role: mockRole },
        "",
        { expiresIn: "1d" }
      );
      expect(token).toBe(mockToken);
    });

    it("should throw an error if jwt.sign fails", () => {
      const signError = new Error("JWT signing failed");
      (jwt.sign as jest.Mock).mockImplementation(() => {
        throw signError;
      });

      setEnvVariable("JWT_SECRET", mockJwtSecret);

      expect(() => signJwt(mockObjectId, mockRole)).toThrow(signError);
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: mockObjectId, role: mockRole },
        mockJwtSecret,
        { expiresIn: "1d" }
      );
    });
  });
});
