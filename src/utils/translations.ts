import { useSettingsStore, SupportedLanguage } from "../store/settingsStore";
import { detectBrowserLanguage } from "./languages";

export interface TranslationDictionary {
  // Navigation
  "nav.menu": string;
  "nav.newClientService": string;
  "nav.overview": string;
  "nav.activeClients": string;
  "nav.inactiveClients": string;
  "nav.suppliers": string;
  "nav.freeProfiles": string;
  "nav.alertsWhatsapp": string;
  "nav.quickLinks": string;
  "nav.searchPlaceholder": string;
  "nav.expirations": string;
  "nav.active": string;

  // Profile Popover & User Menu
  "profile.profile": string;
  "profile.language": string;
  "profile.autoDetect": string;
  "profile.detected": string;
  "profile.theme": string;
  "profile.themeSystem": string;
  "profile.themeLight": string;
  "profile.themeDark": string;
  "profile.allSettings": string;
  "profile.logout": string;
  "profile.logoutConfirmTitle": string;
  "profile.logoutConfirmText": string;
  "profile.cancel": string;
  "profile.confirmLogout": string;

  // Settings Modal
  "settings.title": string;
  "settings.language": string;
  "settings.langDesc": string;
  "settings.theme": string;
  "settings.createPassword": string;
  "settings.createPasswordDesc": string;
  "settings.createPasswordBtn": string;
  "settings.vault": string;
  "settings.vaultDesc": string;
  "settings.openVault": string;
  "settings.weekStart": string;
  "settings.monday": string;
  "settings.sunday": string;

  // Clients List & Filters
  "clients.activeTitle": string;
  "clients.inactiveTitle": string;
  "clients.showing": string;
  "clients.clientCount": string;
  "clients.addClient": string;
  "clients.platform": string;
  "clients.all": string;
  "clients.health": string;
  "clients.healthy": string;
  "clients.warning": string;
  "clients.expired": string;
  "clients.noClientsTitle": string;
  "clients.noClientsDesc": string;
  "clients.showAll": string;
  "clients.search": string;
  "clients.notifyRenewal": string;
  "clients.copied": string;
  "clients.copy": string;
  "clients.daysRemaining": string;
  "clients.expiresToday": string;
  "clients.expiredAgo": string;
  "clients.days": string;
  "clients.day": string;
  "clients.reactivate": string;
  "clients.edit": string;
  "clients.deactivate": string;
  "clients.delete": string;
  "clients.deleteConfirm": string;

  // Client Card & Items
  "clients.cardReactivateTooltip": string;
  "clients.cardDrawerTooltip": string;
  "clients.cardDeactivateTooltip": string;
  "clients.cardDeleteTooltip": string;
  "clients.profileCountSingular": string;
  "clients.profileCountPlural": string;
  "clients.ofTotal": string;
  "clients.noMatchingProfiles": string;

  // Subscription Item
  "sub.freeProfileBadge": string;
  "sub.freeProfileTitle": string;
  "sub.contracted": string;
  "sub.cutDate": string;
  "sub.subPrice": string;
  "sub.assignedProfile": string;
  "sub.pin": string;
  "sub.noEmail": string;
  "sub.noPassword": string;
  "sub.notifyWhatsApp": string;
  "sub.copyEmail": string;
  "sub.copyPassword": string;
  "sub.copyProfile": string;
  "sub.copyPin": string;

  // Client Modal
  "clientModal.newTitle": string;
  "clientModal.editTitle": string;
  "clientModal.duplicateDetected": string;
  "clientModal.duplicateMsg": string;
  "clientModal.editExisting": string;
  "clientModal.continueCreating": string;
  "clientModal.personalInfo": string;
  "clientModal.name": string;
  "clientModal.phone": string;
  "clientModal.status": string;
  "clientModal.active": string;
  "clientModal.inactive": string;
  "clientModal.services": string;
  "clientModal.addService": string;
  "clientModal.serviceNumber": string;
  "clientModal.platform": string;
  "clientModal.subPrice": string;
  "clientModal.period": string;
  "clientModal.periodDays": string;
  "clientModal.periodMonths": string;
  "clientModal.periodYears": string;
  "clientModal.renewFrom": string;
  "clientModal.currentCut": string;
  "clientModal.today": string;
  "clientModal.calculatedFromCut": string;
  "clientModal.calculatedFromToday": string;
  "clientModal.autoCutDate": string;
  "clientModal.hireDate": string;
  "clientModal.cutDate": string;
  "clientModal.emailUser": string;
  "clientModal.password": string;
  "clientModal.profile": string;
  "clientModal.pin": string;
  "clientModal.cancel": string;
  "clientModal.saveChanges": string;
  "clientModal.createClient": string;
  "clientModal.saving": string;
  "clientModal.creating": string;
  "clientModal.removeService": string;
  "clientModal.totalDuration": string;
  "clientModal.namePlaceholder": string;
  "clientModal.phonePlaceholder": string;
  "clientModal.emailPlaceholder": string;
  "clientModal.passPlaceholder": string;
  "clientModal.profilePlaceholder": string;
  "clientModal.pinPlaceholder": string;
  "clientModal.freeProfileTag": string;
  "clientModal.freeProfileNotice": string;

  // Delete Client Modal
  "deleteModal.deactivateTitle": string;
  "deleteModal.deleteTitle": string;
  "deleteModal.deactivateDesc": string;
  "deleteModal.deleteDesc": string;
  "deleteModal.inventoryRestoreTitle": string;
  "deleteModal.inventoryRestoreDesc": string;
  "deleteModal.cancel": string;
  "deleteModal.moveToInactive": string;
  "deleteModal.delete": string;

  // Dashboard Overview Cards
  "dash.title": string;
  "dash.subtitle": string;
  "dash.monthlyRevenueTitle": string;
  "dash.activeSubsTitle": string;
  "dash.activeClientsTitle": string;
  "dash.upcomingExpirationsTitle": string;
  "dash.registeredSuppliersTitle": string;
  "dash.freeProfilesTitle": string;
  "dash.registeredSubsSub": string;
  "dash.inTheSystem": string;
  "dash.inNext5Days": string;
  "dash.masterAccounts": string;
  "dash.availableToAssign": string;

  // Platform Distribution Chart
  "chart.title": string;
  "chart.subtitle": string;
  "chart.totalRevenue": string;
  "chart.noData": string;
  "chart.subs": string;
  "chart.sub": string;

