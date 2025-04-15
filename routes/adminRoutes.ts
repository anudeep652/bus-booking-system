import express from "express";
import * as adminController from "../controllers/adminController";
import { isAdmin, isAuthenticated } from "../middleware/authMiddleware";

const adminRouter = express.Router();

adminRouter.post("/login", adminController.loginAdmin);
adminRouter.post("/register", adminController.registerAdmin);

adminRouter.use(isAuthenticated);
adminRouter.use(isAdmin);

adminRouter.get("/users", adminController.listUsers);

adminRouter.get("/operators", adminController.listOperators);

adminRouter.put("/users/:id/status", adminController.changeUserStatus);

adminRouter.put(
  "/operators/:id/change-verification",
  adminController.changeOperatorVerificationStatus
);

adminRouter.get("/trips", adminController.getAllTrips);

adminRouter.get("/reports", adminController.getReports);

adminRouter.put("/trips/:id/cancel", (req, res) =>
  adminController.changeTripStatus(req, res, "cancelled")
);

export default adminRouter;
