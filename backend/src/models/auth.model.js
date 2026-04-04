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
    },
    isVolunteer: {
        type: Boolean,
        default: false
    },
    lastLocation: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: [0, 0]
        }
    }
}, { collection: 'veera_shield_users', timestamps: True });

userSchema.index({ lastLocation: '2dsphere' });

const UserModel = mongoose.model("User", userSchema)

export default UserModel