  // Financial & Activity Summary
  "finance.title": string;
  "finance.currency": string;
  "finance.totalMonthlyRevenue": string;
  "finance.perMonth": string;
  "finance.avgTicket": string;
  "finance.avgPrice": string;
  "finance.billableProfiles": string;
  "finance.viewClients": string;
  "finance.collectionHealth": string;
  "finance.rateUpToDate": string;
  "finance.upToDate": string;
  "finance.healthyClients": string;
  "finance.expiringClients": string;
  "finance.expiredClients": string;
  "finance.revenueAtRisk": string;
  "finance.viewExpirations": string;
  "finance.topPlatforms": string;
  "finance.revenueByService": string;
  "finance.monthly": string;
  "finance.addClient": string;

  // Expiration Alerts
  "alerts.title": string;
  "alerts.filterAll": string;
  "alerts.filterWarning": string;
  "alerts.filterExpired": string;
  "alerts.searchPlaceholder": string;
  "alerts.notifyWhatsApp": string;
  "alerts.noAlerts": string;
  "alerts.noAlertsDesc": string;
  "alerts.client": string;
  "alerts.platform": string;
  "alerts.status": string;
  "alerts.cutDate": string;
  "alerts.actions": string;

  // Suppliers & Profiles
  "suppliers.title": string;
  "suppliers.subtitle": string;
  "suppliers.search": string;
  "suppliers.newSupplier": string;
  "suppliers.close": string;
  "suppliers.add": string;
  "suppliers.addAccount": string;
  "suppliers.noSuppliers": string;
  "suppliers.noSuppliersDesc": string;
  "suppliers.deleteSupplier": string;
  "suppliers.saveSupplier": string;
  "suppliers.cancel": string;
  "suppliers.accountsCount": string;
  "suppliers.deleteSupplierTitle": string;
  "suppliers.deleteSupplierDesc": string;
  "suppliers.deleteAccountTitle": string;
  "suppliers.deleteAccountDesc": string;
  "suppliers.noAccounts": string;
  "suppliers.expires": string;
  "suppliers.browser": string;
  "suppliers.modalTitleAdd": string;
  "suppliers.modalTitleEdit": string;
  "suppliers.modalSupplier": string;
  "suppliers.platform": string;
  "suppliers.email": string;
  "suppliers.password": string;
  "suppliers.expirationDate": string;
  "suppliers.recommendedBrowser": string;
  "suppliers.webmailUrl": string;
  "suppliers.notes": string;
  "suppliers.saveAccount": string;

  "profiles.title": string;
  "profiles.subtitle": string;
  "profiles.search": string;
  "profiles.add": string;
  "profiles.assign": string;
  "profiles.availableUnits": string;
  "profiles.noProfiles": string;
  "profiles.noProfilesDesc": string;
  "profiles.available": string;
  "profiles.assignToClient": string;
  "profiles.deleteTitle": string;
  "profiles.deleteDesc": string;
  "profiles.addNewTitle": string;
  "profiles.platform": string;
  "profiles.quantity": string;
  "profiles.email": string;
  "profiles.password": string;
  "profiles.browser": string;
  "profiles.cancel": string;
  "profiles.save": string;
  "profiles.assignTitle": string;
  "profiles.selectClient": string;
  "profiles.chooseClientPlaceholder": string;
  "profiles.assignNotice": string;
  "profiles.confirmAssign": string;

  "links.title": string;
  "links.subtitle": string;
  "links.addLink": string;
  "links.noLinks": string;
  "links.noLinksDesc": string;
  "links.copied": string;
  "links.copy": string;
  "links.open": string;
  "links.deleteTitle": string;
  "links.deleteDesc": string;
  "links.modalTitle": string;
  "links.nameLabel": string;
  "links.urlLabel": string;
  "links.cancel": string;
  "links.save": string;

  // Inline Quick Editor
  "inline.quickEdit": string;
  "inline.sidePanel": string;
  "inline.sidePanelTooltip": string;
  "inline.clientName": string;
  "inline.phone": string;
  "inline.services": string;
  "inline.serviceNumber": string;
  "inline.cutDate": string;
  "inline.email": string;
  "inline.password": string;
  "inline.profile": string;
  "inline.pin": string;
  "inline.price": string;
  "inline.cancel": string;
  "inline.save": string;

  // WhatsApp Modal
  "whatsapp.title": string;
  "whatsapp.subtitle": string;
  "whatsapp.formattedMsg": string;
  "whatsapp.copied": string;
  "whatsapp.copy": string;
  "whatsapp.open": string;

  // Common Navigation
  "common.scrollLeft": string;
  "common.scrollRight": string;

  // Renewal
  "clients.renew": string;
  "clients.renewTooltip": string;
  "sub.renew": string;
  "renewModal.title": string;
  "renewModal.subtitle": string;
  "renewModal.selectSubs": string;
  "renewModal.selectAll": string;
  "renewModal.renewPeriod": string;
  "renewModal.durationUnit": string;
  "renewModal.durationValue": string;
  "renewModal.days": string;
  "renewModal.months": string;
  "renewModal.years": string;
  "renewModal.quickPresets": string;
  "renewModal.baseCalculation": string;
  "renewModal.baseFromCut": string;
  "renewModal.baseFromToday": string;
  "renewModal.currentCutDate": string;
  "renewModal.newCutDate": string;
  "renewModal.cutDateManual": string;
  "renewModal.newPrice": string;
  "renewModal.summary": string;
  "renewModal.confirm": string;
  "renewModal.cancel": string;
  "renewModal.success": string;
  "renewModal.notifyWhatsApp": string;
  "renewModal.activeHealth": string;
}

