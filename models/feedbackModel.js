import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    name: String,
    phone: String,
    rating: Number,
    role: String,
    location: String,
    comment: String,
  },
  { timestamps: true }
);

const Feedback = mongoose.model("Feedback", feedbackSchema);
export default Feedback;
