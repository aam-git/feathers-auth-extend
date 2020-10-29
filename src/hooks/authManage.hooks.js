const { NotFound, BadRequest } = require('@feathersjs/errors');
const { iff, isProvider } = require('feathers-hooks-common');
const emailValid = require('../helpers/isValidEmail');

module.exports = {
  before: {
    get: [
      iff(
        isProvider('external'),
        async context => {
          emailValid(context.params.id);
          return context;
        }
      )
    ],
    create:    [
      iff(
        isProvider('external'), //only run on external connections
        async context => {

          const feConfig = context.app.get('feathers-auth-extend') || undefined;

          //if no action supplied
          if (typeof context.data.action === 'undefined' || context.data.action === '') {
            throw new BadRequest('Invalid Action');
          }

          //if no email supplied
          if (typeof context.data.email === 'undefined' || context.data.email === '') {
            throw new BadRequest('Please enter email address');
          }

          //verify type and no token supplied
          if (context.data.action.match(/^(verify|verifyReset)$/) && (typeof context.data.token === 'undefined' || context.data.token === '')) {
            throw new BadRequest('Please enter token');
          }

          //verifyReset type and no new password supplied
          if (context.data.action === 'verifyReset' && (typeof context.data.password === 'undefined' || context.data.password === '')) {
            throw new BadRequest('Please enter new password');
          }

          //if enabled, check the password quality
          if (context.data.action === 'verifyReset' && feConfig !== undefined &&
              typeof feConfig.securePasswords && typeof feConfig.zxcvbn && feConfig.securePasswords && feConfig.zxcvbn > 0) {

            const z = (require('zxcvbn'))(context.data.password);

            if (z.score < feConfig.zxcvbn) {
              throw new BadRequest('Password not secure' + (z.feedback.warning !== '' ? ': ' + z.feedback.warning : ' enough'));
            }

          }

          //search for the user by email
          let users = await context.app.service('users').find({
            query: {
              email: context.data.email
            },
            paginate: false
          });

          //if we cannot match the user email supplied
          if (users.length !== 1) {
            throw new NotFound('User not Found');
          }

          //to save an extra lookup, push the users information into the params.
          context.params.user = {
            id: users[0].id || null,
            _id: users[0]._id || null,
            type: users[0].type || null,
            email: users[0].email,
            accountToken: users[0].accountToken,
            accountTokenExpires: users[0].accountTokenExpires,
            resetToken: users[0].resetToken,
            resetTokenExpires: users[0].resetTokenExpires,
            magicToken: users[0].magicToken,
            magicTokenExpires: users[0].magicTokenExpires,
          };

          return context;

        }
      )
    ],
  },
  after: {
    all:    [],
    find:   [],
    get:    [],
    create: [],
    update: [],
    patch:  [],
    remove: []
  },
};
