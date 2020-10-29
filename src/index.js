const { expressOauth } = require('@feathersjs/authentication-oauth');
const { LocalStrategy } = require('@feathersjs/authentication-local');

const AuthService = require('./authentication/AuthService');
const JwtStrategy = require('./authentication/JwtStrategy');

module.exports = app => {

  //make sure we have the config strings for auth service
  if (typeof app.get('feathers-auth-extend') !== 'undefined') {

    //make sure we have the config strings for email service
    if (typeof app.get('feathers-mail') !== 'undefined') {

      // mailer plugin
      //TESTING - app.configure(require('./tmp/feathers-mail/index.js'));
      app.configure(require('feathers-mail'));

      //extend original auth hooks
      app.service('authentication').hooks(require('./hooks/authentication.hooks'));

      //extend users hooks
      app.service('users').hooks(require('./hooks/users.hooks'));

      //set up authManage service
      app.configure(require('./services/authMange.service'));

    }

    const authentication = new AuthService(app);

    authentication.register('jwt', new JwtStrategy());
    authentication.register('local', new LocalStrategy());

    app.use(app.get('feathers-auth-extend').route || '/auth', authentication);
    app.configure(expressOauth());

  }

};
