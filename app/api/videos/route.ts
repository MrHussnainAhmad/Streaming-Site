import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Video from '@/models/Video';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const genre = searchParams.get('genre');
    const language = searchParams.get('language');
    const year = searchParams.get('year');
    const trending = searchParams.get('trending') === 'true';
    const featured = searchParams.get('featured') === 'true';

    const query: any = {};

    if (category) query.categories = category;
    if (genre) query.genres = genre;
    if (language) query.languages = language;
    if (year) query.year = parseInt(year);
    if (trending) query.isTrending = true;
    if (featured) query.isFeatured = true;

    const skip = (page - 1) * limit;

    const [videos, total] = await Promise.all([
      Video.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-magnetLink')
        .lean(),
      Video.countDocuments(query),
    ]);

    return NextResponse.json({
      videos,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}
