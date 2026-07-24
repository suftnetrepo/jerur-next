const checkoutValidator = {
  rules: {
    name: [
      {
        pattern: /^.+$/,
        message: 'church is required'
      }
    ],
    first_name: [
      {
        pattern: /^.+$/,
        message: 'first name is required'
      },
      {
        pattern: /^.{0,50}$/,
        message: 'first name must not be more than 50 characters'
      }
    ],
    last_name: [
      { pattern: /^.+$/, message: 'last name is required' },
      {
        pattern: /^.{0,50}$/,
        message: 'last name must not be more than 50 characters'
      }
    ],
    mobile: [
      {
        pattern: /^.+$/,
        message: 'mobile is required'
      }
    ],
    email: [
      { pattern: /.+/, message: 'email address is required' },
      {
        pattern: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
        message: 'Please enter a valid email address',
      },
      {
        pattern: /^.{0,100}$/,
        message: 'email address must be no more than 100 characters',
      },
    ],
  },
  fields: {
    first_name: '',
    last_name: '',
    name:'',
    email:'',
    mobile :'',
    priceId:'',
    stripeCustomerId: '',
    subscriptionId: '',
    terms : false
  }
}

export { checkoutValidator }
