'use client';

import { useEffect, useState } from 'react';
import VideoCard from '@/components/VideoCard';
import VideoPlayer from '@/components/VideoPlayer';
import VideoInfoModal from '@/components/VideoInfoModal';
import Header from '@/components/Header';

interface Video {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  poster: string;
  year: number;
  duration: number;
  rating?: number;
  genres: string[];
  languages: string[];
  categories: string[];
}

export default function BrowsePage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedInfoVideo, setSelectedInfoVideo] = useState<Video | null>(null);
  const [filters, setFilters] = useState({
    genre: '',
    year: '',
    language: '',
  });

  useEffect(() => {
    fetchVideos();
  }, [filters]);

  const fetchVideos = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.genre) params.append('genre', filters.genre);
    if (filters.year) params.append('year', filters.year);
    if (filters.language) params.append('language', filters.language);

    try {
      const response = await fetch(`/api/videos?${params.toString()}`);
      const data = await response.json();
      setVideos(data.videos || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <Header scrolled={true} currentPage="browse" />

      <div className="pt-24 p-8 max-w-7xl mx-auto">
        {/* Filters */}
        <div className="mb-8 flex gap-4 flex-wrap">
          <select
            value={filters.genre}
            onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
            className="px-4 py-2 bg-gray-800 rounded border border-gray-700 focus:border-red-600 focus:outline-none"
          >
            <option value="">All Genres</option>
            <option value="Action">Action</option>
            <option value="Comedy">Comedy</option>
            <option value="Drama">Drama</option>
            <option value="Horror">Horror</option>
            <option value="Sci-Fi">Sci-Fi</option>
            <option value="Thriller">Thriller</option>
          </select>

          <select
            value={filters.year}
            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
            className="px-4 py-2 bg-gray-800 rounded border border-gray-700 focus:border-red-600 focus:outline-none"
          >
            <option value="">All Years</option>
            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          <select
            value={filters.language}
            onChange={(e) => setFilters({ ...filters, language: e.target.value })}
            className="px-4 py-2 bg-gray-800 rounded border border-gray-700 focus:border-red-600 focus:outline-none"
          >
            <option value="">All Languages</option>
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
            <option value="German">German</option>
            <option value="Japanese">Japanese</option>
            <option value="Korean">Korean</option>
          </select>

          <button
            onClick={() => setFilters({ genre: '', year: '', language: '' })}
            className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
          >
            Clear Filters
          </button>
        </div>

        {/* Videos Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : videos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {videos.map((video) => (
              <VideoCard
                key={video._id}
                video={video}
                onClick={setSelectedInfoVideo}
              />
            ))}
          </div>
        ) : (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="text-6xl mb-6">🎭</div>
              <h2 className="text-3xl font-bold mb-4">No videos found</h2>
              <p className="text-gray-400 text-lg mb-6">Try adjusting your filters or check back later for new content</p>
              <button
                onClick={() => setFilters({ genre: '', year: '', language: '' })}
                className="px-6 py-3 bg-red-600 rounded-lg hover:bg-red-700 transition-all font-semibold"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Video Player */}
      {selectedVideo && (
        <VideoPlayer
          videoId={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}

      {/* Video Info Modal */}
      {selectedInfoVideo && (
        <VideoInfoModal
          video={selectedInfoVideo}
          onClose={() => setSelectedInfoVideo(null)}
          onPlay={setSelectedVideo}
        />
      )}
    </div>
  );
}
