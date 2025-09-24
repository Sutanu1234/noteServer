import Tenant from "../models/Tenant.js";
import User from "../models/User.js";

// Get tenant info with members
export const getTenant = async (req, res) => {
  try {
    const tenantId = req.params.slug;
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) return res.status(404).json({ message: "Tenant not found" });

    // Fetch members with this tenantId
    const members = await User.find({ tenant: tenant._id }).select("email role");

    res.json({
      name: tenant.name,
      inviteCode: tenant.inviteCode,
      slug: tenant.slug,
      members,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin can upgrade tenant plan
export const upgradeTenantPlan = async (req, res) => {
  try {
    const tenantId = req.params.slug;
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) return res.status(404).json({ message: "Tenant not found" });

    tenant.plan = "pro";
    tenant.credits = 10000;
    await tenant.save();

    res.json({ message: "Tenant upgraded to Pro", tenant });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin can generate a new invite code
export const generateInviteCode = async (req, res) => {
  try {
    const tenantId = req.params.slug;
    const tenant = await Tenant.findOne({ slug: tenantId });
    if (!tenant) return res.status(404).json({ message: "Tenant not found" });

    tenant.inviteCode = Math.floor(100000 + Math.random() * 900000).toString();
    await tenant.save();

    res.json({ inviteCode: tenant.inviteCode });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeUser = async (req, res) => {
  try {
    const { slug, userId } = req.params;
    const tenant = await Tenant.findOne({ slug });
    if (!tenant) return res.status(404).json({ message: "Tenant not found" });

    const user = await User.findOne({ _id: userId, tenant: tenant._id });
    if (!user) return res.status(404).json({ message: "User not found in this tenant" });

    if (user.role === "admin") return res.status(403).json({ message: "Cannot remove admin" });

    user.tenant = null;
    await user.save();

    res.json({ message: "User removed from tenant" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get tenant plan and credits
export const getTenantPlan = async (req, res) => {
  try {
    const tenantId = req.params.id;
    const tenant = await Tenant.findById(tenantId);

    if (!tenant) return res.status(404).json({ message: "Tenant not found" });

    res.json({
      plan: tenant.plan,
      credits: tenant.plan === "pro" ? 10000 : tenant.credits,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};