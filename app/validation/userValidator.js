import Validator from 'fastest-validator';

function loginValidator(data) {
  const validator = new Validator()
  const schema = {
    email: { type: 'email' }
  }
  return validator.validate(data, schema)
}

function signOnValidator(data) {
  const validator = new Validator()
  const schema = {
    email: { type: 'email' },
    password: { type: 'string', min: 6 }
  }
  return validator.validate(data, schema)
}

function passwordValidator(data) {
  const validator = new Validator()
  const schema = {
    password: { type: 'string', min: 6 }
  }
  return validator.validate(data, schema)
}


function userValidator(data) {
  const validator = new Validator()
  const schema = {
    email: { type: 'email', empty: false, max: 50 },
    first_name: { type: 'string', empty: false, max: 50 },
    last_name: { type: 'string', empty: false, max: 50 },
    mobile: { type: 'string', empty: false, max: 20 },
    role: { type: 'string', empty: false, max: 10 }
  }
  return validator.validate(data, schema)
}

function memberValidator(data) {
  const validator = new Validator()
  const schema = {
    email: { type: 'email', empty: false, max: 50 },
    first_name: { type: 'string', empty: false, max: 50 },
    last_name: { type: 'string', empty: false, max: 50 },
    mobile: { type: 'string', empty: false, max: 20 }
  }
  return validator.validate(data, schema)
}

function testimoniesValidator(data) {
  const validator = new Validator()
  const schema = {
    first_name: { type: 'string', empty: false, max: 50 },
    last_name: { type: 'string', empty: false, max: 50 },
    description: { type: 'string', max: 1000 }
  }
  return validator.validate(data, schema)
}

function codeValidator(data) {
  const validator = new Validator()
  const schema = {
    email: { type: 'email' },
    code: { type: 'string', min: 6, max: 6 }
  }
  return validator.validate(data, schema)
}

function pinValidator(data) {
  const validator = new Validator()
  const schema = {
    email: { type: 'email' },
    pin: { type: 'number' }
  }
  return validator.validate(data, schema)
}

export  {
 
  passwordValidator,
  signOnValidator,
  loginValidator,
  userValidator,
  codeValidator,
  memberValidator,
  pinValidator,
  testimoniesValidator
}
