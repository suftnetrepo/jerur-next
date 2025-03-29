import Validator from 'fastest-validator';

function campaignValidator(data) {
  const validator = new Validator();
  const schema = {
    title: { type: 'string', min: 5, max: 100 },
    description: { type: 'string', min: 10 },
    target_amount: { type: 'number', positive: true },
    start_date: { type: 'date', convert: true },
    end_date: { type: 'date', convert: true },
  };
  return validator.validate(data, schema);
}

export default {
  campaignValidator,
};
