import React, { useState } from 'react';
import {
  StreamingHub3DScene,
  LightingPreset,
  CameraViewPreset,
  StreamingNodeData,
} from './StreamingHub3DScene';
import {
  Box,
  Layers,
  Sun,
  Flame,
  Radio,
  RotateCw,
  Eye,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ExternalLink,
  Sliders,
  Compass,
} from 'lucide-react';

interface StreamingHub3DViewProps {
  onNavigateTab: (tab: string) => void;
}

export const StreamingHub3DView: React.FC<StreamingHub3DViewProps> = ({
  onNavigateTab,
}) => {
  const [lightingPreset, setLightingPreset] = useState<LightingPreset>('cyber');
  const [explodedAmount, setExplodedAmount] = useState<number>(0);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [cameraView, setCameraView] = useState<CameraViewPreset>('perspective');
  const [selectedNode, setSelectedNode] = useState<StreamingNodeData | null>(null);
  const [isControlsCollapsed, setIsControlsCollapsed] = useState<boolean>(false);

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* 3D Viewport Container */}
      <div className="relative w-full h-[620px] sm:h-[680px] lg:h-[720px] rounded-2xl overflow-hidden border border-slate-800/80 bg-[#07090E] shadow-2xl select-none">
        {/* Three.js Canvas Scene */}
        <StreamingHub3DScene
          lightingPreset={lightingPreset}
          explodedAmount={explodedAmount}
          autoRotate={autoRotate}
          cameraView={cameraView}
          onSelectNode={setSelectedNode}
          selectedNodeId={selectedNode ? selectedNode.id : null}
        />

        {/* Top-Left Floating HUD: Brand Title & Back Button */}
        <div className="absolute top-4 left-4 z-20 flex flex-col sm:flex-row items-start sm:items-center gap-2.5 pointer-events-none">
          <button
            type="button"
            onClick={() => onNavigateTab('dashboard')}
            className="pointer-events-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700/80 shadow-lg transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-indigo-400" />
            <span>Volver al Resumen</span>
          </button>

          <div className="pointer-events-auto px-3.5 py-1.5 rounded-xl bg-slate-900/85 border border-indigo-500/30 shadow-lg flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-xs shadow-emerald-400/50" />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-xs font-bold text-white tracking-wide font-cascadia">
                  STREAMCORE 3D
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  WEBGL
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Top-Right Floating HUD: Interaction Guide */}
        <div className="absolute top-4 right-4 z-20 hidden md:flex items-center gap-2 pointer-events-none">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2 shadow-lg">
            <Compass className="w-3.5 h-3.5 text-indigo-400 animate-spin" style={{ animationDuration: '10s' }} />
            <span>Arrastrar: Rotar · Rueda: Zoom · Clic: Inspeccionar</span>
          </div>
        </div>

        {/* Floating Selected Node Detail Card (Holographic Card) */}
        {selectedNode && (
          <div className="absolute top-20 right-4 z-20 w-72 max-w-[calc(100vw-32px)] p-4 rounded-xl bg-slate-900/95 border border-slate-700 shadow-2xl text-white animate-fade-in">
            <div className="flex items-start justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full shadow-sm"
                  style={{ backgroundColor: selectedNode.color }}
                />
                <h4 className="font-bold text-sm text-white tracking-wide">
                  {selectedNode.name}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-300 mb-3">
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span className="text-slate-400">Categoría</span>
                <span className="font-medium text-slate-200">{selectedNode.category}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span className="text-slate-400">Estado Nodo</span>
                <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {selectedNode.status}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">Cuentas Activas</span>
                <span className="font-bold text-indigo-400 font-cascadia text-sm">
                  {selectedNode.activeAccounts} cuentas
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onNavigateTab('clients_active')}
                className="flex-1 py-1.5 px-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Ver Clientes</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedNode(null)}
                className="py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

        {/* Collapsible Bottom Control Dock (< 15% viewport footprint) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[95%] max-w-4xl flex flex-col items-center">
          {/* Dock Toggle Pill */}
          <button
            type="button"
            onClick={() => setIsControlsCollapsed(!isControlsCollapsed)}
            className="mb-2 px-3.5 py-1 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] font-semibold border border-slate-700/80 shadow-lg flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-xs"
          >
            {isControlsCollapsed ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-indigo-400" />
                <span>Mostrar Controles 3D</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                <span>Minimizar Controles</span>
              </>
            )}
          </button>

          {/* Main Control Panel */}
          {!isControlsCollapsed && (
            <div className="w-full p-3 sm:p-3.5 rounded-2xl bg-slate-900/92 border border-slate-700/90 shadow-2xl flex flex-wrap items-center justify-between gap-3 text-white">
              {/* Lighting Presets */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline mr-1">
                  Iluminación:
                </span>
                <button
                  type="button"
                  onClick={() => setLightingPreset('cyber')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    lightingPreset === 'cyber'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-xs'
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                  title="Estilo Cyberpunk Neón"
                >
                  <Radio className="w-3 h-3 text-cyan-400" />
                  <span>Cyber</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLightingPreset('studio')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    lightingPreset === 'studio'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50 shadow-xs'
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                  title="Estudio PBR Neutro"
                >
                  <Sun className="w-3 h-3 text-indigo-400" />
                  <span>Estudio</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLightingPreset('warm')}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    lightingPreset === 'warm'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-xs'
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                  title="Cine Cálido"
                >
                  <Flame className="w-3 h-3 text-amber-400" />
                  <span>Cálido</span>
                </button>
              </div>

              {/* Exploded View Slider */}
              <div className="flex items-center gap-2 min-w-[170px] sm:min-w-[200px] flex-1 max-w-xs">
                <Layers className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <div className="flex flex-col flex-1">
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold mb-0.5">
                    <span>Despiece 3D</span>
                    <span className="font-cascadia text-indigo-300">
                      {Math.round(explodedAmount * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={explodedAmount}
                    onChange={(e) => setExplodedAmount(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Camera Views & Auto-Rotate */}
              <div className="flex items-center gap-1.5">
                <div className="hidden lg:flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-xl border border-slate-700/60">
                  <button
                    type="button"
                    onClick={() => setCameraView('perspective')}
                    className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                      cameraView === 'perspective'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    3D
                  </button>
                  <button
                    type="button"
                    onClick={() => setCameraView('front')}
                    className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                      cameraView === 'front'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Frente
                  </button>
                  <button
                    type="button"
                    onClick={() => setCameraView('top')}
                    className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                      cameraView === 'top'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Cenital
                  </button>
                  <button
                    type="button"
                    onClick={() => setCameraView('isometric')}
                    className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                      cameraView === 'isometric'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Isométrica
                  </button>
                </div>

                {/* Auto-Rotate Button */}
                <button
                  type="button"
                  onClick={() => setAutoRotate(!autoRotate)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    autoRotate
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-xs'
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                  }`}
                  title={autoRotate ? 'Pausar auto-rotación' : 'Activar auto-rotación'}
                >
                  <RotateCw className={`w-3 h-3 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
                  <span className="hidden sm:inline">{autoRotate ? 'Rotando' : 'Pausado'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Feature cards below the 3D scene */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-xl bg-white dark:bg-[#141418] border border-slate-200 dark:border-[#1F1F23] flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0 border border-indigo-500/20">
            <Box className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">
              Geometría PBR Compuesta
            </h4>
            <p className="text-xs text-slate-500 dark:text-[#94949E] leading-relaxed">
              Modelo procedural multicapa con pedestal biselado, collar cuántico, prisma de cuarzo reflectivo y satélites de streaming.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#141418] border border-slate-200 dark:border-[#1F1F23] flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center shrink-0 border border-cyan-500/20">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">
              Modo Despiece Explotado
            </h4>
            <p className="text-xs text-slate-500 dark:text-[#94949E] leading-relaxed">
              Desplaza el control deslizante para separar los componentes del reactor central y ver los anillos de calibración internos.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#141418] border border-slate-200 dark:border-[#1F1F23] flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">
              Interacción Raycasting
            </h4>
            <p className="text-xs text-slate-500 dark:text-[#94949E] leading-relaxed">
              Haz clic o posa el cursor sobre los satélites de Netflix, Disney+, Prime, HBO Max y Spotify para inspeccionar su telemetría.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamingHub3DView;
