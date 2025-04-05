import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
})

export async function POST(req) {
  try {
    const { stripe_user_id } = await req.json()
    const baseURL = process.env.STRIPE_CONNECT_RETURN_URL
    const encodedStripeUserID = encodeURIComponent(stripe_user_id)

    const loginLink = await stripe.accounts.createLoginLink(stripe_user_id, {
      redirect_url: `${baseURL}${encodedStripeUserID}`,
    })

    return NextResponse.json({ url: loginLink.url }, { status: 200 })
  } catch (err) {
    console.error('Stripe dashboard error:', err)
    return NextResponse.json({ error: 'Failed to create Stripe login link' }, { status: 500 })
  }
}
