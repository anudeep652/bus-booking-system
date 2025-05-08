import { Router } from "express";
import { getTripDetail, searchTrips } from "../controllers/tripController";

const tripRouter = Router();

tripRouter.get("/search", searchTrips);
tripRouter.get("/:tripId", getTripDetail);

export default tripRouter;
