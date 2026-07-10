import Validator from 'fastest-validator';

const hasAtLeastOneMediaUrl = (value = {}) => {
  return Boolean(value.youtubeUrl || value.videoUrl || value.audioUrl);
};

function sermonValidator(data) {
  const validator = new Validator();
  const schema = {
    churchId: { type: 'string', empty: false },
    title: { type: 'string', empty: false, max: 200 },
    speakerName: { type: 'string', empty: false, max: 120 },
    serviceId: { type: 'string', empty: false },
    summary: { type: 'string', max: 5000, optional: true },
    media: {
      type: 'object',
      empty: false,
      props: {
        youtubeUrl: { type: 'url', optional: true, empty: true },
        audioUrl: { type: 'url', optional: true, empty: true },
        videoUrl: { type: 'url', optional: true, empty: true },
        thumbnail: { type: 'url', optional: true, empty: true }
      },
      custom: (value) => hasAtLeastOneMediaUrl(value) ? true : [{ type: 'mediaUrlRequired', actual: value }]
    },
    durationMinutes: { type: 'number', positive: true, integer: true, optional: true },
    preachedAt: { type: 'date' },
    status: {
      type: 'enum',
      values: ['DRAFT', 'PUBLISHED', 'ARCHIVED']
    },
    createdBy: { type: 'string', empty: false },
    updatedBy: { type: 'string', empty: false, optional: true }
  };

  validator.addMessage('mediaUrlRequired', 'At least one media URL is required');

  return validator.validate(data, schema);
}

export { sermonValidator };
