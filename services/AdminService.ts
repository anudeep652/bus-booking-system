import { Trip, User, Operator } from "../models/index.ts";
import type {
  OperatorStatus,
  Operator as TOperator,
  TripStatus,
  User as TUser,
} from "../types/index.ts";

export class AdminService {
  async getAllTrips(
    page: number = 1,
    limit: number = 10
  ): Promise<{
    trips: any[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;

      const trips = await Trip.find()
        .populate("bus_id", "bus_number bus_type")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await Trip.countDocuments();
      const totalPages = Math.ceil(total / limit);

      return {
        trips,
        total,
        page,
        totalPages,
      };
    } catch (error) {
      throw new Error("Error fetching trips");
    }
  }

  async changeTripStatus(tripId: string, status: TripStatus): Promise<any> {
    try {
      return await Trip.findByIdAndUpdate(
        tripId,
        { status },
        { new: true, select: "-__v" }
      ).populate("bus_id", "bus_number bus_type");
    } catch (error) {
      throw new Error("Error changing trip status");
    }
  }
  async listUsers(page: number = 1, limit: number = 10): Promise<TUser[]> {
    try {
      return await User.find()
        .skip((page - 1) * limit)
        .limit(limit)
        .select("-password -__v");
    } catch (error) {
      throw new Error("Error fetching users");
    }
  }

  async listOperators(
    page: number = 1,
    limit: number = 10
  ): Promise<TOperator[]> {
    try {
      return await Operator.find()
        .skip((page - 1) * limit)
        .limit(limit)
        .select("-password -__v");
    } catch (error) {
      throw new Error("Error fetching operators");
    }
  }

  async changeUserStatus(
    userId: string,
    status: "active" | "inactive"
  ): Promise<TUser | null> {
    try {
      return await User.findByIdAndUpdate(
        userId,
        { status },
        { new: true, select: "-password -__v" }
      );
    } catch (error) {
      throw new Error("Error changing user status");
    }
  }

  async changeOperatorVerificationStatus(
    operatorId: string,
    status: OperatorStatus
  ): Promise<TOperator | null> {
    try {
      return await Operator.findByIdAndUpdate(
        operatorId,
        { verification_status: status },
        { new: true, select: "-password -__v" }
      );
    } catch (error) {
      throw new Error("Error changing operator verification status");
    }
  }

  async getReports(): Promise<any> {
    try {
      const totalUsers = await User.countDocuments();
      const activeUsers = await User.countDocuments({ status: "active" });
      const inactiveUsers = await User.countDocuments({ status: "inactive" });

      const totalOperators = await Operator.countDocuments();
      const verifiedOperators = await Operator.countDocuments({
        verification_status: "verified",
      });
      const pendingOperators = await Operator.countDocuments({
        verification_status: "pending",
      });
      const rejectedOperators = await Operator.countDocuments({
        verification_status: "rejected",
      });

      return {
        users: {
          total: totalUsers,
          active: activeUsers,
          inactive: inactiveUsers,
        },
        operators: {
          total: totalOperators,
          verified: verifiedOperators,
          pending: pendingOperators,
          rejected: rejectedOperators,
        },
      };
    } catch (error) {
      throw new Error("Error generating reports");
    }
  }
}
