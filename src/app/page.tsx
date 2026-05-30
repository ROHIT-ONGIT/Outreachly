import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Zap,
  Sparkles,
  Mail,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Users,
  Clock,
  Star,
} from "lucide-react";

// ─── Redirect authenticated users straight to the app ─────────────────────────
export default async function RootPage() {
  const { userId } = await auth();
  if (userId) redirect("/campaigns");

  return <LandingPage />;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function NavBar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/6 bg-[#09090B]/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-900/50">
            <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-[15px] font-bold tracking-tight text-white">Outreachly</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6">
          {["Features", "Pricing", "How it works"].map((l) => (
            <a
              key={l}
              href={`#${l.toLowerCase().replace(/ /g, "-")}`}
              className="text-[13px] text-zinc-400 hover:text-white transition-colors"
            >
              {l}
            </a>
          ))}
        </nav>

        {/* CTAs */}
        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="text-[13px] font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[13px] font-semibold transition-colors shadow-sm shadow-indigo-900/50"
          >
            Start free <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="pt-40 pb-28 px-6 text-center relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />

      <div className="relative max-w-4xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 mb-8">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          <span className="text-[12px] font-semibold text-indigo-300">
            Powered by GPT-4o · Built for B2B sales teams
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
          Cold outreach that{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            actually converts
          </span>
        </h1>

        <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed mb-10">
          Outreachly writes a unique, personalised email for every single lead — using their
          name, role, company, and LinkedIn profile. Import your list, set your sequence,
          and let AI do the heavy lifting.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 h-12 px-7 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-[14px] font-semibold shadow-lg shadow-indigo-900/40 transition-all hover:shadow-indigo-900/60 hover:-translate-y-0.5"
          >
            <Sparkles className="h-4 w-4" />
            Start for free
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 h-12 px-7 rounded-xl border border-white/10 text-zinc-300 hover:text-white hover:border-white/20 text-[14px] font-medium transition-all"
          >
            See how it works <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        {/* Product preview card */}
        <div className="relative max-w-3xl mx-auto rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm overflow-hidden shadow-2xl shadow-black/50">
          {/* Window chrome */}
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/6 bg-white/3">
            <div className="h-3 w-3 rounded-full bg-red-500/60" />
            <div className="h-3 w-3 rounded-full bg-amber-500/60" />
            <div className="h-3 w-3 rounded-full bg-emerald-500/60" />
            <span className="ml-3 text-[11px] text-zinc-500">Outreachly — AI Email Generator</span>
          </div>

          {/* Two-column preview */}
          <div className="flex text-left">
            {/* Left — lead intel */}
            <div className="w-56 shrink-0 border-r border-white/6 p-4 space-y-4">
              <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Lead Intel</p>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
                  SC
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-zinc-100">Sarah Chen</p>
                  <p className="text-[10px] text-zinc-500">VP of Sales · TechCorp</p>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { l: "Company", v: "TechCorp" },
                  { l: "Title", v: "VP of Sales" },
                  { l: "Email", v: "s.chen@..." },
                ].map(({ l, v }) => (
                  <div key={l}>
                    <p className="text-[9px] text-zinc-600 uppercase tracking-wide">{l}</p>
                    <p className="text-[11px] text-zinc-300">{v}</p>
                  </div>
                ))}
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <p className="text-[9px] text-zinc-600 uppercase tracking-wide">AI Readiness</p>
                  <p className="text-[9px] font-bold text-zinc-300">100%</p>
                </div>
                <div className="h-1 bg-white/8 rounded-full overflow-hidden">
                  <div className="h-full w-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" />
                </div>
              </div>
            </div>

            {/* Right — email preview */}
            <div className="flex-1 p-4">
              <div className="flex items-center gap-2 mb-3 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 w-fit">
                <div className="h-3.5 w-3.5 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                  <Sparkles className="h-2 w-2 text-white" />
                </div>
                <span className="text-[10px] font-semibold text-indigo-300">Generated by AI</span>
                <span className="text-[9px] text-zinc-600 ml-1">gpt-4o</span>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1">Subject</p>
                  <p className="text-[12px] font-semibold text-zinc-100">
                    Quick question about TechCorp's sales pipeline
                  </p>
                </div>
                <div className="h-px bg-white/6" />
                <div>
                  <p className="text-[9px] text-zinc-600 uppercase tracking-widest mb-1.5">Body</p>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Hi Sarah,
                    <br /><br />
                    I noticed TechCorp recently expanded into enterprise accounts — congrats on
                    the growth. I work with VP-level sales leaders to reduce the time their
                    teams spend on manual outreach by 80%.
                    <br /><br />
                    Worth a 15-minute chat this week?
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-4 text-[12px] text-zinc-600">
          No credit card required · Free plan includes 50 leads/month
        </p>
      </div>
    </section>
  );
}

