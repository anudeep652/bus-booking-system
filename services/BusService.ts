import { Bus } from "../models/index.ts";
import type { RequireAtLeastOne, TBus } from "../types/index.ts";

export class BusService {
  async createBus(busData: TBus) {
    try {
      return await Bus.create(busData);
    } catch (error) {
      throw new Error(
        `Failed to create bus: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  }

  async updateBus(
    busId: string,
    updateData: RequireAtLeastOne<Omit<TBus, "_id">>
  ) {
    try {
      const updatedBus = await Bus.findByIdAndUpdate(busId, updateData, {
        new: true,
      });
      if (!updatedBus) {
        throw new Error(`Bus with ID ${busId} not found`);
      }
      return updatedBus;
    } catch (error) {
      throw new Error(
        `Failed to update bus: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  }

  async deleteBus(busId: string) {
    try {
      const deletedBus = await Bus.findByIdAndDelete(busId);
      if (!deletedBus) {
        throw new Error(`Bus with ID ${busId} not found`);
      }
      return deletedBus;
    } catch (error) {
      throw new Error(
        `Failed to delete bus: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  }

  async getBusesByOperator(operatorId: string) {
    try {
      return await Bus.find({ operator_id: operatorId });
    } catch (error) {
      throw new Error(
        `Failed to fetch buses: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  }
}
