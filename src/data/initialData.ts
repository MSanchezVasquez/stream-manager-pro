import { Client, Supplier, FreeProfile, QuickLink } from "../types";

/**
 * ⚠️ DATOS DE EJEMPLO — NO PONGAS DATOS REALES DE CLIENTES AQUÍ.
 *
 * Este archivo se importa en src/lib/firebase.ts. Aunque hoy esa función
 * de seed no se ejecuta automáticamente, cualquier dato que pongas acá
 * queda guardado en el código fuente (y puede terminar empaquetado en el
 * bundle del navegador si en el futuro alguien conecta ese import).
 *
 * Los datos reales de tus clientes, proveedores y perfiles deben vivir
 * ÚNICAMENTE en Firestore, nunca hardcodeados en el código. Usa este
 * archivo solo para tener algo que mostrar en desarrollo local.
 */

export const INITIAL_CLIENTS: Client[] = [
  {
    id: "c-demo-1",
    name: "Cliente de Prueba",
    status: "active",
    phone: "+51 999 999 999",
    createdAt: "2026-01-01",
    subscriptions: [
      {
        id: "sub-demo-1",
        clientId: "c-demo-1",
        clientName: "Cliente de Prueba",
        serviceName: "Netflix",
        hireDate: "2026-01-01",
        cutDate: "2026-09-01",
        email: "demo@ejemplo.com",
        password: "CambiaEstaClaveDemo123",
        profileName: "Perfil 1",
        pin: "0000",
        status: "active",
      },
    ],
  },
  {
    id: "c-demo-2",
    name: "Otro Cliente Demo",
    status: "inactive",
    createdAt: "2026-02-15",
    subscriptions: [
      {
        id: "sub-demo-2",
        clientId: "c-demo-2",
        clientName: "Otro Cliente Demo",
        serviceName: "Disney+ Premium",
        hireDate: "2026-02-15",
        cutDate: "2026-03-15",
        email: "demo2@ejemplo.com",
        password: "OtraClaveDemo456",
        status: "expired",
      },
    ],
  },
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: "sup-demo-1",
    name: "Proveedor de Ejemplo",
    contactInfo: "+51 900 000 000",
    notes: "Datos ficticios de ejemplo",
    accounts: [
      {
        id: "sup-acc-demo-1",
        supplierId: "sup-demo-1",
        supplierName: "Proveedor de Ejemplo",
        serviceName: "HBO Max",
        email: "proveedor.demo@ejemplo.com",
        password: "ClaveProveedorDemo789",
        expirationDate: "2026-12-31",
        browser: "Google Chrome",
        status: "active",
      },
    ],
  },
];

export const INITIAL_FREE_PROFILES: FreeProfile[] = [
  {
    id: "fp-demo-1",
    serviceName: "Spotify Premium",
    quantity: 2,
    email: "perfiles.demo@ejemplo.com",
    password: "ClavePerfilDemo321",
    browser: "Google Chrome",
  },
];

export const INITIAL_QUICK_LINKS: QuickLink[] = [
  {
    id: "ql-demo-1",
    title: "Enlace de validación (ejemplo)",
    url: "https://ejemplo.com/validacion",
    category: "Validación",
  },
];
