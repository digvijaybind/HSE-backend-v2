const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');

const prisma = new PrismaClient();

const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;
  if (req?.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    try {
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('This is decode token', decoded);
        const investor = await prisma.Investor.findUnique({
          where: {
            id: decoded?.id,
          },
        });
        req.investor = investor;
        console.log('THis is investor', investor);
        next();
      }
    } catch (error) {
      throw new Error(
        'No Authorized token, token expired , Please Login again'
      );
    }
  } else {
    throw new Error('No Bearer token attached to header');
  }
});

// const isInvestor = asyncHandler(async (req, res, next) => {
//   const { emailId } = req.investor;
//   const InvestorUser = await prisma.Investor.findUnique({
//     where: {
//       emailId: emailId,
//     },
//   });
//   // if (adminUser.role !== 'Admin') {
//   //   throw new Error('Only admin can access this route');
//   // } else {
//   //   next();
//   // }
// });
module.exports = { authMiddleware };
