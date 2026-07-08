import Validator from 'fastest-validator';

function attendanceValidator(data) {
  const validator = new Validator()
  const schema = {
    // Legacy fields (optional for backward compatibility)
    service: { type: 'string', empty: false, optional: true },
    church: { type: 'string', empty: false, optional: true },
    count: { type: 'number', optional: true },
    checkInTime: { type: 'date', optional: true },
    
    // New fields
    memberId: { type: 'string', empty: false, optional: true },
    userId: { type: 'string', empty: false, optional: true },
    serviceId: { type: 'string', empty: false, optional: true },
    status: {
      type: 'enum',
      values: [
        'PRESENT_IN_CHURCH',
        'JOINED_ONLINE',
        'ABSENT',
        'SICK',
        'TRAVELLING',
        'WORKING',
        'FAMILY_COMMITMENT',
        'NEEDS_PRAYER',
        'OTHER'
      ],
      optional: true
    },
    message: { type: 'string', max: 500, optional: true },
    checkedInVia: {
      type: 'enum',
      values: ['QR_CODE', 'MANUAL', 'ONLINE'],
      optional: true
    },
    wantsPastorContact: { type: 'boolean', optional: true },
    submittedAt: { type: 'date', optional: true }
  }
  return validator.validate(data, schema)
}

export {
  attendanceValidator
}
