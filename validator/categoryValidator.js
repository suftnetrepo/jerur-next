const categoryValidator = {
  rules: {
    name: [
      {
        pattern: /^.+$/,
        message: 'name is required'
      },
      {
        pattern: /^.{0,100}$/,
        message: 'name must be no more than 100 characters'
      }
    ]
  },
  reset: () => {
    return {
      ...categoryValidator.fields
    };
  },
  fields: {
    name: '',
    description: '',
    status: false
  }
};

export { categoryValidator };
