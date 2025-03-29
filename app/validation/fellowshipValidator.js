import Validator from 'fastest-validator';

function fellowshipValidator(data) {
  const validator = new Validator();
  const fellowshipSchema = {
    name: { type: 'string', min: 3, max: 50 },
    addressLine1: { type: 'string', max: 100 },
    county: { type: 'string', max: 50 },
    town: { type: 'string', max: 20 },
    country: { type: 'string', max: 20 },
    postcode: { type: 'string', max: 20 },
    location: {
      type: 'object',
      props: {
        type: { type: 'string', enum: ['Point'] },
        coordinates: { type: 'array', items: 'number', length: 2 },
      },
    },
  };
  return validator.validate(data, fellowshipSchema);
}

export  {
  fellowshipValidator,
};
