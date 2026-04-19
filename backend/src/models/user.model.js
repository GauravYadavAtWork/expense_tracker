const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 255,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

function mapUser(document) {
  if (!document) {
    return null;
  }

  return {
    id: document._id.toString(),
    name: document.name,
    email: document.email,
    password: document.password,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

async function findByEmail(email) {
  const user = await User.findOne({ email: email.toLowerCase() });
  return mapUser(user);
}

async function findById(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  const user = await User.findById(id);
  return mapUser(user);
}

async function createUser({ name, email, password }) {
  const user = await User.create({
    name,
    email,
    password,
  });

  return mapUser(user);
}

module.exports = {
  findByEmail,
  findById,
  createUser,
};
