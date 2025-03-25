import * as operatorController from "../operatorController.ts";
import * as operatorService from "../operatorController.ts";

// Create mock request and response objects.
const createMockReq = (data:any) => ({ ...data });
const createMockRes = () => {
  const res:any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

jest.mock("../../services/OperatorService.ts");

describe("operatorController", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createTrip", () => {
    it("should create a trip and respond with status 201", async () => {
      const req = createMockReq({ body: { source: "City A", destination: "City B" } });
      const res = createMockRes();
      const createdTrip = { _id: "trip123", ...req.body };

      (operatorService.createTrip as jest.Mock).mockResolvedValue(createdTrip);

      await operatorController.createTrip(req, res);
      
      expect(operatorService.createTrip).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdTrip);
    });

    it("should respond with 500 if creation fails", async () => {
      const req = createMockReq({ body: { source: "City A", destination: "City B" } });
      const res = createMockRes();

      (operatorService.createTrip as jest.Mock).mockRejectedValue(new Error("error"));
      
      await operatorController.createTrip(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Failed to create trip." });
    });
  });

  describe("updateTrip", () => {
    it("should update a trip and return updated trip", async () => {
      const req = createMockReq({ params: { id: "trip123" }, body: { price: 60 } });
      const res = createMockRes();
      const updatedTrip = { _id: "trip123", price: 60 };

      (operatorService.updateTrip as jest.Mock).mockResolvedValue(updatedTrip);

      await operatorController.updateTrip(req, res);
      
      expect(operatorService.updateTrip).toHaveBeenCalledWith("trip123", req.body);
      expect(res.json).toHaveBeenCalledWith(updatedTrip);
    });

    it("should return 404 if trip is not found", async () => {
      const req = createMockReq({ params: { id: "trip123" }, body: { price: 60 } });
      const res = createMockRes();

      (operatorService.updateTrip as jest.Mock).mockResolvedValue(null);
      
      await operatorController.updateTrip(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Trip not found." });
    });

    it("should respond with 500 if update fails", async () => {
      const req = createMockReq({ params: { id: "trip123" }, body: { price: 60 } });
      const res = createMockRes();

      (operatorService.updateTrip as jest.Mock).mockRejectedValue(new Error("error"));
      
      await operatorController.updateTrip(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Failed to update trip." });
    });
  });

  describe("cancelTrip", () => {
    it("should cancel a trip and return success message", async () => {
      const req = createMockReq({ params: { id: "trip123" } });
      const res = createMockRes();
      const cancelledTrip = { _id: "trip123" };

      (operatorService.cancelTrip as jest.Mock).mockResolvedValue(cancelledTrip);

      await operatorController.cancelTrip(req, res);
      
      expect(operatorService.cancelTrip).toHaveBeenCalledWith("trip123");
      expect(res.json).toHaveBeenCalledWith({ message: "Trip cancelled successfully." });
    });

    it("should return 404 if trip not found", async () => {
      const req = createMockReq({ params: { id: "trip123" } });
      const res = createMockRes();

      (operatorService.cancelTrip as jest.Mock).mockResolvedValue(null);
      
      await operatorController.cancelTrip(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Trip not found." });
    });

    it("should respond with 500 if cancellation fails", async () => {
      const req = createMockReq({ params: { id: "trip123" } });
      const res = createMockRes();

      (operatorService.cancelTrip as jest.Mock).mockRejectedValue(new Error("error"));
      
      await operatorController.cancelTrip(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Failed to cancel trip." });
    });
  });

  describe("viewOperatorBookings", () => {
    it("should return bookings based on query parameter bus_id", async () => {
      const req = createMockReq({ query: { bus_id: "bus123" } });
      const res = createMockRes();
      const bookings = [{ _id: "booking1" }];

      (operatorService.viewOperatorBookings as jest.Mock).mockResolvedValue(bookings);

      await operatorController.viewOperatorBookings(req, res);
      
      expect(operatorService.viewOperatorBookings).toHaveBeenCalledWith("bus123");
      expect(res.json).toHaveBeenCalledWith(bookings);
    });

    it("should respond with 500 if retrieval fails", async () => {
      const req = createMockReq({ query: {} });
      const res = createMockRes();

      (operatorService.viewOperatorBookings as jest.Mock).mockRejectedValue(new Error("error"));
      
      await operatorController.viewOperatorBookings(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Failed to retrieve bookings." });
    });
  });
});
