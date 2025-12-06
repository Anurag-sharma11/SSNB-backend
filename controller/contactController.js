import Contact from "../models/contactModel.js";
import nodemailer from "nodemailer";

export const submitContactForm = async (req, res) => {
  try {
    const { name, contact, location, email, message } = req.body;

    if (!name || !contact || !location || !email || !message) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required!" });
    }

    // Save form data
    const newContact = await Contact.create({
      name,
      contact,
      location,
      email,
      message,
    });

    // ------------------ BREVO SMTP ------------------
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // port 587 -> secure: false
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const adminMailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.ADMIN_EMAIL,
      subject: "📩 New Contact Form Submission",
      html: `
        <h2>New Contact Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Contact:</strong> ${contact}</p>
        <p><strong>Location:</strong> ${location}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
    };

    await transporter.sendMail(adminMailOptions);
    console.log("✅ Email sent via Brevo SMTP");

    return res.status(201).json({
      success: true,
      message: "Form submitted successfully!",
      data: newContact,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while submitting form.",
    });
  }
};
