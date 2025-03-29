import Validator from 'fastest-validator';

function pushNotificationValidator(data) {
  const validator = new Validator()
  const schema = {
    title: { type: 'string', empty: false, max: 31 },
    message: { type: 'string', empty: false, max: 75 }
  }
  return validator.validate(data, schema)
}

export  {
  pushNotificationValidator
}
