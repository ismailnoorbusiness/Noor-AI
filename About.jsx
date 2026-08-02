import { Sparkles, Target, Heart, Zap, Shield, Globe } from "lucide-react";
import { Link } from "react-router-dom";

const values = [
  { icon: Target, title: "Mission-driven", desc: "We build AI that genuinely helps people do their best work." },
  { icon: Zap, title: "Fast by design", desc: "Every interaction is engineered for instant, fluid responses." },
  { icon: Shield, title: "Privacy first", desc: "Your data is encrypted and never used to train public models." },
  { icon: Heart, title: "Human-centered", desc: "Beautiful, accessible interfaces that respect your attention." },
  { icon: Globe, title: "For everyone", desc: "100+ languages and a platform that works on any device." },
];

export default function About() {
  return (
    <div className="pt-16">
      <section className="max-w-4xl mx-auto px-5 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-blue-300 mb-8">
          <Sparkles className="w-3.5 h-3.5" /> About Noor AI
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Building the future of <span className="gradient-text">intelligence</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
          Noor AI was founded on a simple belief: powerful AI should be accessible, beautiful, and trustworthy.
          We bring chat, image generation, code assistance, document analysis, and translation into one elegant platform —
          so you can focus on creating, not juggling tools.
        </p>
        <Link to="/chat" className="btn-primary mt-8">Try Noor AI</Link>
      </section>

      <section className="py-24">
        <div className="max-w-6xl mx-auto px-5 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {values.map((v) => (
              <div key={v.title} className="glass rounded-2xl p-7 hover:bg-white/5 transition-all hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl gradient-blue flex items-center justify-center glow-sm mb-5">
                  <v.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </div>
            ))}
            <div className="glass rounded-2xl p-7 flex flex-col items-center justify-center text-center">
              <div className="text-4xl font-bold gradient-text">10M+</div>
              <p className="text-sm text-muted-foreground mt-2">Messages generated</p>
            </div>
            <div className="glass rounded-2xl p-7 flex flex-col items-center justify-center text-center">
              <div className="text-4xl font-bold gradient-text">100+</div>
              <p className="text-sm text-muted-foreground mt-2">Languages supported</p>
            </div>
            <div className="glass rounded-2xl p-7 flex flex-col items-center justify-center text-center">
              <div className="text-4xl font-bold gradient-text">99.9%</div>
              <p className="text-sm text-muted-foreground mt-2">Uptime guarantee</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
