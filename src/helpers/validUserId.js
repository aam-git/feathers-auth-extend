// eslint-disable-next-line no-unused-vars
 module.exports = (target = 'id') => {
  return async context => {
    try {
      if (context.method.match('create')) {
        context.data[target] = String(context.params.user._id);
      } else if (context.method.match(/(remove|update|patch)/)) {
        context.id = String(context.params.user._id);
      } else {
        context.params.query[target] = String(context.params.user._id);
      }
    } catch (err) {
      throw new Error('Invalid User');
    }
  };
};
