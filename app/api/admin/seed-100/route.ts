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

    // Base data from movie.txt
    const baseVideoUrl = "https://player.mediadelivery.net/embed/515631/e829e124-448f-4fcd-9c1d-865aba840af6";
    const baseThumbnail = "https://picsum.photos/400/600?random=";
    const basePoster = "https://picsum.photos/800/450?random=";

    // Arrays for generating varied content
    const movieTitles = [
      "The Last Tower", "Shadow Hunter", "Digital Dreams", "Neon Nights", "Steel Wings",
      "Crystal Empire", "Dark Waters", "Fire Storm", "Ice Queen", "Thunder Strike",
      "Golden Arrow", "Silent Storm", "Blood Moon", "Silver Blade", "Iron Fist",
      "Ghost Protocol", "Phoenix Rising", "Dragon's Eye", "Wolf Pack", "Eagle Soar",
      "Viper's Den", "Tiger Hunt", "Lion's Roar", "Bear Attack", "Shark Bite",
      "Falcon Dive", "Cobra Strike", "Panther Prowl", "Raven's Call", "Hawk Eye",
      "Storm Rider", "Wind Walker", "Earth Shaker", "Fire Bringer", "Water Master",
      "Ice Breaker", "Lightning Flash", "Thunder Roar", "Solar Flare", "Lunar Eclipse",
      "Star Wars", "Galaxy Quest", "Space Odyssey", "Cosmic Journey", "Alien Contact",
      "Mars Attack", "Moon Base", "Space Station", "Asteroid Belt", "Black Hole",
      "Time Travel", "Future Shock", "Past Perfect", "Present Danger", "Tomorrow Never",
      "Yesterday Gone", "Today Forever", "Now Loading", "Then Again", "When Ready",
      "Code Red", "Blue Steel", "Green Light", "Yellow Alert", "Purple Rain",
      "Orange Crush", "Pink Panther", "Black Swan", "White Tiger", "Gray Wolf",
      "Red Dragon", "Blue Phoenix", "Green Arrow", "Yellow Thunder", "Purple Storm",
      "Ocean Deep", "Mountain High", "Desert Hot", "Forest Wild", "City Lights",
      "Country Roads", "Highway Chase", "Street Fight", "Bridge Jump", "Tower Climb",
      "Castle Siege", "Fort Defense", "Base Attack", "Camp Rescue", "Hideout Raid",
      "Mission Impossible", "Operation Fury", "Project X", "Task Force", "Strike Team",
      "Alpha Squad", "Beta Unit", "Gamma Ray", "Delta Force", "Echo Chamber",
      "Final Hour", "Last Stand", "First Strike", "Second Chance", "Third Time",
      "Fourth Wall", "Fifth Element", "Sixth Sense", "Seventh Heaven", "Eighth Wonder",
      "Night Crawler", "Day Walker", "Dawn Patrol", "Dusk Hunter", "Midnight Run"
    ];

    const actionWords = ["Ultimate", "Extreme", "Maximum", "Super", "Mega", "Ultra", "Hyper", "Turbo", "Power", "Force"];
    const descriptors = ["Warrior", "Guardian", "Defender", "Protector", "Champion", "Hero", "Legend", "Master", "Elite", "Prime"];

    const genres = ["Action", "Adventure", "Thriller", "Sci-Fi", "Drama", "Crime", "Mystery", "Horror", "Fantasy", "War"];
    const languages = ["English", "Spanish", "French", "German", "Japanese", "Korean", "Italian", "Portuguese", "Russian", "Chinese"];
    const categories = ["Movies", "Series"];

    const descriptions = [
      "A thrilling adventure that takes you on an unforgettable journey through danger and excitement.",
      "An epic tale of courage, sacrifice, and the fight for justice in a world gone mad.",
      "A heart-pounding action spectacular that pushes the boundaries of what's possible.",
      "A gripping story of survival against impossible odds and overwhelming enemies.",
      "An intense drama that explores the depths of human determination and resilience.",
      "A fast-paced thriller that will keep you on the edge of your seat from start to finish.",
      "A masterpiece of cinema that combines stunning visuals with powerful storytelling.",
      "An explosive action adventure that delivers non-stop excitement and jaw-dropping stunts.",
      "A compelling narrative about heroes who rise when the world needs them most.",
      "A cinematic experience that redefines the boundaries of the action genre."
    ];

    const directors = [
      "Michael Bay", "Christopher Nolan", "Zack Snyder", "James Cameron", "Ridley Scott",
      "Martin Scorsese", "Steven Spielberg", "Quentin Tarantino", "Denis Villeneuve", "David Fincher",
      "The Russo Brothers", "Joss Whedon", "J.J. Abrams", "Peter Jackson", "George Lucas",
      "Tim Burton", "Guillermo del Toro", "Alfonso Cuarón", "Alejandro G. Iñárritu", "Damien Chazelle"
    ];

    const actorFirstNames = ["John", "Chris", "Ryan", "Tom", "Will", "Brad", "Matt", "Mark", "Robert", "Daniel", "Emma", "Scarlett", "Jennifer", "Charlize", "Angelina", "Gal", "Margot", "Amy", "Sandra", "Jessica"];
    const actorLastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];

    const movies = [];

    for (let i = 1; i <= 100; i++) {
      // Generate varied title
      let title;
      if (i === 1) {
        title = "The Last Tower"; // Keep original for first movie
      } else if (i <= movieTitles.length) {
        title = movieTitles[i - 1];
      } else {
        const action = actionWords[Math.floor(Math.random() * actionWords.length)];
        const descriptor = descriptors[Math.floor(Math.random() * descriptors.length)];
        const number = Math.floor(Math.random() * 50) + 1;
        title = `${action} ${descriptor} ${number}`;
      }

      // Generate cast
      const numActors = Math.floor(Math.random() * 3) + 2; // 2-4 actors
      const cast: string[] = [];
      for (let j = 0; j < numActors; j++) {
        const firstName = actorFirstNames[Math.floor(Math.random() * actorFirstNames.length)];
        const lastName = actorLastNames[Math.floor(Math.random() * actorLastNames.length)];
        cast.push(`${firstName} ${lastName}`);
      }

      // Generate other random data
      const year = 2020 + Math.floor(Math.random() * 6); // 2020-2025
      const duration = 90 + Math.floor(Math.random() * 120); // 90-210 minutes
      const rating = (6 + Math.random() * 4).toFixed(1); // 6.0-10.0
      const views = Math.floor(Math.random() * 2000000) + 100000; // 100k-2.1M views
      
      const movieGenres: string[] = [];
      const numGenres = Math.floor(Math.random() * 3) + 1; // 1-3 genres
      for (let j = 0; j < numGenres; j++) {
        const genre = genres[Math.floor(Math.random() * genres.length)];
        if (!movieGenres.includes(genre)) {
          movieGenres.push(genre);
        }
      }
      
      const movieLanguages: string[] = [];
      const numLanguages = Math.floor(Math.random() * 2) + 1; // 1-2 languages
      for (let j = 0; j < numLanguages; j++) {
        const language = languages[Math.floor(Math.random() * languages.length)];
        if (!movieLanguages.includes(language)) {
          movieLanguages.push(language);
        }
      }

      const qualities = ["720p", "1080p", "4K"];
      const numQualities = Math.floor(Math.random() * qualities.length) + 1;
      const movieQualities = qualities.slice(0, numQualities);

      const isTrending = Math.random() > 0.7; // 30% chance
      const isFeatured = Math.random() > 0.85; // 15% chance
      
      // Assign universe to some movies (30% chance)
      const universes = ['MCU', 'DCU', 'Star Wars', 'Fast & Furious', 'John Wick', 'Monsterverse', ''];
      const universe = Math.random() > 0.7 ? universes[Math.floor(Math.random() * (universes.length - 1))] : '';

      const movie = {
        title: title,
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        videoUrl: baseVideoUrl,
        thumbnail: baseThumbnail + i,
        poster: basePoster + i,
        duration: duration,
        year: year,
        genres: movieGenres,
        languages: movieLanguages,
        categories: [categories[Math.floor(Math.random() * categories.length)]],
        cast: cast,
        director: directors[Math.floor(Math.random() * directors.length)],
        rating: parseFloat(rating),
        isTrending: isTrending,
        isFeatured: isFeatured,
        quality: movieQualities,
        universe: universe,
        views: views
      };

      movies.push(movie);
    }

    // Clear existing videos and insert new ones
    await Video.deleteMany({});
    const insertedVideos = await Video.insertMany(movies);

    return NextResponse.json({
      success: true,
      message: `Successfully created ${insertedVideos.length} movies using your video URL!`,
      summary: {
        total: insertedVideos.length,
        featured: insertedVideos.filter(v => v.isFeatured).length,
        trending: insertedVideos.filter(v => v.isTrending).length,
        videoUrl: baseVideoUrl
      }
    });

  } catch (error) {
    console.error('Error seeding 100 movies:', error);
    return NextResponse.json(
      { error: 'Failed to create movies' },
      { status: 500 }
    );
  }
}