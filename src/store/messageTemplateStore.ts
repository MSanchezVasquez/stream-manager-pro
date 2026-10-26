import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ClientSubscription } from "../types";
import { getDaysRemaining, getPlatformDisplayName } from "../utils/platformHelpers";

export type TemplateType =
  | "renewal"
  | "reminder"
  | "expired"
  | "welcome"
  | "multi_renewal";

export interface TemplateVariable {
  key: string;
  label: string;
  example: string;
  description: string;
}

export const TEMPLATE_VARIABLES: TemplateVariable[] = [
  {
    key: "{cliente}",
    label: "Nombre del Cliente",
    example: "Carlos Mendoza",
    description: "Nombre completo del cliente asignado",
  },
  {
    key: "{servicio}",
    label: "Plataforma / Servicio",
    example: "Netflix Premium",
    description: "Nombre de la plataforma contratada",
  },
  {
    key: "{vencimiento}",
    label: "Fecha de Corte",
    example: "28/10/2026",
    description: "Fecha en la que vence el servicio",
  },
  {
    key: "{dias_restantes}",
    label: "Días Restantes",
    example: "3 días",
    description: "Tiempo faltante para el vencimiento",
  },
  {
    key: "{correo}",
    label: "Correo de Cuenta",
    example: "cuenta123@stream.com",
    description: "Correo electrónico para iniciar sesión",
  },
  {
    key: "{contrasena}",
    label: "Contraseña",
    example: "Stream2026*",
    description: "Contraseña de la cuenta compartida",
  },
  {
    key: "{perfil}",
    label: "Perfil Asignado",
    example: "Perfil 1 (Carlos)",
    description: "Nombre o número del perfil asignado",
  },
  {
    key: "{pin}",
    label: "PIN de Seguridad",
    example: "1234",
    description: "PIN de bloqueo del perfil (si tiene)",
  },
  {
    key: "{precio}",
    label: "Precio / Monto",
    example: "S/ 15.00",
    description: "Monto pactado en soles",
  },
  {
    key: "{telefono}",
    label: "WhatsApp / Teléfono",
    example: "+51 987 654 321",
    description: "Número de contacto del cliente",
  },
  {
    key: "{metodo_pago}",
    label: "Medios de Pago",
    example: "Yape / Plin / Transferencia BCP",
    description: "Cuentas bancarias configuradas",
  },
  {
    key: "{firma}",
    label: "Firma / Negocio",
    example: "StreamManager Pro",
    description: "Nombre de tu marca o tienda",
  },
  {
    key: "{lista_servicios}",
    label: "Lista de Servicios",
    example: "📺 Netflix Premium\n📺 Disney+...",
    description: "Solo para renovaciones múltiples (combo)",
  },
];

export interface MessageData {
  clientName: string;
  serviceName: string;
  cutDate: string;
  email?: string;
  password?: string;
  profileName?: string;
  pin?: string;
  price?: number;
  phone?: string;
  renewedSubs?: ClientSubscription[];
  lang?: "es" | "en";
}

export const DEFAULT_TEMPLATES_ES: Record<TemplateType, string> = {
  renewal: `Hola *{cliente}* 👋

🎉 ¡Tu suscripción a *{servicio}* ha sido *renovada con éxito*!

📅 *Nueva fecha de corte:* {vencimiento}
📧 *Correo:* {correo}
🔑 *Contraseña:* {contrasena}
👤 *Perfil:* {perfil}
🔒 *PIN:* {pin}
💰 *Monto:* {precio}

¡Muchas gracias por renovar con nosotros y por tu preferencia continua! ✨ Que disfrutes tu servicio 🍿

{firma}`,

  reminder: `Hola *{cliente}* 👋

Le recordamos amablemente que su servicio de *{servicio}* está próximo a vencer en *{dias_restantes}* (Fecha de corte: {vencimiento}).

📧 *Correo:* {correo}
👤 *Perfil:* {perfil}
💰 *Monto de renovación:* {precio}

💳 *Medios de pago disponibles:*
{metodo_pago}

Para renovar o ante cualquier consulta, responda a este mensaje antes de la fecha límite para evitar cortes. ¡Gracias por preferir nuestro servicio! 🚀

{firma}`,

  expired: `Hola *{cliente}* 👋

Le informamos que su servicio de *{servicio}* ha *VENCIDO* el {vencimiento}.

👤 *Perfil:* {perfil}
📧 *Correo:* {correo}
💰 *Monto para reactivar:* {precio}

💳 *Medios de pago:*
{metodo_pago}

Para reactivar su acceso inmediatamente y no perder sus perfiles guardados, por favor envíenos su comprobante de pago por este medio. ¡Quedamos a su disposición! ⚡

{firma}`,

  welcome: `¡Hola *{cliente}*! 🎬✨

¡Bienvenido/a! Ya hemos activado tu servicio de *{servicio}*. Aquí tienes tus accesos listos para ingresar:

📧 *Correo:* {correo}
🔑 *Contraseña:* {contrasena}
👤 *Perfil asignado:* {perfil}
🔒 *PIN:* {pin}
📅 *Fecha de vencimiento:* {vencimiento}
💰 *Precio:* {precio}

⚠️ *Reglas importantes de uso:*
• No modificar el correo ni la contraseña de la cuenta.
• Utilizar únicamente el perfil asignado.
• No compartir los datos con terceros.

¡Que disfrutes al máximo tus series y películas favoritas! Si tienes dudas estamos aquí para ayudarte 🍿🚀

{firma}`,

  multi_renewal: `Hola *{cliente}* 👋

🎉 ¡Tus suscripciones han sido *renovadas con éxito*! Aquí tienes el detalle actualizado:

{lista_servicios}

¡Muchas gracias por renovar con nosotros y por tu confianza continua! ✨🍿

{firma}`,
};

