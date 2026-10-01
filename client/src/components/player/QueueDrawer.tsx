import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store/index.js';
import { setQueueOpen, addToast } from '../../store/slices/uiSlice.js';
import {
  playTrack,
  removeFromQueue,
  clearQueue,
  reorderQueue
} from '../../store/slices/playerSlice.js';
import { formatDuration } from '../cards/TrackRow.js';
import { X, Trash2, ArrowUp, ArrowDown, ListMusic, Music } from 'lucide-react';

export const QueueDrawer: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isQueueOpen } = useAppSelector((state) => state.ui);
  const { currentTrack, queue, currentIndex } = useAppSelector((state) => state.player);

  if (!isQueueOpen) return null;

  const nowPlaying = currentTrack;
  const nextTracks = queue.slice(currentIndex + 1);

  const handleMoveUp = (indexInNext: number) => {
    if (indexInNext === 0) return;
    const actualFrom = currentIndex + 1 + indexInNext;
    const actualTo = actualFrom - 1;
    dispatch(reorderQueue({ fromIndex: actualFrom, toIndex: actualTo }));
  };

  const handleMoveDown = (indexInNext: number) => {
    if (indexInNext === nextTracks.length - 1) return;
    const actualFrom = currentIndex + 1 + indexInNext;
    const actualTo = actualFrom + 1;
    dispatch(reorderQueue({ fromIndex: actualFrom, toIndex: actualTo }));
  };

  const handleRemove = (indexInNext: number) => {
    const actualIndex = currentIndex + 1 + indexInNext;
    dispatch(removeFromQueue(actualIndex));
    dispatch(addToast({ message: 'Track removed from queue', type: 'info' }));
  };

  const handleClear = () => {
    dispatch(clearQueue());
    dispatch(addToast({ message: 'Queue cleared', type: 'info' }));
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md h-full bg-slate-900/95 backdrop-blur-2xl border-l border-white/10 shadow-2xl flex flex-col text-white animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <ListMusic className="w-5 h-5 text-violet-400" />
            <h3 className="text-lg font-bold">Play Queue</h3>
          </div>
          <div className="flex items-center gap-2">
            {nextTracks.length > 0 && (
              <button
                onClick={handleClear}
                className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
              >
                Clear Next
              </button>
            )}
            <button
              onClick={() => dispatch(setQueueOpen(false))}
              aria-label="Close queue"
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
          {/* Section: Now Playing */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Now Playing
            </h4>
            {nowPlaying ? (
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-violet-600/15 border border-violet-500/30">
                <img
                  src={
                    nowPlaying.coverImage ||
                    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80'
                  }
                  alt={nowPlaying.title}
                  className="w-12 h-12 rounded-xl object-cover shrink-0 shadow-md"
                />
                <div className="min-w-0 flex-1">
                  <h5 className="text-sm font-bold text-violet-300 truncate">{nowPlaying.title}</h5>
                  <p className="text-xs text-slate-400 truncate">{nowPlaying.artist}</p>
                </div>
                <div className="flex items-end gap-[2px] h-4 pr-1">
                  <span className="sound-bar" />
                  <span className="sound-bar" />
                  <span className="sound-bar" />
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No track currently playing</p>
            )}
          </div>

          {/* Section: Next Up */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Next Up ({nextTracks.length})
              </h4>
            </div>

            {nextTracks.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-white/[0.02] border border-white/5 text-center text-slate-500">
                <Music className="w-8 h-8 mb-2 opacity-40 text-violet-400" />
                <p className="text-xs">Your queue is empty.</p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Play an album or add songs from context menus!
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {nextTracks.map((track, i) => (
                  <div
                    key={`${track.id}-${i}`}
                    className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition border border-transparent hover:border-white/5"
                  >
                    <div
                      onClick={() =>
                        dispatch(playTrack({ track, queue, index: currentIndex + 1 + i }))
                      }
                      className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                    >
                      <span className="text-xs font-mono text-slate-500 w-4 text-center">
                        {i + 1}
                      </span>
                      <img
                        src={
                          track.coverImage ||
                          'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80'
                        }
                        alt={track.title}
                        className="w-10 h-10 rounded-lg object-cover shrink-0"
                      />
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="text-xs font-semibold text-white truncate group-hover:text-violet-400 transition">
                          {track.title}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">{track.artist}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[11px] font-mono text-slate-500 mr-1">
                        {formatDuration(track.duration)}
                      </span>

                      {/* Reorder Buttons */}
                      <button
                        onClick={() => handleMoveUp(i)}
                        disabled={i === 0}
                        aria-label="Move track up"
                        className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-20 transition"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleMoveDown(i)}
                        disabled={i === nextTracks.length - 1}
                        aria-label="Move track down"
                        className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-20 transition"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemove(i)}
                        aria-label="Remove from queue"
                        className="p-1 rounded text-slate-400 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
