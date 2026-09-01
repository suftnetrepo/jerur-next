import Validator from 'fastest-validator';
import mongoose from 'mongoose';

// Fastest Validator expects an ObjectID-compatible constructor exposing the
// static `isValid` method. The modern MongoDB driver no longer exports the
// legacy `ObjectID` name, so importing it produced `undefined` at runtime.
// Reuse Mongoose's ObjectId implementation, which is already the canonical
// ID type throughout the application.
const ObjectID = mongoose.Types.ObjectId;

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
