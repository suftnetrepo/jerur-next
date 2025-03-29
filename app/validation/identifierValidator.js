import Validator from 'fastest-validator';
import { ObjectID } from 'mongodb';

function identifierValidator(id) {
  const validator = new Validator();
  const schema = {
    _id: {
      type: 'objectID',
      ObjectID,
      empty: false,
    },
  };

  return validator.validate({ _id: id }, schema);
}

function identifierValidators(ids) {
  const errors = [];
  const validator = new Validator();
  const schema = {
    _id: {
      type: 'objectID',
      ObjectID,
      empty: false,
    },
  };

  ids.forEach((x) => {
    const result = validator.validate({ _id: Object.values(x)[0] }, schema);
    if (result.length) {
      const fieldName = Object.keys(x)[0];
      const message = {
        message: `The ${fieldName} field must be a valid Mongodb ObjectID`,
        field: fieldName,
      };
      errors.push(message);
    }
  });

  return errors;
}

export  { identifierValidators, identifierValidator };
