import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SiteSettings from '@/models/SiteSettings';

// GET site settings
export async function GET() {
  try {
    await dbConnect();
    
    let settings = await SiteSettings.findOne();
    
    // Create default settings if none exist
    if (!settings) {
      settings = await SiteSettings.create({
        siteName: 'STREAMME',
        logo: '',
        favicon: '',
        enableUserAuth: false,
        enableSecondaryFooter: false,
        secondaryFooterContent: '',
        enableAds: false,
        adType: 'google',
        googleAdSenseId: '',
        customAdImage: '',
        customAdLink: '',
      });
    }
    
    // Ensure all fields exist with defaults
    const completeSettings = {
      siteName: settings.siteName || 'STREAMME',
      logo: settings.logo || '',
      favicon: settings.favicon || '',
      enableUserAuth: settings.enableUserAuth || false,
      enableSecondaryFooter: settings.enableSecondaryFooter || false,
      secondaryFooterContent: settings.secondaryFooterContent || '',
      enableAds: settings.enableAds || false,
      adType: settings.adType || 'google',
      googleAdSenseId: settings.googleAdSenseId || '',
      customAdImage: settings.customAdImage || '',
      customAdLink: settings.customAdLink || '',
      updatedAt: settings.updatedAt,
      _id: settings._id,
      __v: settings.__v
    };
    
    return NextResponse.json({ settings: completeSettings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// PUT update site settings (admin only)
export async function PUT(request: NextRequest) {
  let siteName, logo, favicon, enableUserAuth, enableSecondaryFooter, secondaryFooterContent, enableAds, adType, googleAdSenseId, customAdImage, customAdLink;

  try {
    // Check admin authentication
    const authCookie = request.cookies.get('admin-auth');
    if (!authCookie || authCookie.value !== 'authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    const body = await request.json();
    
    // Validate that body is not empty
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    
    ({ 
      siteName, 
      logo,
      favicon, 
      enableUserAuth,
      enableSecondaryFooter,
      secondaryFooterContent,
      enableAds,
      adType,
      googleAdSenseId,
      customAdImage,
      customAdLink
    } = body);
    
    let settings = await SiteSettings.findOne();
    console.log('Found existing settings:', settings ? 'Yes' : 'No');
    
    if (!settings) {
      settings = await SiteSettings.create({ 
        siteName, 
        logo,
        favicon: favicon || '', 
        enableUserAuth: enableUserAuth || false,
        enableSecondaryFooter: enableSecondaryFooter || false,
        secondaryFooterContent: secondaryFooterContent || '',
        enableAds: enableAds || false,
        adType: adType || 'google',
        googleAdSenseId: googleAdSenseId || '',
        customAdImage: customAdImage || '',
        customAdLink: customAdLink || ''
      });
    } else {
      // Directly update all fields, using existing values as fallbacks
      const updateData = {
        siteName: siteName !== undefined ? siteName : settings.siteName,
        logo: logo !== undefined ? logo : settings.logo,
        favicon: favicon !== undefined ? favicon : (settings.favicon || ''),
        enableUserAuth: enableUserAuth !== undefined ? enableUserAuth : (settings.enableUserAuth || false),
        enableSecondaryFooter: enableSecondaryFooter !== undefined ? enableSecondaryFooter : (settings.enableSecondaryFooter || false),
        secondaryFooterContent: secondaryFooterContent !== undefined ? secondaryFooterContent : (settings.secondaryFooterContent || ''),
        enableAds: enableAds !== undefined ? enableAds : (settings.enableAds || false),
        adType: adType !== undefined ? adType : (settings.adType || 'google'),
        googleAdSenseId: googleAdSenseId !== undefined ? googleAdSenseId : (settings.googleAdSenseId || ''),
        customAdImage: customAdImage !== undefined ? customAdImage : (settings.customAdImage || ''),
        customAdLink: customAdLink !== undefined ? customAdLink : (settings.customAdLink || ''),
        updatedAt: new Date()
      };
      
      console.log('Updating settings with:', JSON.stringify(updateData, null, 2));
      
      // Store the original ID for fallback
      const originalId = settings._id;
      
      // Use findOneAndUpdate with proper options to ensure the update persists
      settings = await SiteSettings.findOneAndUpdate(
        { _id: originalId },
        { $set: updateData },
        { 
          new: true, // Return the updated document
          runValidators: true,
          upsert: false // Don't create if not exists since we already have one
        }
      );
      
      if (!settings) {
        console.warn('findOneAndUpdate failed, trying alternative approach');
        
        // Fallback: try direct field assignment and save
        settings = await SiteSettings.findById(originalId);
        if (settings) {
          Object.assign(settings, updateData);
          settings = await settings.save();
        }
        
        if (!settings) {
          throw new Error('Failed to update settings - all methods failed');
        }
      }
      
      console.log('Settings update completed successfully');
      console.log('Updated settings result:', JSON.stringify(settings, null, 2));
      
      // Verify the update by fetching fresh from database
      const verificationCheck = await SiteSettings.findById(originalId);
      console.log('Verification check - settings persisted:', verificationCheck ? 'Yes' : 'No');
    }
    
    // Ensure the response includes all fields with defaults
    const completeSettings = {
      siteName: settings.siteName || 'STREAMME',
      logo: settings.logo || '',
      favicon: settings.favicon || '',
      enableUserAuth: settings.enableUserAuth || false,
      enableSecondaryFooter: settings.enableSecondaryFooter || false,
      secondaryFooterContent: settings.secondaryFooterContent || '',
      enableAds: settings.enableAds || false,
      adType: settings.adType || 'google',
      googleAdSenseId: settings.googleAdSenseId || '',
      customAdImage: settings.customAdImage || '',
      customAdLink: settings.customAdLink || '',
      updatedAt: settings.updatedAt,
      _id: settings._id,
      __v: settings.__v
    };
    
    return NextResponse.json({ settings: completeSettings, message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    
    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorDetails = {
      message: errorMessage,
      timestamp: new Date().toISOString(),
      requestBody: { siteName, logo, favicon, enableUserAuth, enableSecondaryFooter, secondaryFooterContent, enableAds, adType, googleAdSenseId, customAdImage, customAdLink }
    };
    
    console.error('Detailed error info:', errorDetails);
    
    return NextResponse.json({ 
      error: 'Failed to update settings', 
      details: process.env.NODE_ENV === 'development' ? errorDetails : undefined
    }, { status: 500 });
  }
}
