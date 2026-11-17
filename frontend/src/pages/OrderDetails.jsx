import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { orderAPI } from "../services/orderService";
import Loader from "../components/common/Loader";

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    orderAPI.getById(id).then((res) => setOrder(res.data)).catch(() => {});
  }, [id]);

  if (!order) return <Loader />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="section-title font-semibold mb-2">Order Details</h1>
      <p className="text-sm text-ink/50 mb-8">#{order._id.toUpperCase()}</p>

      <div className="bg-white rounded-2xl p-6 mb-4">
        <h2 className="font-semibold mb-3">Items</h2>
        <div className="space-y-3">
          {order.orderItems.map((i, idx) => (
            <div key={idx} className="flex gap-3 items-center">
              <img src={i.image} alt={i.name} className="w-14 h-14 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{i.name}</p>
                <p className="text-xs text-ink/50">Qty: {i.qty}</p>
              </div>
              <p className="text-sm font-semibold">₹{(i.price * i.qty).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 mb-4">
        <h2 className="font-semibold mb-3">Shipping Address</h2>
        <p className="text-sm text-ink/70 leading-relaxed">
          {order.shippingAddress.fullName}<br />
          {order.shippingAddress.addressLine}<br />
          {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}<br />
          {order.shippingAddress.phone}
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6">
        <h2 className="font-semibold mb-3">Payment Summary</h2>
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between"><span className="text-ink/60">Items</span><span>₹{order.itemsPrice.toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-ink/60">Shipping</span><span>₹{order.shippingPrice}</span></div>
          {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{order.discount}</span></div>}
          <div className="flex justify-between font-semibold border-t border-ink/10 pt-2 mt-2"><span>Total</span><span>₹{order.totalPrice.toLocaleString()}</span></div>
          <p className="text-xs text-ink/50 pt-2">Payment: {order.paymentMethod} · {order.isPaid ? "Paid" : "Unpaid"}</p>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;