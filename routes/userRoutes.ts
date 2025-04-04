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


userRouter.get("/profile/:id", isAuthenticated,getProfile);

userRouter.put("/profile/:id", isAuthenticated,updateProfile);

export default userRouter;
