const axios = require('axios');
const User = require('../models/User');

// Helper function to fetch data from GitHub API
const fetchGitHubUser = async (username) => {
  const response = await axios.get(`https://api.github.com/users/${username}`);
  return response.data;
};

// Add or update a user in the database
exports.addUser = async (req, res) => {
  const { username } = req.body;

  try {
    let user = await User.findOne({ username, soft_deleted: false });

    if (user) {
      return res.status(200).json(user);
    }

    const gitHubUser = await fetchGitHubUser(username);
    user = new User({
      username: gitHubUser.login,
      name: gitHubUser.name,
      avatar_url: gitHubUser.avatar_url,
      location: gitHubUser.location,
      bio: gitHubUser.bio,
      public_repos: gitHubUser.public_repos,
      public_gists: gitHubUser.public_gists,
      followers: gitHubUser.followers,
      following: gitHubUser.following,
      created_at: gitHubUser.created_at,
      updated_at: gitHubUser.updated_at,
    });

    await user.save();
    res.status(201).json(user);
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Find mutual friends
exports.findMutualFriends = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username, soft_deleted: false });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const followersResponse = await axios.get(`https://api.github.com/users/${username}/followers`);
    const followingResponse = await axios.get(`https://api.github.com/users/${username}/following`);

    const followers = followersResponse.data.map((f) => f.login);
    const following = followingResponse.data.map((f) => f.login);

    const mutualFriends = followers.filter((f) => following.includes(f));
    user.friends = await User.find({ username: { $in: mutualFriends }, soft_deleted: false });

    await user.save();
    res.status(200).json(user.friends);
  } catch (error) {
    console.error('Error finding mutual friends:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Search users
exports.searchUsers = async (req, res) => {
  const { username, location } = req.query;

  try {
    const query = {
      soft_deleted: false,
      ...(username && { username: new RegExp(username, 'i') }),
      ...(location && { location: new RegExp(location, 'i') }),
    };

    const users = await User.find(query);
    res.status(200).json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Soft delete user
exports.softDeleteUser = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOneAndUpdate({ username, soft_deleted: false }, { soft_deleted: true }, { new: true });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'User soft deleted successfully' });
  } catch (error) {
    console.error('Error soft deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update user fields
exports.updateUser = async (req, res) => {
  const { username } = req.params;
  const updateData = req.body;

  try {
    const user = await User.findOneAndUpdate({ username, soft_deleted: false }, updateData, { new: true });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all users sorted by field
exports.getAllUsers = async (req, res) => {
  const { sortBy } = req.query;

  try {
    const users = await User.find({ soft_deleted: false }).sort({ [sortBy]: 1 });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
