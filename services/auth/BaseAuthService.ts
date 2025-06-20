import type { IAuthService, TAuthResult, TAuthData } from "../../types/index";
import { comparePassword, hashPassword, signJwt } from "../../utils/authUtils";
import { Model } from "mongoose";

export abstract class BaseAuthService implements IAuthService {
  protected model: Model<any>;
  protected role: string;

  constructor(model: Model<any>, role: string) {
    this.model = model;
    this.role = role;
  }

  protected abstract validateRegistrationData(data: TAuthData): string | null;

  protected abstract createEntity(data: TAuthData, hashedPassword: string): any;

  async register(data: TAuthData): Promise<TAuthResult> {
    try {
      const validationError = this.validateRegistrationData(data);
      if (validationError) {
        return {
          success: false,
          message: validationError,
          statusCode: 400,
        };
      }

      const hashedPassword = await hashPassword(data.password);

      const entity = this.createEntity(data, hashedPassword);
      await entity.save();

      const token = signJwt(entity._id, this.role);

      return {
        success: true,
        message: `${this.role} registered successfully`,
        token,
        statusCode: 201,
        name: entity.name,
        id: entity._id,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message,
        statusCode: 500,
      };
    }
  }

  async login(
    email: string,
    phone: string,
    password: string
  ): Promise<TAuthResult> {
    try {
      if (!email && !phone) {
        return {
          success: false,
          message: "Email or phone is required",
          statusCode: 400,
        };
      }
      if (!password) {
        return {
          success: false,
          message: "password is required",
          statusCode: 400,
        };
      }

      let entity;
      if (email) {
        entity = await this.model.findOne({ email });
      } else {
        entity = await this.model.findOne({ phone });
      }
      if (!entity) {
        return {
          success: false,
          message: "No user with the given details found",
          statusCode: 401,
        };
      }

      if (entity.role !== this.role && this.role !== "operator") {
        return {
          success: false,
          message: `Invalid credentials`,
          statusCode: 401,
        };
      }

      const isMatch = await comparePassword(password, entity.password);
      if (!isMatch) {
        return {
          success: false,
          message: "Invalid credentials",
          statusCode: 401,
        };
      }

      const token = signJwt(entity._id, this.role);

      return {
        success: true,
        message: "Login successful",
        token,
        statusCode: 200,
        name: entity.name,
        id: entity._id,
      };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message,
        statusCode: 500,
      };
    }
  }
}
