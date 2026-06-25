import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AnimatedBackground from "@/components/AnimatedBackground";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { User as UserIcon } from "lucide-react";

export default function Account() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/contact');
  }

  const fullName = profile?.full_name ?? user?.email?.split('@')[0] ?? 'KSSI TECH User';
  const email = user?.email ?? profile?.email ?? 'No email available';

  return (
    <div className="min-h-screen bg-background text-slate-900">
      <Navigation />

      <section className="relative pt-28 pb-16 min-h-[40vh]">
        <AnimatedBackground />
        <div className="relative z-10 container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-light mb-2">Account</h1>
            <p className="text-gray-600 mb-8">Manage your KSSI TECH account and settings.</p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto rounded-3xl bg-white p-8 shadow-xl dark:bg-slate-900">
            <div className="flex flex-col gap-6">
              <div className="rounded-3xl border border-slate-200 p-8 dark:border-slate-700">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-100">
                    <UserIcon className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold">{fullName}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{email}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  You are signed in with Supabase. Use the button below to sign out.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 p-6 dark:border-slate-700">
                  <h3 className="text-lg font-semibold mb-3">Profile</h3>
                  <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    <div>
                      <span className="font-medium">Name:</span> {fullName}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {email}
                    </div>
                    <div>
                      <span className="font-medium">Member since:</span> {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 p-6 dark:border-slate-700">
                  <h3 className="text-lg font-semibold mb-3">Actions</h3>
                  <div className="space-y-4">
                    <Button onClick={() => navigate('/dashboard')} className="w-full bg-slate-900 text-white hover:bg-slate-800">Go to Dashboard</Button>
                    <Button onClick={handleLogout} className="w-full border border-slate-300 bg-white text-slate-900 hover:bg-slate-50">
                      Sign Out
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
