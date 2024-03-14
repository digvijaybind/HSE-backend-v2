const { PrismaClient } = require('@prisma/client');
const asyncHandler = require('express-async-handler');
const { superBase } = require('../../config/supabse');
const { generateToken } = require('../../config/jwtToken');
const argon = require('argon2');
const prisma = new PrismaClient();
const multer = require('multer');

const storage = multer.memoryStorage(); // Use memory storage for multer
const upload = multer({ storage: storage }).single('selfieImagePath');

const createInvestor = asyncHandler(async (req, res) => {
  const { fullName, mobileNumber, dateofBirth, emailId } = req.body;

  const findInvestor = await prisma.investor.findUnique({
    where: {
      emailId: emailId,
    },
  });
  if (!findInvestor) {
    // create a new Investor
    const Investor = await prisma.Investor.create({
      data: {
        fullName: fullName,
        mobileNumber: mobileNumber,
        dateofBirth: dateofBirth,
        emailId: emailId,
      },
    });
    res.json(Investor);
  } else {
    res.json({
      msg: 'Investor Already Exists',
      success: false,
    });
  }
});

//Update InvestorPasswordWith Password
const setPassword = asyncHandler(async (req, res) => {
  const { emailId, password, confirmPassword } = req.body;
  try {
    const findInvestorWithAssociatedEmailId = await prisma.Investor.findUnique({
      where: {
        emailId: emailId,
      },
    });

    if (!findInvestorWithAssociatedEmailId) {
      res.json({
        msg: 'No Investor With This Associated EmailId Cant setPassword',
        success: false,
      });
    } else if (findInvestorWithAssociatedEmailId.password != null) {
      res.json({
        msg: 'Password Already Set',
      });
    } else {
      const hash = await argon.hash(password);
      const pwMatches = await argon.verify(hash, confirmPassword);
      if (!pwMatches) {
        res.json({
          message: `Your ${password} did not match your ${confirmPassword}`,
        });
      } else {
        const InvestorsWithSetPassword = await prisma.Investor.update({
          where: {
            emailId: emailId,
          },
          data: {
            password: hash,
          },
        });
        res.json(InvestorsWithSetPassword);
      }
    }
  } catch (error) {
    throw new Error(error);
  }
});

//Kyc
//KYC eMPLOYMENT DETAILS
const updateInvestorEmploymentKyc = asyncHandler(async (req, res) => {
  const { id } = req.investor;

  const InvestorsWithUpdatedEmploymentDetails = await prisma.Investor.update({
    where: {
      id,
    },
    data: {
      industry: req?.body?.industry,
      organization: req?.body?.organization,
      roleAtWork: req?.body?.roleAtWork,
      workingDuration: req?.body?.workingDuration,
    },
  });
  res.json(InvestorsWithUpdatedEmploymentDetails);
});

// KYC Annuall inome

const updateInvestorAnnualIncomeKyc = asyncHandler(async (req, res) => {
  const { id } = req.investor;
  const InvestorsWithUpdatedAnnualIncome = await prisma.Investor.update({
    where: {
      id,
    },
    data: {
      incomeRange: req?.body?.incomeRange,
    },
  });
  res.json(InvestorsWithUpdatedAnnualIncome);
});

// const updateWhereYouWork = asyncHandler(async (req, res) => {});
const loginInvestor = asyncHandler(async (req, res) => {
  const { emailId, mobileNumber, password } = req.body;
  // check if Admin exist
  try {
    if (emailId != null) {
      const findInvestorByEmailId = await prisma.Investor.findUnique({
        where: {
          emailId: emailId,
        },
      });
      const pwMatches = await argon.verify(
        findInvestorByEmailId.password,
        password
      );
      if (findInvestorByEmailId && pwMatches) {
        res.json({
          id: findInvestorByEmailId?.id,
          emailId: findInvestorByEmailId?.emailId,
          mobileNumber: findInvestorByEmailId?.mobileNumber,
          password: findInvestorByEmailId?.password,
          fullName: findInvestorByEmailId?.fullName,
          token: generateToken(findInvestorByEmailId?.id),
        });
      } else {
        throw new Error('Invalid Credentials');
      }
    } else if (mobileNumber != null) {
      const findInvestorByMobileNumber = await prisma.Investor.findUnique({
        where: {
          mobileNumber: mobileNumber,
        },
      });
      const pwMatches = await argon.verify(
        findInvestorByMobileNumber.password,
        password
      );
      if (findInvestorByMobileNumber && pwMatches) {
        res.json({
          id: findInvestorByMobileNumber?.id,
          mobileNumber: findInvestorByMobileNumber?.mobileNumber,
          emailId: findInvestorByMobileNumber?.emailId,
          password: findInvestorByMobileNumber?.password,
          fullName: findInvestorByMobileNumber?.fullName,
          token: generateToken(findInvestorByMobileNumber?.id),
        });
      } else {
        throw new Error('Invalid Credentials');
      }
    }
  } catch (error) {
    throw new Error(error);
  }

  // // check and compare password
});

