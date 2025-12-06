import express from "express";
import Feedback from "../models/feedbackModel.js";
import brevo from "@getbrevo/brevo";

const router = express.Router();

// ------------------------------
// 🔵 Setup Brevo API (same as contactController)
// ------------------------------
const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

// ------------------------------
// 📌 GET all feedbacks
// ------------------------------
router.get("/", async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: "Error fetching feedbacks" });
  }
});

// ------------------------------
// 📌 POST new feedback
// ------------------------------
router.post("/", async (req, res) => {
  try {
    const feedback = new Feedback(req.body);
    const savedFeedback = await feedback.save();

    // 🔵 Emit real-time socket update
    const io = req.app.get("io");
    io.emit("newFeedback", savedFeedback);

    // 🔵 Send email to admin using Brevo API
    const sendSmtpEmail = {
      sender: {
        name: "Seva Sai Nursing Bureau",
        email: process.env.EMAIL_FROM,
      },
      to: [
        {
          email: process.env.ADMIN_EMAIL,
          name: "SSNB Admin",
        },
      ],
      subject: "🆕 New Feedback Received!",
      htmlContent: `
        <h2>New Feedback Submitted</h2>
        <p><strong>Name:</strong> ${req.body.name}</p>
        <p><strong>Phone:</strong> ${req.body.phone}</p>
        <p><strong>Role:</strong> ${req.body.role}</p>
        <p><strong>Location:</strong> ${req.body.location}</p>
        <p><strong>Rating:</strong> ${req.body.rating}</p>
        <p><strong>Comment:</strong> ${req.body.comment}</p>

        <br/>
        <p>Sent automatically from SSNB Website</p>
      `,
    };

    await apiInstance.sendTransacEmail(sendSmtpEmail);

    res.status(201).json(savedFeedback);
  } catch (err) {
    console.error("❌ Error saving feedback:", err);
    res.status(500).json({ message: "Error saving feedback" });
  }
});

export default router;
