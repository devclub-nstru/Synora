import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config({
  path: "../../.env",
});

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const info = await transporter.sendMail({
  from: `"Synora" <${process.env.SMTP_FROM}>`,
  to: process.env.SMTP_USER,
  subject: "Synora SMTP Test",
  text: "This is a test email from the Synora backend.",
  html: `
    <h2>Synora SMTP Test</h2>
    <p>Congratulations! 🎉</p>
    <p>Your Synora backend can now send emails through Gmail.</p>
  `,
});

console.log("Email sent successfully!");
console.log("Message ID:", info.messageId);
