import React from 'react';
import { X, Download, ShieldCheck, Cpu, GitFork, CheckCircle, AlertTriangle } from 'lucide-react';
import { TelemetryData } from '../types';

interface MissionReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  telemetry: TelemetryData;
  initialTelemetry: { power: number; temperature: number; signal: number };
  currentState: string;
}

export const generateReportText = (
  initialTelemetry: { power: number; temperature: number; signal: number },
  finalTelemetry: { power: number; temperature: number; signal: number },
  finalState: string
) => {
  const timestamp = new Date().toISOString();
  return `==================================================
SPACE X BOT
AUTONOMOUS MAINTENANCE REPORT
==================================================

Mission:
Orbital Infrastructure Maintenance Simulation

Fault:
Loose power connector

Diagnosis:
Loose connector

Maintenance:
Connector secured

Initial telemetry:
Power ${Math.round(initialTelemetry.power)}%
Temperature ${Math.round(initialTelemetry.temperature)}°C
Signal ${Math.round(initialTelemetry.signal)}%

Final telemetry:
Power ${Math.round(finalTelemetry.power)}%
Temperature ${Math.round(finalTelemetry.temperature)}°C
Signal ${Math.round(finalTelemetry.signal)}%

Final state:
${finalState}

System:
Concept simulation

Timestamp:
${timestamp}

==================================================
NOTICE:
This is a CONCEPT SIMULATION designed for autonomous
aerospace robotics evaluation. This simulation does not
represent an actual on-orbit repair of a real operational
spacecraft.
==================================================`;
};

