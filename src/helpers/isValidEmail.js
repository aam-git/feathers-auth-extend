const validator = require('validator');

// eslint-disable-next-line no-unused-vars
module.exports = (name = {}) => {
  return async context => {
    if (!validator.isEmail(context.data.email)) throw new Error('Please enter a valid email address');
    return context;
  };
};
