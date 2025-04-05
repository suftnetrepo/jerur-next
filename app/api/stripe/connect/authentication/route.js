
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import {logger} from '../../../../../utils/logger'
import { updateStripeConnect } from '@/services/subscriptionUpdateService'
import {mongoConnect} from '../../../../../utils/connectDb'
import Church from '../../../../models' 

mongoConnect()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
})

const updateStripeConnect = async (id, res) => {
    try {
      const body = {
        key: res.stripe_publishable_key,
        secret: res.access_token,
        name: 'Stripe',
        active: true,
        access_token: res.access_token,
        refresh_token: res.refresh_token,
        scope: res.scope,
        token_type: res.token_type,
        livemode: res.livemode,
        stripe_user_id: res.stripe_user_id,
        stripe_publishable_key: res.stripe_publishable_key
      }
      await Church.findOneAndUpdate(
        { _id: id },
        { $push: { payment_provider: body } },
        { new: true }
      ).exec()
    } catch (error) {
      logger.error(error)
      throw new Error(error.message)
    }
  }

const makeStripeConnectRequest = async (code) => {
  try {
    return await stripe.oauth.token({
      grant_type: 'authorization_code',
      code,
    })
  } catch (error) {
    logger.error(error)
    throw new Error('Stripe Connect Request Failed')
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (!code || !state) {
      throw new Error('Missing authentication code or state')
    }

    const response = await makeStripeConnectRequest(code)
    await updateStripeConnect(state, response)

    const successRedirectURL = process.env.STRIPE_CONNECT_SUCCESS
    return NextResponse.redirect(successRedirectURL)
  } catch (error) {
    logger.error(error)
    const failRedirectURL = process.env.STRIPE_CONNECT_FAIL
    return NextResponse.redirect(failRedirectURL)
  }
}
