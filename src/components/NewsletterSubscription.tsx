import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { blogService } from "@/services/blogService";

interface NewsletterSubscriptionProps {
  variant?: "default" | "compact" | "inline";
  title?: string;
  description?: string;
  className?: string;
  onSubscribeSuccess?: () => void;
}

export default function NewsletterSubscription({
  variant = "default",
  title = "Stay Updated with KSSI TECH Insights",
  description = "Get the latest articles on solutions industrielles et tertiaires, the KSSI TECH platform, and market insights delivered to your inbox.",
  className = "",
  onSubscribeSuccess
}: NewsletterSubscriptionProps) {
  const { isDark } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setSubscribing(true);

    try {
      const { data, error } = await blogService.subscribeToNewsletter(email);

      if (error) {
        // Handle specific error cases
        if (error.code === 'USER_EXISTS') {
          // Email belongs to a registered user
          toast({
            title: "Account Already Exists",
            description: "This email is already registered. Please sign in to manage your preferences.",
            variant: "destructive",
            action: (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/contact?mode=signin')}
                className="ml-2"
              >
                Sign In
              </Button>
            ),
          });
        } else if (error.code === 'ALREADY_SUBSCRIBED' || error.code === '23505' || error.message?.includes('duplicate') || error.message?.includes('unique')) {
          toast({
            title: "Already Subscribed",
            description: "This email is already subscribed to our newsletter.",
            variant: "destructive",
          });
        } else if (error.message?.includes('permission denied for table users') || error.message?.includes('users')) {
          // Fallback for when function doesn't exist yet
          toast({
            title: "Account Detected",
            description: "This email appears to be registered. Please sign in to manage your preferences.",
            variant: "default",
            action: (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/contact?mode=signin')}
                className="ml-2"
              >
                Sign In
              </Button>
            ),
          });
        } else {
          toast({
            title: "Subscription Failed",
            description: error.message || "Failed to subscribe. Please try again later.",
            variant: "destructive",
          });
        }
        return;
      }

      // Success!
      setSubscribed(true);
      setEmail("");
      
      toast({
        title: "Successfully Subscribed! 🎉",
        description: "Thank you for subscribing to KSSI TECH insights. Check your inbox for a confirmation email.",
      });

      // Call success callback if provided
      if (onSubscribeSuccess) {
        onSubscribeSuccess();
      }

      // Reset subscribed state after 5 seconds
      setTimeout(() => {
        setSubscribed(false);
      }, 5000);

    } catch (error: any) {
      console.error("Newsletter subscription error:", error);
      toast({
        title: "Subscription Error",
        description: error?.message || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubscribing(false);
    }
  };

  // Compact variant (for sidebars, footers)
  if (variant === "compact") {
    return (
      <div className={className}>
        <h4 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h4>
        <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {description}
        </p>
        <form onSubmit={handleSubscribe} className="space-y-3">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={subscribing || subscribed}
            className={subscribed ? "border-green-500" : ""}
          />
          <Button
            type="submit"
            disabled={subscribing || subscribed}
            className="w-full bg-khwarizmia-teal hover:bg-khwarizmia-teal/90 text-white"
          >
            {subscribing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Subscribing...
              </>
            ) : subscribed ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Subscribed!
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Subscribe
              </>
            )}
          </Button>
        </form>
      </div>
    );
  }

  // Inline variant (for horizontal layouts)
  if (variant === "inline") {
    return (
      <form onSubmit={handleSubscribe} className={`flex flex-col sm:flex-row gap-3 ${className}`}>
        <Input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={subscribing || subscribed}
          className={`flex-1 ${subscribed ? "border-green-500" : ""}`}
        />
        <Button
          type="submit"
          disabled={subscribing || subscribed}
          className="bg-khwarizmia-teal hover:bg-khwarizmia-teal/90 text-white px-8"
        >
          {subscribing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Subscribing...
            </>
          ) : subscribed ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Subscribed!
            </>
          ) : (
            "Subscribe"
          )}
        </Button>
      </form>
    );
  }

  // Default variant (full featured with icon and description)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-8 rounded-xl border ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } shadow-lg ${className}`}
    >
      <div className="text-center max-w-2xl mx-auto">
        <Mail className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-khwarizmia-teal' : 'text-khwarizmia-navy'}`} />
        <h3 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h3>
        <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          {description}
        </p>

        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <Input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={subscribing || subscribed}
            required
            className={`flex-1 ${subscribed ? "border-green-500" : ""}`}
          />
          <Button
            type="submit"
            disabled={subscribing || subscribed}
            className="bg-khwarizmia-teal hover:bg-khwarizmia-teal/90 text-white"
          >
            {subscribing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Subscribing...
              </>
            ) : subscribed ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Subscribed!
              </>
            ) : (
              "Subscribe"
            )}
          </Button>
        </form>

        {subscribed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`mt-4 p-3 rounded-lg ${
              isDark ? 'bg-green-900/20 text-green-300' : 'bg-green-50 text-green-700'
            } flex items-center justify-center gap-2`}
          >
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Successfully subscribed! Check your inbox.</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

