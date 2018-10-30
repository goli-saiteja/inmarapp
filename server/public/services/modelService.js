var mongodb = require("mongodb");
var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var ObjectId = mongoose.Types.ObjectId;

var mongooseConnect = ()=>{
  mongoose.connect('mongodb://localhost:27017/test')
      .then(() => { // if all is ok we will be here
          // var modeldtl = is_model_available('/location/5b7dced7416b7c1ea2129c53/');
      })
      .catch(err => { // if error we will be here
          console.error('App starting error:', err.stack);
          process.exit(1);
      });
}

var itemSchema = new Schema({
   name: String,
   path: String,
   type: String,
});

var items = mongoose.model("item", itemSchema);

var userSchema = new Schema({
    username: String,
    role: String,
    password: String,
    email: String,
    joindate: { type: Date, default: Date.now },
  });
var users = mongoose.model("user", userSchema);
module.exports = {mongoose, mongooseConnect, items, itemSchema, ObjectId, Schema, users, userSchema}
