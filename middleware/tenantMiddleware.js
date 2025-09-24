import Tenant from "../models/Tenant.js";

// Ensure user belongs to a tenant
export const requireTenant = async (req, res, next) => {
  if (!req.user.tenant) {
    return res.status(403).json({ message: "You must belong to a tenant" });
  }

  const tenant = await Tenant.findById(req.user.tenant._id);
  if (!tenant) return res.status(404).json({ message: "Tenant not found" });

  req.tenant = tenant;
  next();
};
