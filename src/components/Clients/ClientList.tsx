import React, { useState, useMemo } from "react";
import { User, Search, ArrowRight } from "lucide-react";
import { useDataStore } from "../../store/dataStore";
import {
  getClientAccountHealth,
  getDaysRemaining,
} from "../../utils/platformHelpers";
import { Client, ClientSubscription } from "../../types";
import { ClientModal } from "./ClientModal";
import { WhatsAppModal } from "../WhatsAppModal";
import { ClientListHeader } from "./ClientListHeader";
import { ClientHealthFilterBar } from "./ClientHealthFilterBar";
import { ClientCard } from "./ClientCard";
import { ClientInlineEditor } from "./ClientInlineEditor";
import { DeleteClientModal } from "./DeleteClientModal";

interface ClientListProps {
  statusFilter: "active" | "inactive";
  globalSearchQuery: string;
  onSwitchTab?: (tab: "clients_active" | "clients_inactive") => void;
}

const PLATFORM_FILTER_OPTIONS = [
  "Todos",
  "Netflix",
  "Disney+",
  "HBO Max",
  "Youtube Premium",
  "Prime Video",
  "Paramount Plus",
  "Spotify Premium",
  "Crunchyroll",
  "DGO",
];

export const ClientList: React.FC<ClientListProps> = ({
  statusFilter,
  globalSearchQuery,
  onSwitchTab,
}) => {
  const { clients, freeProfiles, deleteClient, saveClient } = useDataStore();

  const [platformFilter, setPlatformFilter] = useState<string>("Todos");
  const [healthFilter, setHealthFilter] = useState<
    "all" | "healthy" | "warning" | "expired"
  >("all");
  const [localSearch] = useState<string>("");
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>(
    {},
  );
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Inline editing state
  const [inlineEditingClientId, setInlineEditingClientId] = useState<
    string | null
  >(null);
  const [inlineClientData, setInlineClientData] = useState<Client | null>(null);

  // Modals / Drawer state
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [isDeletingClient, setIsDeletingClient] = useState(false);
  const [whatsAppSub, setWhatsAppSub] = useState<{
    clientName: string;
    sub: ClientSubscription;
    phone?: string;
  } | null>(null);

  const effectiveSearch = (globalSearchQuery || localSearch).trim();

  // Search matches in the opposite status tab
  const matchingOtherStatus = useMemo(() => {
    if (!effectiveSearch) return [];
    const query = effectiveSearch.toLowerCase();
    const otherStatus = statusFilter === "active" ? "inactive" : "active";
    return clients.filter((client) => {
      if (client.status !== otherStatus) return false;
      const matchesName = client.name.toLowerCase().includes(query);
      const matchesPhone =
        client.phone && client.phone.toLowerCase().includes(query);
      const matchesSub = client.subscriptions.some(
        (sub) =>
          sub.serviceName.toLowerCase().includes(query) ||
          (sub.email && sub.email.toLowerCase().includes(query)) ||
          (sub.profileName && sub.profileName.toLowerCase().includes(query)),
      );
      return matchesName || matchesPhone || matchesSub;
    });
  }, [clients, effectiveSearch, statusFilter]);

  // Filter helper: check if an individual subscription matches platform and health filters
  const isSubMatchingFilters = (sub: ClientSubscription) => {
    // 1. Platform filter
    if (platformFilter !== "Todos") {
      const filterLower = platformFilter.toLowerCase();
      const subLower = sub.serviceName.toLowerCase();
      const matchesPlat =
        filterLower === "prime video"
          ? subLower.includes("prime") || subLower.includes("amazon")
          : subLower.includes(filterLower);
      if (!matchesPlat) return false;
    }

    // 2. Health filter
    if (healthFilter !== "all") {
      const days = getDaysRemaining(sub.cutDate);
      const isExpired = sub.status === "expired" || days < 0;
      const isWarning =
        !isExpired && sub.status !== "inactive" && days >= 0 && days <= 5;
      const isHealthy = !isExpired && sub.status !== "inactive" && days > 5;

      if (healthFilter === "expired" && !isExpired) return false;
      if (healthFilter === "warning" && !isWarning) return false;
      if (healthFilter === "healthy" && !isHealthy) return false;
    }

    return true;
  };

  const hasActiveSubFilters =
    platformFilter !== "Todos" || healthFilter !== "all";

  // Health summary statistics for clients matching statusFilter and active platformFilter
  const clientsInStatus = clients.filter((c) => c.status === statusFilter);

  const healthStats = clientsInStatus.reduce(
    (acc, client) => {
      let subs = client.subscriptions;
      if (platformFilter !== "Todos") {
        const filterLower = platformFilter.toLowerCase();
        subs = subs.filter((sub) => {
          const subLower = sub.serviceName.toLowerCase();
          return filterLower === "prime video"
            ? subLower.includes("prime") || subLower.includes("amazon")
            : subLower.includes(filterLower);
        });
      }

      if (subs.length === 0) return acc;

      const hasExpired = subs.some((s) => {
        const d = getDaysRemaining(s.cutDate);
        return s.status === "expired" || d < 0;
      });
      const hasWarning = subs.some((s) => {
        const d = getDaysRemaining(s.cutDate);
        return (
          s.status !== "expired" &&
          s.status !== "inactive" &&
          d >= 0 &&
          d <= 5
        );
      });
      const hasHealthy = subs.some((s) => {
        const d = getDaysRemaining(s.cutDate);
        return s.status !== "expired" && s.status !== "inactive" && d > 5;
      });

      if (hasExpired) acc.expired++;
      if (hasWarning) acc.warning++;
      if (hasHealthy) acc.healthy++;
      return acc;
    },
    { healthy: 0, warning: 0, expired: 0 },
  );

  const totalInPlatformFilter =
    platformFilter === "Todos"
      ? clientsInStatus.length
      : clientsInStatus.filter((c) =>
          c.subscriptions.some((sub) => {
            const filterLower = platformFilter.toLowerCase();
            const subLower = sub.serviceName.toLowerCase();
            return filterLower === "prime video"
              ? subLower.includes("prime") || subLower.includes("amazon")
              : subLower.includes(filterLower);
          }),
        ).length;

  // Filter clients by status (active / inactive), health status, and platform
  const filteredClients = clients.filter((client) => {
    if (client.status !== statusFilter) return false;

    // When platform or health filters are active, client must contain at least one subscription matching those filters
    if (hasActiveSubFilters) {
      const hasMatchingSub = client.subscriptions.some(isSubMatchingFilters);
      if (!hasMatchingSub) return false;
    }

    // Search query
    if (effectiveSearch) {
      const query = effectiveSearch.toLowerCase();
      const matchesName = client.name.toLowerCase().includes(query);
      const matchesPhone =
        client.phone && client.phone.toLowerCase().includes(query);
      const matchesSub = client.subscriptions.some(
        (sub) =>
          sub.serviceName.toLowerCase().includes(query) ||
          (sub.email && sub.email.toLowerCase().includes(query)) ||
          (sub.profileName && sub.profileName.toLowerCase().includes(query)),
      );
      if (!matchesName && !matchesPhone && !matchesSub) return false;
    }

    return true;
  });

  // Inline editing handlers
  const startInlineEdit = (client: Client) => {
    setInlineEditingClientId(client.id);
    setInlineClientData(JSON.parse(JSON.stringify(client)));
  };

  const cancelInlineEdit = () => {
    setInlineEditingClientId(null);
    setInlineClientData(null);
  };

  const handleSaveInline = async () => {
    if (!inlineClientData) return;
    if (!inlineClientData.name.trim()) {
      alert("El nombre del cliente no puede estar vacío");
      return;
    }
    const success = await saveClient(inlineClientData);
    if (!success) {
      alert(
        "No se pudo guardar el cliente. Verifica tu conexión e inténtalo de nuevo.",
      );
      return;
    }
    cancelInlineEdit();
  };

  const togglePasswordVisibility = (subId: string) => {
    setShowPasswords((prev) => ({ ...prev, [subId]: !prev[subId] }));
  };

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDelete = (client: Client) => {
    setClientToDelete(client);
  };

  const confirmDeleteClient = async () => {
    if (!clientToDelete) return;
    setIsDeletingClient(true);
    try {
      if (clientToDelete.status === "active") {
        // Move active client to inactive tab
        await saveClient({
          ...clientToDelete,
          status: "inactive",
        });
      } else {
        // Permanently delete inactive client
        await deleteClient(clientToDelete.id);
      }
      setClientToDelete(null);
    } finally {
      setIsDeletingClient(false);
    }
  };

  const handleReactivateClient = async (client: Client) => {
    await saveClient({
      ...client,
      status: "active",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <ClientListHeader
        statusFilter={statusFilter}
        clientCount={filteredClients.length}
        platformFilter={platformFilter}
        onSelectPlatform={setPlatformFilter}
        platformOptions={PLATFORM_FILTER_OPTIONS}
        onAddClient={() => {
          setEditingClient(null);
          setIsClientModalOpen(true);
        }}
      />

      {/* Account Health Quick-Filter Bar */}
      <ClientHealthFilterBar
        healthFilter={healthFilter}
        onSelectFilter={setHealthFilter}
        totalInPlatformFilter={totalInPlatformFilter}
        healthStats={healthStats}
      />

      {/* Clients Grid - Adaptable Fluid Masonry Layout */}
      {filteredClients.length === 0 ? (
        <div className="text-center py-12 p-6 rounded-xl bg-white dark:bg-[#141418] border border-slate-200 dark:border-[#1F1F23] shadow-sm">
          <User className="w-12 h-12 text-[#94949E] mx-auto mb-3 opacity-50" />
          <h3 className="text-base font-bold text-slate-700 dark:text-[#E4E4E7] mb-1 font-space">
            No se encontraron clientes
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#94949E] max-w-sm mx-auto mb-3">
            {healthFilter !== "all"
              ? `No hay clientes con estado "${
                  healthFilter === "healthy"
                    ? "Al día"
                    : healthFilter === "warning"
                    ? "Por vencer"
                    : "Vencidos"
                }" con los filtros actuales.`
              : "Intenta cambiar el término de búsqueda o registra un nuevo cliente en el sistema."}
          </p>
          {(healthFilter !== "all" || platformFilter !== "Todos") && (
            <button
              onClick={() => {
                setHealthFilter("all");
                setPlatformFilter("Todos");
              }}
              className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              Mostrar todos los clientes
            </button>
          )}
        </div>
      ) : (
        <div className="columns-1 md:columns-2 xl:columns-3 gap-6 space-y-6">
          {filteredClients.map((client) => {
            const visibleSubs = client.subscriptions.filter(isSubMatchingFilters);
            const health = hasActiveSubFilters
              ? getClientAccountHealth({ ...client, subscriptions: visibleSubs })
              : getClientAccountHealth(client);
            const isInlineEditing =
              inlineEditingClientId === client.id && inlineClientData;

            if (isInlineEditing) {
              return (
                <ClientInlineEditor
                  key={client.id}
                  client={client}
                  inlineClientData={inlineClientData}
                  setInlineClientData={setInlineClientData}
                  health={health}
                  onSave={handleSaveInline}
                  onCancel={cancelInlineEdit}
                  onOpenDrawer={() => {
                    cancelInlineEdit();
                    setEditingClient(client);
                    setIsClientModalOpen(true);
                  }}
                />
              );
            }

            return (
              <ClientCard
                key={client.id}
                client={client}
                visibleSubs={visibleSubs}
                health={health}
                hasActiveSubFilters={hasActiveSubFilters}
                freeProfiles={freeProfiles}
                showPasswords={showPasswords}
                copiedField={copiedField}
                onTogglePassword={togglePasswordVisibility}
                onCopy={copyToClipboard}
                onStartInlineEdit={startInlineEdit}
                onOpenDrawer={(c) => {
                  setEditingClient(c);
                  setIsClientModalOpen(true);
                }}
                onDelete={handleDelete}
                onReactivate={handleReactivateClient}
                onNotifyWhatsApp={(sub) =>
                  setWhatsAppSub({
                    clientName: client.name,
                    sub,
                    phone: client.phone,
                  })
                }
              />
            );
          })}
        </div>
      )}

      {/* Add / Edit Client Modal */}
      {isClientModalOpen && (
        <ClientModal
          isOpen={isClientModalOpen}
          onClose={() => setIsClientModalOpen(false)}
          initialClient={editingClient}
        />
      )}

      {/* WhatsApp Modal */}
      {whatsAppSub && (
        <WhatsAppModal
          isOpen={!!whatsAppSub}
          onClose={() => setWhatsAppSub(null)}
          clientName={whatsAppSub.clientName}
          serviceName={whatsAppSub.sub.serviceName}
          cutDate={whatsAppSub.sub.cutDate}
          email={whatsAppSub.sub.email}
          password={whatsAppSub.sub.password}
          profileName={whatsAppSub.sub.profileName}
          pin={whatsAppSub.sub.pin}
          phone={whatsAppSub.phone}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteClientModal
        client={clientToDelete}
        isOpen={!!clientToDelete}
        onClose={() => !isDeletingClient && setClientToDelete(null)}
        onConfirmDelete={confirmDeleteClient}
        isDeleting={isDeletingClient}
        freeProfiles={freeProfiles}
      />
    </div>
  );
};
