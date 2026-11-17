import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: String,
  image: String,
  price: Number,
  qty: Number,
  variant: String,
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderItems: [orderItemSchema],
    shippingAddress: {
      fullName: String,
      phone: String,
      addressLine: String,
      city: String,
      state: String,
      pincode: String,
      country: String,
    },
    paymentMethod: { type: String, enum: ["Razorpay", "COD"], required: true },
    paymentResult: {
      id: String,
      status: String,
      updateTime: String,
      email: String,
    },
    itemsPrice: Number,
    taxPrice: { type: Number, default: 0 },
    shippingPrice: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalPrice: Number,
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon" },
    isPaid: { type: Boolean, default: false },
    paidAt: Date,
    orderStatus: {
      type: String,
      enum: ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled", "Refunded"],
      default: "Pending",
    },
    deliveredAt: Date,
    cancelledAt: Date,
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;