import express from "express";
import * as busController from "../controllers/busController";

const router = express.Router();

router.post("/", busController.createBus);
router.put("/:id", busController.updateBus);
router.delete("/:id", busController.deleteBus);
router.get("/", busController.getBusesByOperator);

export default router;
