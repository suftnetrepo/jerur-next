import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { logger } from '../../../../../utils/logger';
import { addDonation } from '../../../../services/donationService'
import { checkAmount } from '../../../../../utils/helpers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(req) {
  try {
    const {
      currency,
      stripe_customer_id,
      amount,
      stripe_user_id,
      church_id,
      donation_type,
      first_name,
      last_name,
      email,
      date_donated
    } = await req.json()

    if (!checkAmount(amount)) {
      return NextResponse.json({ error: 'Bad Request, Invalid amount' }, { status: 400 })
    }

    const paymentMethods = await stripe.paymentMethods.list(
      { customer: stripe_customer_id, type: 'card' },
      { stripeAccount: stripe_user_id }
    )

    if (!paymentMethods.data.length) {
      return NextResponse.json({ error: 'No payment methods found for the given customer.' }, { status: 400 })
    }

    await stripe.paymentIntents.create(
      {
        amount: Math.round(parseFloat(amount) * 100),
        currency,
        automatic_payment_methods: { enabled: true },
        customer: stripe_customer_id,
        payment_method: paymentMethods.data[0].id,
        off_session: true,
        confirm: true
      },
      { stripeAccount: stripe_user_id }
    )

    await addDonation(
       church_id,
      {
        amount,
        suid: church_id,
        first_name: first_name || 'Guest',
        last_name: last_name || 'Guest',
        email: email || 'Guest',
        date_donated: date_donated || new Date(),
        online: true,
        donation_type
      }
    )

    return NextResponse.json({ status: true })
  } catch (error) {
    logger.error(error)
    return NextResponse.json({ status: false })
  }
}
