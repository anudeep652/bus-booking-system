import type { Request, Response, RequestParamHandler } from "express";
import { BusService } from "../services/BusService";

const busService = new BusService();

export const createBus = async (
  req: Request,
  res: Response
): Promise<ReturnType<RequestParamHandler>> => {
  try {
    const busData = req.body;
    const newBus = await busService.createBus(busData);
    res.status(201).json({ success: true, data: newBus });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create bus: " + error,
    });
  }
};

export const updateBus = async (
  req: Request,
  res: Response
): Promise<ReturnType<RequestParamHandler>> => {
  try {
    const busId = req.params.id;
    const updateData = req.body;
    const updatedBus = await busService.updateBus(busId, updateData);
    if (!updatedBus) {
      return res
        .status(404)
        .json({ success: false, message: "Bus not found." });
    }
    res.status(200).json({ success: true, data: updatedBus });
  } catch (error) {
    res.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : "Failed to update bus: " + error,
    });
  }
};

export const deleteBus = async (
  req: Request,
  res: Response
): Promise<ReturnType<RequestParamHandler>> => {
  try {
    const busId = req.params.id;
    const deletedBus = await busService.deleteBus(busId);
    if (!deletedBus) {
      return res
        .status(404)
        .json({ success: false, message: "Bus not found." });
    }
    res.json({ success: true, message: "Bus deleted successfully." });
  } catch (error) {
    res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to delete bus: " + error,
    });
  }
};

export const getBusesByOperator = async (
  req: Request,
  res: Response
): Promise<ReturnType<RequestParamHandler>> => {
  try {
    const { operator_id } = req.query;
    if (!operator_id) {
      return res
        .status(400)
        .json({ success: false, message: "Operator ID is required." });
    }
    const buses = await busService.getBusesByOperator("" + operator_id);
    res.status(200).json({ success: true, data: buses });
  } catch (error) {
    console.error("Error fetching buses:", error);
    res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch buses: " + error,
    });
  }
};
