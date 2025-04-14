import { OperatorAuthService } from "../OperatorAuthService.ts";
import { Operator } from "../../../models/operatorSchema.ts";
import * as authUtils from "../../../utils/authUtils.ts";

jest.mock("../../../models/operatorSchema");
jest.mock("../../../utils/authUtils");

describe("OperatorAuthService", () => {
  let operatorAuthService: OperatorAuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    operatorAuthService = new OperatorAuthService();
  });

  describe("register", () => {
    it("should register an operator successfully", async () => {
      const operatorData = {
        company_name: "Test Bus Company",
        email: "company@example.com",
        phone: "1234567890",
        password: "password123",
      };

      const mockOperator = {
        _id: "operator123",
        ...operatorData,
        save: jest.fn().mockResolvedValue(true),
      };

      (Operator as unknown as jest.Mock).mockImplementation(() => mockOperator);
      (authUtils.hashPassword as jest.Mock).mockResolvedValue("hashedPassword");
      (authUtils.signJwt as jest.Mock).mockReturnValue("mockToken");

      const result = await operatorAuthService.register(operatorData);

      expect(authUtils.hashPassword).toHaveBeenCalledWith(
        operatorData.password
      );
      expect(Operator).toHaveBeenCalledWith({
        company_name: operatorData.company_name,
        email: operatorData.email,
        phone: operatorData.phone,
        password: "hashedPassword",
        verification_status: "pending",
      });
      expect(mockOperator.save).toHaveBeenCalled();
      expect(authUtils.signJwt).toHaveBeenCalledWith("operator123", "operator");
      expect(result).toEqual({
        success: true,
        message: "operator registered successfully",
        token: "mockToken",
        statusCode: 201,
      });
    });

    it("should return error when required fields are missing", async () => {
      const incompleteData = {
        company_name: "Test Bus Company",
        email: "company@example.com",
        password: "pass",
        // Missing phone, password
      };

      const result = await operatorAuthService.register(incompleteData);

      expect(result).toEqual({
        success: false,
        message: "Company name, email, phone, and password are required",
        statusCode: 400,
      });
      expect(Operator).not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    it("should login operator successfully", async () => {
      const email = "company@example.com";
      const password = "password123";

      const mockOperator = {
        _id: "operator123",
        email,
        password: "hashedPassword",
      };

      Operator.findOne = jest.fn().mockResolvedValue(mockOperator);
      (authUtils.comparePassword as jest.Mock).mockResolvedValue(true);
      (authUtils.signJwt as jest.Mock).mockReturnValue("mockToken");

      const result = await operatorAuthService.login(email, password);

      expect(Operator.findOne).toHaveBeenCalledWith({ email });
      expect(authUtils.comparePassword).toHaveBeenCalledWith(
        password,
        "hashedPassword"
      );
      expect(authUtils.signJwt).toHaveBeenCalledWith("operator123", "operator");
      expect(result).toEqual({
        success: true,
        message: "Login successful",
        token: "mockToken",
        statusCode: 200,
      });
    });
  });
});
