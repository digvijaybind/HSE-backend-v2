const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const {
  createInvestor,
  setPassword,
  loginInvestor,
  updateInvestorEmploymentKyc,
  updateInvestorAnnualIncomeKyc,
  uploadSelfieKyc,
  addressKyc,
} = require('../controller/investor/investor');

router.post('/investor/SignUp', createInvestor);
router.post('/investor/SetPassword', setPassword);
router.post('/investor/SignIn', loginInvestor);
router.post(
  '/investor/UpdateInvestorEmploymentKyc',
  authMiddleware,
  updateInvestorEmploymentKyc
);
router.post(
  '/investor/UpdateInvestorAnnualIncomeKyc',
  authMiddleware,
  updateInvestorAnnualIncomeKyc
);
router.post(
  '/investor/UpdateInvestorSelfieKyc',
  authMiddleware,
  uploadSelfieKyc
);
router.post(
  '/investor/UpdateInvestorAddressKyc',
  authMiddleware,
  uploadSelfieKyc
);
module.exports = router;
