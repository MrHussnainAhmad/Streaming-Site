import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Video from '@/models/Video';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const video = await Video.findById(id).lean();

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await Video.findByIdAndUpdate(id, { $inc: { views: 1 } });

    return NextResponse.json({
      id: video._id,
      title: video.title,
      videoUrl: video.videoUrl,
      quality: video.quality,
      audioTracks: video.audioTracks,
      subtitles: video.subtitles,
      duration: video.duration,
    });
  } catch (error) {
    console.error('Error fetching stream info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stream info' },
      { status: 500 }
    );
  }
}
