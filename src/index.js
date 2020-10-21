const hooks = require('./hooks/users.hooks');

const loadHooks = (app) => {
  // Get our initialized service so that we can register hooks
  const users = app.service('users');

  users.hooks(hooks);

};

module.exports = {
  loadHooks
};
