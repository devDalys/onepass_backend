import mongoose from 'mongoose';
const AccountEntries = new mongoose.Schema(
  {
    login: String,
    password: String,
    iconSrc: String,
  },
  {
    timestamps: true,
  },
);

const AccountSchema = new mongoose.Schema(
  {
    socialName: String,
    accountEntries: [AccountEntries],
  },
  {timestamps: true},
);

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
