import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVICE_HOST,
  port: process.env.EMAIL_SERVICE_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_SERVICE_USER,
    pass: process.env.EMAIL_SERVICE_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const sendResetEmail = async (userEmail, token) => {
  const resetUrl = `http://localhost:4200/auth/reset-password?token=${token}`;
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: userEmail,
    subject: "Restablecer Contraseña HomeFinder",
    html: `
            <h1>Restablecimiento de Contraseña</h1>
            <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
            <a href="${resetUrl}">Restablecer mi Contraseña</a>
            <p>El enlace expirará en 1 hora. Si no solicitaste un cambio de contraseña, ignora este correo.</p>
        `,
  };

  await transporter.sendMail(mailOptions);
};
