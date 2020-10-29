/* eslint-disable no-unused-vars */

const { NotFound, BadRequest } = require('@feathersjs/errors');

const selectCorrectIDtype = require('../helpers/selectCorrectIDtype');

const randomatic = require('randomatic');

const ucWords = (text) => {
  return text.split(' ').map((txt) => (txt.substring(0, 1).toUpperCase() + txt.substring(1, txt.length))).join(' ');
};

const timeConversion = (ms) => {

  const seconds = (ms / 1000).toFixed();
  const minutes = (ms / (1000 * 60)).toFixed();
  const hours = (ms / (1000 * 60 * 60)).toFixed();
  const days = (ms / (1000 * 60 * 60 * 24)).toFixed();

  if (seconds < 60) {
    return seconds + ' Second' + (seconds != 1 ? 's' : '');
  } else if (minutes < 60) {
    return minutes + ' Minute' + (minutes != 1 ? 's' : '');
  } else if (hours < 24) {
    return hours + ' Hour' + (hours != 1 ? 's' : '');
  } else {
    return days + ' Day' + (days != 1 ? 's' : '');
  }

};

const sendVerify = async (app, user, type = 'account', chars = 8, expires = (24*60*60*1000)) => {
  try {

    let verify = randomatic('Aa0', chars);

    const users = app.service('users');

    let update = {};
    update[type + 'Token'] = verify;
    update[type + 'TokenExpires'] = (Date.now()) + expires;

    await users.patch(
      selectCorrectIDtype(users, user),
      update
    );

    await app.service('_mailer').create({
      from: app.get('feathers-mail').from,
      to: user.email,
      subject: (app.get('feathers-auth-extend').name || '') + ' ' + ucWords(type) + ' Confirmation Token',
      text: 'Your ' + (app.get('feathers-auth-extend').name || '') + ' ' +  ucWords(type) + ' confirmation token is ' + verify + '\n\nYour Token expires in ' + timeConversion(expires),
      html: '<center><h1>' + (app.get('feathers-auth-extend').name || '') + '</h1><h2>' +  ucWords(type) + ' Confirmation Token</h2><h3>' + verify + '</h3><small>Your Token expires in ' + timeConversion(expires) + '</small></center>'
    });

  } catch (e) {
    throw new Error(e);
  }
};

exports.authManage = class authManage {
  constructor (app) {
    this.app = app;
    this.feConfig = this.app.get('feathers-auth-extend') || undefined;
  }

  async get(email) {

    //if magicTokens enabled
    if (this.feConfig !== undefined && this.feConfig.magicTokens) {

      //check to see if user exists
      let users = await this.app.service('users').find({
        query: {
          email: email
        },
        paginate: false
      });

      let user;

      //user doesn't exist, create them
      if (users.length < 1) {

        await this.app.service('users').create({
          'email': email,
          'type': 'magic'
        });

      } else {

        await sendVerify(this.app, {id: users[0].id || null, _id: users[0]._id || null, email: users[0].email}, 'login', 8, (0.08*60*60*1000));

      }

      return {success: true};

    }


  }

  async create (data, params) {

    switch (data.action) {

    case 'sendVerify': {

      if (data.type !== 'magic') {
        await sendVerify(this.app, data);
      } else {
        await sendVerify(this.app, data, 'login', 8, (0.08*60*60*1000));
      }

      return {success: true};

    }

    case 'verifyAccount': {

      if (params.user.accountToken !== data.token) {

        throw new NotFound('Token Error');

      } else {

        //if token has expired send a new one
        if (Date.now() > params.user.accountTokenExpires) {
          await sendVerify(this.app, {
            id: params.user.id || null,
            _id: params.user._id || null,
            email: params.user.email
          });
          throw new NotFound('Token Expired');
        } else {
          //success

          const users = this.app.service('users');

          await users.patch(
            selectCorrectIDtype(users, params.user),
            {
              isVerified: true,
              accountTokenExpires: null,
              accountToken: null,
            });

          return {success: true};

        }

      }

    }
    case 'resetPassword': {
      await sendVerify(this.app, params.user, 'reset', 8, (0.5*60*60*1000));

      return {success: true};
    }
    case 'verifyReset': {

      if (params.user.resetToken !== data.token) {

        throw new NotFound('Token Error');

      } else {

        //if token has expired send a new one
        if (Date.now() > params.user.resetTokenExpires) {
          throw new NotFound('Token Expired');
        } else {
          //success

          const users = this.app.service('users');

          await users.patch(
            selectCorrectIDtype(users, params.user),
            {
              resetTokenExpires: null,
              resetToken: null,
              password: data.password
            });

          return {success: true};

        }

      }

    }
    default: {

      throw new BadRequest('Invalid Action');
    }


    }

  }
};
