import mongoose from "mongoose";

const tenantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  plan: { type: String, enum: ["free", "pro"], default: "free" },
  credits: { type: Number, default: 3 },
  inviteCode: { type: String },
}, { timestamps: true });

export default mongoose.model("Tenant", tenantSchema);
