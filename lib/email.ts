import nodemailer from "nodemailer";
import prisma from "@/lib/prisma";

type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
  template?: string;
  payload?: Record<string, unknown>;
};

export async function sendEmailAndLog(params: SendEmailParams) {
  const { to, subject, html, template, payload } = params;

  const log = await (prisma as any).emailLog.create({
    data: {
      to,
      subject,
      template: template ?? null,
      payload: payload ? (payload as any) : undefined,
      status: "PENDING",
    },
  });

  try {
    const host = process.env.EMAIL_SERVER_HOST;
    const port = Number(process.env.EMAIL_SERVER_PORT || 587);
    const secure = port === 465;
    const user = process.env.EMAIL_SERVER_USER;
    const pass = process.env.EMAIL_SERVER_PASSWORD;
    const from = process.env.EMAIL_FROM || "no-reply@tawsia.app";

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user && pass ? { user, pass } : undefined,
    });

    await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });

    await (prisma as any).emailLog.update({
      where: { id: log.id },
      data: { status: "SENT", sentAt: new Date() },
    });
  } catch (error: any) {
    await (prisma as any).emailLog.update({
      where: { id: log.id },
      data: { status: "FAILED", errorMessage: String(error?.message || error) },
    });
    throw error;
  }
}
