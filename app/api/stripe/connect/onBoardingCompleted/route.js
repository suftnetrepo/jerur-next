
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import {mongoConnect} from '../../../../../utils/connectDb'
import Church from '../../../../models' 

mongoConnect()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function GET(req, { params }) {
  const { stripe_user_id } = params

  const successRedirectURL = process.env.STRIPE_CONNECT_SUCCESS
  const failRedirectURL = process.env.STRIPE_CONNECT_FAIL

  if (!stripe_user_id) {
    console.error('Stripe user ID is required')
    return NextResponse.redirect(failRedirectURL)
  }

  try {

    const account = await stripe.account.retrieve(stripe_user_id)

    if (account.details_submitted) {
      await Church.findOneAndUpdate(
        { stripe_user_id },
        { onboardingComplete: true }
      )
      return NextResponse.redirect(successRedirectURL)
    }

    return NextResponse.redirect(failRedirectURL)
  } catch (err) {
    console.error(err)
    return NextResponse.redirect(failRedirectURL)
  }
}
