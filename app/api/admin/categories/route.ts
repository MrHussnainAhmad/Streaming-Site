import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';

export const dynamic = 'force-dynamic';

function checkAuth(request: NextRequest) {
  const authCookie = request.cookies.get('admin-auth');
  if (!authCookie || authCookie.value !== 'authenticated') {
    return false;
  }
  return true;
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const categories = await Category.find().sort({ order: 1 }).lean();
    return NextResponse.json({ categories });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const data = await request.json();

    const category = await Category.create(data);
    return NextResponse.json({ category }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create category' },
      { status: 500 }
    );
  }
}
