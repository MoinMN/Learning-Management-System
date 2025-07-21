import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  }
});

const sendMail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"LMS" <${process.env.SMTP_USER}>`,
      to,       // receiver email
      subject,  // subject line
      html,     // html body
    });

    return info;
  } catch (error) {
    console.error("Mail sending error:", error);
    throw new Error("Failed to send email");
  }
}

export default sendMail;