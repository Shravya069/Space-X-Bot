import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SpaceScene } from './components/SpaceScene';
import { MissionControls } from './components/MissionControls';
import { TelemetryPanel } from './components/TelemetryPanel';
import { EventLogPanel } from './components/EventLogPanel';
import {
  MissionReportModal,
  SystemLogicModal,
  CiraModal,
  SafetyModal,
  ComponentInspectorModal,
} from './components/InfoModals';
import { BotAttireModal } from './components/BotAttireModal';
import { BotAttire, CameraPreset, LogEntry, MissionState, MissionStatus, TelemetryData } from './types';
import { Video, Shield, Sparkles, AlertCircle, Info, Eye, EyeOff, Award, Lightbulb } from 'lucide-react';

const formatTime = (date: Date) => {
  return date.toTimeString().split(' ')[0];
};

export default function App() {
  // Mission Status State
  const [missionStatus, setMissionStatus] = useState<MissionStatus>({
    currentState: 'IDLE',
    fault: 'NONE',
    diagnosis: '',
    repair: '',
    progress: 0,
    description: 'Autonomous maintenance system in standby. Telemetry stream nominal.',
    isPaused: false,
  });

  // Telemetry State
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    power: 98,
    temperature: 21,
    signal: 100,
    connector: 'NORMAL',
    voltage: 28.2,
    current: 4.8,
    busHealth: 100,
  });

  // Initial fault telemetry snapshot for report
  const initialFaultTelemetry = useRef({ power: 72, temperature: 48, signal: 63 });

  // Event Log
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'init-1',
      timestamp: formatTime(new Date()),
      text: 'Simulation initialized.',
      level: 'info',
    },
    {
      id: 'init-2',
      timestamp: formatTime(new Date(Date.now() + 1000)),
      text: 'Spacecraft telemetry nominal.',
      level: 'info',
    },
  ]);

  // Modals state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [systemLogicModalOpen, setSystemLogicModalOpen] = useState(false);
  const [ciraModalOpen, setCiraModalOpen] = useState(false);
  const [safetyModalOpen, setSafetyModalOpen] = useState(false);
  const [inspectedComponent, setInspectedComponent] = useState<{ name: string; desc: string } | null>(null);

  // Camera preset
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('default');

  // Custom Robot Image
  const [robotImage, setRobotImage] = useState<string | null>(null);

  // Clarity Vision & Panel Closing options
  const [isTelemetryOpen, setIsTelemetryOpen] = useState(true);
  const [isEventLogOpen, setIsEventLogOpen] = useState(true);
  const [isClarityVision, setIsClarityVision] = useState(false);

  // Bot Attire state (Default: High-Albedo SpaceX Baseline)
  const [botAttire, setBotAttire] = useState<BotAttire>('spacex-official');
  const [attireModalOpen, setAttireModalOpen] = useState(false);
  const [isBotSpotlightOn, setIsBotSpotlightOn] = useState(true);

  // Active view tab
  const [activeTab, setActiveTab] = useState<'control' | 'logic' | 'cira' | 'safety'>('control');

  // Internal state machine timer & refs
  const stateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fullDemoTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const missionStepRef = useRef<number>(0);

  // Helper to add log
  const addLog = useCallback((text: string, level: LogEntry['level'] = 'info') => {
    setLogs((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        timestamp: formatTime(new Date()),
        text,
        level,
      },
    ]);
  }, []);

  // Robot Image Upload handler
  const handleUploadRobotImage = (file: File) => {
    if (robotImage && robotImage.startsWith('blob:')) {
      URL.revokeObjectURL(robotImage);
    }
    const newUrl = URL.createObjectURL(file);
    setRobotImage(newUrl);
    addLog(`Custom robot design loaded: ${file.name}`, 'info');
  };

  const handleRemoveRobotImage = () => {
    if (robotImage && robotImage.startsWith('blob:')) {
      URL.revokeObjectURL(robotImage);
    }
    setRobotImage(null);
    addLog('Reverted to baseline Space X Bot 3D model.', 'info');
  };

  // Global paste handler to support pasting robot images directly
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0];
        if (file.type.startsWith('image/')) {
          handleUploadRobotImage(file);
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [robotImage]);

  // ---------------------------------------------------------------------------
  // FAULT INJECTION
  // ---------------------------------------------------------------------------
  const handleInjectFault = useCallback(() => {
    setMissionStatus((prev) => ({
      ...prev,
      fault: 'LOOSE CONNECTOR',
      description: 'Abnormal power connector telemetry detected! High contact impedance observed.',
    }));

    // Target telemetry values
    setTelemetry({
      power: 72,
      temperature: 48,
      signal: 63,
      connector: 'FAULT',
      voltage: 21.4,
      current: 8.9,
      busHealth: 68,
    });

    initialFaultTelemetry.current = { power: 72, temperature: 48, signal: 63 };

    addLog('Power connector anomaly detected.', 'fault');
    addLog('Main power bus voltage dropped to 21.4V. Thermal runaway risk.', 'warning');
  }, [addLog]);

  // ---------------------------------------------------------------------------
  // MISSION RESET
  // ---------------------------------------------------------------------------
  const handleReset = useCallback(() => {
    if (stateTimerRef.current) clearTimeout(stateTimerRef.current);
    if (fullDemoTimeoutRef.current) clearTimeout(fullDemoTimeoutRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    missionStepRef.current = 0;

    setMissionStatus({
      currentState: 'IDLE',
      fault: 'NONE',
      diagnosis: '',
      repair: '',
      progress: 0,
      description: 'System reset. Telemetry nominal. Robot parked in station-keeping orbit.',
      isPaused: false,
    });

    setTelemetry({
      power: 98,
      temperature: 21,
      signal: 100,
      connector: 'NORMAL',
      voltage: 28.2,
      current: 4.8,
      busHealth: 100,
    });

    setLogs([
      {
        id: `reset-${Date.now()}`,
        timestamp: formatTime(new Date()),
        text: 'Mission reset.',
        level: 'info',
      },
    ]);
  }, []);

  // ---------------------------------------------------------------------------
  // MISSION STATE MACHINE STEPPER
  // ---------------------------------------------------------------------------
  const runNextStep = useCallback(() => {
    missionStepRef.current += 1;
    const step = missionStepRef.current;

    switch (step) {
      case 1: // MONITORING
        setMissionStatus((prev) => ({
          ...prev,
          currentState: 'MONITORING',
          progress: 10,
          description: 'Continuously monitoring spacecraft telemetry.',
        }));
        addLog('Continuously monitoring spacecraft telemetry.', 'info');
        break;

      case 2: // ANOMALY DETECTED
        setMissionStatus((prev) => ({
          ...prev,
          currentState: 'ANOMALY DETECTED',
          fault: 'LOOSE CONNECTOR',
          progress: 20,
          description: 'Abnormal power connector telemetry detected.',
        }));
        setTelemetry((prev) => ({
          ...prev,
          power: 72,
          temperature: 48,
          signal: 63,
          connector: 'FAULT',
        }));
        addLog('Abnormal power connector telemetry detected.', 'fault');
        addLog('Autonomous inspection initiated.', 'info');
        break;

      case 3: // INSPECTION
        setMissionStatus((prev) => ({
          ...prev,
          currentState: 'INSPECTION',
          progress: 35,
          description: 'Robot navigating toward affected component.',
        }));
        addLog('Robot navigating toward affected component.', 'info');
        addLog('Robot approaching spacecraft.', 'info');
        break;

      case 4: // DIAGNOSIS
        setMissionStatus((prev) => ({
          ...prev,
          currentState: 'DIAGNOSIS',
          diagnosis: 'Loose connector',
          progress: 50,
          description: 'Analyzing connector condition.',
        }));
        addLog('Connector inspection complete.', 'info');
        addLog('Diagnosis: loose connector.', 'warning');
        break;

      case 5: // MAINTENANCE PLAN
        setMissionStatus((prev) => ({
          ...prev,
          currentState: 'MAINTENANCE PLAN',
          repair: 'Connector secure procedure',
          progress: 60,
          description: 'Safe repair procedure selected.',
        }));
        addLog('Maintenance procedure selected.', 'info');
        break;

      case 6: // ARM POSITIONING
        setMissionStatus((prev) => ({
          ...prev,
          currentState: 'ARM POSITIONING',
          progress: 72,
          description: 'Robotic arm positioning repair tool.',
        }));
        addLog('Robotic arm positioning repair tool.', 'info');
        addLog('Robotic arm positioned.', 'info');
        break;

      case 7: // INTERVENTION
        setMissionStatus((prev) => ({
          ...prev,
          currentState: 'INTERVENTION',
          repair: 'Connector secured',
          progress: 85,
          description: 'Robot securing the power connector.',
        }));
        setTelemetry((prev) => ({
          ...prev,
          connector: 'REPAIRING',
          power: 86,
          temperature: 32,
          signal: 88,
        }));
        addLog('Intervention started.', 'warning');
        addLog('Tool engaging locking ring...', 'info');
        setTimeout(() => {
          addLog('Connector secured.', 'success');
        }, 1800);
        break;

      case 8: // VERIFICATION
        setMissionStatus((prev) => ({
          ...prev,
          currentState: 'VERIFICATION',
          progress: 95,
          description: 'Checking post-repair telemetry.',
        }));
        setTelemetry({
          power: 99,
          temperature: 22,
          signal: 100,
          connector: 'NORMAL',
          voltage: 28.4,
          current: 4.7,
          busHealth: 100,
        });
        addLog('Post-repair verification started.', 'info');
        setTimeout(() => {
          addLog('Telemetry nominal.', 'success');
        }, 1200);
        break;

      case 9: // SUCCESS
        setMissionStatus((prev) => ({
          ...prev,
          currentState: 'SUCCESS',
          progress: 100,
          description: 'Maintenance successfully completed.',
        }));
        addLog('AUTONOMOUS MAINTENANCE COMPLETE.', 'success');
        break;

      default:
        break;
    }
  }, [addLog]);

  // ---------------------------------------------------------------------------
  // ADVANCE OR SCHEDULE NEXT STEP ACCORDING TO TIMINGS
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (missionStatus.isPaused) return;

    if (
      missionStatus.currentState !== 'IDLE' &&
      missionStatus.currentState !== 'SUCCESS'
    ) {
      // Step durations in milliseconds for natural, dramatic aerospace pacing
      const stepDurations: Record<MissionState, number> = {
        IDLE: 0,
        MONITORING: 2400,
        'ANOMALY DETECTED': 2800,
        INSPECTION: 3600,
        DIAGNOSIS: 3400,
        'MAINTENANCE PLAN': 2600,
        'ARM POSITIONING': 3000,
        INTERVENTION: 4200,
        VERIFICATION: 2800,
        SUCCESS: 0,
      };

      const duration = stepDurations[missionStatus.currentState] || 3000;
      stateTimerRef.current = setTimeout(() => {
        runNextStep();
      }, duration);

      return () => {
        if (stateTimerRef.current) clearTimeout(stateTimerRef.current);
      };
    }
  }, [missionStatus.currentState, missionStatus.isPaused, runNextStep]);

  // ---------------------------------------------------------------------------
  // START AUTONOMOUS MISSION
  // ---------------------------------------------------------------------------
  const handleStartMission = useCallback(() => {
    if (missionStatus.currentState === 'SUCCESS') return;

    // If fault hasn't been injected, inject fault or start directly
    if (missionStatus.fault === 'NONE') {
      missionStepRef.current = 0;
      runNextStep(); // Goes to MONITORING, then automatically detects anomaly
    } else {
      missionStepRef.current = 1;
      runNextStep(); // Goes directly to ANOMALY DETECTED / INSPECTION
    }
  }, [missionStatus.currentState, missionStatus.fault, runNextStep]);

  // ---------------------------------------------------------------------------
  // PAUSE / RESUME
  // ---------------------------------------------------------------------------
  const handleTogglePause = () => {
    setMissionStatus((prev) => {
      const nextPaused = !prev.isPaused;
      addLog(nextPaused ? 'Mission simulation paused.' : 'Mission simulation resumed.', 'info');
      return { ...prev, isPaused: nextPaused };
    });
  };

  // ---------------------------------------------------------------------------
  // FULL DEMO (REQUIREMENT #13)
  // ---------------------------------------------------------------------------
  const handleFullDemo = () => {
    handleReset();
    addLog('Initiating full autonomous demonstration scenario...', 'info');

    fullDemoTimeoutRef.current = setTimeout(() => {
      handleInjectFault();
      fullDemoTimeoutRef.current = setTimeout(() => {
        missionStepRef.current = 1;
        runNextStep();
      }, 1600);
    }, 800);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (robotImage) URL.revokeObjectURL(robotImage);
    };
  }, [robotImage]);

  return (
    <div className="relative w-screen h-screen bg-[#030712] text-slate-100 flex flex-col overflow-hidden font-sans select-none">
      {/* --------------------------------------------------------------------- */}
      {/* 1. TOP BAR (Strict 3-zone contract from design constitution)           */}
      {/* --------------------------------------------------------------------- */}
      <header className="h-14 bg-slate-950/90 border-b border-slate-800/80 px-5 flex items-center justify-between z-30 shrink-0 backdrop-blur-md">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h1 className="font-tech text-lg font-bold tracking-wider text-white">
              SPACE X BOT
            </h1>
          </div>
          <span className="hidden sm:inline-block text-xs font-mono text-cyan-400/80 px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-800/40">
            SIMULATOR
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
          <button
            onClick={() => setActiveTab('control')}
            className={`hover:text-slate-100 transition-colors whitespace-nowrap ${
              activeTab === 'control' ? 'text-cyan-400 font-semibold' : ''
            }`}
          >
            Mission Control
          </button>
          <button
            onClick={() => setSystemLogicModalOpen(true)}
            className="hover:text-slate-100 transition-colors whitespace-nowrap flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            System Logic
          </button>
          <button
            onClick={() => setCiraModalOpen(true)}
            className="hover:text-slate-100 transition-colors whitespace-nowrap flex items-center gap-1.5"
          >
            <Info className="w-3.5 h-3.5 text-amber-400" />
            CIRA Framework
          </button>
          <button
            onClick={() => setSafetyModalOpen(true)}
            className="hover:text-slate-100 transition-colors whitespace-nowrap flex items-center gap-1.5"
          >
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            Safety Model
          </button>
          <button
            onClick={() => setAttireModalOpen(true)}
            className="hover:text-amber-200 transition-colors whitespace-nowrap flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-950/50 border border-amber-500/60 text-amber-300 font-semibold shadow-sm shadow-amber-950/40"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Bot Attire</span>
            <span className="text-[9px] bg-amber-900 text-amber-100 px-1 rounded uppercase font-bold">Classic</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2">
          {/* Clarity Vision Toggle */}
          <button
            onClick={() => setIsClarityVision(!isClarityVision)}
            title={isClarityVision ? 'Restore full mission interface' : 'Enable Clarity Vision (hide HUD for unobstructed space view)'}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all shadow-sm ${
              isClarityVision
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-cyan-500/30'
                : 'bg-slate-900 hover:bg-slate-800 text-cyan-300 border-slate-700/80 hover:border-cyan-500/50'
            }`}
          >
            {isClarityVision ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-cyan-400" />}
            <span className="hidden sm:inline">{isClarityVision ? 'Exit Clarity' : 'Clarity Vision'}</span>
          </button>

          {/* Bot Illumination Spotlight Button */}
          <button
            onClick={() => {
              const next = !isBotSpotlightOn;
              setIsBotSpotlightOn(next);
              addLog(`Bot Spotlight ${next ? 'ACTIVATED (High-Visibility)' : 'DEACTIVATED'}`, 'info');
            }}
            title={isBotSpotlightOn ? 'Bot Spotlight is ON (High Clarity)' : 'Bot Spotlight is OFF (Click to illuminate)'}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all shadow-sm ${
              isBotSpotlightOn
                ? 'bg-amber-500/20 text-amber-300 border-amber-400 font-semibold shadow-amber-500/20'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-700/80 hover:border-slate-500'
            }`}
          >
            <Lightbulb className={`w-3.5 h-3.5 ${isBotSpotlightOn ? 'text-amber-400 fill-amber-400/40' : 'text-slate-400'}`} />
            <span className="hidden md:inline">{isBotSpotlightOn ? 'Bot Lit' : 'Spotlight'}</span>
          </button>

          {/* Camera presets */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono">
            <button
              onClick={() => setCameraPreset('default')}
              title="Overview Orbit"
              className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${
                cameraPreset === 'default' ? 'bg-cyan-900/60 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setCameraPreset('robot')}
              title="Follow Robot"
              className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${
                cameraPreset === 'robot' ? 'bg-cyan-900/60 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Robot Cam
            </button>
            <button
              onClick={() => setCameraPreset('connector')}
              title="Connector Focus"
              className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${
                cameraPreset === 'connector' ? 'bg-cyan-900/60 text-cyan-300 font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Connector
            </button>
          </div>

          <button
            onClick={handleFullDemo}
            className="px-3 py-1.5 text-xs font-tech font-semibold uppercase tracking-wider text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors whitespace-nowrap shadow-md shadow-cyan-950/40"
          >
            Demo Run
          </button>
        </div>
      </header>

      {/* --------------------------------------------------------------------- */}
      {/* NOTICE BANNER: CONCEPT SIMULATION DISCLAIMER                          */}
      {/* --------------------------------------------------------------------- */}
      <div className="bg-cyan-950/70 border-b border-cyan-800/40 px-4 py-1.5 flex items-center justify-between text-[11px] font-mono text-cyan-300/90 z-20 shrink-0">
        <div className="flex items-center gap-2 truncate">
          <AlertCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="font-semibold text-cyan-200">CONCEPT SIMULATION:</span>
          <span className="truncate text-slate-300">
            Autonomous Space Infrastructure Maintenance Simulator. Demonstrating loose power connector detection, diagnosis, robotic repair & verification.
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setAttireModalOpen(true)}
            className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/80 border border-amber-500/60 text-amber-300 flex items-center gap-1 hover:bg-amber-900/60 transition-colors"
          >
            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
            <span>ATTIRE: {botAttire.toUpperCase().replace('-', ' ')}</span>
          </button>
          <span className="hidden sm:inline-block text-slate-400 text-[10px]">
            NOT A REAL SPACE-QUALIFIED ROBOT
          </span>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 2. MAIN 3D VIEWPORT WITH OVERLAY PANELS                               */}
      {/* --------------------------------------------------------------------- */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        {/* Three.js 3D Spatial Canvas */}
        <div className="absolute inset-0">
          <SpaceScene
            missionState={missionStatus.currentState}
            isPaused={missionStatus.isPaused}
            robotImage={robotImage}
            botAttire={botAttire}
            isBotSpotlightOn={isBotSpotlightOn}
            cameraPreset={cameraPreset}
            onSelectComponent={(name, desc) => setInspectedComponent({ name, desc })}
          />
        </div>

        {/* CLARITY VISION RESTORE BUTTON (When HUD is hidden) */}
        {isClarityVision && (
          <button
            onClick={() => setIsClarityVision(false)}
            className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-950/85 hover:bg-slate-900 border border-cyan-500/50 text-cyan-300 hover:text-white backdrop-blur-md shadow-2xl text-xs font-mono transition-all animate-pulse"
          >
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>Clarity Vision Active · Click to Restore HUD</span>
          </button>
        )}

        {/* LEFT OVERLAY: MISSION COMMAND & ROBOT CONTROLS */}
        {!isClarityVision && (
          <div className="absolute top-4 left-4 z-20 w-80 max-w-[calc(100vw-2rem)] flex flex-col gap-3 pointer-events-auto max-h-[calc(100vh-10rem)] overflow-y-auto pr-1 animate-fade-in">
            <MissionControls
              status={missionStatus}
              onStartMission={handleStartMission}
              onInjectFault={handleInjectFault}
              onTogglePause={handleTogglePause}
              onReset={handleReset}
              onFullDemo={handleFullDemo}
              onGenerateReport={() => setReportModalOpen(true)}
              robotImage={robotImage}
              onUploadRobotImage={handleUploadRobotImage}
              onRemoveRobotImage={handleRemoveRobotImage}
              botAttire={botAttire}
              onOpenAttireModal={() => setAttireModalOpen(true)}
              isBotSpotlightOn={isBotSpotlightOn}
              onToggleBotSpotlight={() => {
                const next = !isBotSpotlightOn;
                setIsBotSpotlightOn(next);
                addLog(`Bot Spotlight ${next ? 'ACTIVATED (High-Visibility)' : 'DEACTIVATED'}`, 'info');
              }}
              onSelectAttire={(attire) => {
                setBotAttire(attire);
                addLog(`Bot attire switched to ${attire.toUpperCase().replace('-', ' ')} (High-Visibility)`, 'info');
              }}
            />
          </div>
        )}

        {/* RIGHT OVERLAY: LIVE TELEMETRY & EVENT LOG WITH CLOSING OPTIONS */}
        {!isClarityVision && (
          <div className="absolute top-4 right-4 z-20 w-96 max-w-[calc(100vw-2rem)] flex flex-col gap-3 pointer-events-auto max-h-[calc(100vh-10rem)] overflow-y-auto pl-1">
            {/* LIVE TELEMETRY PANEL (COLLAPSIBLE / CLOSABLE) */}
            {isTelemetryOpen ? (
              <TelemetryPanel
                telemetry={telemetry}
                onClose={() => {
                  setIsTelemetryOpen(false);
                  addLog('Telemetry bar closed for Space X Bot clarity vision.', 'info');
                }}
              />
            ) : (
              <button
                onClick={() => {
                  setIsTelemetryOpen(true);
                  addLog('Telemetry bar reopened.', 'info');
                }}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-950/85 hover:bg-slate-900 border border-cyan-500/50 text-cyan-300 font-mono text-xs shadow-2xl backdrop-blur-md transition-all group animate-fade-in"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="font-tech font-bold text-white tracking-wider">LIVE TELEMETRY</span>
                  <span className="text-slate-600">|</span>
                  <span className="tabular-nums font-semibold">{Math.round(telemetry.power)}%</span>
                  <span className="text-slate-600">·</span>
                  <span className="tabular-nums">{Math.round(telemetry.temperature)}°C</span>
                  <span className="text-slate-600">·</span>
                  <span className={telemetry.connector === 'FAULT' ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {telemetry.connector}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-400 group-hover:text-cyan-300 font-medium">
                  <span>Open Bar</span>
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                </div>
              </button>
            )}

            {/* EVENT LOG PANEL (COLLAPSIBLE / CLOSABLE) */}
            {isEventLogOpen ? (
              <EventLogPanel
                logs={logs}
                onClearLogs={() => setLogs([])}
                onClose={() => setIsEventLogOpen(false)}
              />
            ) : (
              <button
                onClick={() => setIsEventLogOpen(true)}
                className="flex items-center justify-between px-3.5 py-2 rounded-lg bg-slate-950/85 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-cyan-300 font-mono text-xs shadow-lg backdrop-blur-md transition-all animate-fade-in"
              >
                <span>Orbital Event Log ({logs.length} events)</span>
                <span className="text-[11px] text-cyan-400 font-semibold flex items-center gap-1">
                  <span>Open Log</span>
                  <Eye className="w-3.5 h-3.5" />
                </span>
              </button>
            )}
          </div>
        )}
      </main>

      {/* --------------------------------------------------------------------- */}
      {/* 3. BOTTOM BAR (Mandatory prompt closing requirement)                 */}
      {/* --------------------------------------------------------------------- */}
      <footer className="h-10 bg-slate-950/95 border-t border-slate-800/80 px-5 flex items-center justify-between z-30 shrink-0 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-3">
          <span className="font-tech font-bold text-slate-200 uppercase tracking-wider">
            SPACE X BOT
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400 hidden sm:inline">
            Autonomous Space Infrastructure Maintenance
          </span>
        </div>

        <div className="flex items-center gap-2 italic text-cyan-300 font-medium">
          “Detect. Diagnose. Repair. Verify.”
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-slate-900 border border-slate-700 text-slate-300">
            CONCEPT SIMULATION
          </span>
        </div>
      </footer>

      {/* --------------------------------------------------------------------- */}
      {/* MODALS & DRAWERS                                                      */}
      {/* --------------------------------------------------------------------- */}
      <MissionReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        telemetry={telemetry}
        initialTelemetry={initialFaultTelemetry.current}
        currentState={missionStatus.currentState}
      />

      <SystemLogicModal
        isOpen={systemLogicModalOpen}
        onClose={() => setSystemLogicModalOpen(false)}
      />

      <CiraModal
        isOpen={ciraModalOpen}
        onClose={() => setCiraModalOpen(false)}
      />

      <SafetyModal
        isOpen={safetyModalOpen}
        onClose={() => setSafetyModalOpen(false)}
      />

      <ComponentInspectorModal
        component={inspectedComponent}
        onClose={() => setInspectedComponent(null)}
      />

      <BotAttireModal
        isOpen={attireModalOpen}
        onClose={() => setAttireModalOpen(false)}
        currentAttire={botAttire}
        onSelectAttire={(newAttire) => {
          setBotAttire(newAttire);
          addLog(
            `Space X Bot attire changed to ${newAttire.toUpperCase().replace('-', ' ')}.`,
            'success'
          );
        }}
      />
    </div>
  );
}
