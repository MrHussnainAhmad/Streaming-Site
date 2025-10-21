'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import VideoCard from '@/components/VideoCard';
import VideoPlayer from '@/components/VideoPlayer';
import VideoInfoModal from '@/components/VideoInfoModal';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdBanner from '@/components/AdBanner';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

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
  universe?: string;
}

export default function HomePage() {
  const [featuredVideos, setFeaturedVideos] = useState<Video[]>([]);
  const [trendingVideos, setTrendingVideos] = useState<Video[]>([]);
  const [latestVideos, setLatestVideos] = useState<Video[]>([]);
  const [actionVideos, setActionVideos] = useState<Video[]>([]);
  const [adventureVideos, setAdventureVideos] = useState<Video[]>([]);
  const [scifiVideos, setScifiVideos] = useState<Video[]>([]);
  const [fantasyVideos, setFantasyVideos] = useState<Video[]>([]);
  const [universeVideos, setUniverseVideos] = useState<{[key: string]: Video[]}>({});
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedInfoVideo, setSelectedInfoVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000, stopOnInteraction: false })]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  
  const [trendingEmblaRef] = useEmblaCarousel({ dragFree: true, containScroll: 'trimSnaps' });
  const [latestEmblaRef] = useEmblaCarousel({ dragFree: true, containScroll: 'trimSnaps' });
  const [actionEmblaRef] = useEmblaCarousel({ dragFree: true, containScroll: 'trimSnaps' });
  const [adventureEmblaRef] = useEmblaCarousel({ dragFree: true, containScroll: 'trimSnaps' });
  const [scifiEmblaRef] = useEmblaCarousel({ dragFree: true, containScroll: 'trimSnaps' });
  const [fantasyEmblaRef] = useEmblaCarousel({ dragFree: true, containScroll: 'trimSnaps' });

  useEffect(() => {
    fetchData();
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    
    emblaApi.on('select', () => {
      setCurrentSlide(emblaApi.selectedScrollSnap());
    });
  }, [emblaApi]);

  const fetchData = async () => {
    try {
      const [featuredRes, trendingRes, latestRes, actionRes, adventureRes, scifiRes, fantasyRes, allVideosRes] = await Promise.all([
        fetch('/api/videos?featured=true&limit=5'),
        fetch('/api/videos?trending=true&limit=10'),
        fetch('/api/videos?limit=10'),
        fetch('/api/videos?genre=Action&limit=10'),
        fetch('/api/videos?genre=Adventure&limit=10'),
        fetch('/api/videos?genre=Sci-Fi&limit=10'),
        fetch('/api/videos?genre=Fantasy&limit=10'),
        fetch('/api/videos?limit=100'), // Get more videos to group by universe
      ]);

      const [featuredData, trendingData, latestData, actionData, adventureData, scifiData, fantasyData, allVideosData] = await Promise.all([
        featuredRes.json(),
        trendingRes.json(),
        latestRes.json(),
        actionRes.json(),
        adventureRes.json(),
        scifiRes.json(),
        fantasyRes.json(),
        allVideosRes.json(),
      ]);

      setFeaturedVideos(featuredData.videos || []);
      setTrendingVideos(trendingData.videos || []);
      setLatestVideos(latestData.videos || []);
      setActionVideos(actionData.videos || []);
      setAdventureVideos(adventureData.videos || []);
      setScifiVideos(scifiData.videos || []);
      setFantasyVideos(fantasyData.videos || []);

      // Group videos by universe
      const universeGroups: {[key: string]: Video[]} = {};
      (allVideosData.videos || []).forEach((video: Video) => {
        if (video.universe) {
          if (!universeGroups[video.universe]) {
            universeGroups[video.universe] = [];
          }
          universeGroups[video.universe].push(video);
        }
      });
      
      // Only keep universes with at least 3 videos
      Object.keys(universeGroups).forEach(universe => {
        if (universeGroups[universe].length < 3) {
          delete universeGroups[universe];
        }
      });
      
      setUniverseVideos(universeGroups);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Fixed Header */}
      <Header scrolled={scrolled} currentPage="home" />

      {/* Featured Carousel */}
      {featuredVideos.length > 0 && (
        <div className="relative h-[80vh] overflow-hidden mt-16">
          <div className="embla" ref={emblaRef}>
            <div className="embla__container flex">
              {featuredVideos.map((video, index) => {
                const posterUrl = video.poster && isValidUrl(video.poster)
                  ? video.poster
                  : 'https://via.placeholder.com/1920x1080/1f2937/9ca3af?text=Featured';

                return (
                  <div key={video._id} className="embla__slide flex-[0_0_100%] relative">
                    <div className="absolute inset-0">
                      <Image
                        src={posterUrl}
                        alt={video.title}
                        fill
                        className="object-cover"
                        priority={index === 0}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
                    </div>

                    <div className="relative h-full flex flex-col justify-end p-8 md:p-16 max-w-3xl">
                      <div className="mb-4">
                        <span className="px-3 py-1 bg-red-600 rounded-full text-sm font-bold">
                          ⭐ FEATURED
                        </span>
                      </div>
                      <h2 className="text-4xl md:text-6xl font-bold mb-4">
                        {video.title}
                      </h2>
                      <p className="text-lg md:text-xl text-gray-300 mb-6 line-clamp-3">
                        {video.description}
                      </p>
                      <div className="flex items-center gap-4 mb-8 text-sm">
                        <span className="px-3 py-1 bg-gray-800/80 rounded">{video.year}</span>
                        <span>{video.genres.slice(0, 3).join(' • ')}</span>
                        {video.rating && (
                          <span className="flex items-center gap-1">
                            ⭐ {video.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-4">
                        <button
                          onClick={() => setSelectedVideo(video._id)}
                          className="flex items-center gap-2 px-8 py-4 bg-red-600 rounded-lg hover:bg-red-700 transition-all font-bold text-lg shadow-lg"
                        >
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                          Play Now
                        </button>
                        <button 
                          onClick={() => setSelectedInfoVideo(video)}
                          className="flex items-center gap-2 px-8 py-4 bg-gray-800/80 rounded-lg hover:bg-gray-700/80 transition-all font-bold text-lg"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          More Info
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Carousel Indicators */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
            {featuredVideos.map((_, index) => (
              <button
                key={index}
                onClick={() => emblaApi?.scrollTo(index)}
                className={`h-1 rounded-full transition-all ${
                  index === currentSlide ? 'w-8 bg-red-600' : 'w-4 bg-gray-500'
                }`}
              />
            ))}
          </div>

          {/* Navigation Arrows */}
          {featuredVideos.length > 1 && (
            <>
              <button
                onClick={() => emblaApi?.scrollPrev()}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 hover:bg-black/80 rounded-full transition-all z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => emblaApi?.scrollNext()}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 hover:bg-black/80 rounded-full transition-all z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>
      )}

      {/* Empty State - Centered on full page */}
      {featuredVideos.length === 0 && trendingVideos.length === 0 && latestVideos.length === 0 && 
       actionVideos.length === 0 && adventureVideos.length === 0 && scifiVideos.length === 0 && 
       fantasyVideos.length === 0 && Object.keys(universeVideos).length === 0 && (
        <div className="min-h-[80vh] flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <div className="text-8xl mb-8 animate-pulse">🎬</div>
            <h2 className="text-4xl font-bold mb-6 text-white">No Content Available</h2>
            <p className="text-gray-400 text-xl leading-relaxed">
              Our streaming library is currently empty. Check back soon for new releases!
            </p>
          </div>
        </div>
      )}

      {/* Content Sections - Only show when there's content */}
      {(featuredVideos.length > 0 || trendingVideos.length > 0 || latestVideos.length > 0 || 
        actionVideos.length > 0 || adventureVideos.length > 0 || scifiVideos.length > 0 || 
        fantasyVideos.length > 0 || Object.keys(universeVideos).length > 0) && (
        <div className="relative z-20 -mt-32 space-y-12 pb-16">
          {/* Trending Section */}
          {trendingVideos.length > 0 && (
            <section className="relative group">
              <div className="px-4 md:px-12 mb-4">
                <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                  🔥 Trending Now
                </h2>
              </div>
              <div className="embla overflow-x-scroll overflow-y-hidden scrollbar-hide" ref={trendingEmblaRef}>
                <div className="flex gap-2 px-4 md:px-12 pb-4">
                  {trendingVideos.map((video) => (
                    <div key={video._id} className="flex-shrink-0 w-[45%] sm:w-[30%] md:w-[23%] lg:w-[18.5%] xl:w-[15.5%]">
                      <VideoCard
                        video={video}
                        onClick={setSelectedInfoVideo}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Ad Banner - After Trending */}
          <AdBanner position="after-trending" />

          {/* Universe Sections */}
          {Object.entries(universeVideos).map(([universe, videos]) => (
            <section key={universe} className="relative group">
              <div className="px-4 md:px-12 mb-4">
                <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                  🌌 {universe} Universe
                </h2>
                <p className="text-gray-400 text-sm mt-1">{videos.length} movies & series</p>
              </div>
              <div className="embla overflow-x-scroll overflow-y-hidden scrollbar-hide">
                <div className="flex gap-2 px-4 md:px-12 pb-4">
                  {videos.map((video) => (
                    <div key={video._id} className="flex-shrink-0 w-[45%] sm:w-[30%] md:w-[23%] lg:w-[18.5%] xl:w-[15.5%]">
                      <VideoCard
                        video={video}
                        onClick={setSelectedInfoVideo}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ))}

          {/* Ad Banner - After Universe */}
          <AdBanner position="after-universe" />

          {/* Action Section */}
          {actionVideos.length > 0 && (
            <section className="relative group">
              <div className="px-4 md:px-12 mb-4">
                <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                  💥 Action Movies
                </h2>
              </div>
              <div className="embla overflow-x-scroll overflow-y-hidden scrollbar-hide" ref={actionEmblaRef}>
                <div className="flex gap-2 px-4 md:px-12 pb-4">
                  {actionVideos.map((video) => (
                    <div key={video._id} className="flex-shrink-0 w-[45%] sm:w-[30%] md:w-[23%] lg:w-[18.5%] xl:w-[15.5%]">
                      <VideoCard
                        video={video}
                        onClick={setSelectedInfoVideo}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Adventure Section */}
          {adventureVideos.length > 0 && (
            <section className="relative group">
              <div className="px-4 md:px-12 mb-4">
                <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                  🏔️ Adventure Movies
                </h2>
              </div>
              <div className="embla overflow-x-scroll overflow-y-hidden scrollbar-hide" ref={adventureEmblaRef}>
                <div className="flex gap-2 px-4 md:px-12 pb-4">
                  {adventureVideos.map((video) => (
                    <div key={video._id} className="flex-shrink-0 w-[45%] sm:w-[30%] md:w-[23%] lg:w-[18.5%] xl:w-[15.5%]">
                      <VideoCard
                        video={video}
                        onClick={setSelectedInfoVideo}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Sci-Fi Section */}
          {scifiVideos.length > 0 && (
            <section className="relative group">
              <div className="px-4 md:px-12 mb-4">
                <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                  🚀 Sci-Fi Movies
                </h2>
              </div>
              <div className="embla overflow-x-scroll overflow-y-hidden scrollbar-hide" ref={scifiEmblaRef}>
                <div className="flex gap-2 px-4 md:px-12 pb-4">
                  {scifiVideos.map((video) => (
                    <div key={video._id} className="flex-shrink-0 w-[45%] sm:w-[30%] md:w-[23%] lg:w-[18.5%] xl:w-[15.5%]">
                      <VideoCard
                        video={video}
                        onClick={setSelectedInfoVideo}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Fantasy Section */}
          {fantasyVideos.length > 0 && (
            <section className="relative group">
              <div className="px-4 md:px-12 mb-4">
                <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                  🧿 Fantasy Movies
                </h2>
              </div>
              <div className="embla overflow-x-scroll overflow-y-hidden scrollbar-hide" ref={fantasyEmblaRef}>
                <div className="flex gap-2 px-4 md:px-12 pb-4">
                  {fantasyVideos.map((video) => (
                    <div key={video._id} className="flex-shrink-0 w-[45%] sm:w-[30%] md:w-[23%] lg:w-[18.5%] xl:w-[15.5%]">
                      <VideoCard
                        video={video}
                        onClick={setSelectedInfoVideo}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Latest Releases */}
          {latestVideos.length > 0 && (
            <section className="relative group">
              <div className="px-4 md:px-12 mb-4">
                <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                  ✨ New Releases
                </h2>
              </div>
              <div className="embla overflow-x-scroll overflow-y-hidden scrollbar-hide" ref={latestEmblaRef}>
                <div className="flex gap-2 px-4 md:px-12 pb-4">
                  {latestVideos.map((video) => (
                    <div key={video._id} className="flex-shrink-0 w-[45%] sm:w-[30%] md:w-[23%] lg:w-[18.5%] xl:w-[15.5%]">
                      <VideoCard
                        video={video}
                        onClick={setSelectedInfoVideo}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Ad Banner - After Genre Sections */}
          <AdBanner position="after-genres" />
        </div>
      )}

      {/* Ad Banner - Before Footer */}
      <AdBanner position="before-footer" />

      {/* Footer */}
      <Footer />

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
