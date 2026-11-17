import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.json(user);
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  user.phone = req.body.phone || user.phone;
  if (req.body.password) user.password = req.body.password;
  const updated = await user.save();
  res.json({
    _id: updated._id,
    name: updated.name,
    email: updated.email,
    phone: updated.phone,
    isAdmin: updated.isAdmin,
    token: generateToken(updated._id),
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!(await user.matchPassword(req.body.oldPassword))) {
    res.status(400);
    throw new Error("Old password is incorrect");
  }
  user.password = req.body.newPassword;
  await user.save();
  res.json({ message: "Password changed" });
});

export const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (req.body.isDefault) {
    user.addresses.forEach((a) => (a.isDefault = false));
  }
  user.addresses.push(req.body);
  await user.save();
  res.status(201).json(user.addresses);
});

export const updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const address = user.addresses.id(req.params.addressId);
  if (!address) {
    res.status(404);
    throw new Error("Address not found");
  }
  if (req.body.isDefault) {
    user.addresses.forEach((a) => (a.isDefault = false));
  }
  Object.assign(address, req.body);
  await user.save();
  res.json(user.addresses);
});

export const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses = user.addresses.filter(
    (a) => a._id.toString() !== req.params.addressId
  );
  await user.save();
  res.json(user.addresses);
});

// Admin controllers
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password").sort("-createdAt");
  res.json(users);
});

export const toggleBlockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  user.isBlocked = !user.isBlocked;
  await user.save();
  res.json({ message: user.isBlocked ? "Blocked" : "Unblocked" });
});