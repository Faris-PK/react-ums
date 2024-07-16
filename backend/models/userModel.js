import mongoose from "mongoose";
import bcrypt from 'bcryptjs'

const userSchema = mongoose.Schema({
  name:{
    type:String,
    required:true
  },
  email:{
    type:String,
    required:true,
    unique:true
  },
  password:{
    type:String,
    required:true
  },
  isAdmin:{
    type:String,
    default :false
  },
  profileImage:{
    type:String,
    default:'https://cdn.pixabay.com/photo/2016/11/18/23/38/child-1837375_1280.png'
  }
},{
  timestamps:true
})

userSchema.pre('save',async function(next){
  if(!this.isModified('password')){
    next()
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password,salt)
})

userSchema.methods.matchPasswords = async function (enteredPassword){
  return await bcrypt.compare(enteredPassword,this.password)
}

const User = mongoose.model('User',userSchema)

export default User