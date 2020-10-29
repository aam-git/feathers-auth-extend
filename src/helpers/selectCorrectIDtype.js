// eslint-disable-next-line no-unused-vars
module.exports = (model, data) => {
  //standard search for mysql etc
  let userID = data.id;

  //switch to mongodb ids
  if (model.options.id === '_id') {
    const ObjectID = require('mongodb').ObjectID;
    userID = new ObjectID(data._id);
  }

  return userID;
};
