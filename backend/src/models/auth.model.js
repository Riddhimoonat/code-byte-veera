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
    }
});

const UserModel = mongoose.model("User", userSchema)

export default UserModel
