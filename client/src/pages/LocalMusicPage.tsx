import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/index.js';
import { playTrack } from '../store/slices/playerSlice.js';
import { addLocalTracks, setLocalTracks, removeLocalTrack } from '../store/slices/librarySlice.js';
import { addToast } from '../store/slices/uiSlice.js';
import { LocalMusicStore } from '../storage/localMusicStore.js';
import { ITrack } from '../types/index.js';
import { TrackRow } from '../components/cards/TrackRow.js';
import {
  UploadCloud,
  FileMusic,
  Play,
  Shuffle,
  Trash2,
  Plus
} from 'lucide-react';

export const LocalMusicPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { localTracks } = useAppSelector((state) => state.library);

  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load persisted local tracks from IndexedDB on initial mount
  useEffect(() => {
    if (localTracks.length === 0) {
      LocalMusicStore.loadStoredLocalTracks().then((tracks) => {
        if (tracks.length > 0) {
          dispatch(setLocalTracks(tracks));
        }
      });
    }
  }, []);

  const handleFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);
    try {
      const added = await LocalMusicStore.addLocalFiles(files);
      if (added.length > 0) {
        dispatch(addLocalTracks(added));
        dispatch(addToast({
          message: `Added ${added.length} local audio track${added.length > 1 ? 's' : ''} to library!`,
          type: 'success'
        }));
      } else {
        dispatch(addToast({
          message: 'No valid audio files found in selection.',
          type: 'info'
        }));
      }
    } catch (err) {
      console.error('Error processing local audio files:', err);
      dispatch(addToast({ message: 'Failed to process files.', type: 'error' }));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handlePlayAll = () => {
    if (localTracks.length > 0) {
      dispatch(playTrack({ track: localTracks[0], queue: localTracks, index: 0 }));
    }
  };

  const handleShufflePlay = () => {
    if (localTracks.length > 0) {
      const rand = Math.floor(Math.random() * localTracks.length);
      dispatch(playTrack({ track: localTracks[rand], queue: localTracks, index: rand }));
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Remove all local tracks from your browser storage?')) return;
    await LocalMusicStore.clearAll();
    dispatch(setLocalTracks([]));
    dispatch(addToast({ message: 'Cleared local music library', type: 'info' }));
  };

  return (
    <div className="flex flex-col gap-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <FileMusic className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Local Music</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Play MP3, WAV, OGG, M4A, FLAC, and AAC files directly from your computer. Files remain local to your device.
          </p>
        </div>

        {localTracks.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add More Files</span>
            </button>

            <button
              onClick={handleClearAll}
              className="p-2 rounded-full text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
              aria-label="Clear local library"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`group relative flex flex-col items-center justify-center p-8 sm:p-12 rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer text-center select-none ${
          isDragging
            ? 'border-violet-500 bg-violet-500/10 scale-[1.01]'
            : 'border-white/10 hover:border-violet-500/40 bg-white/[0.02] hover:bg-white/[0.04]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac,.aac,.weba"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />

        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600/30 to-cyan-500/30 text-violet-400 flex items-center justify-center mb-4 group-hover:scale-110 transition duration-300">
          <UploadCloud className="w-8 h-8" />
        </div>

        <h3 className="text-base sm:text-lg font-bold text-white mb-1">
          {isProcessing ? 'Reading audio metadata...' : 'Drop your audio files here'}
        </h3>
        <p className="text-xs text-slate-400 max-w-sm mb-4">
          Drag & drop audio files or click to browse. Supported formats: MP3, WAV, FLAC, M4A, OGG, AAC.
        </p>

        <button
          type="button"
          className="px-5 py-2 rounded-full bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition shadow-md"
        >
          Select Audio Files
        </button>
      </div>

      {/* Local Tracks Actions & List */}
      {localTracks.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 py-2">
            <button
              onClick={handlePlayAll}
              aria-label="Play all local tracks"
              className="w-13 h-13 rounded-full bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center shadow-lg shadow-violet-600/40 hover:scale-105 active:scale-95 transition cursor-pointer"
            >
              <Play className="w-6 h-6 fill-current ml-0.5" />
            </button>

            <button
              onClick={handleShufflePlay}
              aria-label="Shuffle local tracks"
              className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <Shuffle className="w-5 h-5" />
            </button>

            <span className="text-xs font-semibold text-slate-400">
              {localTracks.length} local track{localTracks.length > 1 ? 's' : ''} saved in browser
            </span>
          </div>

          <div className="flex flex-col gap-1">
            {localTracks.map((track, i) => (
              <TrackRow
                key={track.id}
                track={track}
                index={i}
                queueContext={localTracks}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
