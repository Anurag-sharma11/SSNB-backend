import Contact from "../models/contactModel.js";
import nodemailer from "nodemailer";

// Create transporter ONCE (not inside function)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,      // smtp-relay.brevo.com
  port: process.env.SMTP_PORT,      // 587
  secure: false,
  auth: {
    user: process.env.SMTP_USER,    // your Brevo login email
    pass: process.env.SMTP_PASS,    // your SMTP key
  },
});

export const submitContactForm = async (req, res) => {
  try {
    const { name, contact, location, email, message } = req.body;

    // Validate inputs
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

    // Email sent to admin
    const adminMailOptions = {
      from: `"Seva Sai Nursing Bureau" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: "📩 New Contact Form Submission",
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Contact:</strong> ${contact}</p>
        <p><strong>Location:</strong> ${location}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong> ${message}</p>
        <br/>
        <p><em>Submitted at: ${new Date().toLocaleString()}</em></p>
      `,
    };

    // Send email
    await transporter.sendMail(adminMailOptions);
    console.log("Email sent to admin successfully!");

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
