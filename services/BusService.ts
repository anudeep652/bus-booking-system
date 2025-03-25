import { Bus } from "../models/busSchema.ts";

/**
 * Create a new bus.
 */
export const createBus = async (busData) => {
  return await Bus.create(busData);
};

/**
 * Update an existing bus.
 */
export const updateBus = async (busId, updateData) => {
  return await Bus.findByIdAndUpdate(busId, updateData, { new: true });
};

/**
 * Delete a bus.
 */
export const deleteBus = async (busId) => {
  return await Bus.findByIdAndDelete(busId);
};

/**
 * Get all buses for a specific operator.
 */
export const getBusesByOperator = async (operatorId) => {
  return await Bus.find({ operator_id: operatorId });
};
