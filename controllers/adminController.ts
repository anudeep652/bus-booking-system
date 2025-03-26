import type { Request, Response } from "express";
import { AdminService } from "../services/AdminService.ts";
import type { TripStatus } from "../types/trip.ts";

export class AdminController {
  private adminService: AdminService;

  constructor() {
    this.adminService = new AdminService();
  }

  async listUsers(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const users = await this.adminService.listUsers(page, limit);

      res.status(200).json({
        status: "success",
        results: users.length,
        data: users,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  }

  async listOperators(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const operators = await this.adminService.listOperators(page, limit);

      res.status(200).json({
        status: "success",
        results: operators.length,
        data: operators,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  }

  async changeUserStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.id;
      const { status } = req.body;

      if (!["active", "inactive"].includes(status)) {
        res.status(400).json({
          status: "error",
          message: 'Invalid status. Must be "active" or "inactive".',
        });
        return;
      }

      const updatedUser = await this.adminService.changeUserStatus(
        userId,
        status,
      );

      if (!updatedUser) {
        res.status(404).json({
          status: "error",
          message: "User not found",
        });
        return;
      }

      res.status(200).json({
        status: "success",
        data: updatedUser,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  }

  async changeOperatorVerificationStatus(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const operatorId = req.params.id;
      const { status } = req.body;

      if (!["pending", "verified", "rejected"].includes(status)) {
        res.status(400).json({
          status: "error",
          message:
            'Invalid status. Must be "pending", "verified", or "rejected".',
        });
        return;
      }

      const updatedOperator =
        await this.adminService.changeOperatorVerificationStatus(
          operatorId,
          status,
        );

      if (!updatedOperator) {
        res.status(404).json({
          status: "error",
          message: "Operator not found",
        });
        return;
      }

      res.status(200).json({
        status: "success",
        data: updatedOperator,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  }

  async getAllTrips(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const trips = await this.adminService.getAllTrips(page, limit);

      res.status(200).json({
        status: "success",
        data: trips,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  }

  async changeTripStatus(
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
          status: "error",
          message:
            'Invalid status. Must be "scheduled", "completed" or "cancelled".',
        });
        return;
      }

      const updatedTrip = await this.adminService.changeTripStatus(
        tripId,
        tripStatus ?? status,
      );

      if (!updatedTrip) {
        res.status(404).json({
          status: "error",
          message: "Trip not found",
        });
        return;
      }

      res.status(200).json({
        status: "success",
        data: updatedTrip,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  }

  async getReports(req: Request, res: Response): Promise<void> {
    try {
      const reports = await this.adminService.getReports();

      res.status(200).json({
        status: "success",
        data: reports,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  }
}
