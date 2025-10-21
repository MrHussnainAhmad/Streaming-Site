import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Video from '@/models/Video';

function checkAuth(request: NextRequest) {
  const authCookie = request.cookies.get('admin-auth');
  if (!authCookie || authCookie.value !== 'authenticated') {
    return false;
  }
  return true;
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    
    // Drop the videos collection to reset schema
    await Video.collection.drop().catch(() => {
      // Ignore error if collection doesn't exist
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Videos collection reset successfully. You can now add videos with the new schema.' 
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to reset database' },
      { status: 500 }
    );
  }
}
