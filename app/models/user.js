import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const UserSchema = new mongoose.Schema({
  church: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Church',
    required: true
  },
  first_name: {
    type: String,
    trim: true,
    required: true
  },
  last_name: {
    type: String,
    trim: true,
    required: true
  },
  mobile: {
    type: String,
    trim: true,
    required: false,
    default: ''
  },
  user_status: {
    type: Boolean,
    default: false
  },
  otp: {
    type: String,
    default: ''
  },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ["user", "admin"], required: true },
  profilePicture: String,
  bio: String,
  password: {
    type: String,
    required: true
  },
  secure_url: {
    type: String,
    required: false,
    default: ''
  },
  public_id: {
    type: String,
    required: false,
    default: ''
  },
  fcm: {
    type: String,
    required: false,
    default: ''
  },
}, { timestamps: true });

UserSchema.statics.findByEmail = function (email) {
  const user = this.findOne({ email });
  return user;
};

UserSchema.methods.generatePasswordHash = function (password) {
  const saltRounds = 10;
  const result = bcrypt.hash(password, saltRounds);
  return result;
};

UserSchema.methods.validatePassword = function (password) {
  try {
    return bcrypt.compare(password, this.password);
  } catch (error) {
    console.error(error);
    return false;
  }
};

UserSchema.statics.autocomplete = function (searchTerm) {
  const regex = new RegExp(searchTerm, 'i'); 
  return this.find({
    $or: [
      { first_name: regex },
      { last_name: regex },
      { email: regex }
    ]
  }).limit(10); 
};

const User = mongoose.models.User || mongoose.model('User', UserSchema);
export default User;
