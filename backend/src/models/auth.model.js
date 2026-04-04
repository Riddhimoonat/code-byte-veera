import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required:true,
        trim: true
    },
    phone:{
        type: String,
        required: true,
        unique: true
    },
    otp: {
        type: String,
        default: null
    },
    otpExpires: {
        type: Date,
        default: null
    }
}, { collection: 'veera_shield_users' });

const UserModel = mongoose.model("User", userSchema)

export default UserModel
