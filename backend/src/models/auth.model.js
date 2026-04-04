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
    otpExpires: {
        type: Date,
        default: null
    },
    isVolunteer: {
        type: Boolean,
        default: false
    },
    lastLocation: {
        latitude: Number,
        longitude: Number,
        updatedAt: { type: Date, default: Date.now }
    },
    pushToken: String
}, { collection: 'veera_shield_users' });

const UserModel = mongoose.model("User", userSchema)

export default UserModel
