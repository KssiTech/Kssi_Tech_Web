import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight, ExternalLink, Code2, Building2, Rocket, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { useNavigate } from "react-router-dom";

const Pricing = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: [0.2, 0.8, 0.2, 1] },
  };

  const scaleIn = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.6, ease: "easeOut" },
  };

  const pricingTiers = [
    {
      name: "Open Source",
      description: "Free for research, academia, and open-source projects",
      price: "Free",
      period: "",
      badge: "GPL-3.0",
      features: [
        "Full Python SDK (pip install KSSI TECH)",
        "Random module",
        "Math module",
        "Serialization module",
        "Community support via GitHub",
        "All future open-source releases",
        "Research & non-commercial use",
      ],
      icon: Code2,
      color: "teal" as const,
      popular: false,
      cta: "Get Started",
      onCta: () => window.open("https://github.com/kssi-tech/Hisab", "_blank"),
    },
    {
      name: "Commercial",
      description: "For teams building proprietary products and SaaS",
      price: "Contact",
      period: "for pricing",
      badge: "Most Popular",
      features: [
        "Commercial license — no copyleft obligations",
        "Full Python SDK + C++ Core Library",
        "All compute modules (Random, Math, Serialization, Vectorization, PDE, Date, Util, exp)",
        "Priority support",
        "Production deployment rights",
        "Dedicated account manager",
        "Access to pre-release builds",
      ],
      icon: Rocket,
      color: "gold" as const,
      popular: true,
      cta: "Contact Sales",
      onCta: () => navigate("/contact"),
    },
    {
      name: "Enterprise",
      description: "Custom solutions for large institutions",
      price: "Custom",
      period: "",
      badge: "Enterprise",
      features: [
        "Everything in Commercial",
        "On-premise deployment",
        "SLA guarantees",
        "Custom module development",
        "24/7 premium support",
        "Dedicated infrastructure",
        "Training & onboarding programs",
        "Custom integrations",
      ],
      icon: Building2,
      color: "bronze" as const,
      popular: false,
      cta: "Talk to Us",
      onCta: () => navigate("/contact"),
    },
  ];

  const comparisonRows = [
    { feature: "Python SDK", open: true, commercial: true, enterprise: true },
    { feature: "C++ Core Library", open: false, commercial: true, enterprise: true },
    { feature: "Random Module", open: true, commercial: true, enterprise: true },
    { feature: "Math Module", open: true, commercial: true, enterprise: true },
    { feature: "Serialization Module", open: true, commercial: true, enterprise: true },
    { feature: "Vectorization Module", open: false, commercial: true, enterprise: true },
    { feature: "PDE Module", open: false, commercial: true, enterprise: true },
    { feature: "Priority Support", open: false, commercial: true, enterprise: true },
    { feature: "Commercial License", open: false, commercial: true, enterprise: true },
    { feature: "On-premise Deployment", open: false, commercial: false, enterprise: true },
    { feature: "SLA Guarantees", open: false, commercial: false, enterprise: true },
    { feature: "Custom Module Development", open: false, commercial: false, enterprise: true },
  ];

  const faqs = [
    {
      question: "What is the difference between the GPL and Commercial license?",
      answer:
        "The GPL-3.0 license is free to use for open-source projects and research, but requires you to open-source your own code when distributing. The Commercial license removes that requirement, letting you build proprietary products and SaaS services on top of KSSI TECH without any copyleft obligations.",
    },
    {
      question: "Can I use KSSI TECH for academic research?",
      answer:
        "Yes — the Open Source tier is free for academic research, university projects, and non-commercial use. You get full access to the Python SDK and core modules.",
    },
    {
      question: "Which Python versions are supported?",
      answer:
        "KSSI TECH supports Python 3.9 and above. Install via pip: pip install KSSI TECH.",
    },
    {
      question: "Can I switch from Open Source to Commercial later?",
      answer:
        "Absolutely. You can start with the open-source tier and upgrade to a commercial license when you're ready to ship a proprietary product.",
    },
    {
      question: "What compute modules are currently active?",
      answer:
        "The Random module is fully operational today. Serialization, Vectorization, Math, PDE, Util, Date, and exp are planned and will be progressively activated.",
    },
  ];

  const colorMap = {
    teal: {
      icon: "bg-khwarizmia-teal/15 text-khwarizmia-teal",
      check: "text-khwarizmia-teal",
      border: "border-khwarizmia-teal/40",
      badge: "bg-khwarizmia-teal/10 text-khwarizmia-teal border border-khwarizmia-teal/30",
    },
    gold: {
      icon: "bg-khwarizmia-gold/15 text-khwarizmia-gold",
      check: "text-khwarizmia-gold",
      border: "border-khwarizmia-gold/60",
      badge: "bg-khwarizmia-gold/10 text-khwarizmia-gold border border-khwarizmia-gold/30",
    },
    bronze: {
      icon: "bg-khwarizmia-bronze/15 text-khwarizmia-bronze",
      check: "text-khwarizmia-bronze",
      border: "border-khwarizmia-bronze/40",
      badge: "bg-khwarizmia-bronze/10 text-khwarizmia-bronze border border-khwarizmia-bronze/30",
    },
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      {/* Breadcrumb */}
      <div className="bg-background/90 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 text-sm">
          <span className="text-muted-foreground">Home / </span>
          <span className="text-foreground">Pricing</span>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden py-14">
        <div className="absolute inset-0 bg-gradient-to-br from-khwarizmia-navy via-khwarizmia-navy to-black opacity-95" />
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs uppercase tracking-wider text-white mb-6">
              Simple, transparent licensing
            </div>
            <h1 className="finance-heading text-4xl md:text-5xl lg:text-6xl leading-tight tracking-tight text-white mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-khwarizmia-teal via-khwarizmia-gold to-khwarizmia-bronze font-bold">
                KSSI TECH
              </span>{" "}
              Pricing
            </h1>
            <p className="mt-4 text-lg md:text-xl text-stone-300 max-w-2xl mx-auto">
              Open-source core. Commercial performance. Choose the license that fits your project.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, i) => {
              const colors = colorMap[tier.color];
              return (
                <motion.div
                  key={tier.name}
                  variants={scaleIn}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                  transition={{ ...scaleIn.transition, delay: i * 0.1 }}
                  className={`relative rounded-2xl p-8 border ${
                    tier.popular ? colors.border + " border-2" : "border-border"
                  } bg-card shadow-xl flex flex-col`}
                >


                  <div className={`inline-flex p-3 rounded-xl mb-5 w-fit ${colors.icon}`}>
                    <tier.icon className="w-6 h-6" />
                  </div>

                  <h3 className="text-xl font-bold text-foreground mb-1">{tier.name}</h3>
                  <p className="text-sm text-muted-foreground mb-6">{tier.description}</p>

                  <div className="mb-6">
                    <span className="text-4xl font-bold text-foreground">{tier.price}</span>
                    {tier.period && (
                      <span className="text-sm text-muted-foreground ml-2">{tier.period}</span>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-3">
                        <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${colors.check}`} />
                        <span className="text-sm text-muted-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={tier.onCta}
                    className={`w-full font-semibold ${
                      tier.popular
                        ? "bg-khwarizmia-teal hover:bg-khwarizmia-gold text-khwarizmia-navy"
                        : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                    }`}
                    size="lg"
                  >
                    {tier.cta}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-12 bg-background">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div {...fadeInUp} viewport={{ once: true }} className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Compare Plans
            </h2>
            <p className="text-muted-foreground">
              Full breakdown of what's included in each tier
            </p>
          </motion.div>

          <motion.div
            {...fadeInUp}
            viewport={{ once: true }}
            className="rounded-2xl overflow-hidden border border-border bg-card shadow-xl"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Feature</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-khwarizmia-teal">Open Source</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-khwarizmia-gold">Commercial</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-khwarizmia-bronze">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {comparisonRows.map((row, i) => (
                    <tr key={i} className="hover:bg-border/20 transition-colors">
                      <td className="px-6 py-4 text-sm text-muted-foreground">{row.feature}</td>
                      <td className="px-6 py-4 text-center">
                        {row.open ? (
                          <Check className="w-4 h-4 text-khwarizmia-teal mx-auto" />
                        ) : (
                          <span className="text-muted-foreground/40">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {row.commercial ? (
                          <Check className="w-4 h-4 text-khwarizmia-gold mx-auto" />
                        ) : (
                          <span className="text-muted-foreground/40">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {row.enterprise ? (
                          <Check className="w-4 h-4 text-khwarizmia-bronze mx-auto" />
                        ) : (
                          <span className="text-muted-foreground/40">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 bg-background">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div {...fadeInUp} viewport={{ once: true }} className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Frequently Asked Questions
            </h2>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="rounded-xl overflow-hidden bg-card border border-border"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left"
                >
                  <span className="font-semibold text-foreground">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground transition-transform flex-shrink-0 ml-4 ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-khwarizmia-navy text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-6">Start Building with KSSI TECH</h2>
            <p className="text-xl text-stone-200 max-w-2xl mx-auto mb-8">
              Install the Python SDK in seconds, or talk to us about a commercial license for your team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="https://github.com/kssi-tech/Hisab"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-khwarizmia-teal hover:bg-khwarizmia-gold text-khwarizmia-navy px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View on GitHub
                <ExternalLink className="w-5 h-5 ml-2" />
              </motion.a>
              <motion.button
                onClick={() => navigate("/contact")}
                className="inline-flex items-center bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors border border-white/30"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Contact Our Team
                <ArrowRight className="w-5 h-5 ml-2" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
