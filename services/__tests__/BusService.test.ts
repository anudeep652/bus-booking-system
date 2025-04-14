import { BusService } from "../BusService.ts";
import { Bus } from "../../models/busSchema.ts";
import type { RequireAtLeastOne, TBus } from "../../types/index.ts";

jest.mock("../../models/busSchema.ts");

const mockBusCreate = Bus.create as jest.Mock;
const mockBusFindByIdAndUpdate = Bus.findByIdAndUpdate as jest.Mock;
const mockBusFindByIdAndDelete = Bus.findByIdAndDelete as jest.Mock;
const mockBusFind = Bus.find as jest.Mock;

describe("BusService", () => {
  let busService: BusService;

  beforeEach(() => {
    busService = new BusService();
    jest.clearAllMocks();
  });

  describe("createBus", () => {
    const busData: TBus = {
      _id: "bus1",
      operator_id: "op1",
      bus_number: "TN01AB1234",
      total_seats: 40,
      bus_type: "Sleeper",
      amenities: ["AC", "Charging Port"],
    };

    it("should create a bus successfully", async () => {
      mockBusCreate.mockResolvedValue(busData);

      const result = await busService.createBus(busData);

      expect(Bus.create).toHaveBeenCalledWith(busData);
      expect(result).toEqual(busData);
    });

    it("should throw an error if bus creation fails", async () => {
      const dbError = new Error("Database error during creation");
      mockBusCreate.mockRejectedValue(dbError);

      await expect(busService.createBus(busData)).rejects.toThrow(
        `Failed to create bus: ${dbError.message}`
      );
      expect(Bus.create).toHaveBeenCalledWith(busData);
    });

    it("should handle non-Error objects thrown during creation", async () => {
      const nonError = { message: "Something went wrong" };
      mockBusCreate.mockRejectedValue(nonError);

      await expect(busService.createBus(busData)).rejects.toThrow(
        `Failed to create bus: ${nonError}`
      );
      expect(Bus.create).toHaveBeenCalledWith(busData);
    });
  });

  describe("updateBus", () => {
    const busId = "bus123";
    const updateData: RequireAtLeastOne<Omit<TBus, "_id">> = {
      total_seats: 45,
      bus_type: "Semi-Sleeper",
    };
    const updatedBusDoc = {
      _id: busId,
      operator_id: "op1",
      bus_number: "KA01CD5678",
      capacity: 45,
      bus_type: "Semi-Sleeper",
      amenities: ["AC"],
    };

    it("should update a bus successfully", async () => {
      mockBusFindByIdAndUpdate.mockResolvedValue(updatedBusDoc);

      const result = await busService.updateBus(busId, updateData);

      expect(Bus.findByIdAndUpdate).toHaveBeenCalledWith(busId, updateData, {
        new: true,
      });
      expect(result).toEqual(updatedBusDoc);
    });

    it("should throw an error if the bus to update is not found", async () => {
      mockBusFindByIdAndUpdate.mockResolvedValue(null);

      await expect(busService.updateBus(busId, updateData)).rejects.toThrow(
        `Failed to update bus: Bus with ID ${busId} not found`
      );
      expect(Bus.findByIdAndUpdate).toHaveBeenCalledWith(busId, updateData, {
        new: true,
      });
    });

    it("should throw an error if bus update fails due to DB error", async () => {
      const dbError = new Error("Database error during update");
      mockBusFindByIdAndUpdate.mockRejectedValue(dbError);

      await expect(busService.updateBus(busId, updateData)).rejects.toThrow(
        `Failed to update bus: ${dbError.message}`
      );
      expect(Bus.findByIdAndUpdate).toHaveBeenCalledWith(busId, updateData, {
        new: true,
      });
    });

    it("should handle non-Error objects thrown during update", async () => {
      const nonError = "Update failed unexpectedly";
      mockBusFindByIdAndUpdate.mockRejectedValue(nonError);

      await expect(busService.updateBus(busId, updateData)).rejects.toThrow(
        `Failed to update bus: ${nonError}`
      );
      expect(Bus.findByIdAndUpdate).toHaveBeenCalledWith(busId, updateData, {
        new: true,
      });
    });
  });

  describe("deleteBus", () => {
    const busId = "bus456";
    const deletedBusDoc = {
      _id: busId,
      operator_id: "op2",
      bus_number: "TN02EF9012",
      capacity: 30,
      bus_type: "Seater",
      amenities: [],
    };

    it("should delete a bus successfully", async () => {
      mockBusFindByIdAndDelete.mockResolvedValue(deletedBusDoc);

      const result = await busService.deleteBus(busId);

      expect(Bus.findByIdAndDelete).toHaveBeenCalledWith(busId);
      expect(result).toEqual(deletedBusDoc);
    });

    it("should throw an error if the bus to delete is not found", async () => {
      mockBusFindByIdAndDelete.mockResolvedValue(null);

      await expect(busService.deleteBus(busId)).rejects.toThrow(
        `Failed to delete bus: Bus with ID ${busId} not found`
      );
      expect(Bus.findByIdAndDelete).toHaveBeenCalledWith(busId);
    });

    it("should throw an error if bus deletion fails due to DB error", async () => {
      const dbError = new Error("Database error during deletion");
      mockBusFindByIdAndDelete.mockRejectedValue(dbError);

      await expect(busService.deleteBus(busId)).rejects.toThrow(
        `Failed to delete bus: ${dbError.message}`
      );
      expect(Bus.findByIdAndDelete).toHaveBeenCalledWith(busId);
    });

    it("should handle non-Error objects thrown during deletion", async () => {
      const nonError = { detail: "Deletion conflict" };
      mockBusFindByIdAndDelete.mockRejectedValue(nonError);

      await expect(busService.deleteBus(busId)).rejects.toThrow(
        `Failed to delete bus: ${nonError}`
      );
      expect(Bus.findByIdAndDelete).toHaveBeenCalledWith(busId);
    });
  });

  describe("getBusesByOperator", () => {
    const operatorId = "op3";
    const busesList = [
      {
        _id: "bus7",
        operator_id: operatorId,
        bus_number: "AP03GH3456",
        capacity: 50,
        bus_type: "Sleeper",
        amenities: ["AC", "Wifi"],
      },
      {
        _id: "bus8",
        operator_id: operatorId,
        bus_number: "AP03IJ7890",
        capacity: 40,
        bus_type: "Semi-Sleeper",
        amenities: ["AC"],
      },
    ];

    it("should return buses for a given operator ID", async () => {
      mockBusFind.mockResolvedValue(busesList);

      const result = await busService.getBusesByOperator(operatorId);

      expect(Bus.find).toHaveBeenCalledWith({ operator_id: operatorId });
      expect(result).toEqual(busesList);
    });

    it("should return an empty array if no buses are found for the operator", async () => {
      mockBusFind.mockResolvedValue([]);

      const result = await busService.getBusesByOperator(operatorId);

      expect(Bus.find).toHaveBeenCalledWith({ operator_id: operatorId });
      expect(result).toEqual([]);
    });

    it("should throw an error if fetching buses fails", async () => {
      const dbError = new Error("Database error during find");
      mockBusFind.mockRejectedValue(dbError);

      await expect(busService.getBusesByOperator(operatorId)).rejects.toThrow(
        `Failed to fetch buses: ${dbError.message}`
      );
      expect(Bus.find).toHaveBeenCalledWith({ operator_id: operatorId });
    });

    it("should handle non-Error objects thrown during fetch", async () => {
      const nonError = "Fetch problem";
      mockBusFind.mockRejectedValue(nonError);

      await expect(busService.getBusesByOperator(operatorId)).rejects.toThrow(
        `Failed to fetch buses: ${nonError}`
      );
      expect(Bus.find).toHaveBeenCalledWith({ operator_id: operatorId });
    });
  });
});
