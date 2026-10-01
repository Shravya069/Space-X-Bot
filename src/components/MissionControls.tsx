import React, { useRef } from 'react';
import { BotAttire, MissionStatus } from '../types';
import {
  Play,
  Pause,
  AlertTriangle,
  RotateCcw,
  FileText,
  Rocket,
  Upload,
  X,
  Camera,
  Award,
  Sparkles,
  Sun,
  Lightbulb,
} from 'lucide-react';

interface MissionControlsProps {
  status: MissionStatus;
  onStartMission: () => void;
  onInjectFault: () => void;
  onTogglePause: () => void;
  onReset: () => void;
  onFullDemo: () => void;
  onGenerateReport: () => void;
  robotImage: string | null;
  onUploadRobotImage: (file: File) => void;
  onRemoveRobotImage: () => void;
  botAttire: BotAttire;
  onOpenAttireModal: () => void;
  isBotSpotlightOn?: boolean;
  onToggleBotSpotlight?: () => void;
  onSelectAttire?: (attire: BotAttire) => void;
}

export const MissionControls: React.FC<MissionControlsProps> = ({
  status,
  onStartMission,
  onInjectFault,
  onTogglePause,
  onReset,
  onFullDemo,
  onGenerateReport,
  robotImage,
  onUploadRobotImage,
  onRemoveRobotImage,
  botAttire,
  onOpenAttireModal,
  isBotSpotlightOn = true,
  onToggleBotSpotlight,
  onSelectAttire,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      onUploadRobotImage(file);
    }
  };

  const getAttireName = (attire: BotAttire) => {
    switch (attire) {
      case 'classic-tuxedo':
        return 'Classic Black-Tie Tuxedo';
      case 'classic-apollo':
        return 'Classic Apollo Heritage';
      case 'classic-dragon':
        return 'Classic SpaceX Dragon';
      case 'classic-steampunk':
        return 'Classic Victorian Brass & Gold';
      case 'spacex-official':
      default:
        return 'SpaceX Official Baseline';
    }
  };

  const isFaultInjected = status.fault !== 'NONE';
  const isMissionActive = status.currentState !== 'IDLE' && status.currentState !== 'SUCCESS';

  return (
    <div className="flex flex-col gap-3.5 bg-slate-950/85 border border-slate-800/90 rounded-xl p-4 backdrop-blur-md shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <h2 className="font-tech text-sm font-semibold tracking-wider uppercase text-slate-100">
            Mission Command
          </h2>
        </div>
        <span className="text-[10px] font-mono text-cyan-400/80 px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-800/50">
          AUTONOMY LEVEL 4
        </span>
      </div>

      {/* Primary Action Buttons */}
      <div className="grid grid-cols-1 gap-2">
        {/* START AUTONOMOUS MISSION */}
        <button
          onClick={onStartMission}
          disabled={status.currentState === 'SUCCESS' || (isMissionActive && !status.isPaused)}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-tech text-xs font-semibold tracking-wide uppercase transition-all duration-200 shadow-md ${
            isMissionActive && !status.isPaused
              ? 'bg-cyan-950/60 text-cyan-500 border border-cyan-800/40 cursor-not-allowed opacity-70'
              : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-900/30 hover:shadow-cyan-500/20 active:scale-[0.98]'
          }`}
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Start Autonomous Mission</span>
        </button>

        {/* INJECT SATELLITE FAULT & FULL DEMO */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onInjectFault}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-tech text-[11px] font-semibold tracking-wide uppercase border transition-all duration-200 ${
              isFaultInjected
                ? 'bg-rose-950/50 border-rose-500/60 text-rose-300 shadow-rose-950/40'
                : 'bg-slate-900 hover:bg-rose-950/30 border-rose-900/50 hover:border-rose-500/50 text-rose-400'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Inject Fault</span>
          </button>

          <button
            onClick={onFullDemo}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-tech text-[11px] font-semibold tracking-wide uppercase bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/50 hover:border-emerald-400 text-emerald-300 transition-all duration-200 shadow-sm"
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>Full Demo</span>
          </button>
        </div>

        {/* PAUSE / RESUME & RESET */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onTogglePause}
            disabled={!isMissionActive}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-tech text-[11px] font-semibold tracking-wide uppercase border transition-all duration-200 ${
              !isMissionActive
                ? 'bg-slate-900/40 border-slate-800 text-slate-600 cursor-not-allowed'
                : status.isPaused
                ? 'bg-amber-950/50 border-amber-500/60 text-amber-300 animate-pulse'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            {status.isPaused ? (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Resume</span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </>
            )}
          </button>

          <button
            onClick={onReset}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-tech text-[11px] font-semibold tracking-wide uppercase bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 transition-all duration-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* GENERATE REPORT */}
        <button
          onClick={onGenerateReport}
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-tech text-xs font-semibold tracking-wide uppercase bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-600/50 text-cyan-300 transition-all duration-200 shadow-sm"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Generate Report</span>
        </button>
      </div>

      {/* MISSION STATUS CARD */}
      <div className="bg-slate-900/80 border border-slate-800/90 rounded-lg p-3 flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-[11px] font-mono border-b border-slate-800 pb-1.5">
          <span className="text-slate-400 uppercase tracking-wider font-semibold">Mission Status</span>
          <span className="text-cyan-400 font-bold">{Math.round(status.progress)}%</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              status.currentState === 'SUCCESS'
                ? 'bg-emerald-400'
                : status.fault !== 'NONE' && status.currentState === 'IDLE'
                ? 'bg-rose-500'
                : 'bg-cyan-500'
            }`}
            style={{ width: `${status.progress}%` }}
          />
        </div>

        {/* Status Fields */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div>
            <span className="text-[10px] text-slate-500 block uppercase">Current State</span>
            <span
              className={`font-semibold tracking-tight text-[11px] block truncate ${
                status.currentState === 'SUCCESS'
                  ? 'text-emerald-400'
                  : status.currentState === 'ANOMALY DETECTED'
                  ? 'text-rose-400'
                  : 'text-cyan-300'
              }`}
            >
              {status.currentState}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 block uppercase">Fault</span>
            <span
              className={`font-semibold tracking-tight text-[11px] block truncate ${
                status.fault !== 'NONE' ? 'text-rose-400' : 'text-slate-300'
              }`}
            >
              {status.fault}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 block uppercase">Diagnosis</span>
            <span className="font-semibold tracking-tight text-[11px] text-amber-300 block truncate">
              {status.diagnosis || '—'}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 block uppercase">Repair</span>
            <span className="font-semibold tracking-tight text-[11px] text-emerald-400 block truncate">
              {status.repair || '—'}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="mt-1 p-2 rounded bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-300 leading-relaxed font-mono">
          {status.description}
        </div>
      </div>

      {/* ROBOT DESIGN UPLOAD SECTION */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-tech font-semibold uppercase text-slate-300">
          <span className="flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-cyan-400" />
            Upload Robot Design
          </span>
          <span className="text-[10px] font-mono text-slate-500">PNG / JPG / WEBP</span>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp"
          className="hidden"
          onChange={handleFileChange}
        />

        {robotImage ? (
          <div className="flex items-center gap-2.5 p-2 rounded bg-slate-950 border border-cyan-800/50">
            <img
              src={robotImage}
              alt="Custom Robot Design"
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded object-cover border border-cyan-500/40"
            />
            <div className="flex-1 min-w-0">
              <span className="text-xs font-mono text-cyan-300 block truncate font-medium">Custom Design Active</span>
              <span className="text-[10px] font-mono text-slate-400 block">Projected onto chassis</span>
            </div>
            <button
              onClick={onRemoveRobotImage}
              title="Remove custom design"
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded border border-dashed border-slate-700 hover:border-cyan-500/70 bg-slate-950/50 hover:bg-slate-900 text-xs font-mono text-slate-400 hover:text-cyan-300 transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Robot Design</span>
          </button>
        )}
      </div>

      {/* HIGH-VISIBILITY BOT SPOTLIGHT TOGGLE */}
      {onToggleBotSpotlight && (
        <button
          onClick={onToggleBotSpotlight}
          className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-xs font-mono transition-all duration-200 shadow-md ${
            isBotSpotlightOn
              ? 'bg-amber-950/40 border-amber-400 text-amber-200 shadow-amber-900/30'
              : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
          }`}
        >
          <div className="flex items-center gap-2">
            <Lightbulb className={`w-4 h-4 ${isBotSpotlightOn ? 'text-amber-400 fill-amber-400/30' : 'text-slate-500'}`} />
            <div className="text-left">
              <span className="font-tech text-xs font-bold block">
                {isBotSpotlightOn ? 'Bot Spotlight: HIGH ILLUMINATION' : 'Bot Spotlight: LOW/OFF'}
              </span>
              <span className="text-[10px] text-slate-400 block">
                {isBotSpotlightOn ? 'Direct beam keeps bot bright in deep space' : 'Click to illuminate bot brightly'}
              </span>
            </div>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
              isBotSpotlightOn
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            {isBotSpotlightOn ? 'ON' : 'OFF'}
          </span>
        </button>
      )}

      {/* BOT ATTIRE & WARDROBE SECTION */}
      <div className="flex flex-col gap-2">
        <button
          onClick={onOpenAttireModal}
          className="w-full flex items-center justify-between p-3 rounded-lg border border-amber-500/50 hover:border-amber-400 bg-gradient-to-r from-slate-900/90 via-amber-950/30 to-slate-900/90 text-slate-200 hover:text-white transition-all duration-300 group shadow-lg shadow-amber-950/30"
        >
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shrink-0 shadow-md shadow-amber-950/50 text-slate-950">
              <Award className="w-4 h-4 font-bold" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-tech text-xs font-bold uppercase tracking-wider block text-amber-300 group-hover:text-amber-200 truncate">
                  {getAttireName(botAttire)}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 block truncate">
                {botAttire === 'classic-tuxedo'
                  ? 'White-tie dinner jacket & 3D gold bowtie'
                  : botAttire === 'classic-apollo'
                  ? 'Gold MLI foil wrap & racing stripes'
                  : botAttire === 'spacex-official'
                  ? 'High-albedo white & cyan optics'
                  : 'Click to customize bot attire'}
              </span>
            </div>
          </div>
          <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/50 shrink-0 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
            <span>CLASSIC</span>
          </span>
        </button>

        {/* Quick Attire Selector Pills */}
        {onSelectAttire && (
          <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
            <button
              onClick={() => onSelectAttire('spacex-official')}
              className={`p-1.5 rounded border text-left flex items-center justify-between transition-colors ${
                botAttire === 'spacex-official'
                  ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 font-bold'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <span>🚀 SpaceX Baseline</span>
              {botAttire === 'spacex-official' && <span className="text-[9px] text-cyan-400">●</span>}
            </button>
            <button
              onClick={() => onSelectAttire('classic-apollo')}
              className={`p-1.5 rounded border text-left flex items-center justify-between transition-colors ${
                botAttire === 'classic-apollo'
                  ? 'bg-amber-950/80 border-amber-400 text-amber-200 font-bold'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <span>🦅 Apollo (1969 Gold)</span>
              {botAttire === 'classic-apollo' && <span className="text-[9px] text-amber-400">●</span>}
            </button>
            <button
              onClick={() => onSelectAttire('classic-tuxedo')}
              className={`p-1.5 rounded border text-left flex items-center justify-between transition-colors ${
                botAttire === 'classic-tuxedo'
                  ? 'bg-amber-950/80 border-amber-400 text-amber-200 font-bold'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <span>👔 White-Tie Tuxedo</span>
              {botAttire === 'classic-tuxedo' && <span className="text-[9px] text-amber-400">●</span>}
            </button>
            <button
              onClick={() => onSelectAttire('classic-dragon')}
              className={`p-1.5 rounded border text-left flex items-center justify-between transition-colors ${
                botAttire === 'classic-dragon'
                  ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 font-bold'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <span>🐉 Dragon Suit</span>
              {botAttire === 'classic-dragon' && <span className="text-[9px] text-cyan-400">●</span>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
