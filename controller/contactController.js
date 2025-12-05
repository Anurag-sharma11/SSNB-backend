import Contact from "../models/contactModel.js";
import axios from "axios";

export const submitContactForm = async (req, res) => {
  try {
    const { name, contact, location, email, message } = req.body;

    if (!name || !contact || !location || !email || !message) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required!" });
    }

    // Save to DB
    const newContact = await Contact.create({
      name,
      contact,
      location,
      email,
      message,
    });

    // Email Body for Admin
    const htmlContent = `
      <h2>📩 New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Contact:</strong> ${contact}</p>
      <p><strong>Location:</strong> ${location}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong> ${message}</p>
      <p><em>${new Date().toLocaleString()}</em></p>
    `;

    // Send email using Brevo API
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { name: "Seva Sai Nursing Bureau", email: process.env.ADMIN_EMAIL },
        to: [{ email: process.env.ADMIN_EMAIL }],
        subject: "New Contact Form Submission",
        htmlContent,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.BREVO_API_KEY,
        },
      }
    );

    console.log("✅ Email sent via Brevo API");

    return res.status(201).json({
      success: true,
      data: newContact,
      message: "Form submitted successfully & email alert sent!",
    });
  } catch (error) {
    console.error("❌ Error submitting contact form:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error while submitting form." });
  }
};
