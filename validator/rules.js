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
      remote_link: '',
      file: null
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
    remote_link: '',
    file: null
  }
};

export const regularAgendaValidator = {
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
    sequency_no: [
      {
        pattern: /^.+$/,
        message: 'sequency no is required'
      }
    ]
  },

  reset: () => {
    return {
      _id: '',
      title: '',
      start_time: '',
      end_time: '',
      sequency_no: '',
      description: '',
      status: false
    };
  },
  fields: {
    _id: '',
    title: '',
    start_time: '',
    end_time: '',
    sequency_no: '',
    description: '',
    status: false
  }
};

export const eventValidator = {
  rules: {
    title: [
      { pattern: /^.+$/, message: 'title is required' },
      { pattern: /^.{0,250}$/, message: 'title must not exceed 150 characters' }
    ],
    description: [
      { pattern: /^.+$/, message: 'description is required' },
      { pattern: /^.{0,5000}$/, message: 'description must not exceed 1000 characters' }
    ],
    status: [{ pattern: /^.+$/, message: 'Status is required' }],
    start_date: [
      { pattern: /^.+$/, message: 'Start date is required' },
      {
        validate: (value, fields) => {
          if (fields?.start_date && new Date(value) > new Date(fields?.start_date)) {
            return 'Start date cannot be after end date';
          }
          return undefined;
        }
      }
    ],
    end_date: [
      { pattern: /^.+$/, message: 'End date is required' },
      {
        validate: (value, fields) => {
          if (fields.end_date && new Date(value) < new Date(fields.end_date)) {
            return 'End date cannot be before start date';
          }
          return undefined;
        }
      }
    ]
  },
  reset: () => {
    return {
      title: '',
      status: '',
      description: null,
      start_date: '',
      end_date: '',
      addressLine1: '',
      county: '',
      town: '',
      country: '',
      postcode: '',
      completeAddress: '',
      location: {
        type: 'Point',
        coordinates: []
      }
    };
  },
  fields: {
    title: '',
    status: '',
    description: null,
    start_date: '',
    end_date: '',
    addressLine1: '',
    county: '',
    town: '',
    country: '',
    postcode: '',
    completeAddress: '',
    location: {
      type: 'Point',
      coordinates: []
    }
  }
};

export const fellowshipValidator = {
  rules: {
    name: [
      { pattern: /^.+$/, message: 'name is required' },
      {
        pattern: /^.{0,100}$/,
        message: 'name must be no more than 50 characters'
      }
    ],
    mobile: [
      { pattern: /^.+$/, message: 'mobile number is required' },
      {
        pattern: /^.{0,50}$/,
        message: 'mobile number must be no more than 20 characters'
      }
    ],
    addressLine1: [
      {
        pattern: /^.+$/,
        message: 'street address is required'
      }
    ],
    town: [
      {
        pattern: /^.+$/,
        message: 'town is required'
      }
    ],
    country: [
      {
        pattern: /^.+$/,
        message: 'country is required'
      }
    ]
  },
  reset: () => {
    return {
      _id: '',
      name: '',
      mobile: '',
      addressLine1: '',
      county: '',
      town: '',
      country: '',
      postcode: '',
      completeAddress: '',
      location: {
        type: '',
        coordinates: []
      },
      status: false
    };
  },
  fields: {
    _id: '',
    name: '',
    mobile: '',
    addressLine1: '',
    county: '',
    town: '',
    country: '',
    postcode: '',
    completeAddress: '',
    location: {
      type: '',
      coordinates: []
    },
    status: false
  }
};
