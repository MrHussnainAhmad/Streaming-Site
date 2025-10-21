'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface Video {
  _id: string;
  title: string;
  description: string;
  poster: string;
  year: number;
  duration: number;
  rating?: number;
  genres: string[];
  languages: string[];
  categories: string[];
}

interface VideoInfoModalProps {
  video: Video;
  onClose: () => void;
  onPlay: (videoId: string) => void;
}

export default function VideoInfoModal({ video, onClose, onPlay }: VideoInfoModalProps) {

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

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
    : 'https://via.placeholder.com/1920x1080/1f2937/9ca3af?text=No+Image';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl bg-gray-900 rounded-xl overflow-hidden shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-black/70 hover:bg-black rounded-full transition-all"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Poster section with gradient overlay */}
        <div className="relative w-full aspect-video">
          <Image
            src={posterUrl}
            alt={video.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
          
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={() => {
                onPlay(video._id);
                onClose();
              }}
              className="flex items-center gap-3 px-8 py-4 bg-red-600 rounded-lg hover:bg-red-700 transition-all font-bold text-lg shadow-lg"
            >
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
              Play Now
            </button>
          </div>
        </div>

        {/* Content section */}
        <div className="p-8 space-y-6">
          {/* Title */}
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            {video.title}
          </h2>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            {video.rating && (
              <div className="flex items-center gap-1 px-3 py-1 bg-green-600 rounded font-bold">
                ⭐ {video.rating.toFixed(1)}
              </div>
            )}
            <span className="px-3 py-1 bg-gray-800 rounded font-semibold">
              {video.year}
            </span>
            <span className="px-3 py-1 bg-gray-800 rounded font-semibold">
              {formatDuration(video.duration)}
            </span>
          </div>

          {/* Description */}
          <p className="text-gray-300 text-lg leading-relaxed">
            {video.description}
          </p>

          {/* Details grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-800">
            {/* Categories */}
            {video.categories && video.categories.length > 0 && (
              <div>
                <span className="text-gray-400 font-semibold">Category: </span>
                <span className="text-white">{video.categories.join(', ')}</span>
              </div>
            )}

            {/* Genres */}
            {video.genres && video.genres.length > 0 && (
              <div>
                <span className="text-gray-400 font-semibold">Genre: </span>
                <span className="text-white">{video.genres.join(', ')}</span>
              </div>
            )}

            {/* Languages */}
            {video.languages && video.languages.length > 0 && (
              <div>
                <span className="text-gray-400 font-semibold">Languages: </span>
                <span className="text-white">{video.languages.join(', ')}</span>
              </div>
            )}

            {/* Release Date */}
            <div>
              <span className="text-gray-400 font-semibold">Release: </span>
              <span className="text-white">{video.year}</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
