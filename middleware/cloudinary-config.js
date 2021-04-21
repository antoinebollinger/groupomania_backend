const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
})

const uploader = (file) => {
    const image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(image, { folder: 'groupomania' }, (err, url) => {
            if (err) return reject(err);
            return resolve(url.url);
        })
    })
};

module.exports = uploader;