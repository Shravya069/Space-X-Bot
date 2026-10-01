import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';
import { Terminal, Download, EyeOff, X } from 'lucide-react';

interface EventLogPanelProps {
  logs: LogEntry[];
  onClearLogs?: () => void;
  onClose?: () => void;
}

export const EventLogPanel: React.FC<EventLogPanelProps> = ({ logs, onClose }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleDownloadLog = () => {
    const textContent = logs.map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.text}`).join('\n');
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `space_x_bot_event_log_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLogColorClass = (level: string) => {
    switch (level) {
      case 'success':
        return 'text-emerald-400 font-semibold';
      case 'fault':
        return 'text-rose-400 font-semibold';
      case 'warning':
        return 'text-amber-300 font-medium';
      case 'info':
      default:
        return 'text-cyan-300';
    }
  };

  return (
    <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3.5 backdrop-blur-md shadow-2xl flex flex-col h-56 animate-fade-in transition-all">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h3 className="font-tech text-xs tracking-wider uppercase text-slate-200 font-semibold">
            Orbital Event Log
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-500">{logs.length} EVENTS</span>
          <button
            onClick={handleDownloadLog}
            title="Download log"
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              title="Close log bar for Space X Bot clarity vision"
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Log Feed */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-1.5 pr-1 font-mono text-xs select-text scroll-smooth"
      >
        {logs.map((log) => (
          <div key={log.id} className="flex items-start gap-2 leading-relaxed">
            <span className="text-slate-500 shrink-0 select-none text-[11px]">
              [{log.timestamp}]
            </span>
            <span className={`break-words ${getLogColorClass(log.level)}`}>
              {log.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
