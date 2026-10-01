import React from 'react';
import { TelemetryData } from '../types';
import { Zap, Thermometer, Radio, Cpu, Activity, EyeOff, X } from 'lucide-react';

interface TelemetryPanelProps {
  telemetry: TelemetryData;
  onClose?: () => void;
}

export const TelemetryPanel: React.FC<TelemetryPanelProps> = ({ telemetry, onClose }) => {
  const isFault = telemetry.connector === 'FAULT';
  const isRepairing = telemetry.connector === 'REPAIRING';

  return (
    <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-4 backdrop-blur-md shadow-2xl flex flex-col gap-4 animate-fade-in transition-all">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h3 className="font-tech text-sm tracking-wider uppercase text-slate-200 font-semibold">
            Live Telemetry Stream
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[11px] font-mono mr-1">
            <span
              className={`w-2 h-2 rounded-full ${
                isFault
                  ? 'bg-rose-500 animate-ping'
                  : isRepairing
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-emerald-400'
              }`}
            />
            <span className={isFault ? 'text-rose-400' : isRepairing ? 'text-amber-300' : 'text-emerald-400'}>
              {isFault ? 'ANOMALY' : isRepairing ? 'SERVICING' : 'NOMINAL'}
            </span>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              title="Close telemetry bar for Space X Bot clarity vision"
              className="flex items-center gap-1 px-2 py-1 rounded bg-slate-900 hover:bg-cyan-950/60 border border-slate-700/80 hover:border-cyan-500/50 text-slate-400 hover:text-cyan-300 text-[10px] font-mono transition-all"
            >
              <EyeOff className="w-3 h-3" />
              <span>Clarity</span>
              <X className="w-3 h-3 ml-0.5" />
            </button>
          )}
        </div>
      </div>

      {/* Primary Telemetry Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* POWER */}
        <div
          className={`p-3 rounded-lg border transition-all duration-500 ${
            isFault
              ? 'bg-rose-950/20 border-rose-500/40'
              : 'bg-slate-900/60 border-slate-800/80'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Zap className={`w-3.5 h-3.5 ${isFault ? 'text-rose-400' : 'text-cyan-400'}`} />
              POWER
            </span>
            <span className="text-[10px] font-mono text-slate-500">28V DC BUS</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span
              className={`font-mono text-2xl font-bold tracking-tight transition-colors duration-500 tabular-nums ${
                isFault ? 'text-rose-400 glow-red' : 'text-cyan-300 glow-cyan'
              }`}
            >
              {Math.round(telemetry.power)}%
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {telemetry.voltage.toFixed(1)}V / {telemetry.current.toFixed(1)}A
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isFault ? 'bg-rose-500' : 'bg-cyan-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, telemetry.power))}%` }}
            />
          </div>
        </div>

        {/* TEMPERATURE */}
        <div
          className={`p-3 rounded-lg border transition-all duration-500 ${
            telemetry.temperature > 35
              ? 'bg-rose-950/20 border-rose-500/40'
              : 'bg-slate-900/60 border-slate-800/80'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Thermometer
                className={`w-3.5 h-3.5 ${telemetry.temperature > 35 ? 'text-rose-400' : 'text-emerald-400'}`}
              />
              TEMPERATURE
            </span>
            <span className="text-[10px] font-mono text-slate-500">BUS THERMAL</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span
              className={`font-mono text-2xl font-bold tracking-tight transition-colors duration-500 tabular-nums ${
                telemetry.temperature > 35 ? 'text-rose-400 glow-red' : 'text-emerald-300'
              }`}
            >
              {Math.round(telemetry.temperature)}°C
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {telemetry.temperature > 35 ? 'HIGH RESIST' : 'NORMAL RANGE'}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                telemetry.temperature > 35 ? 'bg-rose-500' : 'bg-emerald-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(10, (telemetry.temperature / 60) * 100))}%` }}
            />
          </div>
        </div>

        {/* SIGNAL */}
        <div
          className={`p-3 rounded-lg border transition-all duration-500 ${
            telemetry.signal < 80
              ? 'bg-amber-950/20 border-amber-500/40'
              : 'bg-slate-900/60 border-slate-800/80'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Radio className={`w-3.5 h-3.5 ${telemetry.signal < 80 ? 'text-amber-400' : 'text-cyan-400'}`} />
              SIGNAL
            </span>
            <span className="text-[10px] font-mono text-slate-500">TELEMETRY LINK</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span
              className={`font-mono text-2xl font-bold tracking-tight transition-colors duration-500 tabular-nums ${
                telemetry.signal < 80 ? 'text-amber-400' : 'text-cyan-300'
              }`}
            >
              {Math.round(telemetry.signal)}%
            </span>
            <span className="text-[11px] font-mono text-slate-400">X-BAND RF</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                telemetry.signal < 80 ? 'bg-amber-400' : 'bg-cyan-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, telemetry.signal))}%` }}
            />
          </div>
        </div>

        {/* CONNECTOR STATUS */}
        <div
          className={`p-3 rounded-lg border transition-all duration-500 ${
            isFault
              ? 'bg-rose-950/30 border-rose-500/60'
              : isRepairing
              ? 'bg-amber-950/30 border-amber-500/60'
              : 'bg-emerald-950/20 border-emerald-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Cpu
                className={`w-3.5 h-3.5 ${
                  isFault ? 'text-rose-400' : isRepairing ? 'text-amber-400' : 'text-emerald-400'
                }`}
              />
              CONNECTOR
            </span>
            <span className="text-[10px] font-mono text-slate-500">PIN INTERFACE</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span
              className={`font-mono text-xl font-bold tracking-wider transition-colors duration-500 ${
                isFault
                  ? 'text-rose-400 glow-red'
                  : isRepairing
                  ? 'text-amber-300'
                  : 'text-emerald-400 glow-green'
              }`}
            >
              {telemetry.connector}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {isFault ? 'LOOSE FLANGE' : isRepairing ? 'SECURING...' : 'LATCHED'}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isFault ? 'bg-rose-500' : isRepairing ? 'bg-amber-400' : 'bg-emerald-500'
              }`}
              style={{ width: isFault ? '35%' : isRepairing ? '70%' : '100%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
