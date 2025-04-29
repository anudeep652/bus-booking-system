import { Router } from "express";
import { searchTrips } from "../controllers/tripController";

const tripRouter = Router();

tripRouter.get("/search", searchTrips);

export default tripRouter;
