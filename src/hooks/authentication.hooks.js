const { Forbidden } = require('@feathersjs/errors');
const { iff, isProvider } = require('feathers-hooks-common');


module.exports = {
  before: {
    get: [],
    create: [
      iff(
        isProvider('external'), //only run this for external connections
        async context => {

          //if this is a password style login
          if (typeof context.data.strategy !== 'undefined' && context.data.strategy === 'local') {

            //check to see if the email provided is not verified
            let user = await context.app.service('users').find({
              query: {
                email: context.data.email, isVerified: false
              },
              paginate: false
            });

            if (user.length > 0) {

              throw new Forbidden('Please validate your account');

            }

          }

          return context;

        }),

    ]
  }
};
