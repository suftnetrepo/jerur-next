import Validator from 'fastest-validator';
import { ARTICLE_STATUS_VALUES } from '../../constants/articles';

function articleValidator(data) {
  const validator = new Validator();
  const schema = {
    title: { type: 'string', empty: false, max: 150 },
    summary: { type: 'string', empty: false, max: 300 },
    content: { type: 'string', empty: false },
    status: { type: 'enum', values: ARTICLE_STATUS_VALUES, optional: true }
  };
  return validator.validate(data, schema);
}

export { articleValidator };
