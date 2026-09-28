import express from "express";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // In-memory store for verification codes: email -> { code, expiresAt }
  const verificationCodes = new Map<
    string,
    { code: string; expiresAt: number }
  >();

  // GET /api/mail-status - Check if Gmail SMTP is configured
  app.get("/api/mail-status", (_req, res) => {
    const user = process.env.SMTP_GMAIL_USER?.trim() || "";
    const pass = process.env.SMTP_GMAIL_APP_PASSWORD?.trim() || "";
    const isConfigured = user.length > 0 && pass.length > 0;

    res.json({
      configured: isConfigured,
      senderEmail: isConfigured
        ? user.replace(/(.{2})(.*)(@.*)/, "$1***$3")
        : null,
    });
  });

  // POST /api/send-verification-code - Send 6-digit OTP code to Gmail
  app.post("/api/send-verification-code", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email || typeof email !== "string") {
        return res
          .status(400)
          .json({ success: false, error: "Correo electrónico no válido." });
      }

      const cleanEmail = email.trim().toLowerCase();
      const gmailUser = process.env.SMTP_GMAIL_USER?.trim() || "";
      const gmailPass = process.env.SMTP_GMAIL_APP_PASSWORD?.trim() || "";

      if (!gmailUser || !gmailPass) {
        return res.status(503).json({
          success: false,
          missingConfig: true,
          error:
            "Falta configurar SMTP_GMAIL_USER y SMTP_GMAIL_APP_PASSWORD en las variables de entorno (.env).",
        });
      }

      // Generate 6-digit numeric OTP
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes valid

      verificationCodes.set(cleanEmail, { code, expiresAt });

      // Create Nodemailer Gmail transport
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
      });

      const mailOptions = {
        from: `"StreamManager Pro" <${gmailUser}>`,
        to: cleanEmail,
        subject: `Tu código de seguridad de StreamManager Pro: ${code}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #4f46e5; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">StreamManager Pro</h1>
              <p style="color: #64748b; font-size: 13px; margin: 6px 0 0 0;">Verificación de Seguridad</p>
            </div>
            
            <p style="color: #1e293b; font-size: 15px; line-height: 1.5; margin: 0 0 16px 0;">
              Hola,
            </p>
            <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
              Has solicitado un código de verificación para establecer o cambiar la contraseña de tu cuenta. Ingresa el siguiente código de 6 dígitos en la aplicación:
            </p>
            
            <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
              <span style="font-family: monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #3730a3; display: inline-block;">
                ${code}
              </span>
            </div>
            
            <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 0 0 24px 0;">
              ⏱ Este código es válido durante <strong>10 minutos</strong>. Si tú no realizaste esta solicitud, puedes ignorar este correo sin riesgo.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">
              Enviado automáticamente por StreamManager Pro a través de Gmail.
            </p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);

      return res.json({
        success: true,
        message: `Código de verificación enviado exitosamente a ${cleanEmail}`,
      });
    } catch (err: any) {
      console.error("Error sending email via Nodemailer:", err);
      return res.status(500).json({
        success: false,
        error:
          err?.message ||
          "Ocurrió un error al enviar el correo a través de Gmail. Verifica tus credenciales.",
      });
    }
  });

  // POST /api/verify-code - Verify 6-digit OTP code
  app.post("/api/verify-code", (req, res) => {
    try {
      const { email, code } = req.body;
      if (!email || !code) {
        return res
          .status(400)
          .json({ success: false, error: "Datos incompletos." });
      }

      const cleanEmail = String(email).trim().toLowerCase();
      const cleanCode = String(code).trim();
      const record = verificationCodes.get(cleanEmail);

      if (!record) {
        return res.status(400).json({
          success: false,
          error:
            "No hay un código pendiente para este correo. Solicita uno nuevo.",
        });
      }

      if (Date.now() > record.expiresAt) {
        verificationCodes.delete(cleanEmail);
        return res.status(400).json({
          success: false,
          error: "El código ha expirado. Por favor solicita uno nuevo.",
        });
      }

      if (record.code !== cleanCode) {
        return res.status(400).json({
          success: false,
          error:
            "El código ingresado es incorrecto. Verifica el número recibido en tu Gmail.",
        });
      }

      // Valid! Delete so it cannot be reused
      verificationCodes.delete(cleanEmail);
      return res.json({
        success: true,
        message: "Código verificado correctamente.",
      });
    } catch (err: any) {
      console.error("Error verifying code:", err);
      return res
        .status(500)
        .json({ success: false, error: "Error al validar el código." });
    }
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`StreamManager Server running on port ${PORT}`);
  });
}

startServer();
