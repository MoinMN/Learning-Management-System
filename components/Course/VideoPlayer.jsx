'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Play, Pause,
  Volume2, VolumeX,
  Maximize, Minimize
} from 'lucide-react';
import { FaForward, FaBackward } from "react-icons/fa"


export default function SecureVideoPlayer({ videoUrl }) {
  const videoRef = useRef(null);
  const videoContainerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Initialize video and set up event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    const handleCanPlay = () => {
      setIsVideoReady(true);
    };

    const handleError = () => {
      console.error('Video error:', video.error);
      setIsVideoReady(false);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);
    video.addEventListener('waiting', () => setIsVideoReady(false));
    video.addEventListener('playing', () => setIsVideoReady(true));

    // Set initial volume
    video.volume = volume;
    video.muted = isMuted;

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
      video.removeEventListener('waiting', () => setIsVideoReady(false));
      video.removeEventListener('playing', () => setIsVideoReady(true));
    };
  }, [volume, isMuted]);

  // Load video when URL changes
  useEffect(() => {
    const video = videoRef.current;
    if (video && videoUrl) {
      video.load();
      setIsVideoReady(false);
    }
  }, [videoUrl]);

  // Fullscreen handling
  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return;

    if (!isFullscreen) {
      if (videoContainerRef.current.requestFullscreen) {
        videoContainerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(err => console.error('Play failed:', err));
    } else {
      video.pause();
    }
  };

  const skip = (seconds) => {
    const video = videoRef.current;
    if (video) {
      video.currentTime += seconds;
    }
  };

  const handleVolumeChange = (value) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
      if (newMuted) {
        setVolume(0);
      } else {
        setVolume(0.7); // Default volume when unmuting
      }
    }
  };

  const handleSeek = (value) => {
    const seekTime = value[0];
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
    }
  };

  // Disable right-click and keyboard shortcuts
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) e.preventDefault();
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div
      ref={videoContainerRef}
      className={`relative bg-black rounded-lg overflow-hidden group ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'aspect-video'}`}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        controls={false}
        className={`w-full ${isFullscreen ? 'h-full' : 'h-full'}`}
        preload="auto"
        disablePictureInPicture
        controlsList="nodownload nofullscreen noremoteplayback"
        onContextMenu={(e) => e.preventDefault()}
        onClick={togglePlay}
      />

      {/* Loading Overlay */}
      {!isVideoReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      )}

      {/* Custom Controls */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 ${isVideoReady ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'} transition-opacity`}>
        {/* Time Progress */}
        <div className="flex justify-between items-center text-xs text-white mb-2 px-2">
          <span>
            {new Date(currentTime * 1000).toISOString().substr(11, 8)}
          </span>
          <span>
            {new Date(duration * 1000).toISOString().substr(11, 8)}
          </span>
        </div>

        {/* Seek Slider */}
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSeek}
          className="w-full mb-3 [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 cursor-pointer"
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Play/Pause */}
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              disabled={!isVideoReady}
              className="text-white hover:text-white hover:bg-white/10 cursor-pointer"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>

            {/* Skip Backward */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => skip(-10)}
              disabled={!isVideoReady}
              className="text-white hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <FaBackward className="h-5 w-5" />
            </Button>

            {/* Skip Forward */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => skip(10)}
              disabled={!isVideoReady}
              className="text-white hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <FaForward className="h-5 w-5" />
            </Button>

            {/* Volume Control */}
            <div className="flex items-center space-x-2 ml-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="text-white hover:text-white hover:bg-white/10 cursor-pointer"
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
              <Slider
                value={[volume]}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
                className="w-24 [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 cursor-pointer"
              />
            </div>
          </div>

          {/* Fullscreen Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="text-white hover:text-white hover:bg-white/10 cursor-pointer"
          >
            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}