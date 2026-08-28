import 'server-only';
import nodemailer from 'nodemailer';

export async function sendPasswordResetEmail(to: string, token: string) {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const password = process.env.SMTP_PASSWORD;
    const from = process.env.SMTP_FROM;
    const appUrl = process.env.APP_URL;
    if (!host || !user || !password || !from || !appUrl) throw new Error('SMTP and APP_URL configuration is required');

    const transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass: password } });
    await transporter.sendMail({
        from,
        to,
        subject: 'Reset your portfolio admin password',
        text: `Reset your password within 15 minutes: ${appUrl}/admin/reset-password?token=${encodeURIComponent(token)}`,
    });
}
