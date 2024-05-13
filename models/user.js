const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        email: { type: String },
        password: { type: String },
        coin: { type: Number },
        localPass: { type: String },
        isOpenVideo: { type: Boolean, default: false }, // Thuộc tính isOpenVideo
        isOpenPhoto: { type: Boolean, default: false }, // Thuộc tính isOpenPhoto
        isOpenGallery: { type: Boolean, default: false } // Thuộc tính isOpenGallery
    },
    {
        versionKey: false,
    }
);

module.exports = mongoose.models.user || mongoose.model('user', userSchema);
