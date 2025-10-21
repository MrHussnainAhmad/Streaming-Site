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

    // Get the collection
    const collection = Video.collection;
    
    // List all indexes
    const indexes = await collection.listIndexes().toArray();
    console.log('Current indexes:', indexes);

    // Drop all existing data and indexes
    await collection.drop().catch(() => {
      // Collection might not exist, that's fine
      console.log('Collection drop completed or collection did not exist');
    });

    // Recreate the collection with fresh indexes
    // This will be done automatically when we insert new data

    return NextResponse.json({
      success: true,
      message: 'Database cleaned up successfully! Old indexes removed.',
      indexes: indexes
    });

  } catch (error) {
    console.error('Error fixing database:', error);
    return NextResponse.json(
      { error: 'Failed to fix database', details: error.message },
      { status: 500 }
    );
  }
}