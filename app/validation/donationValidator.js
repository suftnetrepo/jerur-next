import Validator from 'fastest-validator';
import { DONATION_TYPE_VALUES } from '../../utils/donationConstants';

function donationValidator(data) {
  const validator = new Validator();
  const schema = {
    amount: { type: 'number', positive: true },
    date_donated: { type: 'date', convert: true },
    donation_type: { type: 'enum', values: DONATION_TYPE_VALUES },
    online: { type: 'boolean', optional: true },
    first_name: { type: 'string', optional: true, empty: true },
    last_name: { type: 'string', optional: true, empty: true },
    email: { type: 'email', optional: true, empty: true },
    mobile: { type: 'string', optional: true, empty: true }
  };
  return validator.validate(data, schema);
}

export  {
  donationValidator,
};
