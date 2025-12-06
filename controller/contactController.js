import Brevo from "@getbrevo/brevo";
import Contact from "../models/contactModel.js";

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

    // Brevo API client
    const apiInstance = new Brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(
      Brevo.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY
    );

    // Email payload
    const emailData = {
      sender: { name: "Seva Sai Alerts", email: process.env.EMAIL_FROM },
      to: [{ email: process.env.ADMIN_EMAIL }],
      subject: "New Contact Form Submission",
      htmlContent: `
        <h2>New Contact Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Phone:</strong> ${contact}</p>
        <p><strong>Location:</strong> ${location}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong> ${message}</p>
        <br><i>Received at: ${new Date().toLocaleString()}</i>
      `,
    };

    // Send Email
    await apiInstance.sendTransacEmail(emailData);

    return res.status(201).json({
      success: true,
      message: "Form submitted & email sent successfully!",
      data: newContact,
    });
  } catch (error) {
    console.error("❌ Error submitting contact form:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while submitting form.",
    });
  }
};
