const { NotFound, BadRequest } = require('@feathersjs/errors');

const { iff, isProvider, keep } = require('feathers-hooks-common');

const emailValid = require('../helpers/isValidEmail');
const checkUserExists = require('../helpers/checkUserExists');
const validUserId = require('../helpers/validUserId');

module.exports = {
  before: {
    all:    [],
    find:   [
      iff(
        isProvider('external'),
        validUserId()
      )
    ],
    get:    [
    ],
    create: [
      emailValid(),
      checkUserExists(),
      async context => {

        keep(context.app.get('feathers-auth-extend').user.keepBefore);

        const feConfig = context.app.get('feathers-auth-extend') || undefined;

        //if enabled, check the password quality
        if (context.data.action === 'verifyReset' && feConfig !== undefined &&
          typeof feConfig.securePasswords && typeof feConfig.zxcvbn && feConfig.securePasswords && feConfig.zxcvbn > 0) {

          const z = (require('zxcvbn'))(context.data.password);

          if (z.score < feConfig.zxcvbn) {
            throw new BadRequest('Password not secure' + (z.feedback.warning !== '' ? ': ' + z.feedback.warning : ' enough'));
          }

        }

        context.data = {
          ...context.data,
          ...{
            isVerified: false,
            accountToken: null,
            accountTokenExpires: null,
            resetToken: null,
            resetTokenExpires: null,
            loginToken: null,
            loginTokenExpires: null
          }
        };
        return context;
      }
    ],
    update: [
      iff(
        isProvider('external'),
        validUserId()
      )
    ],
    patch:  [
      iff(
        isProvider('external'),
        validUserId()
      )
    ],
    remove: [
      iff(
        isProvider('external'),
        () => {
          throw new NotFound();
        }
      )
    ]
  },
  after: {
    all: [
    ],
    find:   [],
    get:    [
      async context => {
        keep(context.app.get('feathers-auth-extend').user.keepAfter);
        return context;
      }
    ],
    create: [
      async context => {
        await context.app.service('authManage').create(
          {
            action: 'sendVerify',
            type: context.result.type || null,
            id: context.result.id || null,
            _id: context.result._id || null,
            email: context.result.email
          });
        context.dispatch = {success: true};
        return context;
      }
    ],
    update: [],
    patch:  [],
    remove: []
  },
};
