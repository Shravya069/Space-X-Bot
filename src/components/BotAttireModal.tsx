import React from 'react';
import { BotAttire } from '../types';
import { X, Check, Sparkles, Award, Shield, Compass, Star } from 'lucide-react';

interface BotAttireModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAttire: BotAttire;
  onSelectAttire: (attire: BotAttire) => void;
}

interface AttireOption {
  id: BotAttire;
  name: string;
  tagline: string;
  description: string;
  themeColor: string;
  borderColor: string;
  badge: string;
  features: string[];
}

const ATTIRE_OPTIONS: AttireOption[] = [
  {
    id: 'spacex-official',
    name: 'SpaceX Official Baseline',
    tagline: 'Clean High-Albedo Factory Aerospace Config',
    description:
      'The iconic pristine orbital maintenance servicer: brilliant aerospace white composite panels, high-contrast hardware, radiant cyan stereo optics, and emerald green LIDAR dome.',
    themeColor: 'from-cyan-900/30 to-slate-900',
    borderColor: 'border-cyan-500/60 hover:border-cyan-400',
    badge: 'DEFAULT · ULTRA BRIGHT',
    features: [
      'High-albedo ceramic white aerospace chassis',
      'High-contrast aerospace titanium hardware',
      'Dual illuminated cyan stereo sensor lenses',
      'Luminous SpaceX Bot status display',
    ],
  },
  {
    id: 'classic-apollo',
    name: 'Classic Apollo Heritage (1969)',
    tagline: 'Historic Lunar Module & Saturn V Livery',
    description:
      'Wraps Space X Bot in radiant gold thermal MLI foil blankets, brilliant lunar-reflective white ceramic hull, vintage NASA red-and-blue flight racing stripes, and warm glowing optics.',
    themeColor: 'from-amber-600/30 to-blue-950/30',
    borderColor: 'border-amber-500/60 hover:border-amber-400',
    badge: 'HISTORIC HERITAGE',
    features: [
      'Gleaming thermal gold MLI foil wrapped flank panels',
      'Apollo lunar ceramic white hull with mission stripes',
      'Luminous amber halogen optical beacons',
      'SV-1969 Apollo Heritage front badge',
    ],
  },
  {
    id: 'classic-tuxedo',
    name: 'Classic White-Tie Gala Tuxedo',
    tagline: 'High-Society Formal Gala & Dapper Gentleman Edition',
    description:
      'Dresses Space X Bot in brilliant classic attire: an ivory/pearl white gala dinner jacket, midnight satin lapels, a 3D polished golden bowtie, champagne amber crystal lenses, and gold-trimmed display.',
    themeColor: 'from-amber-500/30 to-slate-900',
    borderColor: 'border-amber-500/60 hover:border-amber-400',
    badge: 'DAPPER & BRIGHT',
    features: [
      'Brilliant pearl-white dinner jacket chassis',
      '3D polished gold bowtie at collar',
      'Champagne amber glowing crystal camera eyes',
      'Gold filigree double-bordered chest display',
    ],
  },
  {
    id: 'classic-dragon',
    name: 'Classic SpaceX Dragon Suit',
    tagline: 'Iconic Minimalist Commercial Crew Attire',
    description:
      'Inspired by the sleek SpaceX Dragon astronaut spacesuit: aerodynamic titanium white plating, high-contrast matte carbon-black seams, and cobalt blue sensor rings.',
    themeColor: 'from-cyan-950/40 to-slate-900',
    borderColor: 'border-cyan-500/50 hover:border-cyan-400',
    badge: 'SPACEX ICONIC',
    features: [
      'Matte titanium white Dragon composite hull',
      'Charcoal aerodynamic contour lines',
      'Cobalt blue stereo sensor optics',
      'Clean icy-blue cold gas RCS thrusters',
    ],
  },
  {
    id: 'classic-steampunk',
    name: 'Classic Victorian Brass & Gold',
    tagline: 'Dapper Industrial Age Chronometer Attire',
    description:
      'An audacious vintage aesthetic featuring radiant polished mirror-brass plating, polished copper reinforcement seams, glowing warm vacuum-tube optics, and brass chronometer dials.',
    themeColor: 'from-amber-500/30 to-yellow-950/30',
    borderColor: 'border-yellow-500/60 hover:border-yellow-400',
    badge: 'GOLDEN BRASS',
    features: [
      'Radiant polished mirror-brass golden plating',
      'Warm vacuum-tube glowing optical sensor lenses',
      'Polished copper elbow joints and pressure dials',
      'Bright golden parchment status dial',
    ],
  },
];

export const BotAttireModal: React.FC<BotAttireModalProps> = ({
  isOpen,
  onClose,
  currentAttire,
  onSelectAttire,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-950 border border-amber-500/40 rounded-2xl max-w-3xl w-full p-6 shadow-2xl shadow-amber-950/30 flex flex-col gap-5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-950/50">
              <Award className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-tech text-base tracking-wider uppercase text-white font-bold">
                  Space X Bot Attire & Wardrobe
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950/70 border border-amber-500/60 text-amber-300 font-bold uppercase tracking-wider">
                  CLASSIC STYLING
                </span>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Modify the robot&apos;s physical attire, hull materials, and livery in real-time 3D orbit
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

        {/* Attire Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {ATTIRE_OPTIONS.map((attire) => {
            const isSelected = currentAttire === attire.id;
            return (
              <div
                key={attire.id}
                onClick={() => onSelectAttire(attire.id)}
                className={`cursor-pointer rounded-xl p-4 border transition-all duration-300 flex flex-col justify-between relative group ${
                  isSelected
                    ? 'bg-gradient-to-br from-amber-950/60 to-slate-900 border-amber-400 shadow-lg shadow-amber-950/50 ring-1 ring-amber-400/50'
                    : `bg-gradient-to-br ${attire.themeColor} ${attire.borderColor} hover:bg-slate-900/90`
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black/50 border border-slate-700 text-slate-300">
                      {attire.badge}
                    </span>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[11px] font-mono text-amber-300 font-bold bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-500/60">
                        <Check className="w-3.5 h-3.5" />
                        ACTIVE
                      </span>
                    )}
                  </div>

                  <h4 className="font-tech text-sm font-bold uppercase tracking-wide text-white group-hover:text-amber-300 transition-colors">
                    {attire.name}
                  </h4>
                  <p className="text-[11px] font-mono text-slate-400 mb-2 leading-tight">
                    {attire.tagline}
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans mb-3">
                    {attire.description}
                  </p>
                </div>

                <div className="border-t border-slate-800/80 pt-2.5 mt-auto">
                  <span className="text-[10px] font-mono text-slate-500 block uppercase mb-1">
                    Attire Elements:
                  </span>
                  <ul className="text-[11px] font-mono text-slate-300 space-y-1">
                    {attire.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-amber-400 shrink-0" />
                        <span className="truncate">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Changes reflect immediately on the 3D Space X Bot in orbit</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 font-tech text-xs font-bold uppercase tracking-wider text-slate-950 transition-all shadow-md shadow-amber-950/40"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
