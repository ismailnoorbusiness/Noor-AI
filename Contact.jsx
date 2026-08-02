import { useState } from "react";
import { Mail, MessageSquare, MapPin, Send } from "lucide-react";

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const submit = (e) => {
    e.preventDefault();
    setSent(true);
    setForm({ name: "", email: "", message: "" });
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="pt-16 pb-24">
      <div className="max-w-5xl mx-auto px-5 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Get in <span className="gradient-text">touch</span>
          </h1>
          <p className="mt-4 text-muted-foreground text-lg">
            Questions, feedback, or partnership ideas — we'd love to hear from you.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            {[
              { icon: Mail, title: "Email", value: "hello@noor.ai" },
              { icon: MessageSquare, title: "Live chat", value: "Mon–Fri, 9–5" },
              { icon: MapPin, title: "Office", value: "San Francisco, CA" },
            ].map((c) => (
              <div key={c.title} className="glass rounded-2xl p-5 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl gradient-blue flex items-center justify-center glow-sm shrink-0">
                  <c.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">{c.title}</div>
                  <div className="text-sm font-medium">{c.value}</div>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={submit} className="lg:col-span-2 glass rounded-2xl p-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Email</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition"
                  placeholder="you@email.com"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Message</label>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition resize-none"
                placeholder="How can we help?"
              />
            </div>
            <button type="submit" className="btn-primary w-full sm:w-auto">
              {sent ? "Message sent!" : "Send message"}
              <Send className="w-4 h-4" />
            </button>
            {sent && <p className="text-sm text-green-400">Thanks! We'll get back to you shortly.</p>}
          </form>
        </div>
      </div>
    </div>
  );
}
