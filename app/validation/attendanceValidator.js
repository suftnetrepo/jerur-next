import Validator from 'fastest-validator';

function attendanceValidator(data) {
  const validator = new Validator()
  const schema = {
    service: { type: 'string', empty: false },
    memberId: { type: 'string', empty: false },
    church: { type: 'string', empty: false }
  }
  return validator.validate(data, schema)
}

export {
  attendanceValidator
}
