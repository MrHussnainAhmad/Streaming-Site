export interface Video {
  _id: string;
  title: string;
  description: string;
  magnetLink: string;
  thumbnail: string;
  poster: string;
  duration: number;
  year: number;
  genres: string[];
  languages: string[];
  categories: string[];
  cast: string[];
  director?: string;
  rating?: number;
  isTrending: boolean;
  isFeatured: boolean;
  quality: string[];
  audioTracks?: { language: string; name: string }[];
  subtitles?: { language: string; url: string }[];
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  order: number;
  type: 'default' | 'genre' | 'language' | 'custom';
  createdAt: Date;
  updatedAt: Date;
}
