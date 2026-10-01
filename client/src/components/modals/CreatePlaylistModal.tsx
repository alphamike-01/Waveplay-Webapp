import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/index.js';
import { setCreatePlaylistModalOpen, addToast } from '../../store/slices/uiSlice.js';
import { addUserPlaylist } from '../../store/slices/librarySlice.js';
import { api } from '../../services/api.js';
import { X, Sparkles, ListMusic } from 'lucide-react';

export const CreatePlaylistModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isCreatePlaylistModalOpen } = useAppSelector((state) => state.ui);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCreatePlaylistModalOpen) return null;

  const handleClose = () => {
    dispatch(setCreatePlaylistModalOpen(false));
    setName('');
    setDescription('');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      if (isAuthenticated) {
        const res = await api.playlists.create({
          name: name.trim(),
          description: description.trim(),
          isPublic
        });
        dispatch(addUserPlaylist(res.playlist));
        dispatch(addToast({ message: `Created playlist "${res.playlist.name}"`, type: 'success' }));
      } else {
        // Guest mode creation
        const guestPlaylist = {
          id: `guest-pl-${Date.now()}`,
          name: name.trim(),
          description: description.trim(),
          coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
          ownerId: 'guest',
          ownerName: 'Guest',
          tracks: [],
          isPublic: false,
          createdAt: new Date().toISOString()
        };
        dispatch(addUserPlaylist(guestPlaylist));
        dispatch(addToast({ message: `Created playlist "${guestPlaylist.name}" (Guest)`, type: 'success' }));
      }
      handleClose();
    } catch (err: any) {
      dispatch(addToast({ message: err.message || 'Failed to create playlist', type: 'error' }));
    } finally {
      setIsSubmitting(false);
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

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-violet-600/20 text-violet-400">
            <ListMusic className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold">New Playlist</h3>
            <p className="text-xs text-slate-400">Assemble your soundtrack</p>
          </div>
        </div>

        <form onSubmit={handleCreate} className="flex flex-col gap-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Playlist Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Late Night Vibes"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-sm text-white placeholder-slate-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Description (Optional)</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Give your playlist a story or vibe..."
              className="w-full px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 text-sm text-white placeholder-slate-500 outline-none transition resize-none"
            />
          </div>

          <div className="flex items-center gap-2.5 pt-1">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-4 h-4 rounded text-violet-600 bg-slate-800 border-slate-700 focus:ring-violet-500"
            />
            <label htmlFor="isPublic" className="text-xs text-slate-300 cursor-pointer">
              Make playlist public in search & profile
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/30 transition disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Creating...' : 'Create Playlist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
