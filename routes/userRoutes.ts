import * as express from "express";
import { loginUser, registerUser } from "../controllers/userController.ts";

const userRouter = express.Router();

userRouter.post("/register", registerUser);

userRouter.post("/login", loginUser);

export default userRouter;
