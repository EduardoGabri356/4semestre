// ==================== EmailService — ENVIO DE E-MAIL (nodemailer) ====================
// Isola o SMTP do Controller. Gmail exige "senha de app" (verificação em 2 etapas).

import nodemailer from "nodemailer";

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_HOST = process.env.EMAIL_HOST || "smtp.gmail.com";
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || "587", 10);
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Gmail: exige "senha de app" (verificação em 2 etapas ligada). Porta 587 = STARTTLS (secure:false).
const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: EMAIL_PORT === 465,
    auth: { user: EMAIL_USER, pass: EMAIL_PASS }
});

// Envio genérico
export const sendEmail = async ({ to, subject, html }) => {
    await transporter.sendMail({ from: `"Meu App" <${EMAIL_USER}>`, to, subject, html });
};

// Link de redefinição de senha (o front lê o ?token= com useSearchParams)
export const sendPasswordResetEmail = async (toEmail, token) => {
    const resetLink = `${FRONTEND_URL}/reset-password?token=${token}`;
    await sendEmail({
        to: toEmail,
        subject: "Redefinição de Senha Solicitada",
        html: `
          <h2>Redefinição de senha</h2>
          <p>Clique no botão para criar uma nova senha. O link expira em <strong>1 hora</strong>.</p>
          <p><a href="${resetLink}" style="background:#007bff;color:#fff;padding:10px 20px;border-radius:5px;text-decoration:none">Redefinir Senha</a></p>
          <p>Se você não solicitou, ignore este e-mail.</p>`
    });
};
