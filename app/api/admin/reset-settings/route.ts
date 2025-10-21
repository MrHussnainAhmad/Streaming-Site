import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SiteSettings from '@/models/SiteSettings';

export async function DELETE(request: NextRequest) {
  try {
    // Check admin authentication
    const authCookie = request.cookies.get('admin-auth');
    if (!authCookie || authCookie.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    // Delete existing settings
    await SiteSettings.deleteMany({});
    
    // Create fresh settings with all fields
    const newSettings = await SiteSettings.create({
      siteName: 'Flix',
      logo: '',
      enableUserAuth: true,
      enableSecondaryFooter: false,
      secondaryFooterContent: '',
      enableAds: false,
      adType: 'google',
      googleAdSenseId: '',
      customAdImage: '',
      customAdLink: '',
    });
    
    return NextResponse.json({ 
      message: 'Settings reset successfully',
      settings: newSettings 
    });
  } catch (error) {
    console.error('Error resetting settings:', error);
    return NextResponse.json({ error: 'Failed to reset settings' }, { status: 500 });
  }
}