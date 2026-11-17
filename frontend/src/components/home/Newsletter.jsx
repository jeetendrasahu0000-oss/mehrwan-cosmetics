import { useState } from "react";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (email) {
      setDone(true);
      setEmail("");
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-16">
      <div className="bg-nude-100 rounded-3xl p-8 md:p-14 text-center">
        <p className="text-[11px] tracking-[0.3em] uppercase text-blush-700 font-semibold mb-3">Join the list</p>
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-ink">Beauty tips, new drops & exclusive offers</h2>
        <p className="text-ink/60 mt-3 max-w-lg mx-auto text-sm">
          Subscribe to our newsletter and get 10% off your first order.
        </p>
        {done ? (
          <p className="mt-6 text-blush-700 font-semibold">Thank you for subscribing! 💕</p>
        ) : (
          <form onSubmit={submit} className="mt-6 max-w-md mx-auto flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="input-field"
            />
            <button className="btn-primary !px-6 whitespace-nowrap">Subscribe</button>
          </form>
        )}
      </div>
    </section>
  );
};

export default Newsletter;