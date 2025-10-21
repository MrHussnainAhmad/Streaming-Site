import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

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

    const { currentPassword, newPassword } = await request.json();
    
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Get current admin password from env
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    // Verify current password
    if (currentPassword !== adminPassword) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Try to update the .env.local file
    try {
      const envPath = path.join(process.cwd(), '.env.local');
      let envContent = '';
      
      try {
        envContent = fs.readFileSync(envPath, 'utf8');
      } catch {
        // File doesn't exist, create new content
        envContent = '';
      }
      
      const lines = envContent.split('\n');
      let passwordUpdated = false;
      
      // Update existing ADMIN_PASSWORD line or add new one
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('ADMIN_PASSWORD=')) {
          lines[i] = `ADMIN_PASSWORD=${newPassword}`;
          passwordUpdated = true;
          break;
        }
      }
      
      if (!passwordUpdated) {
        lines.push(`ADMIN_PASSWORD=${newPassword}`);
      }
      
      // Write back to file
      fs.writeFileSync(envPath, lines.join('\n'));
      
      // Update the runtime environment variable
      process.env.ADMIN_PASSWORD = newPassword;
      
      return NextResponse.json({ 
        success: true, 
        message: 'Password changed successfully. Please restart the application for changes to take full effect.' 
      });
    } catch (fileError) {
      console.error('Error updating .env.local:', fileError);
      
      // Fallback: just update the runtime env variable
      process.env.ADMIN_PASSWORD = newPassword;
      
      return NextResponse.json({ 
        success: true, 
        message: 'Password changed for this session. For permanent changes, manually update ADMIN_PASSWORD in your .env.local file.' 
      });
    }
    
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    );
  }
}