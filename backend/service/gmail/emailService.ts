import nodemailer from 'nodemailer';
import { z } from 'zod';

const smtpConfigSchema = z.object({
  host: z.string().min(1, 'SMTP_HOST is required'),
  port: z.preprocess(
    (val) => (val === '' || val === undefined ? 587 : val),
    z.coerce.number().int().min(1).max(65535),
  ),
  secure: z.preprocess((val) => String(val).toLowerCase() === 'true', z.boolean()),
  user: z.string().min(1, 'SMTP_USER is required'),
  pass: z.string().min(1, 'SMTP_PASS is required'),
  from: z.string().email('SMTP_FROM must be a valid email address'),
});

let transporter: nodemailer.Transporter | undefined;
let fromAddress: string | undefined;

const getMailer = () => {
  if (transporter && fromAddress) return { transporter, fromAddress };

  const config = smtpConfigSchema.parse({
    host: process.env['SMTP_HOST'],
    port: process.env['SMTP_PORT'],
    secure: process.env['SMTP_SECURE'],
    user: process.env['SMTP_USER'],
    pass: process.env['SMTP_PASS'],
    from: process.env['SMTP_FROM'],
  });

  transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure, // false for port 587 (STARTTLS), true for port 465
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  fromAddress = config.from;

  return { transporter, fromAddress };
};

export const sendVerificationEmail = async (to: string, username: string, otp: string) => {
  const mailer = getMailer();

  await mailer.transporter.sendMail({
    from: `"Vanta Ecommerce" <${mailer.fromAddress}>`,
    to,
    subject: 'Your Vanta verification code',
    text: `Hi ${username},\n\nYour verification code is: ${otp}\nIt expires in 10 minutes.\n\nVanta`,
    html: `<div style="font-family: Arial, sans-serif; padding: 20px;"><h2>Welcome, ${username}!</h2><p>Your verification code is:</p><h1 style="letter-spacing: 2px;">${otp}</h1><p>This code expires in 10 minutes.</p></div>`,
  });
};
