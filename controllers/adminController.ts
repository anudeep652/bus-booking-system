import type { Request, Response } from "express";
import { AdminService } from "../services/AdminService.ts";
import type { TripStatus } from "../types/trip.ts";
import { AuthServiceFactory } from "../services/auth/AuthServiceFactory.ts";

const adminService = new AdminService()

export async function loginAdmin(req:Request,res:Response):Promise<void> {
    const { email, password } = req.body;
  const authService = AuthServiceFactory.createAuthService("admin");
    const result = await authService.login(email, password);
      res.status(result.statusCode).json({
      message: result.message,
      token: result.token,
    });
};

export async function registerAdmin(req: Request, res: Response): Promise<void> {
  const authService = AuthServiceFactory.createAuthService("admin");
  const result = await authService.register(req.body);
    res.status(result.statusCode).json({
    message: result.message,
    token: result.token,
  });
}

export async function listUsers(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const users = await adminService.listUsers(page, limit);

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to get list of users, An unknown error occurred: "+error,
    });
  }
}

export async function listOperators(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const operators = await adminService.listOperators(page, limit);

    res.status(200).json({
      success: true,
      data: operators,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to list all operators, An unknown error occurred: "+error,
    });
  }
}

export async function changeUserStatus(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.params.id;
    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Failed to change user status, Invalid status. Must be "active" or "inactive"',
      });
      return;
    }

    const updatedUser = await adminService.changeUserStatus(
      userId,
      status,
    );

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        message: 'Failed to change user status, User not found',
      });
      return;
    }

    res.status(200).json({
      success:true,
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "An unknown error occurred: "+error,
    });
  }
}

export async function changeOperatorVerificationStatus(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const operatorId = req.params.id;
    const { status } = req.body;

    if (!["pending", "verified", "rejected"].includes(status)) {
      res.status(400).json({
        success: false,
        message:
          'Failed to change operator verification status, Invalid status. Must be "pending" or "verified" or "rejected".',
      });
      return;
    }

    const updatedOperator =
      await adminService.changeOperatorVerificationStatus(
        operatorId,
        status,
      );

    if (!updatedOperator) {
      res.status(404).json({
        success: false,
        message: "Failed to change operator verification status, Operator not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: updatedOperator,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to change operator verification status, An unknown error occurred",
    });
  }
}

export async function getAllTrips(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const trips = await adminService.getAllTrips(page, limit);

    res.status(200).json({
      success: true,
      data: trips,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message:
        error instanceof Error ? error.message : "Failed to get all trips, An unknown error occurred "+ error,
    });
  }
}

export async function changeTripStatus(
  req: Request,
  res: Response,
  tripStatus: TripStatus,
): Promise<void> {
  try {
    const tripId = req.params.id;
    const { status } = req.body;

    if (
      !tripStatus &&
      !["scheduled", "cancelled", "completed"].includes(status)
    ) {
      res.status(400).json({
        success:false,
        message:
          'Failed to change trip status, Invalid status. Must be "scheduled" or "completed" or "cancelled".',
      });
      return;
    }

    const updatedTrip = await adminService.changeTripStatus(
      tripId,
      tripStatus ?? status,
    );

    if (!updatedTrip) {
      res.status(404).json({
        success:false,
        message: "Failed to change trip status, Trip not found",
      });
      return;
    }

    res.status(200).json({
      success:true,
      data: updatedTrip,
    });
  } catch (error) {
    res.status(500).json({
      success:false,
      message:
        error instanceof Error ? error.message : "Failed to change trip status, An unknown error occurred "+error,
    });
  }
}

export async function getReports(req: Request, res: Response): Promise<void> {
  try {
    const reports = await adminService.getReports();

    res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to get reports, An unknown error occurred",
    });
  }
}

