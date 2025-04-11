export const regularServiceValidator = {
  rules: {
    title: [
      {
        pattern: /^.+$/,
        message: 'title is required'
      },
      {
        pattern: /^.{0,50}$/,
        message: 'title must be no more than 50 characters'
      }
    ],
    start_time: [
      {
        pattern: /^.+$/,
        message: 'start time is required'
      },
      {
        pattern: /^.{0,50}$/,
        message: 'star time must be no more than 10 characters'
      }
    ],
    end_time: [
      {
        pattern: /^.+$/,
        message: 'end time is required'
      },
      {
        pattern: /^.{0,50}$/,
        message: 'end time must be no more than 10 characters'
      }
    ],
    remote_link: [
      {
        pattern: /^.+$/,
        message: 'remote link is required'
      },
      {
        pattern: /^.{0,200}$/,
        message: 'remote link must be no more than 200 characters'
      }
    ]
  },

  reset: () => {
    return {
      _id: '',
      title: '',
      start_time: '',
      end_time: '',
      sequency_no: 0,
      description: '',
      status: false,
      remote: false,
      remote_link: ''
    };
  },
  fields: {
    _id: '',
    title: '',
    start_time: '',
    end_time: '',
    sequency_no: 0,
    description: '',
    status: false,
    remote: false,
    remote_link: ''
  }
};
