import express from "express";
import {
  submitFeedback,
  getTripFeedback,
  getUserFeedback,
} from "../controllers/feedbackContoller";
import { isAuthenticated } from "../middleware/authMiddleware";

const feedbackRouter = express.Router();

feedbackRouter.post("/", isAuthenticated, submitFeedback);

feedbackRouter.get("/trip/:tripId", getTripFeedback);

feedbackRouter.get("/user", isAuthenticated, getUserFeedback);

feedbackRouter.get("/user/:userId", isAuthenticated, getUserFeedback);

export default feedbackRouter;
