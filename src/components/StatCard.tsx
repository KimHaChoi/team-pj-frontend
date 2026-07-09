import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'green' | 'blue' | 'red' | 'yellow' | 'purple' | 'cyan';
  subText: string;
  progress?: number; // Optional bar indicator progress (0-100)
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  subText,
  progress
}) => {
  const colorMap = {
    green: {
      text: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200/65',
      glow: 'shadow-emerald-500/5',
      bar: 'bg-emerald-500'
    },
    blue: {
      text: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-200/65',
      glow: 'shadow-indigo-500/5',
      bar: 'bg-indigo-500'
    },
    red: {
      text: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-200/65',
      glow: 'shadow-rose-500/5',
      bar: 'bg-rose-500'
    },
    yellow: {
      text: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200/65',
      glow: 'shadow-amber-500/5',
      bar: 'bg-amber-500'
    },
    purple: {
      text: 'text-fuchsia-600',
      bg: 'bg-fuchsia-50',
      border: 'border-fuchsia-200/65',
      glow: 'shadow-fuchsia-500/5',
      bar: 'bg-fuchsia-500'
    },
    cyan: {
      text: 'text-cyan-600',
      bg: 'bg-cyan-50',
      border: 'border-cyan-200/65',
      glow: 'shadow-cyan-500/5',
      bar: 'bg-cyan-500'
    }
  };

  const style = colorMap[color] || colorMap.green;

  return (
    <div className={`relative overflow-hidden rounded-2xl border ${style.border} bg-white/70 p-5 backdrop-blur-md shadow-sm transition-all duration-300 hover:translate-y-[-2px] hover:bg-white hover:shadow-md`}>
      {/* Background radial accent glow */}
      <div className={`absolute -right-6 -top-6 h-20 w-20 rounded-full filter blur-2xl opacity-10 ${style.bar}`} />

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold tracking-wider uppercase text-slate-400 font-mono">
            {title}
          </p>
          <h3 className="mt-2 text-3xl font-display font-extrabold tracking-tight text-slate-800">
            {value}
          </h3>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${style.border} ${style.bg} ${style.text}`}>
          {icon}
        </div>
      </div>

      {progress !== undefined && (
        <div className="mt-4">
          <div className="h-1.5 w-full rounded-full bg-slate-100">
            <div
              className={`h-1.5 rounded-full ${style.bar} transition-all duration-500`}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-slate-500">
        <span>{subText}</span>
      </div>
    </div>
  );
};
