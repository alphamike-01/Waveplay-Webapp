import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/index.js';
import { setAddUrlModalOpen, addToast } from '../../store/slices/uiSlice.js';
import { playTrack, addToQueue } from '../../store/slices/playerSlice.js';
import { api } from '../../services/api.js';
import { ITrack } from '../../types/index.js';
import { X, Globe, Play, Plus, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export const AddUrlModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAddUrlModalOpen } = useAppSelector((state) => state.ui);

  const [url, setUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customArtist, setCustomArtist] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    message?: string;
    suggestedTitle?: string;
    suggestedArtist?: string;
  } | null>(null);

  if (!isAddUrlModalOpen) return null;

  const handleClose = () => {
    dispatch(setAddUrlModalOpen(false));
    setUrl('');
    setCustomTitle('');
    setCustomArtist('');
    setValidationResult(null);
  };

  const handleValidate = async () => {
    if (!url.trim()) return;
    setIsValidating(true);
    setValidationResult(null);

    try {
      const data = await api.audio.validateUrl(url.trim());
      if (data.success && data.playable) {
        setValidationResult({
          valid: true,
          message: 'Audio resource validated and accessible!',
          suggestedTitle: data.suggestedTitle,
          suggestedArtist: data.suggestedArtist
        });
        if (!customTitle && data.suggestedTitle) setCustomTitle(data.suggestedTitle);
        if (!customArtist && data.suggestedArtist) setCustomArtist(data.suggestedArtist);
      } else {
        setValidationResult({
          valid: false,
          message: data.message || 'The specified URL does not appear to be a supported, playable audio stream.'
        });
      }
    } catch (err: any) {
      setValidationResult({
        valid: false,
        message: err.message || 'Could not validate URL. Check CORS or network reachability.'
      });
    } finally {
      setIsValidating(false);
    }
  };

  const buildTrack = (): ITrack => {
    return {
      id: `remote-${Date.now()}`,
      title: customTitle.trim() || validationResult?.suggestedTitle || 'Web Audio Stream',
      artist: customArtist.trim() || validationResult?.suggestedArtist || 'Remote Source',
      album: 'Web Stream',
      duration: 0,
      coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
      audioUrl: url.trim(),
      sourceType: 'REMOTE',
      genre: 'Web Audio',
      releaseDate: new Date().toISOString().split('T')[0],
      playCount: 0
    };
  };

  const handlePlayNow = () => {
    const track = buildTrack();
    dispatch(playTrack({ track }));
    dispatch(addToast({ message: `Playing "${track.title}"`, type: 'success' }));
    handleClose();
  };

  const handleAddToQueue = () => {
    const track = buildTrack();
    dispatch(addToQueue(track));
    dispatch(addToast({ message: `Added "${track.title}" to queue`, type: 'info' }));
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 sm:p-8 text-white">
        <button
          onClick={handleClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-violet-600/20 text-violet-400">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Play Music from URL</h3>
            <p className="text-xs text-slate-400">
              Stream any direct audio file (MP3, WAV, OGG, M4A, FLAC) from the web.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Direct Audio URL</label>
            <div className="flex gap-2">
              <input
                type="url"
                required
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setValidationResult(null);
                }}
                placeholder="https://example.com/audio/song.mp3"
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-sm text-white placeholder-slate-500 outline-none transition"
              />
              <button
                type="button"
                onClick={handleValidate}
                disabled={isValidating || !url.trim()}
                className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-medium text-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                {isValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Test URL'}
              </button>
            </div>
          </div>

          {/* Validation Feedback */}
          {validationResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                validationResult.valid
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
              }`}
            >
              {validationResult.valid ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-semibold">{validationResult.message}</p>
                {!validationResult.valid && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    Note: WavePlay respects browser security rules (CORS) and rights protection. Services like YouTube or Spotify cannot be streamed directly via raw URL.
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Track Title (Optional)</label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Song Title"
                className="w-full px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-500 outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Artist Name (Optional)</label>
              <input
                type="text"
                value={customArtist}
                onChange={(e) => setCustomArtist(e.target.value)}
                placeholder="Artist Name"
                className="w-full px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-500 outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold transition"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleAddToQueue}
              disabled={!url.trim()}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Queue</span>
            </button>

            <button
              type="button"
              onClick={handlePlayNow}
              disabled={!url.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white text-xs font-semibold shadow-lg shadow-violet-600/30 transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Play Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
