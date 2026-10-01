import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
}

export const WavePlayLogo: React.FC<LogoProps> = ({ size = 'md', showTagline = false, className = '' }) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* WavePlay Sonic Crest Icon */}
      <div
        className={`${iconSizes[size]} rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 p-[2px] shadow-lg shadow-violet-500/25 flex items-center justify-center shrink-0`}
      >
        <div className="w-full h-full bg-[#0d0e12] rounded-[10px] flex items-center justify-center gap-[2.5px] px-1.5">
          <span className="w-[3px] h-3 bg-gradient-to-t from-violet-500 to-cyan-300 rounded-full animate-pulse" />
          <span className="w-[3px] h-5 bg-gradient-to-t from-violet-500 to-cyan-300 rounded-full animate-pulse [animation-delay:200ms]" />
          <span className="w-[3px] h-4 bg-gradient-to-t from-violet-500 to-cyan-300 rounded-full animate-pulse [animation-delay:400ms]" />
          <span className="w-[3px] h-2 bg-gradient-to-t from-violet-500 to-cyan-300 rounded-full animate-pulse [animation-delay:600ms]" />
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center">
          <span className={`font-black tracking-tight ${textSizes[size]} bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent`}>
            Wave
          </span>
          <span className={`font-black tracking-tight ${textSizes[size]} bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent`}>
            Play
          </span>
        </div>
        {showTagline && (
          <span className="text-[10px] font-medium tracking-wider uppercase text-slate-400 -mt-0.5">
            Your Music. Your Way.
          </span>
        )}
      </div>
    </div>
  );
};
