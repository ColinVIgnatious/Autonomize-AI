const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  name: String,
  avatar_url: String,
  location: String,
  bio: String,
  public_repos: Number,
  public_gists: Number,
  followers: Number,
  following: Number,
  created_at: Date,
  updated_at: Date,
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  soft_deleted: { type: Boolean, default: false },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
