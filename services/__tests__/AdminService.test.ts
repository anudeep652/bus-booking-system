// @ts-nocheck
import { AdminService } from "../AdminService.ts";
import { Trip, User, Operator } from "../../models/index.ts";
import type {
  User as TUser,
  Operator as TOperator,
  OperatorStatus,
  TripStatus,
} from "../../types/index.ts";

jest.mock("../../models/userSchema");
jest.mock("../../models/operatorSchema");
jest.mock("../../models/tripSchema");

const mockUser = User as jest.Mocked<typeof User>;
const mockOperator = Operator as jest.Mocked<typeof Operator>;
const mockTrip = Trip as jest.Mocked<typeof Trip>;

describe("AdminService", () => {
  let adminService: AdminService;

  beforeEach(() => {
    adminService = new AdminService();
    jest.clearAllMocks();
  });

  describe("getAllTrips", () => {
    const mockTrips = [
      { _id: "t1", destination: "A" },
      { _id: "t2", destination: "B" },
    ];
    const mockTotal = 15;

    const mockSort = jest.fn();
    const mockLimit = jest.fn();
    const mockSkip = jest.fn();
    const mockPopulate = jest.fn();
    const mockFind = jest.fn();

    beforeEach(() => {
      mockSort.mockResolvedValue(mockTrips);
      mockLimit.mockReturnValue({ sort: mockSort });
      mockSkip.mockReturnValue({ limit: mockLimit });
      mockPopulate.mockReturnValue({ skip: mockSkip });
      mockFind.mockReturnValue({ populate: mockPopulate });
      mockTrip.find.mockImplementation(mockFind);
      mockTrip.countDocuments.mockResolvedValue(mockTotal);
    });

    it("should fetch trips with default pagination", async () => {
      const result = await adminService.getAllTrips();

      expect(mockTrip.find).toHaveBeenCalledTimes(1);
      expect(mockPopulate).toHaveBeenCalledWith(
        "bus_id",
        "bus_number bus_type"
      );
      expect(mockSkip).toHaveBeenCalledWith(0);
      expect(mockLimit).toHaveBeenCalledWith(10);
      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(mockTrip.countDocuments).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        trips: mockTrips,
        total: mockTotal,
        page: 1,
        totalPages: 2,
      });
    });

    it("should fetch trips with specified pagination", async () => {
      const page = 2;
      const limit = 5;
      const expectedSkip = 5;
      const expectedTotalPages = 3;

      const result = await adminService.getAllTrips(page, limit);

      expect(mockTrip.find).toHaveBeenCalledTimes(1);
      expect(mockPopulate).toHaveBeenCalledWith(
        "bus_id",
        "bus_number bus_type"
      );
      expect(mockSkip).toHaveBeenCalledWith(expectedSkip);
      expect(mockLimit).toHaveBeenCalledWith(limit);
      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(mockTrip.countDocuments).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        trips: mockTrips,
        total: mockTotal,
        page: page,
        totalPages: expectedTotalPages,
      });
    });

    it("should throw an error if fetching trips fails", async () => {
      const error = new Error("DB error");
      mockSort.mockRejectedValue(error);

      await expect(adminService.getAllTrips()).rejects.toThrow(
        "Error fetching trips"
      );
    });

    it("should throw an error if counting trips fails", async () => {
      const error = new Error("DB count error");
      mockTrip.countDocuments.mockRejectedValue(error);

      await expect(adminService.getAllTrips()).rejects.toThrow(
        "Error fetching trips"
      );
    });
  });

  describe("changeTripStatus", () => {
    const tripId = "trip123";
    const status: TripStatus = "completed";
    const mockUpdatedTrip = { _id: tripId, status: status, destination: "C" };

    const mockPopulateUpdate = jest.fn();
    const mockFindByIdAndUpdate = jest.fn();

    beforeEach(() => {
      mockPopulateUpdate.mockResolvedValue(mockUpdatedTrip);
      mockFindByIdAndUpdate.mockReturnValue({ populate: mockPopulateUpdate });
      mockTrip.findByIdAndUpdate.mockImplementation(mockFindByIdAndUpdate);
    });

    it("should change trip status successfully", async () => {
      const result = await adminService.changeTripStatus(tripId, status);

      expect(mockTrip.findByIdAndUpdate).toHaveBeenCalledWith(
        tripId,
        { status },
        { new: true, select: "-__v" }
      );
      expect(mockPopulateUpdate).toHaveBeenCalledWith(
        "bus_id",
        "bus_number bus_type"
      );
      expect(result).toEqual(mockUpdatedTrip);
    });

    it("should throw an error if changing trip status fails", async () => {
      const error = new Error("DB update error");
      mockPopulateUpdate.mockRejectedValue(error);

      await expect(
        adminService.changeTripStatus(tripId, status)
      ).rejects.toThrow("Error changing trip status");
    });
  });

  describe("listUsers", () => {
    const mockUsers: TUser[] = [
      { _id: "u1", name: "User A", email: "a@a.com" },
      { _id: "u2", name: "User B", email: "b@b.com" },
    ];

    const mockSelect = jest.fn();
    const mockLimit = jest.fn();
    const mockSkip = jest.fn();
    const mockFind = jest.fn();

    beforeEach(() => {
      mockSelect.mockResolvedValue(mockUsers);
      mockLimit.mockReturnValue({ select: mockSelect });
      mockSkip.mockReturnValue({ limit: mockLimit });
      mockFind.mockReturnValue({ skip: mockSkip });
      mockUser.find.mockImplementation(mockFind);
    });

    it("should list users with default pagination", async () => {
      const result = await adminService.listUsers();

      expect(mockUser.find).toHaveBeenCalledTimes(1);
      expect(mockSkip).toHaveBeenCalledWith(0);
      expect(mockLimit).toHaveBeenCalledWith(10);
      expect(mockSelect).toHaveBeenCalledWith("-password -__v");
      expect(result).toEqual(mockUsers);
    });

    it("should list users with specified pagination", async () => {
      const page = 3;
      const limit = 7;
      const expectedSkip = 14;

      const result = await adminService.listUsers(page, limit);

      expect(mockUser.find).toHaveBeenCalledTimes(1);
      expect(mockSkip).toHaveBeenCalledWith(expectedSkip);
      expect(mockLimit).toHaveBeenCalledWith(limit);
      expect(mockSelect).toHaveBeenCalledWith("-password -__v");
      expect(result).toEqual(mockUsers);
    });

    it("should throw an error if fetching users fails", async () => {
      const error = new Error("DB error");
      mockSelect.mockRejectedValue(error);

      await expect(adminService.listUsers()).rejects.toThrow(
        "Error fetching users"
      );
    });
  });

  describe("listOperators", () => {
    const mockOperators: TOperator[] = [
      { _id: "o1", company_name: "Op A", email: "oa@oa.com" },
      { _id: "o2", company_name: "Op B", email: "ob@ob.com" },
    ];
    const mockSelect = jest.fn();
    const mockLimit = jest.fn();
    const mockSkip = jest.fn();
    const mockFind = jest.fn();

    beforeEach(() => {
      mockSelect.mockResolvedValue(mockOperators);
      mockLimit.mockReturnValue({ select: mockSelect });
      mockSkip.mockReturnValue({ limit: mockLimit });
      mockFind.mockReturnValue({ skip: mockSkip });
      mockOperator.find.mockImplementation(mockFind);
    });

    it("should list operators with default pagination", async () => {
      const result = await adminService.listOperators();

      expect(mockOperator.find).toHaveBeenCalledTimes(1);
      expect(mockSkip).toHaveBeenCalledWith(0);
      expect(mockLimit).toHaveBeenCalledWith(10);
      expect(mockSelect).toHaveBeenCalledWith("-password -__v");
      expect(result).toEqual(mockOperators);
    });

    it("should list operators with specified pagination", async () => {
      const page = 2;
      const limit = 20;
      const expectedSkip = 20;

      const result = await adminService.listOperators(page, limit);

      expect(mockOperator.find).toHaveBeenCalledTimes(1);
      expect(mockSkip).toHaveBeenCalledWith(expectedSkip);
      expect(mockLimit).toHaveBeenCalledWith(limit);
      expect(mockSelect).toHaveBeenCalledWith("-password -__v");
      expect(result).toEqual(mockOperators);
    });

    it("should throw an error if fetching operators fails", async () => {
      const error = new Error("DB error");
      mockSelect.mockRejectedValue(error);

      await expect(adminService.listOperators()).rejects.toThrow(
        "Error fetching operators"
      );
    });
  });

  describe("changeUserStatus", () => {
    const userId = "user123";
    const status = "inactive";
    const mockUpdatedUser = { _id: userId, status: status, name: "Test User" };

    beforeEach(() => {
      mockUser.findByIdAndUpdate.mockResolvedValue(mockUpdatedUser);
    });

    it("should change user status successfully", async () => {
      const result = await adminService.changeUserStatus(userId, status);

      expect(mockUser.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        { status },
        { new: true, select: "-password -__v" }
      );
      expect(result).toEqual(mockUpdatedUser);
    });

    it("should return null if user not found during status change", async () => {
      mockUser.findByIdAndUpdate.mockResolvedValue(null);
      const result = await adminService.changeUserStatus(userId, status);
      expect(result).toBeNull();
    });

    it("should throw an error if changing user status fails", async () => {
      const error = new Error("DB update error");
      mockUser.findByIdAndUpdate.mockRejectedValue(error);

      await expect(
        adminService.changeUserStatus(userId, status)
      ).rejects.toThrow("Error changing user status");
    });
  });

  describe("changeOperatorVerificationStatus", () => {
    const operatorId = "op123";
    const status: OperatorStatus = "verified";
    const mockUpdatedOperator = {
      _id: operatorId,
      verification_status: status,
      company_name: "Test Op",
    };

    beforeEach(() => {
      mockOperator.findByIdAndUpdate.mockResolvedValue(mockUpdatedOperator);
    });

    it("should change operator verification status successfully", async () => {
      const result = await adminService.changeOperatorVerificationStatus(
        operatorId,
        status
      );

      expect(mockOperator.findByIdAndUpdate).toHaveBeenCalledWith(
        operatorId,
        { verification_status: status },
        { new: true, select: "-password -__v" }
      );
      expect(result).toEqual(mockUpdatedOperator);
    });

    it("should return null if operator not found during status change", async () => {
      mockOperator.findByIdAndUpdate.mockResolvedValue(null);
      const result = await adminService.changeOperatorVerificationStatus(
        operatorId,
        status
      );
      expect(result).toBeNull();
    });

    it("should throw an error if changing operator status fails", async () => {
      const error = new Error("DB update error");
      mockOperator.findByIdAndUpdate.mockRejectedValue(error);

      await expect(
        adminService.changeOperatorVerificationStatus(operatorId, status)
      ).rejects.toThrow("Error changing operator verification status");
    });
  });

  describe("getReports", () => {
    beforeEach(() => {
      mockUser.countDocuments.mockReset();
      mockOperator.countDocuments.mockReset();

      mockUser.countDocuments
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(80)
        .mockResolvedValueOnce(20);

      mockOperator.countDocuments
        .mockResolvedValueOnce(50)
        .mockResolvedValueOnce(30)
        .mockResolvedValueOnce(15)
        .mockResolvedValueOnce(5);
    });

    it("should generate reports successfully", async () => {
      const result = await adminService.getReports();

      expect(mockUser.countDocuments).toHaveBeenCalledTimes(3);
      expect(mockUser.countDocuments).toHaveBeenNthCalledWith(1);
      expect(mockUser.countDocuments).toHaveBeenNthCalledWith(2, {
        status: "active",
      });
      expect(mockUser.countDocuments).toHaveBeenNthCalledWith(3, {
        status: "inactive",
      });

      expect(mockOperator.countDocuments).toHaveBeenCalledTimes(4);
      expect(mockOperator.countDocuments).toHaveBeenNthCalledWith(1);
      expect(mockOperator.countDocuments).toHaveBeenNthCalledWith(2, {
        verification_status: "verified",
      });
      expect(mockOperator.countDocuments).toHaveBeenNthCalledWith(3, {
        verification_status: "pending",
      });
      expect(mockOperator.countDocuments).toHaveBeenNthCalledWith(4, {
        verification_status: "rejected",
      });

      expect(result).toEqual({
        users: {
          total: 100,
          active: 80,
          inactive: 20,
        },
        operators: {
          total: 50,
          verified: 30,
          pending: 15,
          rejected: 5,
        },
      });
    });

    it("should throw an error if fetching user counts fails", async () => {
      const error = new Error("DB count error");
      mockUser.countDocuments.mockReset();
      mockOperator.countDocuments.mockReset();
      mockUser.countDocuments.mockRejectedValue(error);

      await expect(adminService.getReports()).rejects.toThrow(
        "Error generating reports"
      );
      expect(mockOperator.countDocuments).not.toHaveBeenCalled();
    });

    it("should throw an error if fetching operator counts fails", async () => {
      const error = new Error("DB count error");
      mockUser.countDocuments.mockReset();
      mockOperator.countDocuments.mockReset();

      mockUser.countDocuments
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(80)
        .mockResolvedValueOnce(20);

      mockOperator.countDocuments.mockRejectedValue(error);

      await expect(adminService.getReports()).rejects.toThrow(
        "Error generating reports"
      );
      expect(mockUser.countDocuments).toHaveBeenCalledTimes(3);
      expect(mockOperator.countDocuments).toHaveBeenCalledTimes(1);
    });
  });
});
