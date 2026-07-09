import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string; // Standard background color string or class
  subText?: string;
  description?: string; // Alias for subtext to support dashboard schema
  progress?: number; // Optional bar indicator progress (0-100)
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color = 'bg-[#0284c7]',
  subText,
  description,
  progress
}) => {
  const displaySubText = subText || description || '';

  return (
    <div className="portal-card portal-card-hover p-5 flex flex-col justify-between relative overflow-hidden bg-white">
      
      <div className="flex items-center justify-between gap-2.5">
        <div>
          <p className="text-[10px] font-extrabold tracking-wider uppercase text-slate-400 font-mono leading-none">
            {title}
          </p>
          <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-800">
            {value}
          </h3>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
          {icon}
        </div>
      </div>

      {progress !== undefined && (
        <div className="mt-4">
          <div className="h-1.5 w-full rounded-full bg-slate-100 border border-slate-200/40">
            <div
              className={`h-1.5 rounded-full ${color.startsWith('bg-') ? color : 'bg-[#0284c7]'} transition-all duration-500`}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>
      )}

      {displaySubText && (
        <div className="mt-3.5 flex items-center justify-between text-[11px] font-bold text-slate-500 font-mono leading-none">
          <span>{displaySubText}</span>
        </div>
      )}
    </div>
  );
};
