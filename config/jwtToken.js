const jwt = require('jsonwebtoken');

//generate a token for every Admin with their id when called

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '3d' });
};

module.exports = { generateToken };
