import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";

/**
 * The format of the user Model.
 * Creating a new instance of the mongoose schema class
 **/
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      minlength: [6, "Minimum length 6 characters."],
      maxlength: [30, "Maximum length 30 characters"],
    },
    username: {
      type: String,
      lowercase: true,
      select: false,
      default: function () {
        return this.name.split(" ").join("");
      },
    },
    profilephoto: {
      type: String,
      default: "",
    },
    coverphoto: {
      type: String,
      default: "",
    },
    profession: {
      type: "String",
      default: "",
      select: false,
    },
    bio: {
      type: "string",
      maxlength: [150, "Max length reached!"],
      default: "",
      select: false,
    },
    website: {
      type: "String",
      default: "",
      select: false,
    },
    gender: {
      type: String,
      enum: ["male", "female", "others"],
      lowercase: true,
      select: false,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      lowercase: true,
      unique: true,
      select: false,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    phone: {
      type: String,
      select: false,
      minlength: [10, "Minimum length 10"],
      maxlength: [10, "Maximum length 10"],
    },
    country: {
      type: String,
      default: "",
      select: false, //hides the country
    },
    state: {
      type: String,
      default: "",
      select: false, //hides the state
    },
    location: {
      type: String,
      default: "",
      select: false,
    },
    passcode: {
      type: String,
      required: [true, "Please provide your password"],
      minlength: [8, "Password cannot be lower than 8"],
      select: false, //hides the password
    },
    passcodeConfirm: {
      type: String,
      required: [true, "Please confirm your passcode"],
      minlength: [8, "Password cannot be lower than 8"],
      validate: {
        validator: function (el) {
          return el === this.passcode;
        },
        message: "Passwords do not match!",
      },
    },
    passcodeChangedAt: {
      type: Date,
    },
    likes: {
      type: Array,
      default: [],
      select: false,
    },
    followers: {
      type: Array,
      default: [],
      select: false,
    },
    following: {
      type: Array,
      default: [],
      select: false,
    },
    createdAt: {
      type: String,
      default: function () {
        return Math.floor(new Date().getTime() / 1000);
      },
    },
    updatedAt: {
      type: String,
    },
  },
  { versionKey: false }
);

userSchema.pre("save", async function () {
  if (!this.isModified("passcode")) return;

  this.passcode = await bcrypt.hash(this.passcode, 10);

  this.passcodeConfirm = undefined;

  if (!this.isNew) {
    this.passcodeChangedAt = Date.now() - 1000;
  }
});

userSchema.methods.correctPassword = async (
  candidatePassword,
  userPassword
) => {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passcodeChangedAt) {
    const changedTimestamp = parseInt(
      this.passcodeChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  return false;
};
// 1st parameter in model stands for the database table name in mongodb
export const user = mongoose.model("user", userSchema);
