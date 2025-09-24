import User from "../models/User.js";
import Tenant from "../models/Tenant.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";

// Generate random 6-digit invite code
const generateInviteCode = () => Math.floor(100000 + Math.random() * 900000).toString();

export const registerAdmin = async (req, res) => {
  try {
    const { email, password, tenantName } = req.body;

    if (!email || !password || !tenantName)
      return res.status(400).json({ message: "All fields are required" });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User exists" });

    // Check or create tenant
    let tenant = await Tenant.findOne({ slug: tenantName.toLowerCase() });
    if (!tenant) {
      tenant = await Tenant.create({
        name: tenantName,
        slug: tenantName.toLowerCase(),
        inviteCode: generateInviteCode(),
        plan: "free",
        credits: 3
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      role: "admin",
      tenant: tenant._id,
    });

    const token = generateToken(user);
    res.status(201).json({ token, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const registerMember = async (req, res) => {
  try {
    const { email, password, inviteCode } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email & password required" });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User exists" });

    let tenant = null;
    if (inviteCode) {
      tenant = await Tenant.findOne({ inviteCode });
      if (!tenant) return res.status(400).json({ message: "Invalid invite code" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      role: "member",
      tenant: tenant ? tenant._id : null,
    });

    const token = generateToken(user);
    res.status(201).json({ token, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email & password required" });

    const user = await User.findOne({ email }).populate("tenant");
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user);
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Join existing tenant using invite code
export const joinTenant = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    const userId = req.user.id;

    const tenant = await Tenant.findOne({ inviteCode });
    if (!tenant) return res.status(400).json({ message: "Invalid invite code" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.tenant = tenant._id;
    await user.save();

    res.json({ message: "Joined tenant successfully", tenant });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Join existing tenant using invite code via URL
export const joinTenantViaLink = async (req, res) => {
  try {
    const { inviteCode } = req.params;
    const userId = req.user.id;

    const tenant = await Tenant.findOne({ inviteCode });
    if (!tenant) return res.status(400).send("Invalid invite code");

    // Find user
    const user = await User.findById(userId);
    if (!user) return res.status(404).send("User not found");

    user.tenant = tenant._id;
    await user.save();

    res.json({ message: "Successfully joined tenant", tenant });
  } catch (error) {
    res.status(500).send("Something went wrong");
  }
};
