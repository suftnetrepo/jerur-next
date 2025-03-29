import Validator from 'fastest-validator';

function campaignContributionValidator(data) {
  const validator = new Validator();
  const schema = {
    amount: { type: 'number', positive: true },
    email: { type: 'email', empty: false, max: 50 },
    first_name: { type: 'string', empty: false, max: 50 },
    last_name: { type: 'string', empty: false, max: 50 },
    campaign: { type: 'string', pattern: '^[0-9a-fA-F]{24}$' },
  };
  return validator.validate(data, schema);
}

export default {
  campaignContributionValidator,
};
