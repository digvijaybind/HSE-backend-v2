const cloudinary = require('cloudinary');

cloudinary.config({
  cloud_name: 'dzm2pbk2k',
  api_key: process.env.CLOUDINARY_API_KEY,

  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const opts = {
  overwrite: true,
  invalidate: true,
  resource_type: 'auto',
};

module.exports = (image) => {
  return new promise((resolve, reject) => {
    cloudinary.uploader.upload(image, opts, (error, result) => {
      if (result && result.secure_url) {
        console.log('result_url is this>>>>>', result.secure_url);
        return resolve(result.secure_url);
      }
      console.log(error.message);
      return reject({
        message: error.message,
      });
    });
  });
};
