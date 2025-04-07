import Validator from 'fastest-validator';

function sliderValidator(data) {
  const validator = new Validator()
  const schema = {
    title: { type: 'string', empty: false, max: 50 },
    message: { type: 'string', empty: false, max: 90 }
  }
  return validator.validate(data, schema)
}

export  {
  sliderValidator
}