export const DEFAULT_TEMPLATES_EN: Record<TemplateType, string> = {
  renewal: `Hello *{cliente}* 👋

🎉 Your *{servicio}* subscription has been *successfully renewed*!

📅 *New cutoff date:* {vencimiento}
📧 *Email:* {correo}
🔑 *Password:* {contrasena}
👤 *Profile:* {perfil}
🔒 *PIN:* {pin}
💰 *Amount:* {precio}

Thank you for renewing with us and for your trust! ✨ Enjoy your streaming 🍿

{firma}`,

  reminder: `Hello *{cliente}* 👋

This is a friendly reminder that your *{servicio}* service is expiring in *{dias_restantes}* (Cutoff date: {vencimiento}).

📧 *Email:* {correo}
👤 *Profile:* {perfil}
💰 *Renewal price:* {precio}

💳 *Payment methods:*
{metodo_pago}

To renew or if you have any questions, simply reply to this message before cutoff. Thank you for choosing our service! 🚀

{firma}`,

  expired: `Hello *{cliente}* 👋

We would like to inform you that your *{servicio}* service *EXPIRED* on {vencimiento}.

👤 *Profile:* {perfil}
📧 *Email:* {correo}
💰 *Amount to reactivate:* {precio}

💳 *Payment methods:*
{metodo_pago}

To reactivate your service immediately, please send us your payment receipt. We are at your service! ⚡

{firma}`,

  welcome: `Hello *{cliente}*! 🎬✨

Welcome! Your *{servicio}* service has been activated. Here are your access credentials:

📧 *Email:* {correo}
🔑 *Password:* {contrasena}
👤 *Assigned profile:* {perfil}
🔒 *PIN:* {pin}
📅 *Expiration date:* {vencimiento}
💰 *Price:* {precio}

⚠️ *Important rules:*
• Do not change the email or account password.
• Use only your assigned profile.
• Do not share credentials with third parties.

Enjoy your favorite shows and movies! Let us know if you need any assistance 🍿🚀

{firma}`,

  multi_renewal: `Hello *{cliente}* 👋

🎉 Your subscriptions have been *successfully renewed*! Here are the updated details:

{lista_servicios}

Thank you for renewing with us and for your continued trust! ✨🍿

{firma}`,
};

export const DEFAULT_PAYMENT_INFO = `• Yape / Plin: 999-999-999 (Nombre Titular)
• BCP Ahorros: 191-XXXXXXXX-0-XX
• BBVA / Interbank disponible
(Envíanos tu comprobante tras realizar el pago)`;

export const DEFAULT_BUSINESS_NAME = "StreamManager Pro";

interface MessageTemplateState {
  templates: Record<TemplateType, string>;
  paymentInfo: string;
  businessName: string;

  // Actions
  updateTemplate: (type: TemplateType, content: string) => void;
  resetTemplate: (type: TemplateType, lang?: "es" | "en") => void;
  resetAllTemplates: (lang?: "es" | "en") => void;
  updatePaymentInfo: (paymentInfo: string) => void;
  updateBusinessName: (businessName: string) => void;

  // Formatting helper
  formatMessage: (type: TemplateType, data: MessageData) => string;
}

