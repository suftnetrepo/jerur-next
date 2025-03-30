import Validator from 'fastest-validator';

function donationValidator(data) {
  const validator = new Validator();
  const schema = {
    amount: { type: 'number', positive: true },
    date_donated: { type: 'date', convert: true },
  };
  return validator.validate(data, schema);
}

export  {
  donationValidator,
};
