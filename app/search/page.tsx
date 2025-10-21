'use client';

import { useState } from 'react';
import VideoCard from '@/components/VideoCard';
import VideoPlayer from '@/components/VideoPlayer';
import Header from '@/components/Header';

interface Video {
  _id: string;
  title: string;
  thumbnail: string;
  year: number;
  duration: number;
  rating?: number;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setVideos(data.videos || []);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <Header scrolled={true} currentPage="search" />

      <div className="pt-24 p-8 max-w-7xl mx-auto">
        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-12 max-w-2xl mx-auto">
          <div className="flex gap-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies, actors, directors..."
              className="flex-1 px-6 py-4 bg-gray-800 rounded-lg border border-gray-700 focus:border-red-600 focus:outline-none text-lg"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-gray-600 font-semibold"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : searched ? (
          videos.length > 0 ? (
            <>
              <h2 className="text-2xl font-bold mb-6">
                Found {videos.length} result{videos.length !== 1 ? 's' : ''} for "{query}"
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {videos.map((video) => (
                  <VideoCard
                    key={video._id}
                    video={video}
                    onClick={setSelectedVideo}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="min-h-[50vh] flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="text-6xl mb-6">🔍</div>
                <h2 className="text-3xl font-bold mb-4">No results found</h2>
                <p className="text-gray-400 text-lg mb-6">We couldn't find anything matching "{query}"</p>
                <p className="text-gray-500 text-sm">Try different keywords or browse our collection</p>
              </div>
            </div>
          )
        ) : (
          <div className="min-h-[50vh] flex items-center justify-center">
            <div className="text-center max-w-lg">
              <div className="text-8xl mb-8">🎆</div>
              <h2 className="text-4xl font-bold mb-6 text-white">
                Discover Amazing Content
              </h2>
              <p className="text-gray-400 text-xl leading-relaxed">
                Search for movies, series, actors, directors, and more...
              </p>
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
    </div>
  );
}
