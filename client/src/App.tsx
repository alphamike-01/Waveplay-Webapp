import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './store/index.js';
import { fetchCurrentUser } from './store/slices/authSlice.js';
import { fetchLibrary } from './store/slices/librarySlice.js';

// Layout & Core
import { Sidebar } from './components/layout/Sidebar.js';
import { TopBar } from './components/layout/TopBar.js';
import { BottomNav } from './components/layout/BottomNav.js';
import { PlayerBar } from './components/player/PlayerBar.js';
import { MiniPlayer } from './components/player/MiniPlayer.js';
import { QueueDrawer } from './components/player/QueueDrawer.js';
import { AudioProvider } from './components/player/AudioProvider.js';

// Modals & Common
import { AuthModal } from './components/modals/AuthModal.js';
import { AddUrlModal } from './components/modals/AddUrlModal.js';
import { AddToPlaylistModal } from './components/modals/AddToPlaylistModal.js';
import { CreatePlaylistModal } from './components/modals/CreatePlaylistModal.js';
import { ToastContainer } from './components/common/ToastContainer.js';

// Pages
import { HomePage } from './pages/HomePage.js';
import { SearchPage } from './pages/SearchPage.js';
import { LibraryPage } from './pages/LibraryPage.js';
import { LikedPage } from './pages/LikedPage.js';
import { PlaylistPage } from './pages/PlaylistPage.js';
import { AlbumPage } from './pages/AlbumPage.js';
import { ArtistPage } from './pages/ArtistPage.js';
import { LocalMusicPage } from './pages/LocalMusicPage.js';
import { HistoryPage } from './pages/HistoryPage.js';
import { NowPlayingPage } from './pages/NowPlayingPage.js';
import { SettingsPage } from './pages/SettingsPage.js';
import { ProfilePage } from './pages/ProfilePage.js';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentTrack } = useAppSelector((state) => state.player);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0c0d12] text-slate-100 font-sans">
      {/* Desktop Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <TopBar />
        <main
          className={`flex-1 overflow-y-auto px-4 sm:px-8 py-6 ${
            currentTrack ? 'pb-32 md:pb-28' : 'pb-20 md:pb-8'
          }`}
        >
          {children}
        </main>
      </div>

      {/* Persistent Audio Player Elements */}
      <PlayerBar />
      <MiniPlayer />
      <BottomNav />
      <QueueDrawer />

      {/* Modals & Global Notifications */}
      <AuthModal />
      <AddUrlModal />
      <AddToPlaylistModal />
      <CreatePlaylistModal />
      <ToastContainer />
    </div>
  );
};

export const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { theme } = useAppSelector((state) => state.settings);

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    dispatch(fetchCurrentUser());
    dispatch(fetchLibrary());
  }, []);

  return (
    <BrowserRouter>
      <AudioProvider>
        <MainLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/liked" element={<LikedPage />} />
            <Route path="/playlists" element={<LibraryPage />} />
            <Route path="/playlist/:id" element={<PlaylistPage />} />
            <Route path="/album/:id" element={<AlbumPage />} />
            <Route path="/artist/:id" element={<ArtistPage />} />
            <Route path="/local-music" element={<LocalMusicPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/now-playing" element={<NowPlayingPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MainLayout>
      </AudioProvider>
    </BrowserRouter>
  );
};

export default App;
