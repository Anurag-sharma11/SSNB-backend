import Nurse from "../models/Nurse.js";

// Get all nurses
export const getNurses = async (req, res) => {
  try {
    const nurses = await Nurse.find();
    res.json(nurses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a nurse
export const addNurse = async (req, res) => {
  try {
    const newNurse = new Nurse(req.body);
    await newNurse.save();
    res.status(201).json(newNurse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
