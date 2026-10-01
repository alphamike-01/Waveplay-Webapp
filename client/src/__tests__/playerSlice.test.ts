import { describe, it, expect } from 'vitest';
import playerReducer, {
  playTrack,
  togglePlay,
  playNext,
  playPrevious,
  seekTo,
  setVolume,
  toggleMute,
  toggleShuffle,
  cycleRepeatMode,
  addToQueue,
  removeFromQueue,
  clearQueue
} from '../store/slices/playerSlice.js';
import { ITrack } from '../types/index.js';

const mockTrack1: ITrack = {
  id: 'track-1',
  title: 'Quantum Velocity',
  artist: 'Aetheria',
  album: 'Neon Odyssey',
  duration: 372,
  audioUrl: 'https://example.com/audio1.mp3',
  sourceType: 'STREAM',
  genre: 'Synthwave'
};

const mockTrack2: ITrack = {
  id: 'track-2',
  title: 'Neon Starlight',
  artist: 'Aetheria',
  album: 'Neon Odyssey',
  duration: 423,
  audioUrl: 'https://example.com/audio2.mp3',
  sourceType: 'STREAM',
  genre: 'Synthwave'
};

describe('Player Slice Unit Tests', () => {
  it('should initialize with default state', () => {
    const state = playerReducer(undefined, { type: 'unknown' });
    expect(state.currentTrack).toBeNull();
    expect(state.isPlaying).toBe(false);
    expect(state.volume).toBeGreaterThan(0);
    expect(state.repeatMode).toBe('NONE');
    expect(state.shuffle).toBe(false);
  });

  it('should handle playTrack action and set queue', () => {
    const initialState = playerReducer(undefined, { type: 'unknown' });
    const nextState = playerReducer(
      initialState,
      playTrack({ track: mockTrack1, queue: [mockTrack1, mockTrack2], index: 0 })
    );

    expect(nextState.currentTrack?.id).toBe('track-1');
    expect(nextState.isPlaying).toBe(true);
    expect(nextState.queue.length).toBe(2);
    expect(nextState.currentIndex).toBe(0);
  });

  it('should toggle play / pause state', () => {
    let state = playerReducer(undefined, playTrack({ track: mockTrack1 }));
    expect(state.isPlaying).toBe(true);

    state = playerReducer(state, togglePlay());
    expect(state.isPlaying).toBe(false);

    state = playerReducer(state, togglePlay());
    expect(state.isPlaying).toBe(true);
  });

  it('should handle playNext and playPrevious', () => {
    let state = playerReducer(
      undefined,
      playTrack({ track: mockTrack1, queue: [mockTrack1, mockTrack2], index: 0 })
    );

    state = playerReducer(state, playNext());
    expect(state.currentTrack?.id).toBe('track-2');
    expect(state.currentIndex).toBe(1);

    // With currentTime <= 3, playPrevious moves to track-1
    state = playerReducer(state, playPrevious());
    expect(state.currentTrack?.id).toBe('track-1');
    expect(state.currentIndex).toBe(0);
  });

  it('should cycle repeat modes NONE -> ALL -> ONE -> NONE', () => {
    let state = playerReducer(undefined, { type: 'unknown' });
    expect(state.repeatMode).toBe('NONE');

    state = playerReducer(state, cycleRepeatMode());
    expect(state.repeatMode).toBe('ALL');

    state = playerReducer(state, cycleRepeatMode());
    expect(state.repeatMode).toBe('ONE');

    state = playerReducer(state, cycleRepeatMode());
    expect(state.repeatMode).toBe('NONE');
  });

  it('should toggle shuffle and maintain current track in queue', () => {
    let state = playerReducer(
      undefined,
      playTrack({ track: mockTrack1, queue: [mockTrack1, mockTrack2], index: 0 })
    );
    expect(state.shuffle).toBe(false);

    state = playerReducer(state, toggleShuffle());
    expect(state.shuffle).toBe(true);
    expect(state.queue.length).toBe(2);
    expect(state.queue[0].id).toBe('track-1');

    state = playerReducer(state, toggleShuffle());
    expect(state.shuffle).toBe(false);
  });

  it('should manage queue additions and removals', () => {
    let state = playerReducer(undefined, playTrack({ track: mockTrack1 }));
    state = playerReducer(state, addToQueue(mockTrack2));
    expect(state.queue.length).toBe(2);

    state = playerReducer(state, removeFromQueue(1));
    expect(state.queue.length).toBe(1);

    state = playerReducer(state, clearQueue());
    expect(state.queue.length).toBe(1); // Clears next items but keeps playing track
  });

  it('should update volume and mute state', () => {
    let state = playerReducer(undefined, setVolume(0.5));
    expect(state.volume).toBe(0.5);
    expect(state.isMuted).toBe(false);

    state = playerReducer(state, toggleMute());
    expect(state.isMuted).toBe(true);

    state = playerReducer(state, toggleMute());
    expect(state.isMuted).toBe(false);
  });

  it('should seek to specific timestamp', () => {
    let state = playerReducer(undefined, seekTo(45));
    expect(state.currentTime).toBe(45);
    expect(state.seekTarget).toBe(45);
  });
});
