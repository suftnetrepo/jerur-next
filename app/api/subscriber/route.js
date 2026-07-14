import { mongoConnect } from '../../../utils/connectDb';
import { createUser, verifyEmail } from '../../services/userServices';
import { createChurch } from '../../services/subscriberServices';
import { NextResponse } from 'next/server';

mongoConnect();

export async function POST(req) {
  try {
    const body = await req.json();
    console.log('Received body:', body); // Debug log to check the received data
    const { email } = body;

    const { message, exists } = await verifyEmail(email);

    if (exists) {
      return NextResponse.json(
        {
          error: message
        },
        { status: 400 }
      );
    }

    const church = await createChurch({ ...body, status: 'inactive' });
    
    const userPayload = {
      ...body,
      church: church._id,
      role: 'admin',
      user_status: true,
      visible: 'private'
    };
  
    await createUser(userPayload);
    const response = NextResponse.json({ data: true }, { status: 200 });
    
    return response;
  } catch (err) {
    return NextResponse.json(
      {
        error: err.message
      },
      { status: 400 }
    );
  }
}
