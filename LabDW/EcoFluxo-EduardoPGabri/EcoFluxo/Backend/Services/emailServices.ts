import * as nodemailer from "nodemailer";

const { EMAIL_USER, EMAIL_PASS, EMAIL_HOST } = process.env;
const EMAIL_PORT = Number(process.env.EMAIL_PORT) || 587;
const producao = process.env.NODE_ENV === "production";

//configurar o transporte do email (porta 465 usa TLS direto; 587 usa STARTTLS)
const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: EMAIL_PORT === 465,
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    },
});

const montarEmail = (toEmail: string, codigo: string) => ({
    from: `"EcoFluxo" <${EMAIL_USER}>`,
    to: toEmail,
    subject: "Código de Verificação de Acesso",
    html: `
    <div style="font-family:sans-serif; max-width:500px; margin:0 auto; border:1px solid #e2e8f0; padding:20px; border-radius:8px;">
        <h2 style="color:#1e3a8a; text-align:center;">Verificação em Duas Etapas</h2>
        <p>Você iniciou o login no EcoFluxo. Use o código de segurança abaixo para concluir a sua autenticação:</p>
        <div style="background-color:#f8fafc; border:1px dashed #cbd5e1; padding:15px; text-align:center; margin:20px 0; border-radius:6px;">
            <span style="font-size:32px; font-weight:bold; letter-spacing:5px; color:#1e3a8a;">${codigo}</span>
        </div>
        <p style="font-size:14px; color:#64748b;">
            Este código é válido por <strong>10 minutos</strong> e só pode ser utilizado uma única vez.
        </p>
        <p style="font-size:12px; color:#94a3b8; text-align:center;">
            Se você não tentou realizar o login, altere imediatamente a sua senha no EcoFluxo.
        </p>
    </div>
    `,
});

export const send2FACodeEmail = async (toEmail: string, codigo: string) => {
    try {
        await transporter.sendMail(montarEmail(toEmail, codigo));
        console.log(`E-mail de 2FA enviado com sucesso para: ${toEmail}`);
    } catch (error) {
        //em produção, falha de envio é erro de verdade
        if (producao) throw error;

        //em desenvolvimento o login continua e o código aparece aqui no terminal (não precisa configurar e-mail)
        const motivo = error instanceof Error ? error.message.split("\n")[0] : "erro desconhecido";
        console.warn(`[DEV] Não foi possível enviar o e-mail (${motivo}).`);
        console.log(`[DEV] >>> Código de verificação de ${toEmail}: ${codigo}`);
    }
};