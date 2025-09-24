import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "member"], default: "member" },
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant" },
}, { timestamps: true });

export default mongoose.model("User", userSchema);
