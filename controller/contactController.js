import Contact from "../models/contactModel.js";
import Brevo from "@getbrevo/brevo";

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

    // -------------------------
    // BREVO API CONFIG
    // -------------------------
    let apiInstance = new Brevo.TransactionalEmailsApi();
    let apiKey = apiInstance.authentications["apiKey"];
    apiKey.apiKey = process.env.BREVO_API_KEY;

    // -------------------------
    // EMAIL DATA
    // -------------------------
    let sendSmtpEmail = new Brevo.SendSmtpEmail();

    sendSmtpEmail.subject = "📩 New Contact Form Submission";
    sendSmtpEmail.sender = { email: process.env.EMAIL_FROM, name: "Seva Sai Nursing Bureau" };
    sendSmtpEmail.to = [{ email: process.env.ADMIN_EMAIL }];

    sendSmtpEmail.htmlContent = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Contact:</strong> ${contact}</p>
      <p><strong>Location:</strong> ${location}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong> ${message}</p>
      <hr/>
      <small>Automatic email from Seva Sai Nursing Bureau</small>
    `;

    // -------------------------
    // SEND EMAIL
    // -------------------------
    await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log("📩 Admin email sent via Brevo API");

    res.status(201).json({
      success: true,
      message: "Form submitted & email sent to admin!",
      data: newContact,
    });
  } catch (error) {
    console.log("❌ Brevo Email Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while sending email.",
      error: error.message,
    });
  }
};
