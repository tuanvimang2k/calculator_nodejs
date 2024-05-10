const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = new Schema(
    {
        email: { type: String },
        password: { type: String },
        coin: { type: Number },
        localPass:{type:String}
    },
    {
        versionKey: false,
    }
);

module.exports = mongoose.models.user || mongoose.model('user', userSchema);
