import * as express from "express";
import {
  loginUser,
  registerUser,
  getProfile,
  updateProfile,
} from "../controllers/userController.ts";
import { isAuthenticated } from "../middleware/authMiddleware.ts";

const userRouter = express.Router();

userRouter.post("/register", registerUser);

userRouter.post("/login", loginUser);

userRouter.use(isAuthenticated);

userRouter.get("/profile/:id", getProfile);

userRouter.put("/profile/:id", updateProfile);

export default userRouter;
