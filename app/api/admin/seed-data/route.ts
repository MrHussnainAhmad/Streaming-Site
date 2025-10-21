import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Video from '@/models/Video';

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const authCookie = request.cookies.get('admin-auth');
    if (!authCookie || authCookie.value !== 'authenticated') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Sample movie and series data
    const dummyVideos = [
      // Featured Movies
      {
        title: "The Dark Knight",
        description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        thumbnail: "https://picsum.photos/400/600?random=1",
        poster: "https://picsum.photos/800/450?random=1",
        duration: 152,
        year: 2008,
        genres: ["Action", "Crime", "Drama"],
        languages: ["English"],
        categories: ["Movies"],
        cast: ["Christian Bale", "Heath Ledger", "Aaron Eckhart"],
        director: "Christopher Nolan",
        rating: 9.0,
        isTrending: true,
        isFeatured: true,
        quality: ["1080p", "4K"],
        views: 1500000
      },
      {
        title: "Inception",
        description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        thumbnail: "https://picsum.photos/400/600?random=2",
        poster: "https://picsum.photos/800/450?random=2",
        duration: 148,
        year: 2010,
        genres: ["Action", "Sci-Fi", "Thriller"],
        languages: ["English"],
        categories: ["Movies"],
        cast: ["Leonardo DiCaprio", "Marion Cotillard", "Tom Hardy"],
        director: "Christopher Nolan",
        rating: 8.8,
        isTrending: false,
        isFeatured: true,
        quality: ["1080p"],
        views: 1200000
      },
      {
        title: "Interstellar",
        description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        thumbnail: "https://picsum.photos/400/600?random=3",
        poster: "https://picsum.photos/800/450?random=3",
        duration: 169,
        year: 2014,
        genres: ["Adventure", "Drama", "Sci-Fi"],
        languages: ["English"],
        categories: ["Movies"],
        cast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"],
        director: "Christopher Nolan",
        rating: 8.6,
        isTrending: true,
        isFeatured: true,
        quality: ["1080p", "4K"],
        views: 980000
      },
      
      // Trending Series
      {
        title: "Breaking Bad",
        description: "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family's future.",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        thumbnail: "https://picsum.photos/400/600?random=4",
        poster: "https://picsum.photos/800/450?random=4",
        duration: 47,
        year: 2008,
        genres: ["Crime", "Drama", "Thriller"],
        languages: ["English"],
        categories: ["Series"],
        cast: ["Bryan Cranston", "Aaron Paul", "Anna Gunn"],
        director: "Vince Gilligan",
        rating: 9.5,
        isTrending: true,
        isFeatured: false,
        quality: ["1080p"],
        views: 2100000
      },
      {
        title: "Stranger Things",
        description: "When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces in order to get him back.",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
        thumbnail: "https://picsum.photos/400/600?random=5",
        poster: "https://picsum.photos/800/450?random=5",
        duration: 51,
        year: 2016,
        genres: ["Drama", "Fantasy", "Horror"],
        languages: ["English"],
        categories: ["Series"],
        cast: ["Millie Bobby Brown", "Finn Wolfhard", "Winona Ryder"],
        director: "The Duffer Brothers",
        rating: 8.7,
        isTrending: true,
        isFeatured: false,
        quality: ["1080p", "4K"],
        views: 1800000
      },
      
      // Popular Movies
      {
        title: "Avengers: Endgame",
        description: "After the devastating events of Avengers: Infinity War, the universe is in ruins due to the efforts of the Mad Titan, Thanos.",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
        thumbnail: "https://picsum.photos/400/600?random=6",
        poster: "https://picsum.photos/800/450?random=6",
        duration: 181,
        year: 2019,
        genres: ["Action", "Adventure", "Drama"],
        languages: ["English"],
        categories: ["Movies"],
        cast: ["Robert Downey Jr.", "Chris Evans", "Mark Ruffalo"],
        director: "Anthony Russo, Joe Russo",
        rating: 8.4,
        isTrending: false,
        isFeatured: true,
        quality: ["1080p", "4K"],
        views: 2500000
      },
      {
        title: "Parasite",
        description: "A poor family, the Kims, con their way into becoming the servants of a rich family, the Parks. But their easy life gets complicated when their deception is threatened with exposure.",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
        thumbnail: "https://picsum.photos/400/600?random=7",
        poster: "https://picsum.photos/800/450?random=7",
        duration: 132,
        year: 2019,
        genres: ["Comedy", "Drama", "Thriller"],
        languages: ["Korean"],
        categories: ["Movies"],
        cast: ["Song Kang-ho", "Lee Sun-kyun", "Cho Yeo-jeong"],
        director: "Bong Joon-ho",
        rating: 8.6,
        isTrending: true,
        isFeatured: false,
        quality: ["1080p"],
        views: 950000
      },
      {
        title: "The Witcher",
        description: "Geralt of Rivia, a solitary monster hunter, struggles to find his place in a world where people often prove more wicked than beasts.",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
        thumbnail: "https://picsum.photos/400/600?random=8",
        poster: "https://picsum.photos/800/450?random=8",
        duration: 60,
        year: 2019,
        genres: ["Action", "Adventure", "Drama"],
        languages: ["English"],
        categories: ["Series"],
        cast: ["Henry Cavill", "Anya Chalotra", "Freya Allan"],
        director: "Lauren Schmidt Hissrich",
        rating: 8.2,
        isTrending: true,
        isFeatured: false,
        quality: ["1080p", "4K"],
        views: 1400000
      },
      {
        title: "Dune",
        description: "Paul Atreides, a brilliant and gifted young man born into a great destiny beyond his understanding, must travel to the most dangerous planet in the universe to ensure the future of his family and his people.",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
        thumbnail: "https://picsum.photos/400/600?random=9",
        poster: "https://picsum.photos/800/450?random=9",
        duration: 155,
        year: 2021,
        genres: ["Action", "Adventure", "Drama"],
        languages: ["English"],
        categories: ["Movies"],
        cast: ["Timothée Chalamet", "Rebecca Ferguson", "Oscar Isaac"],
        director: "Denis Villeneuve",
        rating: 8.0,
        isTrending: false,
        isFeatured: true,
        quality: ["1080p", "4K"],
        views: 1100000
      },
      {
        title: "The Mandalorian",
        description: "The travels of a lone bounty hunter in the outer reaches of the galaxy, far from the authority of the New Republic.",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
        thumbnail: "https://picsum.photos/400/600?random=10",
        poster: "https://picsum.photos/800/450?random=10",
        duration: 39,
        year: 2019,
        genres: ["Action", "Adventure", "Sci-Fi"],
        languages: ["English"],
        categories: ["Series"],
        cast: ["Pedro Pascal", "Gina Carano", "Carl Weathers"],
        director: "Jon Favreau",
        rating: 8.8,
        isTrending: true,
        isFeatured: false,
        quality: ["1080p", "4K"],
        views: 1600000
      }
    ];

    // Clear existing videos (optional - remove if you want to keep existing data)
    await Video.deleteMany({});

    // Insert dummy data
    const insertedVideos = await Video.insertMany(dummyVideos);

    return NextResponse.json({
      success: true,
      message: `Successfully added ${insertedVideos.length} videos to the database`,
      videos: insertedVideos
    });

  } catch (error) {
    console.error('Error seeding data:', error);
    return NextResponse.json(
      { error: 'Failed to seed data' },
      { status: 500 }
    );
  }
}