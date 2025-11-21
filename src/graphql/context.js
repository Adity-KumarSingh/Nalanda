const { verifyToken } = require('../config/jwt');
const User = require('../models/User');

const createContext = async (req) => {
  const context = { user: null };

  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const encryptedToken = authHeader.split(' ')[1];
      const decoded = verifyToken(encryptedToken);

      const user = await User.findById(decoded.userId).select('-password');

      if (user && user.isActive) {
        context.user = user;
      }
    }
  } catch (error) {
  }

  return context;
};

module.exports = createContext;