export const useMessageTemplateStore = create<MessageTemplateState>()(
  persist(
    (set, get) => ({
      templates: { ...DEFAULT_TEMPLATES_ES },
      paymentInfo: DEFAULT_PAYMENT_INFO,
      businessName: DEFAULT_BUSINESS_NAME,

      updateTemplate: (type, content) => {
        set((state) => ({
          templates: {
            ...state.templates,
            [type]: content,
          },
        }));
      },

      resetTemplate: (type, lang = "es") => {
        const defaults =
          lang === "en" ? DEFAULT_TEMPLATES_EN : DEFAULT_TEMPLATES_ES;
        set((state) => ({
          templates: {
            ...state.templates,
            [type]: defaults[type],
          },
        }));
      },

      resetAllTemplates: (lang = "es") => {
        const defaults =
          lang === "en" ? DEFAULT_TEMPLATES_EN : DEFAULT_TEMPLATES_ES;
        set({
          templates: { ...defaults },
          paymentInfo: DEFAULT_PAYMENT_INFO,
          businessName: DEFAULT_BUSINESS_NAME,
        });
      },

      updatePaymentInfo: (paymentInfo) => set({ paymentInfo }),

      updateBusinessName: (businessName) => set({ businessName }),

      formatMessage: (type, data) => {
        const state = get();
        const rawTemplate =
          state.templates[type] ||
          (data.lang === "en"
            ? DEFAULT_TEMPLATES_EN[type]
            : DEFAULT_TEMPLATES_ES[type]);

        const days = data.cutDate ? getDaysRemaining(data.cutDate) : 0;
        let daysRemainingText = "";
        if (data.lang === "en") {
          if (days < 0) {
            daysRemainingText = `EXPIRED (${Math.abs(days)} days ago)`;
          } else if (days === 0) {
            daysRemainingText = "TODAY";
          } else {
            daysRemainingText = `${days} day${days === 1 ? "" : "s"}`;
          }
        } else {
          if (days < 0) {
            daysRemainingText = `VENCIDO (hace ${Math.abs(days)} días)`;
          } else if (days === 0) {
            daysRemainingText = "HOY";
          } else {
            daysRemainingText = `${days} día${days === 1 ? "" : "s"}`;
          }
        }

        const priceText =
          typeof data.price === "number" && data.price > 0
            ? `S/ ${data.price.toFixed(2)}`
            : "";

        // Formato para lista de suscripciones múltiples
        let servicesList = "";
        if (data.renewedSubs && data.renewedSubs.length > 0) {
          servicesList = data.renewedSubs
            .map((sub) => {
              const platform =
                getPlatformDisplayName(sub.serviceName) || sub.serviceName;
              let item = `📺 *${platform}*\n📅 *Corte:* ${sub.cutDate}`;
              if (sub.email) item += `\n📧 *Correo:* ${sub.email}`;
              if (sub.password) item += `\n🔑 *Contraseña:* ${sub.password}`;
              if (sub.profileName) item += `\n👤 *Perfil:* ${sub.profileName}`;
              if (sub.pin) item += `\n🔒 *PIN:* ${sub.pin}`;
              if (typeof sub.price === "number" && sub.price > 0) {
                item += `\n💰 *Monto:* S/ ${sub.price.toFixed(2)}`;
              }
              return item;
            })
            .join("\n\n");
        }

        // Reemplazo de variables
        let result = rawTemplate
          .replace(/{cliente}/g, data.clientName || "Cliente")
          .replace(/{servicio}/g, data.serviceName || "Servicio Streaming")
          .replace(/{vencimiento}/g, data.cutDate || "")
          .replace(/{dias_restantes}/g, daysRemainingText)
          .replace(/{correo}/g, data.email || "")
          .replace(/{contrasena}/g, data.password || "")
          .replace(/{perfil}/g, data.profileName || "")
          .replace(/{pin}/g, data.pin || "")
          .replace(/{precio}/g, priceText)
          .replace(/{telefono}/g, data.phone || "")
          .replace(/{metodo_pago}/g, state.paymentInfo || "")
          .replace(/{firma}/g, state.businessName ? `— ${state.businessName}` : "")
          .replace(/{lista_servicios}/g, servicesList);

        // Limpieza de líneas vacías cuando no hay contraseña, pin, perfil o correo
        // Si una línea quedó como "🔑 *Contraseña:* " o "🔒 *PIN:* " sin valor, la removemos limpiamente
        const cleanedLines = result
          .split("\n")
          .filter((line) => {
            const trimmed = line.trim();
            if (trimmed === "🔑 *Contraseña:*" || trimmed === "🔑 *Password:*") return false;
            if (trimmed === "🔒 *PIN:*" || trimmed === "🔒 *PIN:*") return false;
            if (trimmed === "👤 *Perfil:*" || trimmed === "👤 *Profile:*") return false;
            if (trimmed === "📧 *Correo:*" || trimmed === "📧 *Email:*") return false;
            if (trimmed === "💰 *Monto:*" || trimmed === "💰 *Monto de renovación:*" || trimmed === "💰 *Precio:*") return false;
            return true;
          })
          .join("\n");

        return cleanedLines.replace(/\n{3,}/g, "\n\n").trim();
      },
    }),
    {
      name: "stream-manager-message-templates-v1",
    },
  ),
);
