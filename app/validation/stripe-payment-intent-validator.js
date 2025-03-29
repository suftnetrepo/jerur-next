import Validator from 'fastest-validator';
import _ from 'lodash';

const schema = {
  stripe_user_id: { type: 'string', max: 200, empty: false },
};

export default (req, res, next) => {
  const validator = new Validator();
  const validateResult = validator.validate(req.body, schema);
  if (validateResult.length) {
    const result = validateResult.map((it) => _.pick(it, ['field', 'message']));
    return res.status(401).json(result);
  }
  next();
};
