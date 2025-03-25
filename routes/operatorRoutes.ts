import * as express from "express";
import {
  loginOperator,
  registerOperator,
  createTrip,
  updateTrip,
  cancelTrip,
  viewOperatorBookings,
} from "../controllers/operatorController.ts";

const operatorRouter = express.Router();

operatorRouter.post("/register", registerOperator);

operatorRouter.post("/login", loginOperator);

operatorRouter.post("/api/trips", createTrip);

operatorRouter.put("/api/trips/:id", updateTrip);

operatorRouter.delete("/api/trips/:id", cancelTrip);

operatorRouter.get("/api/bookings/operator", viewOperatorBookings);

export default operatorRouter;
