import express from "express";
import { getNurses, addNurse } from "../controller/nurseController.js";

const router = express.Router();

router.get("/", getNurses);
router.post("/", addNurse);

export default router;
