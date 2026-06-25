import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import AnimatedBackground from "@/components/AnimatedBackground";
import Navigation from "@/components/Navigation";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";

export default function RegisterInterest() {
  const { isDark } = useTheme();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    // TODO: wire to backend/email service if desired
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
    }, 800);
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <ThemeToggle />
      <Navigation />

      <section className="relative pt-28 pb-16 min-h-[60vh]">
        <AnimatedBackground />
        <div className="relative z-10 container mx-auto px-6 max-w-3xl">
          <h1 className="text-4xl font-light mb-2">Register Interest</h1>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-8`}>Tell us a bit about you. We’ll get back shortly.</p>
          {submitted ? (
            <div className={`p-6 border rounded-lg ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="text-xl mb-2">Thank you!</div>
              <div className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Your request has been received.</div>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">First name</label>
                  <input required className={`w-full px-3 py-2 rounded-md border ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'}`} />
                </div>
                <div>
                  <label className="block text-sm mb-1">Last name</label>
                  <input required className={`w-full px-3 py-2 rounded-md border ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'}`} />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1">Company</label>
                <input required className={`w-full px-3 py-2 rounded-md border ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'}`} />
              </div>
              <div>
                <label className="block text-sm mb-1">Work email</label>
                <input type="email" required className={`w-full px-3 py-2 rounded-md border ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'}`} />
              </div>
              <div>
                <label className="block text-sm mb-1">What are you interested in?</label>
                <select className={`w-full px-3 py-2 rounded-md border ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'}`}>
                  <option>Curated Data</option>
                  <option>Data Analytics / XVA</option>
                  <option>PlotTool Pro</option>
                  <option>Portfolio Analytics</option>
                  <option>GS Quant</option>
                  <option>Transaction Banking</option>
                  <option>GS DAP®</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Message</label>
                <textarea rows={5} className={`w-full px-3 py-2 rounded-md border ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-300'}`} />
              </div>
              <Button disabled={loading} className={`${isDark ? 'bg-white text-black hover:bg-gray-100' : 'bg-black text-white hover:bg-gray-800'} rounded-none`}>
                {loading ? 'Sending…' : 'Submit'}
              </Button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

