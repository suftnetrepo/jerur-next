import { mongoConnect } from '../../../utils/connectDb';
import { createUser, verifyEmail } from '../../services/userServices';
import { createChurch } from '../../services/subscriberServices';
import { NextResponse } from 'next/server';
import { verifyRegistrationProof } from '../../../lib/recaptcha';

mongoConnect();

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, stripeCustomerId, subscriptionId, registrationProof, ...subscriberFields } = body;

    if (!verifyRegistrationProof(registrationProof, { email, stripeCustomerId, subscriptionId })) {
      return NextResponse.json(
        { error: 'Your checkout verification has expired. Please restart checkout.' },
        { status: 403 }
      );
    }

    const { message, exists } = await verifyEmail(email);

    if (exists) {
      return NextResponse.json(
        {
          error: message
        },
        { status: 400 }
      );
    }

    const subscriberPayload = { ...subscriberFields, email, stripeCustomerId, subscriptionId };
    const church = await createChurch({ ...subscriberPayload, status: 'inactive' });
    const userPayload = {
      ...subscriberPayload,
      church: church._id,
      role: 'admin',
      user_status: true,
      visible: 'private'
    };
  
    await createUser(userPayload);
    const response = NextResponse.json({ data: true }, { status: 200 });
    
    return response;
  } catch (err) {
   
    if(err.code === 11000) {
      return NextResponse.json(
        {
          error: 'Email already exists'
        },
        { status: 400 }
      );
    } 
    return NextResponse.json(
      {
        error: err.message
      },
      { status: 400 }
    );
  }
}
