import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required:true,
        trim: true
    },
    email:{
        type: String,
        required:true,
        trim: true,
        unique: true
    },
    password:{
        type: String,
        required:true,
        trim: true,
        select:false
    },
    phone:{
        type: String,
        required: true,
        unique: true
    }
});

const UserModel = mongoose.model("User", userSchema)

export default UserModel
