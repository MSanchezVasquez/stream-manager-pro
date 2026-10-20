import React, { useState } from "react";
import { useDataStore } from "../../store/dataStore";
import {
  formatCutDateStatus,
  getDaysRemaining,
  getPlatformConfig,
  getPlatformBadgeProps,
  getPlatformDisplayName,
} from "../../utils/platformHelpers";
import { PlatformIcon } from "../common/PlatformIcon";
import {
  AlertCircle,
  Calendar,
  MessageSquare,
  ShieldAlert,
  Search,
  User,
  Truck,
  RotateCw,
  Copy,
  Check,
  Mail,
  Key,
  Eye,
  EyeOff,
  Compass,
  Coins,
  Layers,
  X,
} from "lucide-react";
import { WhatsAppModal } from "../WhatsAppModal";
import { RenewClientModal } from "../Clients/RenewClientModal";
import { RenewSupplierAccountModal } from "../Suppliers/RenewSupplierAccountModal";
import {
  Client,
  ClientSubscription,
  Supplier,
  SupplierAccount,
} from "../../types";
import { useTranslation } from "../../utils/translations";

interface ClientAlertItem {
  type: "client";
  id: string;
  client: Client;
  sub: ClientSubscription;
  days: number;
  dateStr: string;
  displayName: string;
  phone?: string;
  email?: string;
  profileName?: string;
  pin?: string;
  price?: number;
  serviceName: string;
}

interface SupplierAlertItem {
  type: "supplier";
  id: string;
  supplier: Supplier;
  account: SupplierAccount;
  days: number;
  dateStr: string;
  displayName: string;
  email: string;
  browser?: string;
  cost?: number;
  serviceName: string;
}

type AlertItem = ClientAlertItem | SupplierAlertItem;

