import { ITrack } from '../../types/index.js';

export interface AudioEngineCallbacks {
  onTimeUpdate: (currentTime: number) => void;
  onDurationChange: (duration: number) => void;
  onPlayStateChange: (isPlaying: boolean) => void;
  onLoadingChange: (isLoading: boolean) => void;
  onTrackEnded: () => void;
  onError: (errorMessage: string) => void;
}

export class AudioEngine {
  private primaryAudio: HTMLAudioElement;
  private secondaryAudio: HTMLAudioElement;
  private activeElement: 'primary' | 'secondary' = 'primary';
  private callbacks: AudioEngineCallbacks;
  private currentTrack: ITrack | null = null;
  private crossfadeDuration: number = 0; // seconds
  private crossfadeTimer: number | null = null;
  private isCrossfading: boolean = false;
  private crossfadeTriggeredForTrack: boolean = false;
  private currentVolume: number = 0.8;
  private isMuted: boolean = false;

  constructor(callbacks: AudioEngineCallbacks) {
    this.callbacks = callbacks;
    this.primaryAudio = new Audio();
    this.secondaryAudio = new Audio();

    this.setupAudioElement(this.primaryAudio, 'primary');
    this.setupAudioElement(this.secondaryAudio, 'secondary');
    this.setupMediaSession();
  }

  private getActiveAudio(): HTMLAudioElement {
    return this.activeElement === 'primary' ? this.primaryAudio : this.secondaryAudio;
  }

  private getInactiveAudio(): HTMLAudioElement {
    return this.activeElement === 'primary' ? this.secondaryAudio : this.primaryAudio;
  }

  private setupAudioElement(audio: HTMLAudioElement, label: 'primary' | 'secondary') {
    audio.preload = 'auto';

    audio.addEventListener('timeupdate', () => {
      if (this.activeElement === label) {
        this.callbacks.onTimeUpdate(audio.currentTime);

        // Crossfade trigger ONLY when naturally reaching track end after having played significant portion
        if (
          this.crossfadeDuration > 0 &&
          !this.isCrossfading &&
          !this.crossfadeTriggeredForTrack &&
          audio.duration > 10 &&
          audio.currentTime > 5 &&
          audio.duration - audio.currentTime <= this.crossfadeDuration
        ) {
          this.crossfadeTriggeredForTrack = true;
          this.callbacks.onTrackEnded();
        }
      }
    });

    audio.addEventListener('loadedmetadata', () => {
      if (this.activeElement === label) {
        this.callbacks.onDurationChange(audio.duration || 0);
      }
    });

    audio.addEventListener('durationchange', () => {
      if (this.activeElement === label) {
        this.callbacks.onDurationChange(audio.duration || 0);
      }
    });

    audio.addEventListener('waiting', () => {
      if (this.activeElement === label) {
        this.callbacks.onLoadingChange(true);
      }
    });

    audio.addEventListener('playing', () => {
      if (this.activeElement === label) {
        this.callbacks.onLoadingChange(false);
        this.callbacks.onPlayStateChange(true);
      }
    });

    audio.addEventListener('pause', () => {
      if (this.activeElement === label && !this.isCrossfading) {
        this.callbacks.onPlayStateChange(false);
      }
    });

    audio.addEventListener('ended', () => {
      if (this.activeElement === label && !this.isCrossfading) {
        this.callbacks.onTrackEnded();
      }
    });

    audio.addEventListener('error', () => {
      if (this.activeElement === label) {
        this.callbacks.onLoadingChange(false);
        this.callbacks.onPlayStateChange(false);

        const code = audio.error?.code;
        let msg = 'Unable to play this track.';
        if (code === 2) {
          msg = 'Network error: Audio stream could not be downloaded.';
        } else if (code === 3) {
          msg = 'Codec error: Audio format is not supported by your browser.';
        } else if (code === 4) {
          msg = 'Playback error: The audio resource is unavailable or access was blocked.';
        }
        console.warn(`[AudioEngine] Error on ${label}:`, audio.error);
        this.callbacks.onError(msg);
      }
    });
  }

  public setCrossfadeDuration(seconds: number) {
    this.crossfadeDuration = Math.max(0, Math.min(12, seconds));
  }

