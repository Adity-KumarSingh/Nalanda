const jwt = require('jsonwebtoken');
const CryptoJS = require('crypto-js');

const JWT_SECRET = process.env.JWT_SECRET;
const ENCRYPTION_KEY = process.env.JWT_ENCRYPTION_KEY;

const generateToken = (payload) => {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  const encryptedToken = CryptoJS.AES.encrypt(token, ENCRYPTION_KEY).toString();
  return encryptedToken;
};

const verifyToken = (encryptedToken) => {
  try {
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedToken, ENCRYPTION_KEY);
    const token = decryptedBytes.toString(CryptoJS.enc.Utf8);
    
    if (!token) {
      throw new Error('Invalid token format');
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

module.exports = { generateToken, verifyToken };