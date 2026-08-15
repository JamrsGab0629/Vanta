
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env['EMAIL_HOST'] || "sandbox.smtp.mailtrap.io",
    port: Number(process.env['EMAIL_PORT']) || 2525,
    auth: {
        user: process.env['EMAIL_USER'],
        pass: process.env['EMAIL_PASS'],
    },
});

export const sendWelcomeEmail = async (to: string, username: string, otp: string) => {
    try {
        await transporter.sendMail({
            from: '"Vanta Ecommerce" <ecommerce@vanta.com>',
            to,
            subject: "Your OTP Verification Code",
            text: `Hi ${username},\n\nYour OTP code is: ${otp}\nIt expires in 10 minutes.\n\nBest regards,\nTeam`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>Welcome, ${username}!</h2>
                    <p>Thank you for registering. Please use the following One-Time Password (OTP) to verify your email:</p>
                    <h1 style="color: #4F46E5; letter-spacing: 2px;">${otp}</h1>
                    <p>This code will expire in 10 minutes.</p>
                </div>
            `,
        });
        console.log(`OTP email successfully sent to ${to}`);
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send email");
    }
};