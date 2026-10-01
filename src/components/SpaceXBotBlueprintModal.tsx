import React, { useState } from 'react';
import {
  X,
  Radio,
  Eye,
  Cpu,
  Compass,
  Wrench,
  Sun,
  BatteryCharging,
  Wind,
  ShieldCheck,
  CheckCircle,
  Activity,
  Layers,
} from 'lucide-react';

interface SpaceXBotBlueprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFocusPart?: (partName: string) => void;
}

export const SpaceXBotBlueprintModal: React.FC<SpaceXBotBlueprintModalProps> = ({
  isOpen,
  onClose,
  onFocusPart,
}) => {
  const [viewTab, setViewTab] = useState<'front' | 'back' | 'specs'>('front');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-950 border border-cyan-500/50 rounded-2xl max-w-4xl w-full p-6 shadow-2xl shadow-cyan-950/60 flex flex-col gap-5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-950/50 text-white font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-tech text-base tracking-wider uppercase text-white font-bold">
                  SPACE-X BOT Specification Blueprint
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-500/60 text-cyan-300 font-bold uppercase tracking-wider">
                  OFFICIAL BLUEPRINT
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400">
                AI-Powered Autonomous Robotic Maintenance System · Detect → Inspect → Diagnose → Plan → Repair → Verify → Report
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center justify-between bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <div className="flex items-center gap-1 font-mono text-xs">
            <button
              onClick={() => setViewTab('front')}
              className={`px-4 py-1.5 rounded-lg transition-all ${
                viewTab === 'front'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Front View Architecture (SpaceXB1)
            </button>
            <button
              onClick={() => setViewTab('back')}
              className={`px-4 py-1.5 rounded-lg transition-all ${
                viewTab === 'back'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Rear View & Power Systems (SpaceXB2)
            </button>
            <button
              onClick={() => setViewTab('specs')}
              className={`px-4 py-1.5 rounded-lg transition-all ${
                viewTab === 'specs'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Full Subsystem Specifications
            </button>
          </div>
          <span className="text-[11px] font-mono text-cyan-400 px-3 hidden sm:inline">
            Self-Powered · Self-Sustained · Self-Repairing
          </span>
        </div>

        {/* TAB 1: FRONT VIEW (SpaceXB1) */}
        {viewTab === 'front' && (
          <div className="flex flex-col gap-4 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Communication Antenna */}
              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col gap-1.5 hover:border-cyan-500/50 transition-colors">
                <div className="flex items-center justify-between text-cyan-300 font-mono text-xs font-bold">
                  <span className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-cyan-400" />
                    Communication Antenna
                  </span>
                  <span className="text-[10px] text-slate-500">TOP MAST</span>
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  High-gain parabolic dish with needle feed spike. Ensures real-time data transfer with satellite and ground station with zero telemetry drift.
                </p>
              </div>

              {/* Vision System */}
              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col gap-1.5 hover:border-cyan-500/50 transition-colors">
                <div className="flex items-center justify-between text-cyan-300 font-mono text-xs font-bold">
                  <span className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-cyan-400" />
                    Vision System
                  </span>
                  <span className="text-[10px] text-slate-500">HEAD TURRET</span>
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  Triple high-resolution cameras (stereo + center telephoto) flanked by horizontal blue LED indicator light bars for multi-spectrum optical inspection.
                </p>
              </div>

              {/* Sensor Module */}
              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col gap-1.5 hover:border-cyan-500/50 transition-colors">
                <div className="flex items-center justify-between text-cyan-300 font-mono text-xs font-bold">
                  <span className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    Sensor Module
                  </span>
                  <span className="text-[10px] text-slate-500">TOP RIGHT</span>
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  Cylindrical environmental canister monitors temperature, vacuum pressure, structural vibration, and cosmic radiation levels.
                </p>
              </div>

              {/* AI Processing Unit */}
              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col gap-1.5 hover:border-cyan-500/50 transition-colors">
                <div className="flex items-center justify-between text-cyan-300 font-mono text-xs font-bold">
                  <span className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    AI Processing Unit
                  </span>
                  <span className="text-[10px] text-slate-500">CORE AVIONICS</span>
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  Internal dual neural compute engines analyze sensor telemetry, identify anomalies, formulate repair plans, and command 7-DOF kinematics.
                </p>
              </div>

              {/* Dual 7-DOF Robotic Arms */}
              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col gap-1.5 hover:border-cyan-500/50 transition-colors">
                <div className="flex items-center justify-between text-cyan-300 font-mono text-xs font-bold">
                  <span className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-cyan-400" />
                    Robotic Arms (Left & Right)
                  </span>
                  <span className="text-[10px] text-slate-500">7-DOF ARTICULATED</span>
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  Heavy-duty white composite armor sleeves over rotational joints. Integrated with force/torque sensors for sub-millimeter precision manipulation.
                </p>
              </div>

              {/* Multi-Tool End Effector */}
              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col gap-1.5 hover:border-cyan-500/50 transition-colors">
                <div className="flex items-center justify-between text-cyan-300 font-mono text-xs font-bold">
                  <span className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-cyan-400" />
                    Multi-Tool End Effector
                  </span>
                  <span className="text-[10px] text-slate-500">DEXTEROUS HANDS</span>
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  Interchangeable tools for tightening, cutting, mechanical latching, and rotary bolt intervention with glowing blue force feedback pads.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BACK VIEW & POWER (SpaceXB2) */}
        {viewTab === 'back' && (
          <div className="flex flex-col gap-4 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Solar Panels */}
              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col gap-1.5 hover:border-cyan-500/50 transition-colors">
                <div className="flex items-center justify-between text-cyan-300 font-mono text-xs font-bold">
                  <span className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-cyan-400" />
                    Foldable Solar Panels
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">120W TOTAL</span>
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  High-efficiency monocrystalline silicon panels mounted on rear shoulders. Up to 32% cell efficiency with dual-axis articulation for optimal solar alignment.
                </p>
              </div>

              {/* Battery Module */}
              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col gap-1.5 hover:border-cyan-500/50 transition-colors">
                <div className="flex items-center justify-between text-cyan-300 font-mono text-xs font-bold">
                  <span className="flex items-center gap-2">
                    <BatteryCharging className="w-4 h-4 text-cyan-400" />
                    Battery Module (2.5 kWh)
                  </span>
                  <span className="text-[10px] text-cyan-400 font-bold">LiFePO4 CELLS</span>
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  Modular Lithium-Iron-Phosphate pack with central illuminated blue lightning door. Delivers up to 12 hours of continuous operation without sunlight.
                </p>
              </div>

              {/* Thermal Management & Cooling Vents */}
              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col gap-1.5 hover:border-cyan-500/50 transition-colors">
                <div className="flex items-center justify-between text-cyan-300 font-mono text-xs font-bold">
                  <span className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-cyan-400" />
                    Thermal Cooling Vents
                  </span>
                  <span className="text-[10px] text-slate-500">HEAT EXCHANGER</span>
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  Radiates heat away from high-performance AI processors, arm motor controllers, and the battery pack during peak robotic intervention loads.
                </p>
              </div>

              {/* Thrusters & Mobility System */}
              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col gap-1.5 hover:border-cyan-500/50 transition-colors">
                <div className="flex items-center justify-between text-cyan-300 font-mono text-xs font-bold">
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    Thruster Propulsion Pod
                  </span>
                  <span className="text-[10px] text-cyan-400 font-bold">COLD-GAS / ION</span>
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  Lower conical propulsion cluster with 5 electric-blue nozzle bells. Enables 6-DOF stable stationkeeping, orbit phasing, and precision docking.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SUBSYSTEM SPECS */}
        {viewTab === 'specs' && (
          <div className="flex flex-col gap-4 animate-fade-in font-mono text-xs">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">HULL COLOR</span>
                <span className="text-white font-bold text-sm">Ceramic White</span>
                <span className="text-[10px] text-cyan-400 block mt-1">High-Albedo Plating</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">MANIPULATORS</span>
                <span className="text-white font-bold text-sm">Dual 7-DOF</span>
                <span className="text-[10px] text-emerald-400 block mt-1">Sub-mm Precision</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">SOLAR POWER</span>
                <span className="text-white font-bold text-sm">120 Watts</span>
                <span className="text-[10px] text-cyan-400 block mt-1">Foldable Silicon Wings</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">ENERGY STORAGE</span>
                <span className="text-white font-bold text-sm">2.5 kWh</span>
                <span className="text-[10px] text-cyan-400 block mt-1">Modular LiFePO4</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-cyan-300 block uppercase">
                Autonomous Mission Workflow:
              </span>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-200">
                <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700">1. Detect</span>
                <span className="text-slate-600">→</span>
                <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700">2. Inspect</span>
                <span className="text-slate-600">→</span>
                <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700">3. Diagnose</span>
                <span className="text-slate-600">→</span>
                <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700">4. Plan</span>
                <span className="text-slate-600">→</span>
                <span className="px-2 py-1 rounded bg-cyan-950 border border-cyan-500 text-cyan-300 font-bold">5. Repair</span>
                <span className="text-slate-600">→</span>
                <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700">6. Verify</span>
                <span className="text-slate-600">→</span>
                <span className="px-2 py-1 rounded bg-emerald-950 border border-emerald-500 text-emerald-300 font-bold">7. Report</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <CheckCircle className="w-4 h-4 text-cyan-400" />
            <span>3D Model is rendered in brilliant high-albedo aerospace white</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 font-tech text-xs font-bold uppercase tracking-wider text-white transition-all shadow-md shadow-cyan-950/40"
          >
            Close Blueprint
          </button>
        </div>
      </div>
    </div>
  );
};
