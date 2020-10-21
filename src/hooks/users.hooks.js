const { discard, iff, isProvider } = require('feathers-hooks-common');
const randomatic = require('randomatic');

module.exports = {
  before: {
    create: [
      context => {
        context.data = {
          ...context.data,
          ...{
            isVerified: false,
            verifyTokenExpires: (Date.now()) + (60*60*24*1000),
            verifyToken: randomatic('Aa0', 8),
            resetTokenExpires: null,
            resetToken: null,
            magicTokenExpires: null,
            magicToken: null
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
        discard(
          'isVerified',
          'verifyTokenExpires',
          'verifyToken',
          'resetTokenExpires',
          'resetToken',
          'magicTokenExpires',
          'magicToken'
        )
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
