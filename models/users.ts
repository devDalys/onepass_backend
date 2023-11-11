import mongoose from 'mongoose';

const AccountSchema = new mongoose.Schema({
  login: String,
  password: String,
  iconSrc: String,
  socialName: String,
});

const users = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    avatarUrl: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: true,
    },
    accounts: [AccountSchema],
  },
  {
    timestamps: true,
  },
);

export default mongoose.model('users', users);
