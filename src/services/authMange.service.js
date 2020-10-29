// Initializes the `users` service on path `/authManage`
const { authManage } = require('../class/authManage.class');
const hooks = require('../hooks/authManage.hooks');

module.exports = function (app) {

  if (typeof app.service('authManage') === 'undefined') {

    // Initialize our service with any options it requires
    app.use('/authManage', new authManage(app));

    // Get our initialized service so that we can register hooks
    const service = app.service('authManage');

    service.hooks(hooks);

  }

};
