import Validator from 'fastest-validator';

function sermonValidator(data) {
  const validator = new Validator();
  const schema = {
    title: { type: 'string', empty: false, max: 200 },
    preacher: { type: 'string', max: 100, optional: true },
    scripture: { type: 'string', max: 200, optional: true },
    description: { type: 'string', max: 2000, optional: true },
    audioUrl: { type: 'string', optional: true },
    videoUrl: { type: 'string', optional: true },
    thumbnailUrl: { type: 'string', optional: true },
    sermonDate: { type: 'date', optional: true },
    tags: { type: 'array', items: 'string', optional: true },
    createdBy: { type: 'string', empty: false }
  };
  return validator.validate(data, schema);
}

export { sermonValidator };
