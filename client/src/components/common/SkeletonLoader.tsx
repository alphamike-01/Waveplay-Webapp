import React from 'react';

export const CardSkeleton: React.FC = () => (
  <div className="flex flex-col p-4 rounded-2xl bg-white/5 border border-white/5 animate-pulse">
    <div className="w-full aspect-square rounded-xl bg-white/10 mb-4" />
    <div className="h-4 bg-white/10 rounded-md w-3/4 mb-2" />
    <div className="h-3 bg-white/5 rounded-md w-1/2" />
  </div>
);

export const RowSkeleton: React.FC = () => (
  <div className="flex items-center gap-4 px-4 py-3 rounded-xl bg-white/5 border border-white/5 animate-pulse mb-2">
    <div className="w-6 h-4 bg-white/10 rounded" />
    <div className="w-12 h-12 rounded-lg bg-white/10 shrink-0" />
    <div className="flex-1">
      <div className="h-4 bg-white/10 rounded w-1/3 mb-2" />
      <div className="h-3 bg-white/5 rounded w-1/4" />
    </div>
    <div className="w-16 h-4 bg-white/10 rounded hidden md:block" />
    <div className="w-10 h-4 bg-white/10 rounded" />
  </div>
);

export const HeroSkeleton: React.FC = () => (
  <div className="flex flex-col md:flex-row items-end gap-6 p-8 rounded-3xl bg-white/5 animate-pulse mb-8">
    <div className="w-48 h-48 rounded-2xl bg-white/10 shrink-0" />
    <div className="flex-1 w-full">
      <div className="h-4 bg-white/10 rounded w-24 mb-3" />
      <div className="h-10 bg-white/10 rounded w-2/3 mb-4" />
      <div className="h-4 bg-white/5 rounded w-1/2" />
    </div>
  </div>
);
