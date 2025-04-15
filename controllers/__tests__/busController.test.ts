import type { Request, Response } from "express";
import {
  createBus,
  updateBus,
  deleteBus,
  getBusesByOperator,
} from "../../controllers/busController";
import { BusService } from "../../services/BusService";

jest.mock("../../services/BusService");

const mockBusService = BusService as jest.MockedClass<typeof BusService>;

describe("Bus Controller", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseJson: jest.Mock;
  let responseStatus: jest.Mock;

  beforeEach(() => {
    responseJson = jest.fn();
    responseStatus = jest.fn().mockReturnValue({ json: responseJson });
    mockRequest = {
      body: {},
      params: {},
      query: {},
    };
    mockResponse = {
      status: responseStatus,
      json: responseJson,
    };
    jest.clearAllMocks();
  });

  describe("createBus", () => {
    it("should create a bus and return 201 status", async () => {
      const busData = {
        plateNumber: "TS01AB1234",
        capacity: 50,
        operator_id: "op1",
      };
      const createdBus = { id: "bus1", ...busData };
      mockRequest.body = busData;
      (mockBusService.prototype.createBus as jest.Mock).mockResolvedValue(
        createdBus
      );

      await createBus(mockRequest as Request, mockResponse as Response);

      expect(mockBusService.prototype.createBus).toHaveBeenCalledWith(busData);
      expect(responseStatus).toHaveBeenCalledWith(201);
      expect(responseJson).toHaveBeenCalledWith({
        success: true,
        data: createdBus,
      });
    });

    it("should return 500 if bus creation fails with an Error", async () => {
      const busData = {
        plateNumber: "TS01AB1234",
        capacity: 50,
        operator_id: "op1",
      };
      const errorMessage = "Database error";
      mockRequest.body = busData;
      (mockBusService.prototype.createBus as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      await createBus(mockRequest as Request, mockResponse as Response);

      expect(mockBusService.prototype.createBus).toHaveBeenCalledWith(busData);
      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({
        success: false,
        message: errorMessage,
      });
    });

    it("should return 500 if bus creation fails with a non-Error", async () => {
      const busData = {
        plateNumber: "TS01AB1234",
        capacity: 50,
        operator_id: "op1",
      };
      const errorObject = { code: "UNEXPECTED" };
      mockRequest.body = busData;
      (mockBusService.prototype.createBus as jest.Mock).mockRejectedValue(
        errorObject
      );

      await createBus(mockRequest as Request, mockResponse as Response);

      expect(mockBusService.prototype.createBus).toHaveBeenCalledWith(busData);
      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({
        success: false,
        message: "Failed to create bus: " + errorObject,
      });
    });
  });

  describe("updateBus", () => {
    const busId = "bus1";
    const updateData = { capacity: 55 };

    it("should update a bus and return 200 status", async () => {
      const updatedBus = { id: busId, capacity: 55, plateNumber: "OLDPLATE" };
      mockRequest.params = { id: busId };
      mockRequest.body = updateData;
      (mockBusService.prototype.updateBus as jest.Mock).mockResolvedValue(
        updatedBus
      );

      await updateBus(mockRequest as Request, mockResponse as Response);

      expect(mockBusService.prototype.updateBus).toHaveBeenCalledWith(
        busId,
        updateData
      );
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith({
        success: true,
        data: updatedBus,
      });
    });

    it("should return 404 if bus to update is not found", async () => {
      mockRequest.params = { id: busId };
      mockRequest.body = updateData;
      (mockBusService.prototype.updateBus as jest.Mock).mockResolvedValue(null);

      await updateBus(mockRequest as Request, mockResponse as Response);

      expect(mockBusService.prototype.updateBus).toHaveBeenCalledWith(
        busId,
        updateData
      );
      expect(responseStatus).toHaveBeenCalledWith(404);
      expect(responseJson).toHaveBeenCalledWith({
        success: false,
        message: "Bus not found.",
      });
    });

    it("should return 500 if bus update fails with an Error", async () => {
      const errorMessage = "Update failed";
      mockRequest.params = { id: busId };
      mockRequest.body = updateData;
      (mockBusService.prototype.updateBus as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      await updateBus(mockRequest as Request, mockResponse as Response);

      expect(mockBusService.prototype.updateBus).toHaveBeenCalledWith(
        busId,
        updateData
      );
      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({
        message: errorMessage,
      });
    });

    it("should return 500 if bus update fails with a non-Error", async () => {
      const errorObject = "Something strange happened";
      mockRequest.params = { id: busId };
      mockRequest.body = updateData;
      (mockBusService.prototype.updateBus as jest.Mock).mockRejectedValue(
        errorObject
      );

      await updateBus(mockRequest as Request, mockResponse as Response);

      expect(mockBusService.prototype.updateBus).toHaveBeenCalledWith(
        busId,
        updateData
      );
      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({
        message: "Failed to update bus: " + errorObject,
      });
    });
  });

  describe("deleteBus", () => {
    const busId = "busToDelete";

    it("should delete a bus and return 200 status", async () => {
      const deletedBusMock = { id: busId };
      mockRequest.params = { id: busId };
      (mockBusService.prototype.deleteBus as jest.Mock).mockResolvedValue(
        deletedBusMock
      );

      await deleteBus(mockRequest as Request, mockResponse as Response);

      expect(mockBusService.prototype.deleteBus).toHaveBeenCalledWith(busId);
      expect(responseStatus).not.toHaveBeenCalled();
      expect(responseJson).toHaveBeenCalledWith({
        success: true,
        message: "Bus deleted successfully.",
      });
    });

    it("should return 404 if bus to delete is not found", async () => {
      mockRequest.params = { id: busId };
      (mockBusService.prototype.deleteBus as jest.Mock).mockResolvedValue(null);

      await deleteBus(mockRequest as Request, mockResponse as Response);

      expect(mockBusService.prototype.deleteBus).toHaveBeenCalledWith(busId);
      expect(responseStatus).toHaveBeenCalledWith(404);
      expect(responseJson).toHaveBeenCalledWith({
        success: false,
        message: "Bus not found.",
      });
    });

    it("should return 500 if bus deletion fails with an Error", async () => {
      const errorMessage = "Deletion error";
      mockRequest.params = { id: busId };
      (mockBusService.prototype.deleteBus as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      await deleteBus(mockRequest as Request, mockResponse as Response);

      expect(mockBusService.prototype.deleteBus).toHaveBeenCalledWith(busId);
      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({
        success: false,
        message: errorMessage,
      });
    });

    it("should return 500 if bus deletion fails with a non-Error", async () => {
      const errorObject = { detail: "Constraint violation" };
      mockRequest.params = { id: busId };
      (mockBusService.prototype.deleteBus as jest.Mock).mockRejectedValue(
        errorObject
      );

      await deleteBus(mockRequest as Request, mockResponse as Response);

      expect(mockBusService.prototype.deleteBus).toHaveBeenCalledWith(busId);
      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({
        success: false,
        message: "Failed to delete bus: " + errorObject,
      });
    });
  });

  describe("getBusesByOperator", () => {
    const operatorId = "op123";

    it("should return buses for an operator and 200 status", async () => {
      const buses = [
        { id: "bus1", plateNumber: "AA1", operator_id: operatorId },
        { id: "bus2", plateNumber: "BB2", operator_id: operatorId },
      ];
      mockRequest.query = { operator_id: operatorId };
      (
        mockBusService.prototype.getBusesByOperator as jest.Mock
      ).mockResolvedValue(buses);

      await getBusesByOperator(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockBusService.prototype.getBusesByOperator).toHaveBeenCalledWith(
        operatorId
      );
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith({ success: true, data: buses });
    });

    it("should return 400 if operator_id query param is missing", async () => {
      mockRequest.query = {};

      await getBusesByOperator(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(
        mockBusService.prototype.getBusesByOperator
      ).not.toHaveBeenCalled();
      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        success: false,
        message: "Operator ID is required.",
      });
    });

    it("should return 500 if fetching buses fails with an Error", async () => {
      const errorMessage = "Fetch error";
      mockRequest.query = { operator_id: operatorId };
      (
        mockBusService.prototype.getBusesByOperator as jest.Mock
      ).mockRejectedValue(new Error(errorMessage));
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await getBusesByOperator(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockBusService.prototype.getBusesByOperator).toHaveBeenCalledWith(
        operatorId
      );
      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({
        success: false,
        message: errorMessage,
      });
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it("should return 500 if fetching buses fails with a non-Error", async () => {
      const errorObject = "Timeout";
      mockRequest.query = { operator_id: operatorId };
      (
        mockBusService.prototype.getBusesByOperator as jest.Mock
      ).mockRejectedValue(errorObject);
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await getBusesByOperator(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockBusService.prototype.getBusesByOperator).toHaveBeenCalledWith(
        operatorId
      );
      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({
        success: false,
        message: "Failed to fetch buses: " + errorObject,
      });
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });
});