export const ExpirationAlerts: React.FC = () => {
  const { t, resolvedLanguage } = useTranslation();
  const { clients, suppliers } = useDataStore();

  const [scope, setScope] = useState<"all" | "clients" | "suppliers">("all");
  const [filter, setFilter] = useState<"all" | "warning" | "expired">("all");
  const [search, setSearch] = useState("");

  // Modals state
  const [clientToRenew, setClientToRenew] = useState<{
    client: Client;
    targetSubscriptionId?: string;
  } | null>(null);

  const [supplierAccountToRenew, setSupplierAccountToRenew] = useState<{
    supplier: Supplier;
    account: SupplierAccount;
  } | null>(null);

  const [selectedSub, setSelectedSub] = useState<{
    sub: ClientSubscription;
    clientName?: string;
    phone?: string;
    isRenewal?: boolean;
    renewedSubs?: ClientSubscription[];
  } | null>(null);

  // Supplier account password visibility & copy feedback
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const togglePassword = (accId: string) => {
    setShowPasswords((prev) => ({ ...prev, [accId]: !prev[accId] }));
  };

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Compile alert items from Clients and Suppliers
  const allAlertItems: AlertItem[] = [];

  // 1. Client active subscriptions expiring in <= 7 days or expired
  clients.forEach((client) => {
    if (client.status === "active") {
      client.subscriptions.forEach((sub) => {
        if (sub.status === "active" && sub.cutDate) {
          const days = getDaysRemaining(sub.cutDate);
          if (days <= 7) {
            allAlertItems.push({
              type: "client",
              id: `client-${client.id}-${sub.id}`,
              client,
              sub,
              days,
              dateStr: sub.cutDate,
              displayName: client.name,
              phone: client.phone,
              email: sub.email,
              profileName: sub.profileName,
              pin: sub.pin,
              price: sub.price,
              serviceName: sub.serviceName,
            });
          }
        }
      });
    }
  });

  // 2. Supplier accounts expiring in <= 7 days or expired
  suppliers.forEach((supplier) => {
    (supplier.accounts || []).forEach((acc) => {
      if (acc.expirationDate) {
        const days = getDaysRemaining(acc.expirationDate);
        if (days <= 7) {
          allAlertItems.push({
            type: "supplier",
            id: `supplier-${supplier.id}-${acc.id}`,
            supplier,
            account: acc,
            days,
            dateStr: acc.expirationDate,
            displayName: supplier.name,
            email: acc.email,
            browser: acc.browser,
            cost: acc.cost,
            serviceName: acc.serviceName,
          });
        }
      }
    });
  });

  // Sort by urgency: expired first (most negative days), then closest to expiring
  allAlertItems.sort((a, b) => a.days - b.days);

  // Counts for scope buttons
  const clientAlertsCount = allAlertItems.filter((i) => i.type === "client").length;
  const supplierAlertsCount = allAlertItems.filter((i) => i.type === "supplier").length;

  // Filter by scope, urgency filter and search
  const filteredItems = allAlertItems.filter((item) => {
    // Scope filter
    if (scope === "clients" && item.type !== "client") return false;
    if (scope === "suppliers" && item.type !== "supplier") return false;

    // Urgency filter
    if (filter === "expired" && item.days >= 0) return false;
    if (filter === "warning" && (item.days < 0 || item.days > 5)) return false;

    // Text search
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchesName = item.displayName.toLowerCase().includes(q);
      const matchesPlatform = item.serviceName.toLowerCase().includes(q);
      const matchesEmail = item.email ? item.email.toLowerCase().includes(q) : false;
      const matchesPhone = item.type === "client" && item.phone ? item.phone.toLowerCase().includes(q) : false;
      const matchesProfile = item.type === "client" && item.profileName ? item.profileName.toLowerCase().includes(q) : false;
      const matchesBrowser = item.type === "supplier" && item.browser ? item.browser.toLowerCase().includes(q) : false;

      if (!matchesName && !matchesPlatform && !matchesEmail && !matchesPhone && !matchesProfile && !matchesBrowser) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#141418] border border-slate-200 dark:border-[#1F1F23] shadow-sm">
      {/* Top Header: Title & Spacious Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-[#22222A]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight font-space">
              {t("alerts.title")}
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#94949E] mt-0.5">
              {resolvedLanguage === "en"
                ? "Client subscriptions and supplier accounts requiring renewal or attention"
                : "Suscripciones de clientes y cuentas de proveedores que requieren renovación o atención"}
            </p>
          </div>
        </div>

        {/* Spacious, fully readable searchbar */}
        <div className="relative w-full md:w-80 sm:w-72 shrink-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder={t("alerts.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#2D2D33] bg-slate-50 dark:bg-[#1A1A1E] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Control Bar: Perfectly Aligned Filters Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3.5 mb-6">
        {/* Scope Tabs: Todos | Clientes | Proveedores */}
        <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-[#1A1A1E] border border-slate-200/80 dark:border-[#2D2D33] gap-1 self-start sm:self-auto overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setScope("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              scope === "all"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 dark:text-[#94949E] hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-[#25252D]"
            }`}
          >
            <Layers className="w-3.5 h-3.5 shrink-0" />
            <span>{t("alerts.filterAll")}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                scope === "all"
                  ? "bg-white/20 text-white"
                  : "bg-slate-200 dark:bg-[#2D2D35] text-slate-600 dark:text-slate-300"
              }`}
            >
              {allAlertItems.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setScope("clients")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              scope === "clients"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 dark:text-[#94949E] hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-[#25252D]"
            }`}
          >
            <User className="w-3.5 h-3.5 shrink-0" />
            <span>Clientes</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                scope === "clients"
                  ? "bg-white/20 text-white"
                  : "bg-slate-200 dark:bg-[#2D2D35] text-slate-600 dark:text-slate-300"
              }`}
            >
              {clientAlertsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setScope("suppliers")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              scope === "suppliers"
                ? "bg-purple-600 text-white shadow-xs"
                : "text-slate-600 dark:text-[#94949E] hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-[#25252D]"
            }`}
          >
            <Truck className="w-3.5 h-3.5 shrink-0" />
            <span>Proveedores</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                scope === "suppliers"
                  ? "bg-white/20 text-white"
                  : "bg-slate-200 dark:bg-[#2D2D35] text-slate-600 dark:text-slate-300"
              }`}
            >
              {supplierAlertsCount}
            </span>
          </button>
        </div>

        {/* Urgency Filter Tabs: Todos | Por Vencer | Vencidas */}
        <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-[#1A1A1E] border border-slate-200/80 dark:border-[#2D2D33] gap-1 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              filter === "all"
                ? "bg-white dark:bg-[#25252D] text-slate-900 dark:text-white shadow-xs"
                : "text-slate-600 dark:text-[#94949E] hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {t("alerts.filterAll")}
          </button>
          <button
            type="button"
            onClick={() => setFilter("warning")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              filter === "warning"
                ? "bg-amber-500 text-white shadow-xs"
                : "text-slate-600 dark:text-[#94949E] hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {t("alerts.filterWarning")}
          </button>
          <button
            type="button"
            onClick={() => setFilter("expired")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              filter === "expired"
                ? "bg-red-600 text-white shadow-xs"
                : "text-slate-600 dark:text-[#94949E] hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {t("alerts.filterExpired")}
          </button>
        </div>
      </div>

      {/* Grid of Alert Cards */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-slate-200 dark:border-[#1F1F23] rounded-2xl">
          <AlertCircle className="w-9 h-9 text-emerald-500 mx-auto mb-2 opacity-80" />
          <p className="text-sm font-semibold text-slate-700 dark:text-[#E4E4E7]">
            {t("alerts.noAlerts")}
          </p>
          <p className="text-xs text-slate-500 dark:text-[#94949E] mt-0.5">
            {t("alerts.noAlertsDesc")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const platformConfig = getPlatformConfig(item.serviceName as any);
            const badgeProps = getPlatformBadgeProps(platformConfig);
            const statusInfo = formatCutDateStatus(item.dateStr, resolvedLanguage);

            if (item.type === "client") {
              return (
                <div
                  key={item.id}
                  className="p-4.5 rounded-2xl border border-slate-200 dark:border-[#1F1F23] bg-slate-50/60 dark:bg-[#18181E] hover:border-slate-300 dark:hover:border-[#2D2D33] shadow-xs hover:shadow-sm transition-all flex flex-col justify-between gap-3.5"
                >
                  <div>
                    {/* Top Row: Platform Badge + Status Badge (Guaranteed single-row alignment) */}
                    <div className="flex items-center justify-between gap-2 mb-3 min-h-7">
                      <span
                        className={`${badgeProps.className} shrink-0 max-w-[62%] sm:max-w-[65%]`}
                        style={badgeProps.style}
                        title={getPlatformDisplayName(item.sub.serviceName)}
                      >
                        <PlatformIcon
                          platform={item.sub.serviceName}
                          className="w-3.5 h-3.5 shrink-0"
                        />
                        <span className="font-semibold text-xs truncate">
                          {getPlatformDisplayName(item.sub.serviceName)}
                        </span>
                      </span>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap shrink-0 shadow-2xs ${statusInfo.badge}`}
                      >
                        {statusInfo.label}
                      </span>
                    </div>

                    {/* Clean Customer Identity Box */}
                    <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white/70 dark:bg-[#121216] border border-slate-200/70 dark:border-[#25252D] mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[9px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 leading-none mb-0.5">
                            Cliente
                          </div>
                          <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                            {item.displayName}
                          </div>
                        </div>
                      </div>

                      {item.phone && (
                        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 shrink-0 font-medium">
                          {item.phone}
                        </span>
                      )}
                    </div>

                    {/* Subscription Details */}
                    <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 px-0.5">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          {t("alerts.cutDate")}:{" "}
                          <strong className="text-slate-700 dark:text-slate-200 font-cascadia">
                            {item.dateStr}
                          </strong>
                        </span>
                      </div>

                      {item.email && (
                        <div className="truncate text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                          {item.email}
                        </div>
                      )}

                      {item.profileName && (
                        <div className="text-[11px] truncate">
                          {t("sub.assignedProfile")}:{" "}
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {item.profileName}
                          </span>
                          {item.pin && ` (PIN: ${item.pin})`}
                        </div>
                      )}

                      {typeof item.price === "number" && item.price > 0 && (
                        <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 font-cascadia pt-0.5">
                          {t("sub.subPrice")}: S/ {item.price.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions: Renovar Cliente + Enviar WhatsApp */}
                  <div className="flex items-center gap-2 pt-2.5 border-t border-slate-200/60 dark:border-[#22222A] mt-auto">
                    <button
                      type="button"
                      onClick={() =>
                        setClientToRenew({
                          client: item.client,
                          targetSubscriptionId: item.sub.id,
                        })
                      }
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
                      title="Renovar suscripción del cliente"
                    >
                      <RotateCw className="w-3.5 h-3.5 shrink-0" />
                      <span>{t("clients.renew")}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedSub({
                          sub: item.sub,
                          clientName: item.displayName,
                          phone: item.phone,
                        })
                      }
                      className="py-2 px-3 rounded-xl bg-slate-200/70 hover:bg-slate-200 dark:bg-[#25252E] dark:hover:bg-[#2E2E3A] text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-300/60 dark:border-[#383844] transition-all cursor-pointer shrink-0"
                      title={t("alerts.notifyWhatsApp")}
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </button>
                  </div>
                </div>
              );
            }

            // Supplier Account Card
            return (
              <div
                key={item.id}
                className="p-4.5 rounded-2xl border border-purple-200/70 dark:border-purple-900/30 bg-purple-50/20 dark:bg-[#181520] hover:border-purple-300 dark:hover:border-purple-800/50 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between gap-3.5"
              >
                <div>
                  {/* Top Row: Platform Badge + Status Badge (Guaranteed single-row alignment) */}
                  <div className="flex items-center justify-between gap-2 mb-3 min-h-7">
                    <span
                      className={`${badgeProps.className} shrink-0 max-w-[62%] sm:max-w-[65%]`}
                      style={badgeProps.style}
                      title={getPlatformDisplayName(item.account.serviceName)}
                    >
                      <PlatformIcon
                        platform={item.account.serviceName}
                        className="w-3.5 h-3.5 shrink-0"
                      />
                      <span className="font-semibold text-xs truncate">
                        {getPlatformDisplayName(item.account.serviceName)}
                      </span>
                    </span>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap shrink-0 shadow-2xs ${statusInfo.badge}`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Clean Supplier Identity Box */}
                  <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white/70 dark:bg-[#121216] border border-purple-200/60 dark:border-purple-900/25 mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20">
                        <Truck className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[9px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 leading-none mb-0.5">
                          Proveedor
                        </div>
                        <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                          {item.displayName}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Account Details */}
                  <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 px-0.5">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>
                        {t("suppliers.expires")}:{" "}
                        <strong className="text-slate-800 dark:text-slate-200 font-cascadia">
                          {item.dateStr}
                        </strong>
                      </span>
                    </div>

                    {/* Email with Copy */}
                    <div className="flex items-center justify-between gap-1.5 bg-white dark:bg-[#0F0F12] px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-[#2D2D33]">
                      <div className="flex items-center gap-1.5 truncate">
                        <Mail className="w-3 h-3 text-[#94949E] shrink-0" />
                        <span className="font-mono text-[11px] text-slate-800 dark:text-[#E4E4E7] truncate">
                          {item.email}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(item.email, `semail-${item.account.id}`)}
                        className="text-slate-400 hover:text-indigo-500 p-0.5 shrink-0 cursor-pointer"
                        title="Copiar correo"
                      >
                        {copiedField === `semail-${item.account.id}` ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    {/* Password with Eye toggle & Copy */}
                    <div className="flex items-center justify-between gap-1.5 bg-white dark:bg-[#0F0F12] px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-[#2D2D33]">
                      <div className="flex items-center gap-1.5 truncate">
                        <Key className="w-3 h-3 text-[#94949E] shrink-0" />
                        <span className="font-mono text-[11px] text-slate-800 dark:text-[#E4E4E7] truncate">
                          {showPasswords[item.account.id] ? item.account.password : "••••••••••••"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => togglePassword(item.account.id)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                          title={showPasswords[item.account.id] ? "Ocultar contraseña" : "Ver contraseña"}
                        >
                          {showPasswords[item.account.id] ? (
                            <EyeOff className="w-3 h-3" />
                          ) : (
                            <Eye className="w-3 h-3" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(item.account.password, `spass-${item.account.id}`)}
                          className="text-slate-400 hover:text-indigo-500 p-0.5 cursor-pointer"
                          title="Copiar contraseña"
                        >
                          {copiedField === `spass-${item.account.id}` ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Browser & Cost */}
                    <div className="flex items-center justify-between gap-2 pt-0.5 flex-wrap">
                      {item.browser && (
                        <div className="flex items-center gap-1 text-[11px]">
                          <Compass className="w-3 h-3 text-sky-500 shrink-0" />
                          <span>{item.browser}</span>
                        </div>
                      )}
                      {typeof item.cost === "number" && item.cost > 0 && (
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 font-cascadia ml-auto">
                          <Coins className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span>S/ {item.cost.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions: Renovar Cuenta de Proveedor */}
                <div className="pt-2.5 border-t border-purple-200/50 dark:border-[#282235] mt-auto">
                  <button
                    type="button"
                    onClick={() =>
                      setSupplierAccountToRenew({
                        supplier: item.supplier,
                        account: item.account,
                      })
                    }
                    className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm shadow-purple-600/20 transition-all cursor-pointer"
                    title={t("suppliers.renewAccount")}
                  >
                    <RotateCw className="w-3.5 h-3.5 shrink-0" />
                    <span>{t("suppliers.renewAccount")}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* WhatsApp Modal */}
      {selectedSub && (
        <WhatsAppModal
          isOpen={!!selectedSub}
          onClose={() => setSelectedSub(null)}
          clientName={selectedSub.clientName || selectedSub.sub.clientName}
          serviceName={selectedSub.sub.serviceName}
          cutDate={selectedSub.sub.cutDate}
          email={selectedSub.sub.email}
          password={selectedSub.sub.password}
          profileName={selectedSub.sub.profileName}
          pin={selectedSub.sub.pin}
          phone={selectedSub.phone}
          isRenewal={selectedSub.isRenewal}
          renewedSubs={selectedSub.renewedSubs}
        />
      )}

      {/* Client Renewal Modal */}
      {clientToRenew && (
        <RenewClientModal
          isOpen={!!clientToRenew}
          onClose={() => setClientToRenew(null)}
          client={clientToRenew.client}
          targetSubscriptionId={clientToRenew.targetSubscriptionId}
          onNotifyWhatsApp={(sub, clientName, phone, allRenewedSubs) => {
            setSelectedSub({
              sub,
              clientName,
              phone,
              isRenewal: true,
              renewedSubs: allRenewedSubs,
            });
          }}
        />
      )}

      {/* Supplier Account Renewal Modal */}
      {supplierAccountToRenew && (
        <RenewSupplierAccountModal
          isOpen={!!supplierAccountToRenew}
          onClose={() => setSupplierAccountToRenew(null)}
          supplier={supplierAccountToRenew.supplier}
          account={supplierAccountToRenew.account}
        />
      )}
    </div>
  );
};
