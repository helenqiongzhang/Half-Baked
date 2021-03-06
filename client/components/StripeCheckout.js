import React from 'react'
import axios from 'axios'
import StripeCheckout from 'react-stripe-checkout'
import STRIPE_PUBLISHABLE from './constants/stripe'
// import PAYMENT_SERVER_URL from './constants/server'
import {processCheckout, processGuestCheckout} from '../store/order'
import store from '../store'

const CURRENCY = 'USD'
const fromUSDToCent = amount => amount * 100
const successPayment = orderId => {
  if (orderId) {
    store.dispatch(processCheckout(orderId))
  } else {
    store.dispatch(processGuestCheckout())
  }

  // alert('Payment Successful')
}
const errorPayment = data => {
  alert('Payment Error')
}
const onToken = (amount, description, orderId) => token => {
  axios
    .post(`/api/orders/${orderId}/stripeCheckout`, {
      description,
      source: token.id,
      currency: CURRENCY,
      amount: fromUSDToCent(amount)
    })
    .then(successPayment(orderId))
    .catch(errorPayment)
}

const StrCheckout = ({name, description, amount, orderId}) => (
  <StripeCheckout
    name={name}
    description={description}
    amount={fromUSDToCent(amount)}
    token={onToken(amount, description, orderId)}
    currency={CURRENCY}
    stripeKey={STRIPE_PUBLISHABLE}
  />
)
export default StrCheckout
