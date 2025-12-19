
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendApprovalEmail = async (to, password, note) => {
  await transporter.sendMail({
    to,
    subject: "Mess Management Application Approved",
    html: `
      <p>Your mess has been approved.</p>
      <p><b>Login Email:</b> ${to}</p>
      <p><b>Password:</b> ${password}</p>
      <p>${note || ""}</p>
    `,
  });
};

export const sendRejectionEmail = async (to, note) => {
  await transporter.sendMail({
    to,
    subject: "Mess Management Application Rejected",
    html: `
      <p>Your application was rejected.</p>
      <p>Reason: ${note || "Not specified"}</p>
    `,
  });
};
