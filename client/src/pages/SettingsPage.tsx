import React from 'react';
import { useAppDispatch, useAppSelector } from '../store/index.js';
import {
  setTheme,
  setCrossfade,
  setAutoplay,
  setAudioQuality
} from '../store/slices/settingsSlice.js';
import { addToast } from '../store/slices/uiSlice.js';
import { LocalMusicStore } from '../storage/localMusicStore.js';
import {
  SlidersHorizontal,
  Sun,
  Moon,
  Sparkles,
  Volume2,
  Keyboard,
  HardDrive,
  Trash2
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { theme, crossfade, autoplay, audioQuality } = useAppSelector((state) => state.settings);
  const { localTracks } = useAppSelector((state) => state.library);

  const handleClearCache = async () => {
    await LocalMusicStore.clearAll();
    dispatch(addToast({ message: 'IndexedDB cache cleared successfully', type: 'info' }));
  };

  return (
    <div className="flex flex-col gap-8 pb-16 max-w-3xl">
      {/* Page Title */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Settings</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Customize playback, appearance, audio quality, and local storage.
        </p>
      </div>

      {/* 1. Appearance Section */}
      <section className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 flex flex-col gap-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Sun className="w-4 h-4 text-amber-400" />
          <span>Appearance</span>
        </h2>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Theme Mode</h3>
            <p className="text-xs text-slate-400">Choose between dark aesthetic and bright clean UI.</p>
          </div>

          <div className="flex items-center gap-2 p-1 rounded-2xl bg-white/5 border border-white/10">
            <button
              onClick={() => dispatch(setTheme('dark'))}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                theme === 'dark' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Dark</span>
            </button>
            <button
              onClick={() => dispatch(setTheme('light'))}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                theme === 'light' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Light</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Playback Section */}
      <section className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 flex flex-col gap-6">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-violet-400" />
          <span>Playback Controls</span>
        </h2>

        {/* Crossfade */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Crossfade Songs</h3>
              <p className="text-xs text-slate-400">
                Smoothly fade out the ending song while fading in the next.
              </p>
            </div>
            <span className="text-xs font-bold text-violet-400 font-mono">
              {crossfade === 0 ? 'Off' : `${crossfade}s`}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-500">0s</span>
            <input
              type="range"
              min={0}
              max={12}
              value={crossfade}
              onChange={(e) => dispatch(setCrossfade(parseInt(e.target.value, 10)))}
              className="flex-1 accent-violet-500"
            />
            <span className="text-xs font-mono text-slate-500">12s</span>
          </div>
        </div>

        {/* Autoplay */}
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Autoplay Similar Music</h3>
            <p className="text-xs text-slate-400">
              Keep the music flowing with recommendations when your queue ends.
            </p>
          </div>
          <input
            type="checkbox"
            checked={autoplay}
            onChange={(e) => dispatch(setAutoplay(e.target.checked))}
            className="w-5 h-5 accent-violet-600 rounded cursor-pointer"
          />
        </div>

        {/* Audio Quality */}
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Streaming Quality</h3>
            <p className="text-xs text-slate-400">Select preferred bit-rate.</p>
          </div>

          <select
            value={audioQuality}
            onChange={(e) => dispatch(setAudioQuality(e.target.value as any))}
            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-white outline-none cursor-pointer"
          >
            <option value="standard">Standard (160 kbps)</option>
            <option value="high">High (320 kbps)</option>
            <option value="lossless">Lossless Hi-Fi (FLAC)</option>
          </select>
        </div>
      </section>

      {/* 3. Keyboard Shortcuts Reference (Requirement #32) */}
      <section className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 flex flex-col gap-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Keyboard className="w-4 h-4 text-cyan-400" />
          <span>Keyboard Shortcuts</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02]">
            <span className="text-slate-300">Play / Pause</span>
            <kbd className="px-2 py-1 rounded bg-white/10 font-mono text-slate-200">Space</kbd>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02]">
            <span className="text-slate-300">Seek Backward 5s</span>
            <kbd className="px-2 py-1 rounded bg-white/10 font-mono text-slate-200">← Arrow Left</kbd>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02]">
            <span className="text-slate-300">Seek Forward 5s</span>
            <kbd className="px-2 py-1 rounded bg-white/10 font-mono text-slate-200">→ Arrow Right</kbd>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02]">
            <span className="text-slate-300">Mute / Unmute</span>
            <kbd className="px-2 py-1 rounded bg-white/10 font-mono text-slate-200">M</kbd>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02]">
            <span className="text-slate-300">Next Song</span>
            <kbd className="px-2 py-1 rounded bg-white/10 font-mono text-slate-200">N</kbd>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02]">
            <span className="text-slate-300">Previous Song</span>
            <kbd className="px-2 py-1 rounded bg-white/10 font-mono text-slate-200">P</kbd>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02]">
            <span className="text-slate-300">Like / Save Song</span>
            <kbd className="px-2 py-1 rounded bg-white/10 font-mono text-slate-200">L</kbd>
          </div>
        </div>
      </section>

      {/* 4. Local Storage & Cache */}
      <section className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 flex flex-col gap-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-emerald-400" />
          <span>Local Storage & IndexedDB</span>
        </h2>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">IndexedDB Local Audio Cache</h3>
            <p className="text-xs text-slate-400">
              {localTracks.length} local songs stored in browser storage.
            </p>
          </div>

          <button
            onClick={handleClearCache}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Storage</span>
          </button>
        </div>
      </section>
    </div>
  );
};
