import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/index.js';
import { closeAddToPlaylistModal, setCreatePlaylistModalOpen, addToast } from '../../store/slices/uiSlice.js';
import { api } from '../../services/api.js';
import { IPlaylist } from '../../types/index.js';
import { X, Plus, Check, ListMusic } from 'lucide-react';

export const AddToPlaylistModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAddToPlaylistModalOpen, selectedTrackForPlaylist } = useAppSelector((state) => state.ui);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { userPlaylists } = useAppSelector((state) => state.library);

  const [playlists, setPlaylists] = useState<IPlaylist[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    if (isAddToPlaylistModalOpen) {
      if (isAuthenticated) {
        setLoading(true);
        api.playlists.getAll().then((data) => {
          if (data.playlists) {
            setPlaylists(data.playlists.filter((p) => p.ownerId === user?.id || p.ownerId === 'waveplay-editorial'));
          }
          setLoading(false);
        }).catch(() => setLoading(false));
      } else {
        setPlaylists(userPlaylists);
      }
    }
  }, [isAddToPlaylistModalOpen, isAuthenticated, user, userPlaylists]);

  if (!isAddToPlaylistModalOpen || !selectedTrackForPlaylist) return null;

  const handleClose = () => {
    dispatch(closeAddToPlaylistModal());
  };

  const handleAddTrack = async (playlist: IPlaylist) => {
    setAddingId(playlist.id);
    try {
      if (isAuthenticated) {
        await api.playlists.addTrack(playlist.id, selectedTrackForPlaylist);
      }
      dispatch(addToast({
        message: `Added "${selectedTrackForPlaylist.title}" to ${playlist.name}`,
        type: 'success'
      }));
      handleClose();
    } catch (err: any) {
      dispatch(addToast({ message: err.message || 'Failed to add track', type: 'error' }));
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 text-white">
        <button
          onClick={handleClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold mb-1">Add to Playlist</h3>
        <p className="text-xs text-slate-400 mb-4 truncate">
          Select a playlist to save <strong className="text-slate-200">"{selectedTrackForPlaylist.title}"</strong>
        </p>

        <button
          onClick={() => {
            handleClose();
            dispatch(setCreatePlaylistModalOpen(true));
          }}
          className="w-full flex items-center gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition mb-3 text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-violet-600/30 text-violet-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold">New Playlist</h4>
            <p className="text-xs text-slate-400">Create a new collection</p>
          </div>
        </button>

        <div className="max-h-64 overflow-y-auto pr-1 flex flex-col gap-1.5">
          {loading ? (
            <p className="text-xs text-slate-400 text-center py-4">Loading playlists...</p>
          ) : playlists.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">No playlists found. Create your first one!</p>
          ) : (
            playlists.map((playlist) => {
              const containsTrack = playlist.tracks?.some((t) => t.id === selectedTrackForPlaylist.id);
              return (
                <button
                  key={playlist.id}
                  disabled={containsTrack || addingId === playlist.id}
                  onClick={() => handleAddTrack(playlist)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition text-left disabled:opacity-50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={playlist.coverImage || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80'}
                      alt={playlist.name}
                      className="w-9 h-9 rounded-lg object-cover shrink-0"
                    />
                    <div className="truncate">
                      <p className="text-sm font-medium truncate">{playlist.name}</p>
                      <p className="text-[11px] text-slate-400">{playlist.tracks?.length || 0} songs</p>
                    </div>
                  </div>

                  {containsTrack ? (
                    <span className="text-xs text-emerald-400 flex items-center gap-1 shrink-0 font-medium">
                      <Check className="w-3.5 h-3.5" /> Added
                    </span>
                  ) : (
                    <Plus className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
