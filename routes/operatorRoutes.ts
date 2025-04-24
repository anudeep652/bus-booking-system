import * as express from "express";
import {
  loginOperator,
  registerOperator,
  createTrip,
  updateTrip,
  cancelTrip,
  viewOperatorBookings,
} from "../controllers/operatorController";
import { isAuthenticated, isOperator } from "../middleware/authMiddleware";

const operatorRouter = express.Router();

operatorRouter.post("/register", registerOperator);

operatorRouter.post("/login", loginOperator);

operatorRouter.use(isAuthenticated);
operatorRouter.use(isOperator);
operatorRouter.post("/trips", createTrip);

operatorRouter.put("/trips/:id", updateTrip);

operatorRouter.delete("/trips/:id", cancelTrip);

operatorRouter.get("/bookings/operator", viewOperatorBookings);

export default operatorRouter;
