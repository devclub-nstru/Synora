import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendVerificationEmail = async ({ to, name, verificationUrl }) => {
  const info = await transporter.sendMail({
    from: `"Synora" <${process.env.SMTP_FROM}>`,

    to,

    subject: "Verify your Synora account",

    text: `
Hi ${name},

Welcome to Synora!

Please verify your email address by clicking the link below:

${verificationUrl}

This link will expire in 30 minutes.

If you did not create a Synora account, you can safely ignore this email.

Thanks,
Synora Team
`,

    html: `
      <div
        style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 40px auto;
          padding: 30px;
          border: 1px solid #ddd;
          border-radius: 10px;
        "
      >
        <h1>Welcome to Synora 👋</h1>

        <p>Hi ${name},</p>

        <p>
          Thanks for creating your Synora account.
        </p>

        <p>
          Please verify your email address to activate your account.
        </p>

        <div style="margin: 30px 0;">
          <a
            href="${verificationUrl}"
            style="
              background: #70020f;
              color: white;
              padding: 12px 20px;
              text-decoration: none;
              border-radius: 6px;
              display: inline-block;
            "
          >
            Verify Email
          </a>
        </div>

        <p>
          This verification link will expire in
          <strong>30 minutes</strong>.
        </p>

        <p>
          If you did not create a Synora account,
          you can safely ignore this email.
        </p>

        <br />

        <p>
          Thanks,<br />
          Synora Team
        </p>
      </div>
    `,
  });

  console.log("Verification email sent:", info.messageId);

  return info;
};