  public async loadTrack(track: ITrack, autoPlay: boolean = true) {
    this.currentTrack = track;
    this.crossfadeTriggeredForTrack = false;

    // Cancel any active crossfade transition
    if (this.crossfadeTimer) {
      clearInterval(this.crossfadeTimer);
      this.crossfadeTimer = null;
      this.isCrossfading = false;
    }

    // Determine playable URL: for local files, renew object URL if file is attached
    let playableUrl = track.audioUrl;
    if (track.sourceType === 'LOCAL' && track.localFile) {
      try {
        playableUrl = URL.createObjectURL(track.localFile);
      } catch (e) {
        playableUrl = track.audioUrl;
      }
    }

    // In normal click/play navigation, use the active audio element directly
    const target = this.getActiveAudio();
    const inactive = this.getInactiveAudio();

    // Stop inactive element
    inactive.pause();
    inactive.removeAttribute('src');
    inactive.load();

    this.callbacks.onLoadingChange(true);

    // For blob: URLs, do not set crossorigin (prevents browser security errors on local files)
    if (playableUrl.startsWith('blob:')) {
      target.removeAttribute('crossorigin');
    }

    target.src = playableUrl;
    target.currentTime = 0;
    target.volume = this.isMuted ? 0 : this.currentVolume;
    target.load();

    this.updateMediaSessionMetadata(track);

    if (autoPlay) {
      try {
        await target.play();
        this.callbacks.onPlayStateChange(true);
      } catch (err: any) {
        console.warn('[AudioEngine] Play prevented by browser policy:', err.message);
        this.callbacks.onPlayStateChange(false);
      }
    }
  }

  public async play(): Promise<void> {
    const audio = this.getActiveAudio();
    if (!audio.src) return;
    try {
      await audio.play();
      this.callbacks.onPlayStateChange(true);
    } catch (err: any) {
      console.warn('[AudioEngine] Play failed:', err.message);
      this.callbacks.onError('Playback was prevented by browser policy. Click anywhere to interact.');
    }
  }

  public pause(): void {
    const audio = this.getActiveAudio();
    audio.pause();
    this.callbacks.onPlayStateChange(false);
  }

  public seek(seconds: number): void {
    const audio = this.getActiveAudio();
    if (isFinite(seconds)) {
      audio.currentTime = Math.max(0, Math.min(audio.duration || 0, seconds));
    }
  }

  public setVolume(volume: number): void {
    const vol = Math.max(0, Math.min(1, volume));
    this.currentVolume = vol;
    if (!this.isMuted) {
      this.primaryAudio.volume = vol;
      this.secondaryAudio.volume = vol;
    }
  }

  public setMuted(isMuted: boolean): void {
    this.isMuted = isMuted;
    this.primaryAudio.muted = isMuted;
    this.secondaryAudio.muted = isMuted;
    if (!isMuted) {
      this.primaryAudio.volume = this.currentVolume;
      this.secondaryAudio.volume = this.currentVolume;
    }
  }

  public setPlaybackRate(rate: number): void {
    const r = Math.max(0.5, Math.min(2.0, rate));
    this.primaryAudio.playbackRate = r;
    this.secondaryAudio.playbackRate = r;
  }

  // Web Media Session API integration
  private setupMediaSession() {
    if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
      try {
        navigator.mediaSession.setActionHandler('play', () => this.play());
        navigator.mediaSession.setActionHandler('pause', () => this.pause());
        navigator.mediaSession.setActionHandler('seekbackward', (details) => {
          const skip = details.seekOffset || 10;
          this.seek(this.getActiveAudio().currentTime - skip);
        });
        navigator.mediaSession.setActionHandler('seekforward', (details) => {
          const skip = details.seekOffset || 10;
          this.seek(this.getActiveAudio().currentTime + skip);
        });
      } catch (e) {
        // Ignored if browser media session unsupported
      }
    }
  }

  public setMediaSessionAction(action: MediaSessionAction, handler: MediaSessionActionHandler | null) {
    if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch (e) {
        // Unsupported action on current browser
      }
    }
  }

  private updateMediaSessionMetadata(track: ITrack) {
    if (typeof window !== 'undefined' && 'mediaSession' in navigator && window.MediaMetadata) {
      try {
        navigator.mediaSession.metadata = new window.MediaMetadata({
          title: track.title,
          artist: track.artist,
          album: track.album || 'WavePlay Music',
          artwork: [
            {
              src: track.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
              sizes: '512x512',
              type: 'image/jpeg'
            }
          ]
        });
      } catch (e) {
        // Ignore metadata error
      }
    }
  }

  public destroy() {
    if (this.crossfadeTimer) {
      clearInterval(this.crossfadeTimer);
    }
    this.primaryAudio.pause();
    this.secondaryAudio.pause();
    this.primaryAudio.removeAttribute('src');
    this.secondaryAudio.removeAttribute('src');
    this.primaryAudio.load();
    this.secondaryAudio.load();
  }
}
