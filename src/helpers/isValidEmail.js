const validator = require('validator');

// eslint-disable-next-line no-unused-vars
module.exports = (validate = null) => {
  return async context => {
    const error = 'Please enter a valid email address';
    if (validate !== null) {
      if (!validator.isEmail(validate)) throw new Error(error);
    } else {
      if (typeof context.data !== 'undefined' && typeof context.data.email !== 'undefined') {
        if (!validator.isEmail(context.data.email)) throw new Error(error);
      }
      if (typeof context.params.query !== 'undefined' && typeof context.params.query.email !== 'undefined') {
        if (!validator.isEmail(context.params.query.email)) throw new Error(error);
      }
    }
    return context;
  };
};
