const { discard, iff, isProvider } = require('feathers-hooks-common')

module.exports = {
  before: {
    create: [
      context => {
        context.data = {
          ...context.data,
          ...{
            isVerified: false,
            verifyTokenExpires: null,
            verifyToken: null,
            resetTokenExpires: null,
            resetToken: null,
            magicToken: null,
            magicTokenExpires: null
          }
        };
        return context;
      }
    ],
    update: []
  },
  after: {
    all: [
      iff(
        isProvider('external'),
        discard('password', 'address.city')
      )
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },
};
