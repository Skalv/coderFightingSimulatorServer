const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const Bcrypt = require('bcrypt-nodejs');
const md5 = require('md5');

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const self = "http://skalv-studio.fr";

const userSchema = new Schema({
  username: {type: String, required: true},
  password: {type: String, required: true},
  email: {type: String, required: true, unique: true},
  createdAt: {type: Date, default: Date.now},
  updatedAt: {type: Date, default: Date.now},
  team: {type: ObjectId, required: true, ref: 'users'}
});

userSchema.methods.validPassword = function (password) {
  // Crypt method of VBulletin
  return (md5(md5(password) + this.salt) === this.password);
};

userSchema.pre('save', function (next) {
  if (this.isNew) {
    this.salt = Bcrypt.genSaltSync(10);
    // Crypt method of VBulletin
    this.password = md5(md5(this.password) + this.salt);
  }
  next();
});

const model = mongoose.model('User', userSchema);

module.exports = {
  schema: userSchema,
  model,
  registry: {
    urlTemplates: {
      self: `${self}/api/users/{id}`,
      relationship: `${self}/api/users/{ownerId}/relationships/{path}`
    },
    beforeRender(resource, req) {
      resource.removeAttr('password');
      logger.log('silly', `NOT USED  : ${req}`);

      return resource;
    }
  }
};
