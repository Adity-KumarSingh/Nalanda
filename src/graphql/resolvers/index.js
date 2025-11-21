const userResolvers = require('./userResolvers');
const bookResolvers = require('./bookResolvers');
const borrowingResolvers = require('./borrowingResolvers');
const reportResolvers = require('./reportResolvers');

const rootResolver = {
  ...userResolvers,
  ...bookResolvers,
  ...borrowingResolvers,
  ...reportResolvers
};

module.exports = rootResolver;