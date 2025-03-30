import Validator from 'fastest-validator';

function contactValidator(data) {
  const validator = new Validator()
  const schema = {
    title: { type: 'string', empty: false, max: 50 },
    fullNames: { type: 'string', empty: false, max: 50 },
    phone: { type: 'string', empty: false, max: 20 }
  }
  return validator.validate(data, schema)
}

export  {
  contactValidator
}
