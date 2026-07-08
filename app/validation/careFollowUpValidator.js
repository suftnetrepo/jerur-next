import Validator from 'fastest-validator';

function careFollowUpValidator(data) {
  const validator = new Validator();
  const schema = {
    userId: { type: 'string', empty: false, optional: true },
    memberId: { type: 'string', empty: false, optional: true },
    attendanceId: { type: 'string', empty: false, optional: true },
    assignedTo: { type: 'string', empty: false, optional: true },
    reason: {
      type: 'enum',
      values: ['SICK', 'NEEDS_PRAYER', 'ABSENT', 'BEREAVEMENT', 'OTHER'],
      empty: false
    },
    note: { type: 'string', max: 1000, optional: true },
    priority: {
      type: 'enum',
      values: ['LOW', 'MEDIUM', 'HIGH'],
      optional: true
    },
    status: {
      type: 'enum',
      values: ['OPEN', 'CONTACTED', 'VISITED', 'CLOSED'],
      optional: true
    }
  };
  return validator.validate(data, schema);
}

export { careFollowUpValidator };
