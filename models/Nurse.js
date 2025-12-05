import mongoose from "mongoose";

const nurseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  experience: { type: Number, required: true },
  specialization: { type: String, required: true },
  availability: { type: Boolean, default: true },
});

const Nurse = mongoose.model("Nurse", nurseSchema);

export default Nurse;
