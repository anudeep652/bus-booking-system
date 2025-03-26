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

adminRouter.get("/reports", (req, res) => adminController.getReports(req, res));

export default adminRouter;