//Kyc
//KYC Selfie Uploading

const uploadSelfieKyc = asyncHandler(async (req, res) => {
  try {
    upload(req, res, async function (err) {
      if (err) {
        console.error(err);
        return res.status(400).json({ error: 'File upload failed' });
      }

      // Check if req.file contains the uploaded file information
      console.log(req.file);
      const { id } = req.investor;

      // }
      const findInvestorWithAssociatedSelfie = await prisma.investor.findUnique(
        {
          where: {
            id,
          },
        }
      );

      if (findInvestorWithAssociatedSelfie.selfieImagePath != null) {
        res.json({
          msg: 'selfieImagePath Already Uploaded',
        });
      } else if (findInvestorWithAssociatedSelfie.selfieImagePath === null) {
        try {
          const imageBuffer = req.file.buffer; // Get the image buffer
          const imageContentType = req.file.mimetype; // Get the image content type
          const originalFilename = req.file.originalname; // Get the original filename

          // Upload the image to Supabase storage with the correct content type and original filename
          const { data, error } = await superBase.storage
            .from('gallery')
            .upload(originalFilename, imageBuffer, {
              cacheControl: '3600',
              upsert: false,
              contentType: imageContentType, // Use the content type from the uploaded file
            });

          if (error) {
            console.error(error);
            return res.status(500).json({ error: 'File upload failed' });
          }
          const imageUrlPath = data.path;
          console.log(imageUrlPath);

          if (!imageUrlPath) {
            return res.status(500).json({ error: 'File upload failed' });
          }

          const imageUrl = await superBase.storage
            .from('gallery')
            .getPublicUrl(imageUrlPath);

          console.log(imageUrl);
          const InvestorWithUploadedSelfie = await prisma.Investor.update({
            where: {
              id,
            },
            data: {
              selfieImagePath: imageUrl.data.publicUrl,
            },
          });

          return res.json({
            msg: 'Selfie uploaded successfully',
            data: InvestorWithUploadedSelfie,
          });
        } catch (err) {
          console.error(err);
          return res.status(500).json({ error: 'Server error' });
        }
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
});

//Kyc
//KYC Address Uploading

const addressKyc = asyncHandler(async (req, res) => {
  try {
    upload(req, res, async function (err) {
      if (err) {
        console.error(err);
        return res.status(400).json({ error: 'File upload failed' });
      }

      // Check if req.file contains the uploaded file information
      console.log(req.file);
      const { id } = req.investor;
      const { addressImagePath } = req.body;

      if (!addressImagePath) {
        return res
          .status(400)
          .json({ error: 'AddressImagePath field is required' });
      }
      const findInvestorWithAssociatedAddress =
        await prisma.Investor.findUnique({
          where: {
            id,
          },
        });

      if (findInvestorWithAssociatedAddress.addressImagePath != null) {
        res.json({
          msg: 'addressImagePath Already Uploaded',
        });
      } else if ((findInvestorWithAssociatedAddress = null)) {
        try {
          const imageBuffer = req.file.buffer; // Get the image buffer
          const imageContentType = req.file.mimetype; // Get the image content type
          const originalFilename = req.file.originalname; // Get the original filename

          // Upload the image to Supabase storage with the correct content type and original filename
          const { data, error } = await superBase.storage
            .from('gallery')
            .upload(originalFilename, imageBuffer, {
              cacheControl: '3600',
              upsert: false,
              contentType: imageContentType, // Use the content type from the uploaded file
            });

          if (error) {
            console.error(error);
            return res.status(500).json({ error: 'File upload failed' });
          }
          const imageUrlPath = data.path;
          console.log(imageUrlPath);

          if (!imageUrlPath) {
            return res.status(500).json({ error: 'File upload failed' });
          }

          const imageUrl = await superBase.storage
            .from('gallery')
            .getPublicUrl(imageUrlPath);

          console.log(imageUrl);
          const InvestorWithUploadedAddress = await prisma.Investor.update({
            where: {
              id,
            },
            data: {
              selfieImagePath: imageUrl.data.publicUrl,
            },
          });

          return res.json({
            msg: 'Address uploaded successfully',
            data: InvestorWithUploadedAddress,
          });
        } catch (err) {
          console.error(err);
          return res.status(500).json({ error: 'Server error' });
        }
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = {
  createInvestor,
  setPassword,
  loginInvestor,
  updateInvestorEmploymentKyc,
  updateInvestorAnnualIncomeKyc,
  uploadSelfieKyc,
  addressKyc,
};
