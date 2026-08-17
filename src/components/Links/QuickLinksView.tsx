import React, { useState } from "react";
import { useDataStore } from "../../store/dataStore";
import { CircularSpinner } from "../common/LoadingSpinners";
import { ExternalLink, Globe, Plus, Trash2, Copy, Check } from "lucide-react";
import { QuickLink } from "../../types";

export const QuickLinksView: React.FC = () => {
  const { quickLinks, saveQuickLink, deleteQuickLink } = useDataStore();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  // Delete modal state
  const [linkToDelete, setLinkToDelete] = useState<QuickLink | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const copyLink = (linkUrl: string, id: string) => {
    navigator.clipboard.writeText(linkUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const confirmDeleteLink = async () => {
    if (!linkToDelete) return;
    setIsDeleting(true);
    try {
      await deleteQuickLink(linkToDelete.id);
      setLinkToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url) return;

    let fullUrl = url.trim();
    if (!fullUrl.startsWith("http://") && !fullUrl.startsWith("https://")) {
      fullUrl = `https://${fullUrl}`;
    }

    const newLink: QuickLink = {
      id: `ql-${Date.now()}`,
      title: title.trim(),
      url: fullUrl,
    };

    await saveQuickLink(newLink);
    setIsAddModalOpen(false);
    setTitle("");
    setUrl("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#141418] border border-slate-200 dark:border-[#1F1F23] shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-[#E4E4E7]">
              Enlaces Rápidos & Validación de Códigos
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#94949E]">
              Páginas de consulta externa y activación de cuentas
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-sky-600/20 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Enlace</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map((link) => (
          <div
            key={link.id}
            className="p-5 rounded-xl bg-white dark:bg-[#141418] border border-slate-200 dark:border-[#1F1F23] shadow-sm hover:border-[#2D2D33] transition-all flex flex-col justify-between gap-4 relative group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="p-2 rounded-xl bg-sky-500/10 text-sky-500">
                  <Globe className="w-4 h-4" />
                </span>
                <button
                  onClick={() => setLinkToDelete(link)}
                  className="p-1 rounded text-slate-400 hover:text-red-500 opacity-80 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Eliminar Enlace"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <h3 className="font-bold text-sm text-slate-900 dark:text-[#E4E4E7] mb-1">
                {link.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#94949E] font-mono truncate">
                {link.url}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-[#1F1F23]">
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-1.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir Sitio</span>
              </a>

              <button
                onClick={() => copyLink(link.url, link.id)}
                className="p-2 rounded-xl border border-slate-200 dark:border-[#2D2D33] text-slate-600 dark:text-[#94949E] hover:bg-slate-100 dark:hover:bg-[#1A1A1E] transition-colors cursor-pointer"
                title="Copiar URL"
              >
                {copiedId === link.id ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-[#141418] border border-slate-200 dark:border-[#1F1F23] shadow-2xl p-6 relative">
            <h3 className="font-bold text-lg text-slate-900 dark:text-[#E4E4E7] mb-4">
              Añadir Enlace Rápido
            </h3>

            <form onSubmit={handleAddLink} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-[#94949E] mb-1">
                  Título del Enlace
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: SonPlayMak Codigos"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#2D2D33] bg-slate-50 dark:bg-[#1A1A1E] text-slate-900 dark:text-[#E4E4E7] text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-[#94949E] mb-1">
                  Dirección URL
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#2D2D33] bg-slate-50 dark:bg-[#1A1A1E] text-slate-900 dark:text-[#E4E4E7] text-xs font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-[#1F1F23]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-[#2D2D33] text-slate-600 dark:text-[#94949E] text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-lg shadow-sky-600/20"
                >
                  Guardar Enlace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Link Modal */}
      {linkToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#141418] border border-slate-200 dark:border-[#25252D] shadow-2xl p-6 relative">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-4 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-center text-slate-900 dark:text-[#E4E4E7] mb-2">
              ¿Eliminar Enlace Rápido?
            </h3>
            <p className="text-xs text-center text-slate-500 dark:text-[#94949E] mb-6">
              ¿Deseas eliminar el enlace{" "}
              <strong className="text-slate-800 dark:text-white font-semibold">
                {linkToDelete.title}
              </strong>
              ?
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setLinkToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-[#2D2D35] text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-[#1F1F26] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDeleteLink}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs shadow-md shadow-red-600/20 transition-all flex items-center justify-center gap-2"
              >
                {isDeleting && (
                  <CircularSpinner size={16} className="text-white" />
                )}
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
