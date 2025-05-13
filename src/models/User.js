import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password:{
        type: String,
        required: true,
        minlength: 8,
    },
    profileImg: {
        type: String,
        default: "",
    }
}, {timestamps: true});


//bcrypt password
userSchema.pre("save", async function(next){
    //update username while avoiding double hashing
    if(this.isModified("password")){
        return next();
    }

    const salt  = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);

    next();
});

userSchema.methods.comparePassword = async function (userPassword){
    return await bcrypt.compare(userPassword, this.password);
}

const User = mongoose.model("User", userSchema);
export default User;