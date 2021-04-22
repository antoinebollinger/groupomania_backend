const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
})

const uploader = (file, width = 800) => {
    const image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(image, { folder: process.env.API_FOLDER, width: width, quality: "auto", fetch_format: "auto", crop: "scale"}, (err, result) => {
            if (err) return reject(err);
            return resolve(result.secure_url);
        })
    })
};

const destroyer = (fileUrl) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(fileUrl, (err, result) => {
            if (err) return reject(err);
            return resolve(result);
        });
    })
}

module.exports = {
    uploader,
    destroyer
};