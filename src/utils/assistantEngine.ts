import { Client, FreeProfile, Supplier } from '../types';
import { getDaysRemaining } from './platformHelpers';

export interface AssistantAction {
  type: 'NAVIGATE' | 'SEARCH' | 'OPEN_MODAL' | 'CLEAR_SEARCH';
  tab?: string;
  query?: string;
  modal?: string;
}

export interface AssistantDataContext {
  activeTab: string;
  clients: Client[];
  suppliers: Supplier[];
  freeProfiles: FreeProfile[];
}

export interface AssistantResult {
  reply: string;
  action?: AssistantAction;
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function buildAssistantServerContext(ctx: AssistantDataContext) {
  const activeClients = ctx.clients.filter((c) => c.status === 'active');
  const inactiveClients = ctx.clients.filter((c) => c.status !== 'active');

  let activeSubsCount = 0;
  let expiringSoonCount = 0;
  let expiredCount = 0;
  let monthlyRevenue = 0;

  for (const client of activeClients) {
    for (const sub of client.subscriptions || []) {
      activeSubsCount += 1;
      if (typeof sub.price === 'number' && !Number.isNaN(sub.price)) {
        monthlyRevenue += sub.price;
      }
      if (sub.cutDate) {
        const days = getDaysRemaining(sub.cutDate);
        if (days <= 0) {
          expiredCount += 1;
        } else if (days <= 5) {
          expiringSoonCount += 1;
        }
      }
    }
  }

  const totalFreeSlots = ctx.freeProfiles.reduce(
    (sum, fp) => sum + (Number(fp.quantity) || 0),
    0,
  );

  return {
    activeTab: ctx.activeTab,
    totalActiveClients: activeClients.length,
    totalInactiveClients: inactiveClients.length,
    totalActiveSubscriptions: activeSubsCount,
    expiringSoonCount,
    expiredCount,
    totalSuppliers: ctx.suppliers.length,
    suppliers: ctx.suppliers.map((s) => s.name),
    totalFreeProfiles: ctx.freeProfiles.length,
    totalFreeSlots,
    monthlyRevenue: Number(monthlyRevenue.toFixed(2)),
  };
}

/**
 * Procesa comandos por voz o texto directamente en el cliente usando el estado actual.
 * Garantiza que StreamBot funcione 100% incluso en despliegues estáticos (Firebase Hosting)
 * donde no hay servidor Express /api/gemini/chat.
 */
export function runLocalAssistant(
  rawPrompt: string,
  ctx: AssistantDataContext,
): AssistantResult {
  const p = normalizeText(rawPrompt);
  const activeClients = ctx.clients.filter((c) => c.status === 'active');
  const inactiveClients = ctx.clients.filter((c) => c.status !== 'active');

  // 1. Limpiar búsqueda
  if (
    (p.includes('limpia') || p.includes('borra') || p.includes('quita')) &&
    (p.includes('busqueda') || p.includes('filtro'))
  ) {
    return {
      reply: 'Búsqueda limpiada. Mostrando todos los registros.',
      action: { type: 'CLEAR_SEARCH' },
    };
  }

  // 2. Búsquedas explícitas: "busca a Carlos", "buscar Netflix", "encuentra juan@..."
  const searchMatch = rawPrompt
    .trim()
    .match(/^(?:busca|buscar|encuentra|encontrar|filtra|filtrar)\s+(?:a|por|el|la|los|las|cuenta|cliente|de)?\s*(.+)$/i);
  if (searchMatch && searchMatch[1]) {
    const cleanTerm = searchMatch[1]
      .replace(/^(?:a|por|el|la|cuenta|cliente)\s+/i, '')
      .trim();
    if (cleanTerm.length > 0) {
      return {
        reply: `Buscando "${cleanTerm}" en tus clientes y suscripciones.`,
        action: { type: 'SEARCH', query: cleanTerm },
      };
    }
  }

  // 3. Crear / Añadir nuevo cliente
  if (
    (p.includes('nuevo') ||
      p.includes('crear') ||
      p.includes('anadir') ||
      p.includes('agregar') ||
      p.includes('registrar')) &&
    (p.includes('cliente') || p.includes('suscripcion') || p.includes('cuenta') || p.includes('servicio'))
  ) {
    return {
      reply: 'Abriendo la ventana para registrar un nuevo cliente y servicio.',
      action: { type: 'OPEN_MODAL', modal: 'new_client' },
    };
  }

  // 4. Ajustes / Configuración / Bóveda / Contraseña
  if (
    p.includes('ajuste') ||
    p.includes('configura') ||
    p.includes('boveda') ||
    p.includes('seguridad') ||
    p.includes('contrasena')
  ) {
    return {
      reply: 'Abriendo la ventana de Configuración y Seguridad.',
      action: { type: 'OPEN_MODAL', modal: 'settings' },
    };
  }

  // 5. Consultas de vencimientos / alertas / por vencer
  if (
    p.includes('vence') ||
    p.includes('vencen') ||
    p.includes('vencido') ||
    p.includes('vencimiento') ||
    p.includes('caduc') ||
    p.includes('alerta') ||
    p.includes('corte')
  ) {
    const expiringItems: Array<{ client: string; service: string; days: number }> = [];
    for (const client of activeClients) {
      for (const sub of client.subscriptions || []) {
        if (!sub.cutDate) continue;
        const days = getDaysRemaining(sub.cutDate);
        if (days <= 5) {
          expiringItems.push({
            client: client.name,
            service: sub.serviceName,
            days,
          });
        }
      }
    }
    expiringItems.sort((a, b) => a.days - b.days);

    const expired = expiringItems.filter((i) => i.days <= 0);
    const soon = expiringItems.filter((i) => i.days > 0);

    const isNavigationCommand =
      p.startsWith('ir ') ||
      p.startsWith('ve ') ||
      p.startsWith('abre') ||
      p.startsWith('abrir') ||
      p.startsWith('ver ') ||
      p.startsWith('muestra') ||
      p.startsWith('mostrar') ||
      p === 'alertas';

    if (expiringItems.length === 0) {
      return {
        reply: 'No tienes suscripciones vencidas ni próximas a vencer en los siguientes 5 días.',
        action: isNavigationCommand ? { type: 'NAVIGATE', tab: 'alerts' } : undefined,
      };
    }

    const preview = expiringItems
      .slice(0, 4)
      .map((item) => {
        if (item.days < 0) return `${item.client} (${item.service}, vencido hace ${Math.abs(item.days)}d)`;
        if (item.days === 0) return `${item.client} (${item.service}, vence HOY)`;
        return `${item.client} (${item.service}, en ${item.days}d)`;
      })
      .join(', ');

    return {
      reply: `Tienes ${expired.length} suscripciones vencidas o que vencen hoy y ${soon.length} próximas a vencer (en ≤5 días): ${preview}.`,
      action: { type: 'NAVIGATE', tab: 'alerts' },
    };
  }

  // 6. Consultas sobre perfiles libres / inventario / stock
  if (p.includes('libre') || p.includes('disponible') || p.includes('inventario') || p.includes('stock')) {
    const totalSlots = ctx.freeProfiles.reduce((acc, fp) => acc + (Number(fp.quantity) || 0), 0);
    const byPlatform = new Map<string, number>();
    for (const fp of ctx.freeProfiles) {
      const qty = Number(fp.quantity) || 0;
      if (qty > 0) {
        byPlatform.set(fp.serviceName, (byPlatform.get(fp.serviceName) || 0) + qty);
      }
    }
    const breakdown = Array.from(byPlatform.entries())
      .slice(0, 5)
      .map(([name, qty]) => `${name}: ${qty}`)
      .join(', ');

    const isQuestion = p.includes('cuanto') || p.includes('que ') || p.includes('tengo') || p.includes('?');
    return {
      reply:
        totalSlots > 0
          ? `Tienes ${totalSlots} espacios libres en ${ctx.freeProfiles.length} cuentas (${breakdown}).`
          : 'Actualmente no tienes perfiles libres disponibles en inventario.',
      action: isQuestion ? undefined : { type: 'NAVIGATE', tab: 'free_profiles' },
    };
  }

  // 7. Navegación a secciones específicas
  if (p.includes('proveedor')) {
    const isCountQuestion = p.includes('cuanto') || p.includes('cuales') || p.includes('quienes');
    if (isCountQuestion) {
      const names = ctx.suppliers.map((s) => s.name).slice(0, 6).join(', ');
      return {
        reply:
          ctx.suppliers.length > 0
            ? `Tienes ${ctx.suppliers.length} proveedores registrados${names ? `: ${names}` : ''}.`
            : 'Aún no tienes proveedores registrados.',
      };
    }
    return {
      reply: `Abriendo Proveedores de Streaming (${ctx.suppliers.length} registrados).`,
      action: { type: 'NAVIGATE', tab: 'suppliers' },
    };
  }

  if (p.includes('inactiv')) {
    return {
      reply: `Abriendo Clientes Inactivos (${inactiveClients.length} registros).`,
      action: { type: 'NAVIGATE', tab: 'clients_inactive' },
    };
  }

  if (p.includes('plantilla') || p.includes('whatsapp') || p.includes('mensaje')) {
    return {
      reply: 'Abriendo tus Plantillas de Mensajes para WhatsApp.',
      action: { type: 'NAVIGATE', tab: 'templates' },
    };
  }

  if (p.includes('enlace') || p.includes('link')) {
    return {
      reply: 'Abriendo la sección de Enlaces Rápidos.',
      action: { type: 'NAVIGATE', tab: 'links' },
    };
  }

  if (p.includes('mi perfil') || p.includes('mi cuenta')) {
    return {
      reply: 'Abriendo tu perfil de usuario.',
      action: { type: 'NAVIGATE', tab: 'profile' },
    };
  }

  if (
    p.includes('resumen') ||
    p.includes('inicio') ||
    p.includes('dashboard') ||
    p.includes('panel') ||
    p.includes('metrica')
  ) {
    return {
      reply: 'Regresando al Resumen General y panel de métricas.',
      action: { type: 'NAVIGATE', tab: 'dashboard' },
    };
  }

  // 8. Consultas financieras / ingresos / cobros
  if (
    p.includes('ingreso') ||
    p.includes('ganancia') ||
    p.includes('dinero') ||
    p.includes('cobro') ||
    p.includes('factur') ||
    p.includes('total de ventas')
  ) {
    const summary = buildAssistantServerContext(ctx);
    return {
      reply: `El total estimado de suscripciones activas (${summary.totalActiveSubscriptions} servicios en ${summary.totalActiveClients} clientes activos) es de ${summary.monthlyRevenue.toFixed(2)}.`,
    };
  }

  // 9. Consultas de estado general o conteo de clientes/cuentas
  if (
    p.includes('cuanto') ||
    p.includes('estado') ||
    p.includes('estadistica') ||
    p.includes('total') ||
    p.includes('cuentas tengo')
  ) {
    const summary = buildAssistantServerContext(ctx);
    return {
      reply: `Resumen actual: tienes ${summary.totalActiveClients} clientes activos (${summary.totalActiveSubscriptions} suscripciones), ${summary.totalInactiveClients} inactivos, ${summary.totalSuppliers} proveedores y ${summary.totalFreeSlots} perfiles libres disponibles. Hay ${summary.expiredCount} vencidos y ${summary.expiringSoonCount} por vencer en los próximos 5 días.`,
    };
  }

  // 10. Navegación a clientes activos
  if (p.includes('cliente')) {
    return {
      reply: `Abriendo Clientes Activos (${activeClients.length} clientes).`,
      action: { type: 'NAVIGATE', tab: 'clients_active' },
    };
  }

  // 11. Búsqueda por coincidencia directa con algún nombre de cliente o plataforma mencionada
  const matchedClient = ctx.clients.find((c) => {
    const nameNorm = normalizeText(c.name);
    return nameNorm.length >= 3 && p.includes(nameNorm);
  });
  if (matchedClient) {
    const subsSummary = (matchedClient.subscriptions || [])
      .map((s) => `${s.serviceName}${s.cutDate ? ` (corte: ${s.cutDate})` : ''}`)
      .join(', ');
    return {
      reply: `Encontré a ${matchedClient.name} (${matchedClient.status === 'active' ? 'Activo' : 'Inactivo'})${subsSummary ? `: ${subsSummary}` : ''}.`,
      action: { type: 'SEARCH', query: matchedClient.name },
    };
  }

  // 12. Saludo o ayuda general
  if (p.includes('hola') || p.includes('buenos') || p.includes('buenas') || p.includes('ayuda')) {
    return {
      reply:
        '¡Hola! Estoy listo para ayudarte. Puedes decirme o escribir: "Ir a proveedores", "Abrir nuevo cliente", "Ver alertas", "Buscar [nombre]" o "¿Cuántos clientes y cuentas tengo?".',
    };
  }

  return {
    reply:
      'Puedo navegar por la app, buscar clientes o consultar tu estado. Prueba con: "Ir a clientes activos", "Ver proveedores", "Abrir nuevo cliente", "Ver alertas" o "Buscar Netflix".',
  };
}
