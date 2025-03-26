import express from "express";
import { AdminController } from "../controllers/adminController.ts";

const adminRouter = express.Router();
const adminController = new AdminController();

adminRouter.get("/users", (req, res) => adminController.listUsers(req, res));

adminRouter.get("/operators", (req, res) =>
  adminController.listOperators(req, res),
);

adminRouter.put("/users/:id/status", (req, res) =>
  adminController.changeUserStatus(req, res),
);

adminRouter.put("/operators/:id/verification", (req, res) =>
  adminController.changeOperatorVerificationStatus(req, res),
);

adminRouter.get("/trips", (req, res) => adminController.getAllTrips(req, res));

adminRouter.get("/reports", (req, res) => adminController.getReports(req, res));

adminRouter.put("/trips/:id/cancel", (req, res) =>
  adminController.changeTripStatus(req, res, "cancelled"),
);

export default adminRouter;
