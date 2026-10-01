export type MissionState =
  | 'IDLE'
  | 'MONITORING'
  | 'ANOMALY DETECTED'
  | 'INSPECTION'
  | 'DIAGNOSIS'
  | 'MAINTENANCE PLAN'
  | 'ARM POSITIONING'
  | 'INTERVENTION'
  | 'VERIFICATION'
  | 'SUCCESS';

export type LogLevel = 'info' | 'warning' | 'fault' | 'success';

export interface LogEntry {
  id: string;
  timestamp: string;
  text: string;
  level: LogLevel;
}

export interface TelemetryData {
  power: number; // percentage
  temperature: number; // celsius
  signal: number; // percentage
  connector: 'NORMAL' | 'FAULT' | 'REPAIRING';
  voltage: number; // volts
  current: number; // amps
  busHealth: number; // percentage
}

export interface MissionStatus {
  currentState: MissionState;
  fault: string;
  diagnosis: string;
  repair: string;
  progress: number;
  description: string;
  isPaused: boolean;
}

export type CameraPreset = 'default' | 'robot' | 'connector' | 'earth';

export type BotAttire =
  | 'spacex-official'
  | 'classic-apollo'
  | 'classic-tuxedo'
  | 'classic-dragon'
  | 'classic-steampunk';
