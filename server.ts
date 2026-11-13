import express from "express";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

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

  // Helper for voice intent fallback if Gemini API is unreachable or key not set
  function parseLocalVoiceIntent(promptText: string, context: any) {
    const p = promptText.toLowerCase().trim();
    let reply = "";
    let action: any = null;

    if (p.includes("proveedor")) {
      action = { type: "NAVIGATE", tab: "suppliers" };
      reply = "Entendido. Abriendo la sección de Proveedores de Streaming.";
    } else if (p.includes("inactiv")) {
      action = { type: "NAVIGATE", tab: "clients_inactive" };
      reply = "Abriendo la lista de Clientes Inactivos.";
    } else if (p.includes("activ") || p.includes("cliente")) {
      if (
        p.includes("nuevo") ||
        p.includes("crear") ||
        p.includes("añadir") ||
        p.includes("agregar") ||
        p.includes("registrar")
      ) {
        action = { type: "OPEN_MODAL", modal: "new_client" };
        reply = "Abriendo la ventana para registrar un nuevo cliente.";
      } else {
        action = { type: "NAVIGATE", tab: "clients_active" };
        reply = "Dirigiéndote a la lista de Clientes Activos.";
      }
    } else if (p.includes("libre") || p.includes("perfil")) {
      action = { type: "NAVIGATE", tab: "free_profiles" };
      reply = "Abriendo el inventario de Perfiles Libres disponibles.";
    } else if (p.includes("alerta") || p.includes("venc")) {
      action = { type: "NAVIGATE", tab: "alerts" };
      reply = "Mostrando las alertas de vencimiento próximas.";
    } else if (p.includes("plantilla") || p.includes("whatsapp")) {
      action = { type: "NAVIGATE", tab: "templates" };
      reply = "Abriendo las Plantillas de Mensajes para WhatsApp.";
    } else if (p.includes("enlace") || p.includes("link")) {
      action = { type: "NAVIGATE", tab: "links" };
      reply = "Abriendo tus Enlaces Rápidos de streaming.";
    } else if (
      p.includes("resumen") ||
      p.includes("inicio") ||
      p.includes("dashboard") ||
      p.includes("panel") ||
      p.includes("métrica")
    ) {
      action = { type: "NAVIGATE", tab: "dashboard" };
      reply = "Regresando al Resumen General y panel de métricas.";
    } else if (
      p.includes("ajuste") ||
      p.includes("configura") ||
      p.includes("contraseña")
    ) {
      action = { type: "OPEN_MODAL", modal: "settings" };
      reply = "Abriendo la ventana de Configuración y Seguridad.";
    } else if (
      p.startsWith("busca") ||
      p.startsWith("buscar") ||
      p.startsWith("encuentra") ||
      p.startsWith("filtrar")
    ) {
      const term = p
        .replace(/^(busca|buscar|encuentra|filtrar)\s+(a|por|el|la|cuenta|cliente)?/i, "")
        .trim();
      action = { type: "SEARCH", query: term };
      reply = `Buscando "${term}" en tus registros.`;
    } else if (p.includes("limpiar") && p.includes("busc")) {
      action = { type: "CLEAR_SEARCH" };
      reply = "Búsqueda limpiada. Mostrando todos los registros.";
    } else if (
      p.includes("cuánto") ||
      p.includes("cuanto") ||
      p.includes("total") ||
      p.includes("estado")
    ) {
      reply = `Actualmente tienes ${context?.totalActiveClients ?? 0} clientes activos, ${context?.totalSuppliers ?? 0} proveedores y ${context?.totalFreeProfiles ?? 0} perfiles libres en inventario.`;
    } else {
      reply =
        "Hola, soy StreamBot. Puedes pedirme por voz cosas como: 'Ir a clientes activos', 'Ver proveedores', 'Crear nuevo cliente', 'Buscar Disney' o 'Ver alertas'.";
    }

    return { reply, action };
  }

  // POST /api/gemini/chat - Multi-turn conversational assistant with action execution
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { messages, context } = req.body;
      if (!Array.isArray(messages) || messages.length === 0) {
        return res
          .status(400)
          .json({ success: false, error: "Historial de mensajes requerido." });
      }

      const lastUserMsg = messages[messages.length - 1]?.text || "";
      const apiKey = process.env.GEMINI_API_KEY?.trim();

      if (apiKey) {
        try {
          const ai = new GoogleGenAI({
            apiKey,
            httpOptions: {
              headers: {
                "User-Agent": "aistudio-build",
              },
            },
          });

          const systemInstruction = `
Eres StreamBot, el Asistente Inteligente de Voz y Chat de la aplicación StreamManager Pro.
StreamManager Pro es una plataforma para administradores que gestionan suscripciones de streaming (Netflix, Disney+, Prime Video, Max, YouTube Premium, etc.), clientes, cuentas de proveedores y perfiles libres.

Tu rol:
1. Responder amablemente en español con respuestas concisas, claras y profesionales.
2. Identificar intenciones de navegación o comandos de voz para ejecutar acciones en la aplicación.

COMANDOS Y ACCIONES DE INTERFAZ:
Cuando el usuario pida ir a una sección, buscar algo o abrir un modal, debes incluir al final de tu respuesta EXACTAMENTE una línea con el siguiente formato:
ACTION_JSON:{"type":"NAVIGATE|SEARCH|OPEN_MODAL|CLEAR_SEARCH","tab":"dashboard|clients_active|clients_inactive|suppliers|free_profiles|alerts|templates|links|profile","query":"texto a buscar","modal":"new_client|settings"}

Valores válidos para "tab":
- "dashboard" (Resumen general, inicio, métricas)
- "clients_active" (Clientes activos)
- "clients_inactive" (Clientes inactivos)
- "suppliers" (Proveedores)
- "free_profiles" (Perfiles libres o disponibles)
- "alerts" (Alertas de vencimiento)
- "templates" (Plantillas de mensajes WhatsApp)
- "links" (Enlaces rápidos)
- "profile" (Perfil de usuario)

Valores válidos para "modal":
- "new_client" (Añadir o crear nuevo cliente/servicio)
- "settings" (Ajustes o configuración)

Contexto actual de la aplicación:
${JSON.stringify(context || {})}

Ejemplos:
- Usuario: "Llévame a proveedores"
  Respuesta: "Entendido, abriendo la sección de Proveedores de Streaming.
ACTION_JSON:{"type":"NAVIGATE","tab":"suppliers"}"

- Usuario: "Quiero crear un nuevo cliente"
  Respuesta: "Abriendo la ventana para registrar un nuevo cliente.
ACTION_JSON:{"type":"OPEN_MODAL","modal":"new_client"}"

- Usuario: "Busca a Carlos"
  Respuesta: "Buscando 'Carlos' en tus clientes y cuentas.
ACTION_JSON:{"type":"SEARCH","query":"Carlos"}"

- Usuario: "¿Cuántos clientes activos tengo?"
  Respuesta: "Actualmente tienes ${context?.totalActiveClients ?? 25} clientes activos registrados en el sistema."

Mantén tus respuestas directas y fáciles de escuchar si se reproducen por voz.
`;

          const contents = messages.map((m: any) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: String(m.text || "") }],
          }));

          const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents,
            config: {
              systemInstruction,
            },
          });

          const rawText = response.text || "";
          let reply = rawText;
          let action: any = null;

          const match = rawText.match(/ACTION_JSON:\s*(\{.*\})/);
          if (match) {
            try {
              action = JSON.parse(match[1]);
              reply = rawText.replace(/ACTION_JSON:\s*\{.*\}/, "").trim();
            } catch (err) {
              console.error("Error parsing ACTION_JSON:", err);
            }
          }

          // If no action was emitted by Gemini but the user clearly gave a navigational voice command, augment with fallback intent
          if (!action) {
            const fallback = parseLocalVoiceIntent(lastUserMsg, context);
            if (fallback.action) {
              action = fallback.action;
            }
          }

          return res.json({
            success: true,
            reply,
            action,
            source: "gemini",
          });
        } catch (geminiErr: any) {
          console.error("Gemini API error, falling back to local intent parser:", geminiErr);
          const fallback = parseLocalVoiceIntent(lastUserMsg, context);
          return res.json({
            success: true,
            reply: fallback.reply,
            action: fallback.action,
            source: "fallback",
          });
        }
      }

      // No API key set: execute fallback intent parser
      const fallback = parseLocalVoiceIntent(lastUserMsg, context);
      return res.json({
        success: true,
        reply: fallback.reply,
        action: fallback.action,
        source: "fallback",
      });
    } catch (err: any) {
      console.error("Error in /api/gemini/chat:", err);
      return res
        .status(500)
        .json({ success: false, error: "Error al procesar el mensaje con el asistente." });
    }
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  } else {
    // Intercept /@vite/client before vite.middlewares so disabled HMR never attempts a failing WebSocket connection
    app.get("/@vite/client", (_req, res) => {
      res.setHeader("Content-Type", "application/javascript; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");
      res.send(`import "/@vite/env";
const sheetsMap = new Map();
if ("document" in globalThis) {
  document.querySelectorAll("style[data-vite-dev-id]").forEach((el) => {
    sheetsMap.set(el.getAttribute("data-vite-dev-id"), el);
  });
}
const cspNonce = "document" in globalThis ? document.querySelector("meta[property=csp-nonce]")?.nonce : undefined;
let lastInsertedStyle;
function updateStyle(id, content) {
  let style = sheetsMap.get(id);
  if (!style) {
    style = document.createElement("style");
    style.setAttribute("type", "text/css");
    style.setAttribute("data-vite-dev-id", id);
    style.textContent = content;
    if (cspNonce) style.setAttribute("nonce", cspNonce);
    if (!lastInsertedStyle) {
      document.head.appendChild(style);
      setTimeout(() => { lastInsertedStyle = undefined; }, 0);
    } else {
      lastInsertedStyle.insertAdjacentElement("afterend", style);
    }
    lastInsertedStyle = style;
  } else {
    style.textContent = content;
  }
  sheetsMap.set(id, style);
}
function removeStyle(id) {
  const style = sheetsMap.get(id);
  if (style) {
    document.head.removeChild(style);
    sheetsMap.delete(id);
  }
}
function createHotContext() {
  return {
    data: {},
    accept() {},
    acceptExports() {},
    dispose() {},
    prune() {},
    decline() {},
    invalidate() {},
    on() {},
    off() {},
    send() {},
  };
}
function injectQuery(url, queryToInject) {
  if (url[0] !== "." && url[0] !== "/") return url;
  const pathname = url.replace(/[?#].*$/, "");
  const { search, hash } = new URL(url, "http://vite.dev");
  return pathname + "?" + queryToInject + (search ? "&" + search.slice(1) : "") + (hash || "");
}
class ErrorOverlay {}
export { ErrorOverlay, createHotContext, injectQuery, removeStyle, updateStyle };
`);
    });

    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false, ws: false },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`StreamManager Server running on port ${PORT}`);
  });
}

startServer();