export const TRANSLATIONS: Record<SupportedLanguage, TranslationDictionary> = {
  es: {
    // Navigation
    "nav.menu": "MENÚ DE NAVEGACIÓN",
    "nav.newClientService": "Nuevo Cliente / Servicio",
    "nav.overview": "Resumen General",
    "nav.activeClients": "Clientes Activos",
    "nav.inactiveClients": "Clientes Inactivos",
    "nav.suppliers": "Proveedores",
    "nav.freeProfiles": "Perfiles Libres",
    "nav.alertsWhatsapp": "Alertas & WhatsApp",
    "nav.quickLinks": "Enlaces Rápidos",
    "nav.searchPlaceholder": "Buscar cliente, correo o cuenta...",
    "nav.expirations": "Vencimientos",
    "nav.active": "Activos",

    // Profile Popover
    "profile.profile": "Perfil",
    "profile.language": "Idioma",
    "profile.autoDetect": "Detecta automáticamente el idioma",
    "profile.detected": "Detectado",
    "profile.theme": "Tema",
    "profile.themeSystem": "Sistema",
    "profile.themeLight": "Claro",
    "profile.themeDark": "Oscuro",
    "profile.allSettings": "Todos los ajustes",
    "profile.logout": "Cerrar sesión",
    "profile.logoutConfirmTitle": "¿Cerrar sesión?",
    "profile.logoutConfirmText": "¿Estás seguro de que deseas salir?",
    "profile.cancel": "Cancelar",
    "profile.confirmLogout": "Cerrar Sesión",

    // Settings Modal
    "settings.title": "Ajustes",
    "settings.language": "Idioma",
    "settings.langDesc":
      "Afecta cómo se muestra el texto, fechas y la interfaz en el sistema.",
    "settings.theme": "Tema",
    "settings.createPassword": "Crear Contraseña de Acceso",
    "settings.createPasswordDesc":
      "Iniciaste sesión con tu cuenta de Google. Puedes crear una contraseña para acceder también directamente con correo y contraseña.",
    "settings.createPasswordBtn": "Crear Contraseña",
    "settings.vault": "Bóveda y Cifrado (Vault)",
    "settings.vaultDesc":
      "Protege y encripta las contraseñas de tus proveedores y perfiles con una clave maestra local.",
    "settings.openVault": "Abrir Bóveda (Vault)",
    "settings.weekStart": "Primer día de la semana",
    "settings.monday": "Lunes",
    "settings.sunday": "Domingo",

    // Clients
    "clients.activeTitle": "Clientes Activos",
    "clients.inactiveTitle": "Clientes No Activos / Cancelados",
    "clients.showing": "Mostrando",
    "clients.clientCount": "cliente(s)",
    "clients.addClient": "Añadir Cliente",
    "clients.platform": "Plataforma:",
    "clients.all": "Todos",
    "clients.health": "Salud de Cuenta:",
    "clients.healthy": "Al día",
    "clients.warning": "Por vencer (≤5d)",
    "clients.expired": "Vencidos",
    "clients.noClientsTitle": "No se encontraron clientes",
    "clients.noClientsDesc":
      "Intenta cambiar el término de búsqueda o registra un nuevo cliente en el sistema.",
    "clients.showAll": "Mostrar todos los clientes",
    "clients.search": "Buscar...",
    "clients.notifyRenewal": "Notificar Renovación",
    "clients.copied": "¡Copiado!",
    "clients.copy": "Copiar",
    "clients.daysRemaining": "días restantes",
    "clients.expiresToday": "¡Vence hoy!",
    "clients.expiredAgo": "Vencido hace",
    "clients.days": "días",
    "clients.day": "día",
    "clients.reactivate": "Reactivar",
    "clients.edit": "Editar",
    "clients.deactivate": "Desactivar",
    "clients.delete": "Eliminar",
    "clients.deleteConfirm": "¿Eliminar cliente?",

    // Client Card
    "clients.cardReactivateTooltip": "Reactivar cliente (Mover a Clientes Activos)",
    "clients.cardDrawerTooltip": "Abrir panel lateral",
    "clients.cardDeactivateTooltip": "Desactivar (Mover a Clientes Inactivos)",
    "clients.cardDeleteTooltip": "Eliminar cliente definitivamente",
    "clients.profileCountSingular": "perfil",
    "clients.profileCountPlural": "perfiles",
    "clients.ofTotal": "(de {total})",
    "clients.noMatchingProfiles": "Sin perfiles coincidentes",

    // Subscription Item
    "sub.freeProfileBadge": "Perfil Libre",
    "sub.freeProfileTitle":
      "Asignado desde Perfiles Libres (se restaurará al eliminar)",
    "sub.contracted": "Contratado:",
    "sub.cutDate": "Fecha Corte:",
    "sub.subPrice": "Precio Suscripción:",
    "sub.assignedProfile": "Perfil Asignado:",
    "sub.pin": "PIN:",
    "sub.noEmail": "Sin correo asignado",
    "sub.noPassword": "Sin contraseña asignada",
    "sub.notifyWhatsApp": "Notificar Renovación por WhatsApp",
    "sub.copyEmail": "Copiar correo",
    "sub.copyPassword": "Copiar contraseña",
    "sub.copyProfile": "Copiar perfil",
    "sub.copyPin": "Copiar PIN",

    // Client Modal
    "clientModal.newTitle": "Nuevo Cliente",
    "clientModal.editTitle": "Editar Cliente",
    "clientModal.duplicateDetected": "¡Posible cliente duplicado detectado!",
    "clientModal.duplicateMsg":
      "Ya existe un cliente con este nombre o teléfono en el sistema:",
    "clientModal.editExisting": "Editar cliente existente",
    "clientModal.continueCreating": "Continuar creando nuevo",
    "clientModal.personalInfo": "INFORMACIÓN PERSONAL",
    "clientModal.name": "Nombre del Cliente *",
    "clientModal.phone": "WhatsApp / Teléfono",
    "clientModal.status": "Estado del Cliente",
    "clientModal.active": "Activo",
    "clientModal.inactive": "Inactivo",
    "clientModal.services": "Servicios Contratados",
    "clientModal.addService": "Añadir Servicio",
    "clientModal.serviceNumber": "Servicio #",
    "clientModal.platform": "Plataforma Streaming *",
    "clientModal.subPrice": "Precio de Suscripción (S/)",
    "clientModal.period": "Período de suscripción",
    "clientModal.periodDays": "Días",
    "clientModal.periodMonths": "Meses",
    "clientModal.periodYears": "Años",
    "clientModal.renewFrom": "Renovar calculando desde:",
    "clientModal.currentCut": "Corte actual",
    "clientModal.today": "Hoy",
    "clientModal.calculatedFromCut": "Calculado extendiendo el corte actual ({date})",
    "clientModal.calculatedFromToday": "Calculado a partir de hoy ({date})",
    "clientModal.autoCutDate":
      "Calculada automáticamente según el período seleccionado",
    "clientModal.hireDate": "Fecha Contratación",
    "clientModal.cutDate": "Fecha de Corte *",
    "clientModal.emailUser": "Correo / Usuario de Cuenta",
    "clientModal.password": "Contraseña de Cuenta",
    "clientModal.profile": "Perfil Asignado",
    "clientModal.pin": "PIN del Perfil",
    "clientModal.cancel": "Cancelar",
    "clientModal.saveChanges": "Guardar Cambios",
    "clientModal.createClient": "Crear Cliente",
    "clientModal.saving": "Guardando...",
    "clientModal.creating": "Creando...",
    "clientModal.removeService": "Eliminar Servicio",
    "clientModal.totalDuration": "Duración:",
    "clientModal.namePlaceholder": "ej. Juan Pérez",
    "clientModal.phonePlaceholder": "ej. +51 987 654 321",
    "clientModal.emailPlaceholder": "correo@ejemplo.com",
    "clientModal.passPlaceholder": "Contraseña de la cuenta",
    "clientModal.profilePlaceholder": "ej. Perfil 1, Carlos...",
    "clientModal.pinPlaceholder": "ej. 1234",
    "clientModal.freeProfileTag": "Perfil Libre",
    "clientModal.freeProfileNotice":
      "Asignado desde inventario de Perfiles Libres (se restaurará al eliminar)",

    // Delete Client Modal
    "deleteModal.deactivateTitle": "¿Desactivar Cliente?",
    "deleteModal.deleteTitle": "¿Eliminar Definitivamente?",
    "deleteModal.deactivateDesc":
      "¿Estás seguro de que deseas desactivar a {name}? Se moverá a la pestaña de Clientes Inactivos. Podrás consultarlo y reactivarlo en cualquier momento.",
    "deleteModal.deleteDesc":
      "¿Estás seguro de que deseas eliminar permanentemente a {name}? Esta acción no se puede deshacer y borrará al cliente de la base de datos.",
    "deleteModal.inventoryRestoreTitle": "Restauración de inventario",
    "deleteModal.inventoryRestoreDesc":
      "Los perfiles asignados desde Perfiles Libres se restaurarán y sumarán de vuelta automáticamente.",
    "deleteModal.cancel": "Cancelar",
    "deleteModal.moveToInactive": "Mover a Inactivos",
    "deleteModal.delete": "Eliminar",

    // Dashboard Overview Cards
    "dash.title": "Resumen General",
    "dash.subtitle": "Panel de Control y Métricas de Streaming",
    "dash.monthlyRevenueTitle": "Facturación Mensual",
    "dash.activeSubsTitle": "Suscripciones Activas",
    "dash.activeClientsTitle": "Clientes Activos",
    "dash.upcomingExpirationsTitle": "Vencimientos Próximos",
    "dash.registeredSuppliersTitle": "Proveedores Registrados",
    "dash.freeProfilesTitle": "Perfiles Libres",
    "dash.registeredSubsSub": "suscripciones registradas",
    "dash.inTheSystem": "en el sistema",
    "dash.inNext5Days": "en los próximos 5 días",
    "dash.masterAccounts": "cuentas madre registradas",
    "dash.availableToAssign": "disponibles para asignar",

    // Platform Distribution Chart
    "chart.title": "Distribución por Plataforma",
    "chart.subtitle": "Total de {total} suscripciones activas registradas",
    "chart.totalRevenue": "Total: S/ {amount}/mes",
    "chart.noData": "No hay datos suficientes.",
    "chart.subs": "suscripciones",
    "chart.sub": "suscripción",

    // Financial & Activity Summary
    "finance.title": "Balance Financiero",
    "finance.currency": "Moneda oficial: Soles (PEN)",
    "finance.totalMonthlyRevenue": "Facturación Mensual Total",
    "finance.perMonth": "/ mes",
    "finance.avgTicket": "Ticket Promedio / Cliente",
    "finance.avgPrice": "Precio Promedio / Perfil",
    "finance.billableProfiles": "{count} perfiles facturables",
    "finance.viewClients": "Ver detalle de clientes",
    "finance.collectionHealth": "Salud de Cobranza",
    "finance.rateUpToDate": "Tasa de clientes activos al día",
    "finance.upToDate": "{pct}% Al Día",
    "finance.healthyClients": "Clientes al día",
    "finance.expiringClients": "Por vencer (≤5d)",
    "finance.expiredClients": "Vencidos",
    "finance.revenueAtRisk": "Cobranza en Riesgo / Vencida",
    "finance.viewExpirations": "Ver vencimientos",
    "finance.topPlatforms": "Top Plataformas por Ingreso",
    "finance.revenueByService": "Generación de ingresos por servicio",
    "finance.monthly": "/mes",
    "finance.addClient": "Nuevo Cliente",

    // Expiration Alerts
    "alerts.title": "Alertas y Notificaciones de WhatsApp",
    "alerts.filterAll": "Todas",
    "alerts.filterWarning": "Por Vencer (≤7d)",
    "alerts.filterExpired": "Vencidas",
    "alerts.searchPlaceholder": "Buscar cliente, teléfono o plataforma...",
    "alerts.notifyWhatsApp": "Enviar WhatsApp",
    "alerts.noAlerts": "No hay alertas pendientes en este momento",
    "alerts.noAlertsDesc":
      "Todas las suscripciones tienen más de 7 días de vigencia.",
    "alerts.client": "Cliente",
    "alerts.platform": "Plataforma",
    "alerts.status": "Estado",
    "alerts.cutDate": "Fecha de Corte",
    "alerts.actions": "Acciones",

    // Suppliers & Profiles
    "suppliers.title": "Proveedores de Streaming",
    "suppliers.subtitle":
      "Gestión de licencias, vencimientos y navegadores asignados",
    "suppliers.search": "Buscar por proveedor o correo...",
    "suppliers.newSupplier": "Nuevo Proveedor",
    "suppliers.close": "Cerrar",
    "suppliers.add": "Añadir Proveedor",
    "suppliers.addAccount": "Añadir Cuenta",
    "suppliers.noSuppliers": "No se encontraron proveedores",
    "suppliers.noSuppliersDesc":
      "Registra a tus proveedores para llevar control de cuentas madre y fechas de pago.",
    "suppliers.deleteSupplier": "¿Eliminar proveedor?",
    "suppliers.saveSupplier": "Guardar Proveedor",
    "suppliers.cancel": "Cancelar",
    "suppliers.accountsCount": "{count} cuenta(s) registradas",
    "suppliers.deleteSupplierTitle": "¿Eliminar Proveedor?",
    "suppliers.deleteSupplierDesc": "¿Deseas borrar al proveedor {name} y todas sus cuentas asociadas?",
    "suppliers.deleteAccountTitle": "¿Eliminar Cuenta?",
    "suppliers.deleteAccountDesc": "¿Estás seguro de que deseas eliminar esta cuenta de proveedor?",
    "suppliers.noAccounts": "No hay cuentas registradas para este proveedor.",
    "suppliers.expires": "Expira",
    "suppliers.browser": "Navegador",
    "suppliers.modalTitleAdd": "Añadir Cuenta a Proveedor",
    "suppliers.modalTitleEdit": "Editar Cuenta de Proveedor",
    "suppliers.modalSupplier": "Proveedor",
    "suppliers.platform": "Plataforma Streaming *",
    "suppliers.email": "Correo Electrónico *",
    "suppliers.password": "Contraseña *",
    "suppliers.expirationDate": "Fecha de Vencimiento de Licencia",
    "suppliers.recommendedBrowser": "Navegador Recomendado",
    "suppliers.webmailUrl": "Enlace a Webmail (Opcional)",
    "suppliers.notes": "Notas Adicionales",
    "suppliers.saveAccount": "Guardar Cuenta",

    "profiles.title": "Perfiles Libres y Disponibles",
    "profiles.subtitle":
      "Inventario de perfiles listos para asignar rápidamente a clientes",
    "profiles.search": "Buscar por plataforma, correo o usuario...",
    "profiles.add": "Agregar Perfil Libre",
    "profiles.assign": "Asignar a Cliente",
    "profiles.availableUnits": "{count} disponible(s)",
    "profiles.noProfiles": "No se encontraron perfiles libres",
    "profiles.noProfilesDesc":
      "Añade perfiles disponibles para asignarlos fácilmente a clientes nuevos.",
    "profiles.available": "{count} Libre(s)",
    "profiles.assignToClient": "Asignar a Cliente",
    "profiles.deleteTitle": "¿Eliminar Perfil Libre?",
    "profiles.deleteDesc": "¿Estás seguro de que deseas eliminar este registro de perfil libre?",
    "profiles.addNewTitle": "Agregar Perfil Libre",
    "profiles.platform": "Plataforma Streaming *",
    "profiles.quantity": "Cantidad de perfiles *",
    "profiles.email": "Correo Electrónico *",
    "profiles.password": "Contraseña *",
    "profiles.browser": "Navegador Asignado",
    "profiles.cancel": "Cancelar",
    "profiles.save": "Guardar Perfil",
    "profiles.assignTitle": "Asignar Perfil Libre",
    "profiles.selectClient": "Seleccionar Cliente Activo:",
    "profiles.chooseClientPlaceholder": "-- Elija un cliente --",
    "profiles.assignNotice": "Al asignar, se creará un servicio para este cliente y se reducirá el stock disponible ({count} disponible(s)).",
    "profiles.confirmAssign": "Confirmar Asignación",

    "links.title": "Enlaces Rápidos & Validación de Códigos",
    "links.subtitle": "Páginas de consulta externa y activación de cuentas",
    "links.addLink": "Agregar Enlace",
    "links.noLinks": "No tienes enlaces rápidos guardados",
    "links.noLinksDesc": "Añade accesos directos a plataformas de correo temporal, proveedores o páginas frecuentes.",
    "links.copied": "¡Copiado!",
    "links.copy": "Copiar URL",
    "links.open": "Abrir",
    "links.deleteTitle": "¿Eliminar Enlace?",
    "links.deleteDesc": "¿Estás seguro de que deseas eliminar {title}?",
    "links.modalTitle": "Nuevo Enlace Rápido",
    "links.nameLabel": "Nombre / Título del Portal",
    "links.urlLabel": "URL / Dirección Web",
    "links.cancel": "Cancelar",
    "links.save": "Guardar Enlace",

    // Inline Quick Editor
    "inline.quickEdit": "Edición Rápida en Tarjeta",
    "inline.sidePanel": "Panel Lateral",
    "inline.sidePanelTooltip": "Abrir panel lateral completo",
    "inline.clientName": "Nombre del Cliente",
    "inline.phone": "Teléfono / WhatsApp",
    "inline.services": "Servicios",
    "inline.serviceNumber": "Servicio #{num}",
    "inline.cutDate": "Fecha Corte",
    "inline.email": "Correo / Usuario",
    "inline.password": "Contraseña",
    "inline.profile": "Perfil",
    "inline.pin": "PIN",
    "inline.price": "Precio (S/)",
    "inline.cancel": "Cancelar",
    "inline.save": "Guardar",

    // WhatsApp Modal
    "whatsapp.title": "Notificación para WhatsApp",
    "whatsapp.subtitle": "Aviso de corte/renovación para {name}",
    "whatsapp.formattedMsg": "Mensaje Formateado (Puedes editarlo antes de enviar):",
    "whatsapp.copied": "¡Copiado!",
    "whatsapp.copy": "Copiar Texto",
    "whatsapp.open": "Abrir en WhatsApp",

    // Common Navigation
    "common.scrollLeft": "Desplazar a la izquierda",
    "common.scrollRight": "Desplazar a la derecha",

    // Renewal
    "clients.renew": "Renovar",
    "clients.renewTooltip": "Renovar suscripción del cliente",
    "sub.renew": "Renovar",
    "renewModal.title": "Renovar Suscripción",
    "renewModal.subtitle": "Extender servicio para {name}",
    "renewModal.selectSubs": "Servicios a renovar",
    "renewModal.selectAll": "Renovar todos",
    "renewModal.renewPeriod": "Periodo de renovación",
    "renewModal.durationUnit": "Unidad de tiempo",
    "renewModal.durationValue": "Cantidad",
    "renewModal.days": "Días",
    "renewModal.months": "Meses",
    "renewModal.years": "Años",
    "renewModal.quickPresets": "Atajos de duración",
    "renewModal.baseCalculation": "Calcular renovación a partir de",
    "renewModal.baseFromCut": "Fecha de corte actual ({date})",
    "renewModal.baseFromToday": "A partir de hoy ({date})",
    "renewModal.currentCutDate": "Corte actual",
    "renewModal.newCutDate": "Nuevo corte",
    "renewModal.cutDateManual": "Ajustar fecha de corte",
    "renewModal.newPrice": "Precio de renovación (S/)",
    "renewModal.summary": "Resumen de la renovación",
    "renewModal.confirm": "Confirmar Renovación",
    "renewModal.cancel": "Cancelar",
    "renewModal.success": "¡Cliente renovado con éxito!",
    "renewModal.notifyWhatsApp": "Avisar renovación por WhatsApp",
    "renewModal.activeHealth": "Estado: Activo",
  },
  en: {
    // Navigation
    "nav.menu": "NAVIGATION MENU",
    "nav.newClientService": "New Client / Service",
    "nav.overview": "Overview",
    "nav.activeClients": "Active Clients",
    "nav.inactiveClients": "Inactive Clients",
    "nav.suppliers": "Suppliers",
    "nav.freeProfiles": "Free Profiles",
    "nav.alertsWhatsapp": "Alerts & WhatsApp",
    "nav.quickLinks": "Quick Links",
    "nav.searchPlaceholder": "Search client, email or account...",
    "nav.expirations": "Expirations",
    "nav.active": "Active",

    // Profile Popover
    "profile.profile": "Profile",
    "profile.language": "Language",
    "profile.autoDetect": "Auto-detect language",
    "profile.detected": "Detected",
    "profile.theme": "Theme",
    "profile.themeSystem": "System",
    "profile.themeLight": "Light",
    "profile.themeDark": "Dark",
    "profile.allSettings": "All Settings",
    "profile.logout": "Log Out",
    "profile.logoutConfirmTitle": "Log Out?",
    "profile.logoutConfirmText": "Are you sure you want to log out?",
    "profile.cancel": "Cancel",
    "profile.confirmLogout": "Log Out",

    // Settings Modal
    "settings.title": "Settings",
    "settings.language": "Language",
    "settings.langDesc":
      "Affects how text, dates and UI are displayed across the system.",
    "settings.theme": "Theme",
    "settings.createPassword": "Create Access Password",
    "settings.createPasswordDesc":
      "You logged in with your Google account. You can create a password to also sign in directly with email and password.",
    "settings.createPasswordBtn": "Create Password",
    "settings.vault": "Vault & Encryption",
    "settings.vaultDesc":
      "Protect and encrypt passwords for your accounts and profiles with a local master key.",
    "settings.openVault": "Open Vault",
    "settings.weekStart": "First day of the week",
    "settings.monday": "Monday",
    "settings.sunday": "Sunday",

    // Clients
    "clients.activeTitle": "Active Clients",
    "clients.inactiveTitle": "Inactive / Cancelled Clients",
    "clients.showing": "Showing",
    "clients.clientCount": "client(s)",
    "clients.addClient": "Add Client",
    "clients.platform": "Platform:",
    "clients.all": "All",
    "clients.health": "Account Health:",
    "clients.healthy": "Up to date",
    "clients.warning": "Expiring (≤5d)",
    "clients.expired": "Expired",
    "clients.noClientsTitle": "No clients found",
    "clients.noClientsDesc":
      "Try changing your search query or register a new client in the system.",
    "clients.showAll": "Show all clients",
    "clients.search": "Search...",
    "clients.notifyRenewal": "Notify Renewal",
    "clients.copied": "Copied!",
    "clients.copy": "Copy",
    "clients.daysRemaining": "days remaining",
    "clients.expiresToday": "Expires today!",
    "clients.expiredAgo": "Expired",
    "clients.days": "days",
    "clients.day": "day",
    "clients.reactivate": "Reactivate",
    "clients.edit": "Edit",
    "clients.deactivate": "Deactivate",
    "clients.delete": "Delete",
    "clients.deleteConfirm": "Delete client?",

    // Client Card
    "clients.cardReactivateTooltip": "Reactivate client (Move to Active Clients)",
    "clients.cardDrawerTooltip": "Open side drawer",
    "clients.cardDeactivateTooltip": "Deactivate (Move to Inactive Clients)",
    "clients.cardDeleteTooltip": "Delete client permanently",
    "clients.profileCountSingular": "profile",
    "clients.profileCountPlural": "profiles",
    "clients.ofTotal": "(of {total})",
    "clients.noMatchingProfiles": "No matching profiles",

    // Subscription Item
    "sub.freeProfileBadge": "Free Profile",
    "sub.freeProfileTitle":
      "Assigned from Free Profiles (will be restored upon deletion)",
    "sub.contracted": "Contracted:",
    "sub.cutDate": "Cut Date:",
    "sub.subPrice": "Subscription Price:",
    "sub.assignedProfile": "Assigned Profile:",
    "sub.pin": "PIN:",
    "sub.noEmail": "No email assigned",
    "sub.noPassword": "No password assigned",
    "sub.notifyWhatsApp": "Notify Renewal via WhatsApp",
    "sub.copyEmail": "Copy email",
    "sub.copyPassword": "Copy password",
    "sub.copyProfile": "Copy profile",
    "sub.copyPin": "Copy PIN",

    // Client Modal
    "clientModal.newTitle": "New Client",
    "clientModal.editTitle": "Edit Client",
    "clientModal.duplicateDetected": "Possible duplicate client detected!",
    "clientModal.duplicateMsg":
      "A client with this name or phone already exists in the system:",
    "clientModal.editExisting": "Edit existing client",
    "clientModal.continueCreating": "Continue creating new",
    "clientModal.personalInfo": "PERSONAL INFORMATION",
    "clientModal.name": "Client Name *",
    "clientModal.phone": "WhatsApp / Phone",
    "clientModal.status": "Client Status",
    "clientModal.active": "Active",
    "clientModal.inactive": "Inactive",
    "clientModal.services": "Contracted Services",
    "clientModal.addService": "Add Service",
    "clientModal.serviceNumber": "Service #",
    "clientModal.platform": "Streaming Platform *",
    "clientModal.subPrice": "Subscription Price (S/)",
    "clientModal.period": "Subscription period",
    "clientModal.periodDays": "Days",
    "clientModal.periodMonths": "Months",
    "clientModal.periodYears": "Years",
    "clientModal.renewFrom": "Renew calculating from:",
    "clientModal.currentCut": "Current cut date",
    "clientModal.today": "Today",
    "clientModal.calculatedFromCut":
      "Calculated extending current cut date ({date})",
    "clientModal.calculatedFromToday":
      "Calculated starting from today ({date})",
    "clientModal.autoCutDate":
      "Automatically calculated based on the selected period",
    "clientModal.hireDate": "Hire Date",
    "clientModal.cutDate": "Cut Date *",
    "clientModal.emailUser": "Email / Account User",
    "clientModal.password": "Account Password",
    "clientModal.profile": "Assigned Profile",
    "clientModal.pin": "Profile PIN",
    "clientModal.cancel": "Cancel",
    "clientModal.saveChanges": "Save Changes",
    "clientModal.createClient": "Create Client",
    "clientModal.saving": "Saving...",
    "clientModal.creating": "Creating...",
    "clientModal.removeService": "Remove Service",
    "clientModal.totalDuration": "Duration:",
    "clientModal.namePlaceholder": "e.g. John Doe",
    "clientModal.phonePlaceholder": "e.g. +1 555 123 4567",
    "clientModal.emailPlaceholder": "email@example.com",
    "clientModal.passPlaceholder": "Account password",
    "clientModal.profilePlaceholder": "e.g. Profile 1, John...",
    "clientModal.pinPlaceholder": "e.g. 1234",
    "clientModal.freeProfileTag": "Free Profile",
    "clientModal.freeProfileNotice":
      "Assigned from Free Profiles inventory (will be restored upon deletion)",

    // Delete Client Modal
    "deleteModal.deactivateTitle": "Deactivate Client?",
    "deleteModal.deleteTitle": "Delete Permanently?",
    "deleteModal.deactivateDesc":
      "Are you sure you want to deactivate {name}? They will be moved to the Inactive Clients tab. You can view and reactivate them at any time.",
    "deleteModal.deleteDesc":
      "Are you sure you want to permanently delete {name}? This action cannot be undone and will delete the client from the database.",
    "deleteModal.inventoryRestoreTitle": "Inventory restoration",
    "deleteModal.inventoryRestoreDesc":
      "Profiles assigned from Free Profiles will be automatically restored and added back.",
    "deleteModal.cancel": "Cancel",
    "deleteModal.moveToInactive": "Move to Inactive",
    "deleteModal.delete": "Delete",

    // Dashboard Overview Cards
    "dash.title": "Overview",
    "dash.subtitle": "Streaming Metrics & Control Dashboard",
    "dash.monthlyRevenueTitle": "Monthly Revenue",
    "dash.activeSubsTitle": "Active Subscriptions",
    "dash.activeClientsTitle": "Active Clients",
    "dash.upcomingExpirationsTitle": "Upcoming Expirations",
    "dash.registeredSuppliersTitle": "Registered Suppliers",
    "dash.freeProfilesTitle": "Free Profiles",
    "dash.registeredSubsSub": "registered subscriptions",
    "dash.inTheSystem": "in the system",
    "dash.inNext5Days": "in the next 5 days",
    "dash.masterAccounts": "master accounts registered",
    "dash.availableToAssign": "available to assign",

    // Platform Distribution Chart
    "chart.title": "Platform Distribution",
    "chart.subtitle": "Total of {total} registered active subscriptions",
    "chart.totalRevenue": "Total: S/ {amount}/mo",
    "chart.noData": "Not enough data.",
    "chart.subs": "subscriptions",
    "chart.sub": "subscription",

    // Financial & Activity Summary
    "finance.title": "Financial Balance",
    "finance.currency": "Official currency: Soles (PEN)",
    "finance.totalMonthlyRevenue": "Total Monthly Revenue",
    "finance.perMonth": "/ mo",
    "finance.avgTicket": "Average Ticket / Client",
    "finance.avgPrice": "Average Price / Profile",
    "finance.billableProfiles": "{count} billable profiles",
    "finance.viewClients": "View clients detail",
    "finance.collectionHealth": "Collection Health",
    "finance.rateUpToDate": "Active clients up to date rate",
    "finance.upToDate": "{pct}% Up to Date",
    "finance.healthyClients": "Clients up to date",
    "finance.expiringClients": "Expiring (≤5d)",
    "finance.expiredClients": "Expired",
    "finance.revenueAtRisk": "Revenue at Risk / Overdue",
    "finance.viewExpirations": "View expirations",
    "finance.topPlatforms": "Top Platforms by Revenue",
    "finance.revenueByService": "Revenue generation by service",
    "finance.monthly": "/mo",
    "finance.addClient": "New Client",

    // Expiration Alerts
    "alerts.title": "WhatsApp Alerts & Notifications",
    "alerts.filterAll": "All",
    "alerts.filterWarning": "Expiring (≤7d)",
    "alerts.filterExpired": "Expired",
    "alerts.searchPlaceholder": "Search client, phone or platform...",
    "alerts.notifyWhatsApp": "Send WhatsApp",
    "alerts.noAlerts": "No pending alerts at this moment",
    "alerts.noAlertsDesc":
      "All subscriptions have more than 7 days remaining.",
    "alerts.client": "Client",
    "alerts.platform": "Platform",
    "alerts.status": "Status",
    "alerts.cutDate": "Cut Date",
    "alerts.actions": "Actions",

    // Suppliers & Profiles
    "suppliers.title": "Streaming Suppliers",
    "suppliers.subtitle":
      "Management of licenses, expirations, and assigned browsers",
    "suppliers.search": "Search by supplier or email...",
    "suppliers.newSupplier": "New Supplier",
    "suppliers.close": "Close",
    "suppliers.add": "Add Supplier",
    "suppliers.addAccount": "Add Account",
    "suppliers.noSuppliers": "No suppliers found",
    "suppliers.noSuppliersDesc":
      "Register your suppliers to track master accounts and payment dates.",
    "suppliers.deleteSupplier": "Delete supplier?",
    "suppliers.saveSupplier": "Save Supplier",
    "suppliers.cancel": "Cancel",
    "suppliers.accountsCount": "{count} account(s) registered",
    "suppliers.deleteSupplierTitle": "Delete Supplier?",
    "suppliers.deleteSupplierDesc": "Are you sure you want to delete supplier {name} and all associated accounts?",
    "suppliers.deleteAccountTitle": "Delete Account?",
    "suppliers.deleteAccountDesc": "Are you sure you want to delete this supplier account?",
    "suppliers.noAccounts": "No accounts registered for this supplier.",
    "suppliers.expires": "Expires",
    "suppliers.browser": "Browser",
    "suppliers.modalTitleAdd": "Add Account to Supplier",
    "suppliers.modalTitleEdit": "Edit Supplier Account",
    "suppliers.modalSupplier": "Supplier",
    "suppliers.platform": "Streaming Platform *",
    "suppliers.email": "Email Address *",
    "suppliers.password": "Password *",
    "suppliers.expirationDate": "License Expiration Date",
    "suppliers.recommendedBrowser": "Recommended Browser",
    "suppliers.webmailUrl": "Webmail Link (Optional)",
    "suppliers.notes": "Additional Notes",
    "suppliers.saveAccount": "Save Account",

    "profiles.title": "Available Free Profiles",
    "profiles.subtitle":
      "Inventory of profiles ready to quickly assign to clients",
    "profiles.search": "Search by platform, email or username...",
    "profiles.add": "Add Free Profile",
    "profiles.assign": "Assign to Client",
    "profiles.availableUnits": "{count} available",
    "profiles.noProfiles": "No free profiles found",
    "profiles.noProfilesDesc":
      "Add available profiles to easily assign them to new clients.",
    "profiles.available": "{count} Free",
    "profiles.assignToClient": "Assign to Client",
    "profiles.deleteTitle": "Delete Free Profile?",
    "profiles.deleteDesc": "Are you sure you want to delete this free profile record?",
    "profiles.addNewTitle": "Add Free Profile",
    "profiles.platform": "Streaming Platform *",
    "profiles.quantity": "Profile Quantity *",
    "profiles.email": "Email Address *",
    "profiles.password": "Password *",
    "profiles.browser": "Assigned Browser",
    "profiles.cancel": "Cancel",
    "profiles.save": "Save Profile",
    "profiles.assignTitle": "Assign Free Profile",
    "profiles.selectClient": "Select Active Client:",
    "profiles.chooseClientPlaceholder": "-- Choose a client --",
    "profiles.assignNotice": "When assigned, a service will be created for this client and available stock will be reduced ({count} available).",
    "profiles.confirmAssign": "Confirm Assignment",

    "links.title": "Quick Links & Code Validation",
    "links.subtitle": "External lookup and account activation portals",
    "links.addLink": "Add Link",
    "links.noLinks": "No quick links saved yet",
    "links.noLinksDesc": "Add direct shortcuts to temporary email platforms, supplier dashboards, or frequent sites.",
    "links.copied": "Copied!",
    "links.copy": "Copy URL",
    "links.open": "Open",
    "links.deleteTitle": "Delete Link?",
    "links.deleteDesc": "Are you sure you want to delete {title}?",
    "links.modalTitle": "New Quick Link",
    "links.nameLabel": "Portal Name / Title",
    "links.urlLabel": "URL / Web Address",
    "links.cancel": "Cancel",
    "links.save": "Save Link",

    // Inline Quick Editor
    "inline.quickEdit": "Quick Card Edit",
    "inline.sidePanel": "Side Panel",
    "inline.sidePanelTooltip": "Open full side panel",
    "inline.clientName": "Client Name",
    "inline.phone": "Phone / WhatsApp",
    "inline.services": "Services",
    "inline.serviceNumber": "Service #{num}",
    "inline.cutDate": "Cut-off Date",
    "inline.email": "Email / Username",
    "inline.password": "Password",
    "inline.profile": "Profile",
    "inline.pin": "PIN",
    "inline.price": "Price (S/)",
    "inline.cancel": "Cancel",
    "inline.save": "Save",

    // WhatsApp Modal
    "whatsapp.title": "WhatsApp Notification",
    "whatsapp.subtitle": "Cut-off/renewal notice for {name}",
    "whatsapp.formattedMsg": "Formatted Message (You can edit before sending):",
    "whatsapp.copied": "Copied!",
    "whatsapp.copy": "Copy Text",
    "whatsapp.open": "Open in WhatsApp",

    // Common Navigation
    "common.scrollLeft": "Scroll left",
    "common.scrollRight": "Scroll right",

    // Renewal
    "clients.renew": "Renew",
    "clients.renewTooltip": "Renew client subscription",
    "sub.renew": "Renew",
    "renewModal.title": "Renew Subscription",
    "renewModal.subtitle": "Extend service for {name}",
    "renewModal.selectSubs": "Services to renew",
    "renewModal.selectAll": "Renew all",
    "renewModal.renewPeriod": "Renewal period",
    "renewModal.durationUnit": "Time unit",
    "renewModal.durationValue": "Quantity",
    "renewModal.days": "Days",
    "renewModal.months": "Months",
    "renewModal.years": "Years",
    "renewModal.quickPresets": "Quick duration presets",
    "renewModal.baseCalculation": "Calculate renewal starting from",
    "renewModal.baseFromCut": "Current cutoff date ({date})",
    "renewModal.baseFromToday": "Starting today ({date})",
    "renewModal.currentCutDate": "Current cutoff",
    "renewModal.newCutDate": "New cutoff",
    "renewModal.cutDateManual": "Adjust cutoff date",
    "renewModal.newPrice": "Renewal price (S/)",
    "renewModal.summary": "Renewal summary",
    "renewModal.confirm": "Confirm Renewal",
    "renewModal.cancel": "Cancel",
    "renewModal.success": "Client renewed successfully!",
    "renewModal.notifyWhatsApp": "Send WhatsApp confirmation",
    "renewModal.activeHealth": "Status: Active",
  },
};

export type TranslationKey = keyof TranslationDictionary;

/**
 * Hook to access current translations and language state.
 */
export function useTranslation() {
  const {
    language,
    autoDetectLanguage,
    setLanguage,
    setAutoDetectLanguage,
    getResolvedLanguage,
  } = useSettingsStore();

  const resolvedLang = getResolvedLanguage();
  const detectedBrowserLang = detectBrowserLanguage();

  const t = (
    key: TranslationKey,
    params?: Record<string, string | number>,
  ): string => {
    const dict = TRANSLATIONS[resolvedLang] || TRANSLATIONS.es;
    let text = dict[key] || TRANSLATIONS.es[key] || (key as string);
    if (params) {
      Object.entries(params).forEach(([paramKey, val]) => {
        text = text.replace(new RegExp(`{${paramKey}}`, "g"), String(val));
      });
    }
    return text;
  };

  return {
    t,
    language,
    resolvedLanguage: resolvedLang,
    isAutoDetect: autoDetectLanguage,
    detectedBrowserLanguage: detectedBrowserLang,
    setLanguage,
    setAutoDetectLanguage,
  };
}
