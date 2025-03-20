import * as express from "express";
import {
  loginOperator,
  registerOperator,
} from "../controllers/operatorController.ts";

const operatorRouter = express.Router();

operatorRouter.post("/register", registerOperator);

operatorRouter.post("/login", loginOperator);

export default operatorRouter;
