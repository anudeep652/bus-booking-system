import * as busService from "../services/BusService.ts";

/**
 * Create a new bus.
 */
export const createBus = async (req, res) => {
  try {
    const busData = req.body;
    const newBus = await busService.createBus(busData);
    res.status(201).json(newBus);
  } catch (error) {
    console.error("Error creating bus:", error);
    res.status(500).json({ message: "Failed to create bus." });
  }
};

/**
 * Update bus details.
 */
export const updateBus = async (req, res) => {
  try {
    const busId = req.params.id;
    const updateData = req.body;
    const updatedBus = await busService.updateBus(busId, updateData);
    if (!updatedBus) {
      return res.status(404).json({ message: "Bus not found." });
    }
    res.json(updatedBus);
  } catch (error) {
    console.error("Error updating bus:", error);
    res.status(500).json({ message: "Failed to update bus." });
  }
};

/**
 * Delete a bus.
 */
export const deleteBus = async (req, res) => {
  try {
    const busId = req.params.id;
    const deletedBus = await busService.deleteBus(busId);
    if (!deletedBus) {
      return res.status(404).json({ message: "Bus not found." });
    }
    res.json({ message: "Bus deleted successfully." });
  } catch (error) {
    console.error("Error deleting bus:", error);
    res.status(500).json({ message: "Failed to delete bus." });
  }
};

/**
 * Get all buses for a specific operator.
 */
export const getBusesByOperator = async (req, res) => {
  try {
    const { operator_id } = req.query;
    if (!operator_id) {
      return res.status(400).json({ message: "Operator ID is required." });
    }
    const buses = await busService.getBusesByOperator(operator_id);
    res.json(buses);
  } catch (error) {
    console.error("Error fetching buses:", error);
    res.status(500).json({ message: "Failed to fetch buses." });
  }
};
