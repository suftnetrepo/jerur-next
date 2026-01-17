import {  NextResponse } from 'next/server'
import Stripe from 'stripe'
import { logger } from '@/utils/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(req) {
  try {
    const { stripe_user_id } = await req.json()

    const customer = await stripe.customers.create({
      stripeAccount: stripe_user_id
    })

    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: '2020-08-27', stripeAccount: stripe_user_id }
    )

    const setupIntent = await stripe.setupIntents.create(
      {
        customer: customer.id,
        automatic_payment_methods: { enabled: true }
      },
      { stripeAccount: stripe_user_id }
    )

    return NextResponse.json({
      setupIntent: setupIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      stripeCustomerId: customer.id,
      publishable_key: process.env.STRIPE_PUBLISHABLE_KEY,
      status: true
    })
  } catch (error) {
    logger.error(error)
    return NextResponse.json({ status: false })
  }
}
