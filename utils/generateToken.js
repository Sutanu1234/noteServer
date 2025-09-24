import jwt from "jsonwebtoken";

// Generate JWT token
export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      tenant: user.tenant,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};
