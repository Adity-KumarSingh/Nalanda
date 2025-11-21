const User = require('../../models/User');
const { generateToken } = require('../../config/jwt');

const userResolvers = {
  register: async ({ name, email, password, role }, context) => {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const user = await User.create({ name, email, password, role });
    const token = generateToken({ userId: user._id, role: user.role });

    return { user, token };
  },

  login: async ({ email, password }) => {
    const user = await User.findOne({ email }).select('+password');

    if (!user || !user.isActive) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const token = generateToken({ userId: user._id, role: user.role });

    return { user: user.toJSON(), token };
  },

  getProfile: async (args, context) => {
    if (!context.user) {
      throw new Error('Authentication required');
    }
    return context.user;
  }
};

module.exports = userResolvers;