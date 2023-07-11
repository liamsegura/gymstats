import bcrypt from "bcrypt";
import mongoose, { Document } from "mongoose";

interface IUser extends Document {
  userName: string;
  email: string;
  password: string;
  profilePic: {
    url: string;
    type: string;
  };
  bodyweight: number;
  followers: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];
  cloudinaryId: string;
  unreadCount: number;
  comparePassword(candidatePassword: string, cb: (err: Error | null, isMatch: boolean) => void): void;
}

const UserSchema = new mongoose.Schema<IUser>({
  userName: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
  profilePic: {
    url: { type: String, required: true },
    type: { type: String, required: true },
  },
  bodyweight: { type: Number },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  cloudinaryId: {
    type: String,
    required: true,
  },
  unreadCount: {
    type: Number,
    default: 0
  }
});

// Password hash middleware.
UserSchema.pre<IUser>("save", async function (next) {
  const user = this;
  if (!user.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(user.password, salt);
    user.password = hash;
    next();
  } catch (err:any) {
    next(err);
  }
});

// Helper method for validating user's password.
UserSchema.methods.comparePassword = function (
  this: IUser,
  candidatePassword: string,
  cb: (err: Error | null, isMatch: boolean) => void
) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err !== undefined) {
      cb(err, isMatch);
    } else {
      cb(null, isMatch);
    }
  });
};

export default mongoose.model<IUser>("User", UserSchema);