export const MissionReportModal: React.FC<MissionReportModalProps> = ({
  isOpen,
  onClose,
  telemetry,
  initialTelemetry,
  currentState,
}) => {
  if (!isOpen) return null;

  const reportContent = generateReportText(
    initialTelemetry,
    { power: telemetry.power, temperature: telemetry.temperature, signal: telemetry.signal },
    currentState
  );

  const handleDownload = () => {
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `space_x_bot_mission_report_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-950 border border-cyan-500/40 rounded-xl max-w-xl w-full p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-cyan-400" />
            <h3 className="font-tech text-base tracking-wider uppercase text-white font-bold">
              Autonomous Maintenance Report
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Box */}
        <pre className="flex-1 bg-slate-900/90 border border-slate-800 p-4 rounded-lg font-mono text-xs text-slate-200 overflow-y-auto leading-relaxed select-text whitespace-pre-wrap">
          {reportContent}
        </pre>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
          <span className="text-[11px] font-mono text-slate-400">
            Concept simulation report format compliant
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-tech text-xs font-semibold uppercase tracking-wider transition-colors shadow-lg shadow-cyan-900/40"
            >
              <Download className="w-4 h-4" />
              <span>Download Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// System Logic Modal
export const SystemLogicModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const pipeline = [
    { title: 'ANOMALY DETECTION', desc: 'Real-time telemetry delta monitoring and threshold triggers on bus power and temperature.' },
    { title: 'FAULT DIAGNOSIS', desc: 'Close-proximity optical and multi-spectral inspection to verify mechanical coupling integrity.' },
    { title: 'MAINTENANCE PLANNING', desc: 'Trajectory collision-avoidance synthesis and torque parameter selection for socket intervention.' },
    { title: 'ROBOTIC INTERVENTION', desc: 'Actuation of multi-degree-of-freedom manipulator arm to seat and torque the loose collar.' },
    { title: 'TELEMETRY VERIFICATION', desc: 'Subsystem validation to ensure impedance, thermal dissipation, and RF signals return to nominal levels.' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-950 border border-slate-800 rounded-xl max-w-xl w-full p-6 shadow-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h3 className="font-tech text-base tracking-wider uppercase text-white font-bold">
              System Logic & Decision Pipeline
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pipeline flow */}
        <div className="space-y-2 py-2">
          {pipeline.map((step, idx) => (
            <div key={idx} className="flex flex-col">
              <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="w-6 h-6 rounded-md bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-mono text-xs flex items-center justify-center font-bold">
                  {idx + 1}
                </span>
                <div>
                  <h4 className="font-tech text-xs tracking-wider uppercase font-semibold text-slate-100">
                    {step.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                    {step.desc}
                  </p>
                </div>
              </div>
              {idx < pipeline.length - 1 && (
                <div className="w-0.5 h-3 bg-cyan-500/30 ml-5 my-0.5" />
              )}
            </div>
          ))}
        </div>

        {/* Requirement #15 Prototype Explanation Note */}
        <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-800/40 text-xs text-slate-300 leading-relaxed font-mono">
          <span className="text-cyan-400 font-bold block mb-1">Architecture Disclosure:</span>
          “The current prototype simulates the autonomous decision pipeline. Future versions could integrate machine-learning anomaly detection, computer vision, path planning, robotic control and validated maintenance procedures.”
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// CIRA Algorithm Modal
export const CiraModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const steps = [
    { title: 'DETECT', desc: 'Continuous sensor telemetry ingestion and residual fault symptom identification.' },
    { title: 'IDENTIFY CAUSE', desc: 'Causal graphical mapping between high temperature + reduced power and loose connector mechanics.' },
    { title: 'PREDICT', desc: 'Simulation of physical intervention consequences to prevent cascading orbital bus hazards.' },
    { title: 'SELECT SAFE ACTION', desc: 'Resolution of verified repair action matching validated safety constraints.' },
    { title: 'INTERVENE', desc: 'Precision robotic arm trajectory execution and mechanical torque latching.' },
    { title: 'VERIFY', desc: 'Post-intervention feedback confirmation before confirming mission complete.' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-950 border border-slate-800 rounded-xl max-w-xl w-full p-6 shadow-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <GitFork className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-tech text-base tracking-wider uppercase text-white font-bold">
                CIRA Framework
              </h3>
              <span className="text-[10px] font-mono text-amber-400/90 block">
                Causal Intervention & Recovery Algorithm · Proposed algorithmic framework
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Framework Description */}
        <p className="text-xs text-slate-300 leading-relaxed font-mono p-3 bg-slate-900/60 rounded-lg border border-slate-800">
          “A proposed decision framework for connecting fault symptoms to possible causes, selecting a validated intervention, predicting the expected outcome, and verifying recovery after intervention.”
        </p>

        {/* CIRA Workflow */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {steps.map((st, i) => (
            <div key={i} className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col">
              <span className="font-tech font-bold text-amber-300 text-xs uppercase tracking-wider mb-1">
                {i + 1}. {st.title}
              </span>
              <span className="text-[11px] text-slate-400 leading-snug">{st.desc}</span>
            </div>
          ))}
        </div>

        <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-800/40 text-[11px] text-amber-300/90 font-mono">
          Proposed algorithmic framework for academic & space concept development.
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Autonomy Safety Modal
export const SafetyModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-950 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-tech text-base tracking-wider uppercase text-white font-bold">
              Autonomy Safety Model
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-800/40 text-xs text-slate-200 leading-relaxed font-mono">
          <span className="text-emerald-400 font-bold block mb-2 uppercase tracking-wider text-xs">
            Concept Safety Policy:
          </span>
          “Autonomous intervention is restricted to predefined and validated maintenance actions. If confidence is insufficient or conditions fall outside permitted limits, the system would stop and request human approval.”
        </div>

        <div className="space-y-2 text-xs font-mono text-slate-300">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>Collision Avoidance Zone: Strict 0.5m envelope clearance buffer around solar wings and communication dish.</span>
          </div>
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>Human-in-the-Loop Override: Ground controllers can abort or command manual teleoperation at any millisecond.</span>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Component Inspector Modal
export const ComponentInspectorModal: React.FC<{
  component: { name: string; desc: string } | null;
  onClose: () => void;
}> = ({ component, onClose }) => {
  if (!component) return null;

  return (
    <div className="fixed bottom-16 right-6 z-40 max-w-sm w-full bg-slate-950/95 border border-cyan-500/40 rounded-xl p-4 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
        <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider">Subsystem Telemetry</span>
        <button onClick={onClose} className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>
      <h4 className="font-tech text-sm font-bold text-white mb-1">{component.name}</h4>
      <p className="text-xs text-slate-300 font-mono leading-relaxed">{component.desc}</p>
    </div>
  );
};
