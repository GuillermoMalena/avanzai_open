import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUser } from '@/lib/db/queries';

export async function POST(request: NextRequest) {
  try {
    // Get the user data from the request
    const userData = await request.json();
    
    if (!userData.id || !userData.email) {
      console.error('Invalid user data for sync:', userData);
      return NextResponse.json({ error: 'Invalid user data' }, { status: 400 });
    }

    // Log the sync attempt for debugging
    console.log('Attempting to sync user:', userData.email, 'with ID:', userData.id);

    // Check if the user already exists in our database
    const existingUsers = await getUser(userData.email);
    
    if (existingUsers && existingUsers.length > 0) {
      console.log('User already exists in database:', userData.email, 'with ID:', existingUsers[0].id);
      
      // If IDs don't match, we might want to update the database record in the future
      if (existingUsers[0].id !== userData.id) {
        console.log('Note: Supabase UUID and database UUID differ');
      }
      
      return NextResponse.json({ 
        message: 'User already exists',
        userId: existingUsers[0].id
      });
    }

    // Create the user in our custom database with the Supabase UUID
    console.log('Creating user in custom database with Supabase UUID:', userData.id);
    
    const userResult = await createUser(userData.email, null, userData.id);
    
    return NextResponse.json({ 
      message: 'User synchronized successfully',
      userId: userResult.id
    });
  } catch (error) {
    console.error('Error syncing user with database:', error);
    return NextResponse.json({ 
      error: 'Failed to sync user' 
    }, { 
      status: 500 
    });
  }
} 