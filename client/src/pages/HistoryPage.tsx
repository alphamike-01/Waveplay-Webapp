import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/index.js';
import { fetchPlaybackHistory, clearHistory } from '../store/slices/librarySlice.js';
import { playTrack } from '../store/slices/playerSlice.js';
import { addToast } from '../store/slices/uiSlice.js';
import { IPlaybackHistory, ITrack } from '../types/index.js';
import { TrackRow } from '../components/cards/TrackRow.js';
import { History, Trash2, Clock, Music } from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { history } = useAppSelector((state) => state.library);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchPlaybackHistory());
    }
  }, [isAuthenticated, dispatch]);

  const handleClearHistory = () => {
    dispatch(clearHistory());
    dispatch(addToast({ message: 'Listening history cleared', type: 'info' }));
  };

  // Group history by date periods
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 86400000;
  const last7DaysStart = todayStart - 7 * 86400000;

  const todayList: IPlaybackHistory[] = [];
  const yesterdayList: IPlaybackHistory[] = [];
  const last7DaysList: IPlaybackHistory[] = [];
  const olderList: IPlaybackHistory[] = [];

  history.forEach((h) => {
    const time = new Date(h.playedAt).getTime();
    if (time >= todayStart) todayList.push(h);
    else if (time >= yesterdayStart) yesterdayList.push(h);
    else if (time >= last7DaysStart) last7DaysList.push(h);
    else olderList.push(h);
  });

  const renderSection = (title: string, list: IPlaybackHistory[]) => {
    if (list.length === 0) return null;
    const tracks = list.map((h) => h.track).filter(Boolean) as ITrack[];
    if (tracks.length === 0) return null;

    return (
      <div key={title} className="flex flex-col gap-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-violet-400 mt-2">
          {title} ({tracks.length})
        </h3>
        <div className="flex flex-col gap-1">
          {tracks.map((track, i) => (
            <TrackRow
              key={`${track.id}-${i}-${title}`}
              track={track}
              index={i}
              queueContext={tracks}
            />
          ))}
        </div>
      </div>
    );
  };

  const hasHistory = history.length > 0;

  return (
    <div className="flex flex-col gap-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Listening History</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Tracks you've recently played on WavePlay.
            </p>
          </div>
        </div>

        {hasHistory && (
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 text-xs font-semibold transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {!hasHistory ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400 rounded-3xl bg-white/[0.02] border border-white/5">
          <Clock className="w-12 h-12 mb-3 text-violet-400 opacity-40" />
          <h3 className="text-lg font-bold text-white mb-1">No playback history yet</h3>
          <p className="text-xs text-slate-500 max-w-sm">
            Songs you stream will automatically appear in your listening timeline.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {renderSection('Today', todayList)}
          {renderSection('Yesterday', yesterdayList)}
          {renderSection('Previous 7 Days', last7DaysList)}
          {renderSection('Older', olderList)}
        </div>
      )}
    </div>
  );
};
