// eslint-disable-next-line no-unused-vars
module.exports = (target = 'id') => {
  return async context => {
    try {
      //check if user has admin permission and that they want all results not just own
      if (typeof context.params.user.permissions === 'undefined' ||
        !context.params.user.permissions.includes('admin') ||
        typeof context.params.query.show === 'undefined' ||
        context.params.query.show !== 'all') {
        if (context.method.match('create')) {
          context.data[target] = String(context.params.user._id);
        } else if (context.method.match(/(remove|update|patch)/)) {
          context.id = String(context.params.user._id);
        } else {
          context.params.query[target] = String(context.params.user._id);
        }
      }
      if (typeof context.params.user.show !== 'undefined') {
        delete context.params.query.show;
      }
    } catch (err) {
      throw new Error('Invalid User');
    }
  };
};
