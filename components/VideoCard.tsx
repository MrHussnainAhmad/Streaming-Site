'use client';

import { useState } from 'react';
import Image from 'next/image';

interface VideoCardProps {
  video: {
    _id: string;
    title: string;
    description?: string;
    thumbnail: string;
    poster?: string;
    year: number;
    duration: number;
    rating?: number;
    genres?: string[];
    languages?: string[];
    categories?: string[];
  };
  onClick: (video: any) => void;
}

export default function VideoCard({ video, onClick }: VideoCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  // Validate thumbnail URL
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const posterUrl = video.poster && isValidUrl(video.poster) 
    ? video.poster 
    : 'https://via.placeholder.com/480x270/1f2937/9ca3af?text=No+Image';

  return (
    <div
      className={`relative cursor-pointer transition-transform duration-200 ${
        isHovered ? 'scale-105 z-10' : ''
      }`}
      onClick={() => onClick(video)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-video overflow-hidden rounded-md bg-gray-900 shadow-lg">
        {!imageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-gray-700" />
        )}
        <Image
          src={posterUrl}
          alt={video.title}
          fill
          sizes="(max-width: 640px) 150px, (max-width: 768px) 200px, 250px"
          className="object-cover transition-opacity duration-300"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageLoaded(true)}
          style={{ opacity: imageLoaded ? 1 : 0 }}
        />
        
        {/* Always visible gradient and details */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent">
          <div className={`absolute bottom-0 left-0 right-0 p-3 transition-opacity duration-300 ${
            isHovered ? 'opacity-0' : 'opacity-100'
          }`}>
            <h3 className="font-bold text-white text-sm mb-1 line-clamp-2 leading-tight">
              {video.title}
            </h3>
            <div className="flex items-center gap-1 text-xs text-gray-300">
              <span>{video.year}</span>
              <span>•</span>
              <span>{formatDuration(video.duration)}</span>
              {video.rating && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    ⭐ {video.rating.toFixed(1)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Play button - only visible on hover */}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
