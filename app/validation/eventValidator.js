import Validator from 'fastest-validator';

function eventValidator (data) {
  const validator = new Validator()
  const schema = {
    title: { type: 'string', empty: false, max: 100 },
    start_time: { type: 'string', empty: false, max: 10 },
    end_time: { type: 'string', empty: false, max: 50 },
    start_date: { type: 'string', empty: false },
    end_date: { type: 'string', empty: false }
  }
  return validator.validate(data, schema)
}

function eventAgendaValidator(data) {
  const validator = new Validator()
  const schema = {
    title: { type: 'string', empty: false, max: 100 },
    start_time: { type: 'string', empty: false, max: 10 },
    end_time: { type: 'string', empty: false, max: 50 }
  }
  return validator.validate(data, schema)
}

export  {
  eventValidator,
  eventAgendaValidator
}
