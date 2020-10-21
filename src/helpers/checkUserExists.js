// eslint-disable-next-line no-unused-vars
module.exports = () => {
  return async context => {
    const user = await context.app.service('users').find({
      query: {
        $limit: 0,
        email: context.data.email
      }
    });
    if (user.total > 0) { throw new Error('Email already exists'); }
  };
};
