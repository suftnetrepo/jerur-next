// app/api/stripe-onboarding/route.js
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(req) {
  try {
    const body = await req.json()
    const { stripe_user_id } = body
    const baseURL = process.env.STRIPE_CONNECT_RETURN_URL
    const encodedStripeUserID = encodeURIComponent(stripe_user_id)

    const accountLink = await stripe.accountLinks.create({
      account: stripe_user_id,
      refresh_url: process.env.STRIPE_CONNECT_REFRESH_URL,
      return_url: `${baseURL}${encodedStripeUserID}`,
      type: 'account_onboarding'
    })

    return NextResponse.json({ url: accountLink.url })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
