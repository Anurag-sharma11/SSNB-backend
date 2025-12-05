import express from "express";
import Feedback from "../models/feedbackModel.js";

const router = express.Router();

// 🧠 Get all feedbacks
router.get("/", async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: "Error fetching feedbacks" });
  }
});

// 💬 Add new feedback
router.post("/", async (req, res) => {
  try {
    const feedback = new Feedback(req.body);
    const savedFeedback = await feedback.save();

    // ✅ Emit real-time event
    const io = req.app.get("io"); // get io instance from app
    io.emit("newFeedback", savedFeedback);

    res.status(201).json(savedFeedback);
  } catch (err) {
    res.status(500).json({ message: "Error saving feedback" });
  }
});

export default router;
