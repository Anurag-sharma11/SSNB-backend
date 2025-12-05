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

    // Save contact to database
    const newContact = await Contact.create({
      name,
      contact,
      location,
      email,
      message,
    });

    // SMTP Transport (Brevo)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Email details
    const adminMailOptions = {
      from: `"Seva Sai Alerts" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: "📩 New Contact Form Submission",
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Contact:</strong> ${contact}</p>
        <p><strong>Location:</strong> ${location}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong> ${message}</p>
        <p><em>Submitted at: ${new Date().toLocaleString()}</em></p>
      `,
    };

    // Send Email
    await transporter.sendMail(adminMailOptions);
    console.log("Email sent successfully!");

    return res.status(201).json({
      success: true,
      message: "Message sent successfully!",
      data: newContact,
    });

  } catch (error) {
    console.error("Email Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Try again later.",
    });
  }
};
