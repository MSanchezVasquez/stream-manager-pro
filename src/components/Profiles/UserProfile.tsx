import React, { useRef } from "react";
import { useAuthStore } from "../../store/authStore";
import { useDataStore } from "../../store/dataStore";
import {
  ShieldCheck,
  Calendar,
  Mail,
  Tv,
  Users,
  Truck,
  Sparkles,
  Download,
  Upload,
  Zap,
} from "lucide-react";

export const UserProfile: React.FC = () => {
  const { user } = useAuthStore();
  const { clients, suppliers, freeProfiles, exportDataJSON, importDataJSON } =
    useDataStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estadísticas
  const activeClients = clients.filter((c) => c.status === "active").length;
  const inactiveClients = clients.filter((c) => c.status === "inactive").length;
  const totalSuppliers = suppliers.length;
  const totalFreeProfiles = freeProfiles.reduce(
    (sum, p) => sum + p.quantity,
    0,
  );

  // Formatear fecha de creación de la cuenta
  const creationDate = user?.metadata.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Fecha desconocida";

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      await importDataJSON(content);
      alert("¡Datos importados con éxito!");
    };
    reader.readAsText(file);
  };

  if (!user) return null;

  return (
    <div className="w-full animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
        Mi Perfil
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* COLUMNA IZQUIERDA: Información del Usuario */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-[#16161C] border border-slate-200 dark:border-[#2D2D33] rounded-3xl p-6 flex flex-col items-center text-center shadow-sm">
            <p className="text-xs font-medium text-slate-500 dark:text-[#94949E] mb-4">
              Se unió el {creationDate}
            </p>

            <div className="w-24 h-24 rounded-full bg-indigo-500/10 border-4 border-[#374df5]/30 flex items-center justify-center overflow-hidden mb-4 shadow-lg">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-3xl font-black text-[#374df5]">
                  {user.displayName
                    ? user.displayName.charAt(0).toUpperCase()
                    : user.email?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
              {user.displayName || "Usuario Streaming"}
            </h3>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-[#94949E] bg-slate-100 dark:bg-[#1A1A22] px-3 py-1.5 rounded-full mt-2">
              <Mail className="w-3.5 h-3.5" />
              <span className="truncate max-w-[160px]">{user.email}</span>
            </div>

            <button className="w-full mt-6 py-2.5 rounded-xl border border-slate-200 dark:border-[#2D2D33] hover:bg-slate-50 dark:hover:bg-[#1A1A22] text-sm font-semibold text-slate-700 dark:text-white transition-colors">
              Editar Perfil
            </button>
          </div>
        </div>

        {/* COLUMNA CENTRAL: Resumen y Estadísticas */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white dark:bg-[#16161C] border border-slate-200 dark:border-[#2D2D33] rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-5 text-center">
              Resumen de Operaciones
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Tarjeta Clientes Activos */}
              <div className="bg-slate-50 dark:bg-[#1A1A22] p-4 rounded-2xl flex flex-col items-center justify-center border border-slate-100 dark:border-[#25252D]">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {activeClients}
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-[#94949E]">
                  Clientes Activos
                </span>
              </div>

              {/* Tarjeta Perfiles Libres */}
              <div className="bg-slate-50 dark:bg-[#1A1A22] p-4 rounded-2xl flex flex-col items-center justify-center border border-slate-100 dark:border-[#25252D]">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {totalFreeProfiles}
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-[#94949E]">
                  Perfiles Libres
                </span>
              </div>

              {/* Tarjeta Proveedores */}
              <div className="bg-slate-50 dark:bg-[#1A1A22] p-4 rounded-2xl flex flex-col items-center justify-center border border-slate-100 dark:border-[#25252D]">
                <div className="w-10 h-10 rounded-full bg-[#374df5]/10 text-[#374df5] flex items-center justify-center mb-2">
                  <Truck className="w-5 h-5" />
                </div>
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {totalSuppliers}
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-[#94949E]">
                  Proveedores
                </span>
              </div>

              {/* Tarjeta Clientes Inactivos */}
              <div className="bg-slate-50 dark:bg-[#1A1A22] p-4 rounded-2xl flex flex-col items-center justify-center border border-slate-100 dark:border-[#25252D]">
                <div className="w-10 h-10 rounded-full bg-slate-500/10 text-slate-500 flex items-center justify-center mb-2">
                  <Tv className="w-5 h-5" />
                </div>
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {inactiveClients}
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-[#94949E]">
                  Cuentas Inactivas
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: Herramientas Adicionales */}
        <div className="lg:col-span-3 space-y-6">
          {/* Tarjeta de Estado del Sistema */}
          <div className="bg-white dark:bg-[#16161C] border border-slate-200 dark:border-[#2D2D33] rounded-3xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Plan Actual
              </h4>
              <Zap className="w-4 h-4 text-amber-500" />
            </div>
            <div className="p-3 bg-gradient-to-br from-[#374df5] to-indigo-700 rounded-xl text-white">
              <p className="text-xs font-medium opacity-90 mb-1">Licencia</p>
              <p className="text-lg font-black tracking-tight">Pro Lifetime</p>
              <div className="mt-3 flex items-center gap-1.5 text-[10px] bg-white/20 w-max px-2 py-1 rounded-md">
                <ShieldCheck className="w-3 h-3" /> Base de datos segura
              </div>
            </div>
          </div>

          {/* Tarjeta de Backup y Restauración */}
          <div className="bg-white dark:bg-[#16161C] border border-slate-200 dark:border-[#2D2D33] rounded-3xl p-5 shadow-sm">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
              Respaldos (Backup)
            </h4>
            <p className="text-xs text-slate-500 dark:text-[#94949E] mb-4 leading-relaxed">
              Exporta o importa toda tu base de datos de clientes en formato
              JSON.
            </p>

            <div className="space-y-2">
              <button
                onClick={exportDataJSON}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1A1A22] dark:hover:bg-[#25252D] text-xs font-bold text-[#374df5] transition-colors"
              >
                <Download className="w-4 h-4" /> Exportar Datos
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1A1A22] dark:hover:bg-[#25252D] text-xs font-bold text-slate-700 dark:text-[#E4E4E7] transition-colors"
              >
                <Upload className="w-4 h-4" /> Importar Datos
              </button>
              <input
                type="file"
                accept=".json"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
