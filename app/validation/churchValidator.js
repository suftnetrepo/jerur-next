import Validator from 'fastest-validator';

function updateAddressValidator(data) {
  const validator = new Validator();
  const schema = {
    addressLine1: {
      type: 'string',
      optional: false,
      empty: false,
      min: 3,
      max: 255,
    },
    town: { type: 'string', optional: false, empty: false, min: 3, max: 20 },
    country: { type: 'string', optional: false, empty: false, min: 3, max: 20 },
  };

  return validator.validate(data, schema);
}

function contactValidator(data) {
  const validator = new Validator();
  const schema = {
    email: { type: 'email', empty: false, max: 50 },
    name: { type: 'string', empty: false, max: 50 },
    mobile: { type: 'string', empty: false, max: 20 },
  };
  return validator.validate(data, schema);
}

function propheticValidator(data) {
  const validator = new Validator();
  const schema = {
    month: { type: 'string', empty: false, max: 15 },
    verse: { type: 'string', empty: false, max: 20 },
    description: { type: 'string', empty: false, max: 200 },
  };
  return validator.validate(data, schema);
}

function pastorValidator(data) {
  const validator = new Validator();
  const schema = {
    first_name: { type: 'string', empty: false, max: 50 },
    last_name: { type: 'string', empty: false, max: 50 },
    mobile: { type: 'string', empty: false, max: 20 },
    email: { type: 'string', empty: false, max: 20 },
    description: { type: 'string', empty: false, max: 200 },
  };
  return validator.validate(data, schema);
}

function updateOneValidator(data) {
  const validator = new Validator();
  const updateOneSchema = {
    name: { type: 'string', optional: false, empty: false },
    value: { type: 'string', optional: false, empty: false },
  };

  return validator.validate(data, updateOneSchema);
}

function updateFeatureValidator(data) {
  const validator = new Validator()
  const schema = {
    features: {
      type: 'array',
      items: { type: 'string' }
    }
  }

  return validator.validate(data, schema)
}

function churchValidator(data) {
  const validator = new Validator();
  const schema = {
      email: { type: 'email', empty: false, max: 50 },
      name: { type: 'string', empty: false, max: 50 },
      subscriptionId: { type: 'string', empty: false},
      priceId: { type: 'string', empty: false },
      stripeCustomerId: { type: 'string', empty: false },
      mobile: { type: 'string', empty: false, max: 50 },
  };
  return validator.validate(data, schema);
}

function churchUpdateValidator(data) {
  const validator = new Validator();
  const schema = {
      email: { type: 'email', empty: false, max: 50 },
      name: { type: 'string', empty: false, max: 50 },        
      mobile: { type: 'string', empty: false, max: 50 },
  };
  return validator.validate(data, schema);
}


export  {
  updateAddressValidator,
  contactValidator,
  updateOneValidator,
  updateFeatureValidator,
  churchValidator,
  churchUpdateValidator,
  pastorValidator,
  propheticValidator
};