function TrustBar() {
  const stats = [
    { value: "10,000+", label: "Leads processed" },
    { value: "38%", label: "Avg. open rate" },
    { value: "12%", label: "Avg. reply rate" },
    { value: "3×", label: "More replies vs manual" },
  ];

  return (
    <section className="border-y border-white/6 bg-white/2 py-10 px-6">
      <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
        {stats.map(({ value, label }) => (
          <div key={label}>
            <p className="text-3xl font-extrabold tracking-tight text-white">{value}</p>
            <p className="text-[12px] text-zinc-500 mt-1">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: Sparkles,
      color: "from-indigo-500 to-violet-600",
      title: "AI Personalisation at Scale",
      desc: "GPT-4o writes a unique email for every lead using their name, role, company, and LinkedIn profile. No more mail-merge templates.",
    },
    {
      icon: Clock,
      color: "from-violet-500 to-purple-600",
      title: "Multi-step Auto Sequences",
      desc: "Build follow-up sequences with custom delay intervals. Outreachly sends the right email at the right time — automatically.",
    },
    {
      icon: BarChart3,
      color: "from-emerald-500 to-teal-600",
      title: "Real-time Analytics",
      desc: "Track open rates, reply rates, and campaign performance across every campaign from a single dashboard.",
    },
  ];

  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-[12px] font-semibold text-indigo-400 uppercase tracking-widest mb-3">
            Features
          </p>
          <h2 className="text-4xl font-extrabold tracking-tight text-white mb-4">
            Everything you need to scale outreach
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto text-[15px] leading-relaxed">
            From lead import to AI generation to delivery tracking — Outreachly handles the
            entire cold outreach workflow.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, color, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-white/8 bg-white/3 p-6 hover:border-indigo-500/30 hover:bg-white/5 transition-all duration-200"
            >
              <div
                className={`h-10 w-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-5 shadow-lg`}
              >
                <Icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-[15px] font-semibold text-white mb-2">{title}</h3>
              <p className="text-[13px] text-zinc-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      num: "01",
      icon: Users,
      title: "Import your leads",
      desc: "Upload a CSV or add leads manually. Include name, company, title, and LinkedIn URL for the best AI personalisation.",
    },
    {
      num: "02",
      icon: Sparkles,
      title: "Build your sequence",
      desc: "Write email steps yourself or hit 'Generate with AI' to get 3 personalised variants per lead in seconds.",
    },
    {
      num: "03",
      icon: Mail,
      title: "Activate and track",
      desc: "Hit activate. Outreachly sends every email at the right time and updates your dashboard with open and reply data.",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 px-6 border-t border-white/6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-[12px] font-semibold text-indigo-400 uppercase tracking-widest mb-3">
            How it works
          </p>
          <h2 className="text-4xl font-extrabold tracking-tight text-white mb-4">
            Up and running in minutes
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-8">
          {steps.map(({ num, icon: Icon, title, desc }) => (
            <div key={num} className="relative">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[11px] font-bold text-indigo-500 tracking-widest">{num}</span>
                <div className="flex-1 h-px bg-white/6" />
                <div className="h-9 w-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-zinc-400" />
                </div>
              </div>
              <h3 className="text-[15px] font-semibold text-white mb-2">{title}</h3>
              <p className="text-[13px] text-zinc-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const plans = [
    {
      name: "Free",
      price: "₹0",
      period: "/mo",
      desc: "For individuals just getting started",
      features: ["50 leads/month", "1 sender email", "AI email generation", "Basic analytics"],
      cta: "Start free",
      href: "/sign-up",
      highlight: false,
    },
    {
      name: "Starter",
      price: "₹9,900",
      period: "/mo",
      desc: "For growing sales reps",
      features: ["500 leads/month", "1 sender email", "AI sequences", "Priority support"],
      cta: "Get started",
      href: "/sign-up",
      highlight: false,
    },
    {
      name: "Growth",
      price: "₹19,900",
      period: "/mo",
      desc: "For serious outbound teams",
      features: ["2,000 leads/month", "3 sender emails", "AI sequences", "Advanced analytics"],
      cta: "Get Growth",
      href: "/sign-up",
      highlight: true,
    },
    {
      name: "Pro",
      price: "₹29,900",
      period: "/mo",
      desc: "For high-volume outreach",
      features: ["Unlimited leads", "10 sender emails", "Custom AI prompts", "Dedicated support"],
      cta: "Get Pro",
      href: "/sign-up",
      highlight: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 px-6 border-t border-white/6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-[12px] font-semibold text-indigo-400 uppercase tracking-widest mb-3">
            Pricing
          </p>
          <h2 className="text-4xl font-extrabold tracking-tight text-white mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-zinc-400 max-w-lg mx-auto text-[15px]">
            Start free. Upgrade when you need more leads. No hidden fees, no per-seat pricing.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border p-6 ${
                plan.highlight
                  ? "border-indigo-500/50 bg-gradient-to-b from-indigo-600/10 to-transparent"
                  : "border-white/8 bg-white/3"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-[10px] font-bold shadow-lg shadow-indigo-900/50">
                    <Star className="h-2.5 w-2.5 fill-current" /> Most popular
                  </span>
                </div>
              )}

              <div className="mb-5">
                <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest mb-1">
                  {plan.name}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-zinc-500 text-[12px]">{plan.period}</span>
                </div>
                <p className="text-[12px] text-zinc-500 mt-1">{plan.desc}</p>
              </div>

              <ul className="space-y-2 flex-1 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-[12px] text-zinc-400">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`w-full h-10 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  plan.highlight
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-900/40"
                    : "border border-white/10 text-zinc-300 hover:text-white hover:border-white/20 bg-white/3"
                }`}
              >
                {plan.cta} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "We went from 2% to 14% reply rate in our first month. The AI personalisation is genuinely impressive — leads actually think we researched them individually.",
      name: "Rahul Mehta",
      title: "Head of Sales, Stackify",
      initials: "RM",
      color: "from-indigo-500 to-violet-600",
    },
    {
      quote:
        "We used to spend 4 hours a day manually personalising cold emails. Outreachly does it in seconds. Our SDR team now focuses on calls, not copy-paste.",
      name: "Priya Sharma",
      title: "Founder, GrowthLab",
      initials: "PS",
      color: "from-emerald-500 to-teal-600",
    },
    {
      quote:
        "The sequence automation alone is worth the price. Set it up once and it runs on autopilot. Best outreach tool we've tried and we've tried all of them.",
      name: "Arjun Kapoor",
      title: "VP Sales, CloudBase",
      initials: "AK",
      color: "from-violet-500 to-purple-600",
    },
  ];

  return (
    <section className="py-24 px-6 border-t border-white/6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-[12px] font-semibold text-indigo-400 uppercase tracking-widest mb-3">
            Testimonials
          </p>
          <h2 className="text-4xl font-extrabold tracking-tight text-white mb-4">
            Loved by sales teams
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          {testimonials.map(({ quote, name, title, initials, color }) => (
            <div
              key={name}
              className="rounded-2xl border border-white/8 bg-white/3 p-6 flex flex-col gap-5"
            >
              {/* Stars */}
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <p className="text-[13px] text-zinc-400 leading-relaxed flex-1">&ldquo;{quote}&rdquo;</p>

              <div className="flex items-center gap-3">
                <div
                  className={`h-9 w-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-[11px] font-bold text-white shrink-0`}
                >
                  {initials}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-white">{name}</p>
                  <p className="text-[11px] text-zinc-500">{title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTABanner() {
  return (
    <section className="py-24 px-6 border-t border-white/6">
      <div className="max-w-3xl mx-auto text-center relative">
        <div className="absolute inset-0 bg-indigo-600/8 rounded-3xl blur-3xl pointer-events-none" />
        <div className="relative rounded-3xl border border-indigo-500/20 bg-gradient-to-b from-indigo-600/8 to-transparent p-14">
          <h2 className="text-4xl font-extrabold tracking-tight text-white mb-4">
            Ready to 10× your reply rate?
          </h2>
          <p className="text-zinc-400 text-[15px] mb-8 leading-relaxed">
            Join thousands of sales teams using Outreachly to book more meetings with less effort.
            Start free — no credit card required.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 h-12 px-8 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-[14px] font-semibold shadow-lg shadow-indigo-900/50 transition-all hover:shadow-indigo-900/70 hover:-translate-y-0.5"
          >
            <Sparkles className="h-4 w-4" />
            Get started for free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/6 py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Zap className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-[14px] font-bold text-white">Outreachly</span>
        </div>

        <div className="flex items-center gap-6">
          {["Privacy", "Terms", "Support"].map((l) => (
            <a key={l} href="#" className="text-[12px] text-zinc-500 hover:text-zinc-300 transition-colors">
              {l}
            </a>
          ))}
        </div>

        <p className="text-[12px] text-zinc-600">
          © {new Date().getFullYear()} Outreachly. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

function LandingPage() {
  return (
    <div className="min-h-screen bg-[#09090B] text-white">
      <NavBar />
      <HeroSection />
      <TrustBar />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <TestimonialsSection />
      <CTABanner />
      <Footer />
    </div>
  );
}
