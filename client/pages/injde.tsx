import { Shield, Zap, Eye, Lock, TrendingUp, AlertTriangle } from "lucide-react";
import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import InputForm from "@/components/InputForm";


export default function Index() {
  const fullText = "AnKa OSINT";
  const [text, setText] = useState("");

  useEffect(() => {
    let i = 0;

    const interval = setInterval(() => {
      setText(fullText.slice(0, i + 1));
      i++;

      if (i === fullText.length) clearInterval(interval);
    }, 120);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black">
      
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm bg-black/50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">

          {/* LEFT LOGO */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg">
              {/* Shield icon ici */}
            </div>

            <h1 className="text-2xl font-bold text-white">
              {text}
              <span className="animate-pulse">|</span>
            </h1>
          </div>

          {/* RIGHT - USER ICON */}
    <div className="flex items-center gap-4">

      <SignedOut>
        <SignInButton mode="modal">
          <button className="p-2 rounded-full border border-white/20 hover:bg-white/10 transition">
            👤
          </button>
        </SignInButton>
      </SignedOut>

      <SignedIn>
        <UserButton
          appearance={{
            elements: {
              userButtonAvatarBox: "w-9 h-9"
            }
          }}
        />
      </SignedIn>

          {/* CENTER NAV */}
          <nav className="hidden md:flex gap-6 text-sm">
            <a href="#features" className="text-gray-400 hover:text-white transition-colors"></a>
            <a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors"></a>
          </nav>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        {/* Clerk / User logic ici */}
      </div>
    </div>
  </div>
</header>



{/* Hero Section */}
      <section className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-16">
        <div className="max-w-4xl mx-auto w-full">
          {/* Title */}
          <div className="text-center mb-16 animate-float-in">
            <h2 className="text-4xl md:text-6xl font-black mb-4 leading-tight">
              Check Your Digital{" "}
              <span className="text-glow-green inline-block">Security</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Discover if your{" "}
              <span className="text-glow-blue">email</span>, <span className="text-glow-cyan">phone</span>, or{" "}
              <span className="text-glow-purple">domain</span> has been exposed in known
              data breaches. Get instant insights into your security posture.
            </p>
          </div>

          {/* Search Form */}
          <div className="mb-20">
            <InputForm />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 md:gap-6 mb-24">
            {[
              { value: "50+", label: "Breaches Monitored", color: "text-glow-white" },
              { value: "10B+", label: "Compromised Records", color: "text-glow-white" },
              { value: "Instant", label: "Results", color: "text-glow-white" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="text-center p-4 rounded-lg border border-white/10 bg-white/5 backdrop-blur hover:shadow-lg hover:shadow-white/20 transition-all"
              >
                <div className={`text-2xl md:text-3xl font-bold mb-1 ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-xs md:text-sm text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-black/50 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-16">
            <span className="text-white">Powerful </span>
            <span className="text-glow-red">Breach</span>
            <span className="text-white"> Detection</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Eye,
                title: "Email Exposure Check",
                description: "Verify if your email has been compromised in any known breaches",
              },
              {
                icon: Zap,
                title: "Phone Number Tracking",
                description: "Monitor if your phone number appears in exposed data leaks",
              },
              {
                icon: Lock,
                title: "Domain Security",
                description: "Check if your domain is listed in any security incidents",
              },
              {
                icon: TrendingUp,
                title: "Real-Time Monitoring",
                description: "Get instant notifications about new breaches affecting you",
              },
              {
                icon: AlertTriangle,
                title: "Detailed Reports",
                description: "View comprehensive breach data and recommended actions",
              },
              {
                icon: Shield,
                title: "Privacy First",
                description: "Your data is encrypted and never stored in our systems",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-xl border border-white/10 bg-white/5 hover:border-white/30 transition-all duration-300 group hover:shadow-2xl hover:shadow-white/20"
              >
                <div className="p-3 bg-white/10 rounded-lg w-fit mb-4 group-hover:bg-white/20 transition-colors">
                  <feature.icon className="text-white group-hover:scale-110 transition-transform" />
                </div>
                <h4 className="font-semibold text-white mb-2">{feature.title}</h4>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-16">
            <span className="text-white">How It </span>
            <span className="text-glow-yellow">Works</span>
          </h3>

          <div className="space-y-8">
            {[
              {
                step: "01",
                title: "Enter Your Data",
                description: "Submit your email, phone number, or domain name",
              },
              {
                step: "02",
                title: "Instant Analysis",
                description: "We scan against our database of known breaches",
              },
              {
                step: "03",
                title: "Get Results",
                description: "View detailed information about any exposures found",
              },
              {
                step: "04",
                title: "Take Action",
                description: "Follow our recommendations to secure your accounts",
              },
            ].map((item, index) => (
              <div key={index} className="flex gap-6 items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-white text-black font-bold">
                    {item.step}
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-semibold text-white mb-2">
                    {item.title}
                  </h4>
                  <p className="text-gray-400">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-4 bg-black/50 backdrop-blur">
        <div className="max-w-6xl mx-auto text-center text-gray-400 text-sm">
          <p>
            © 2024 Leak Scanner. Your security is our priority. | Privacy
            First
          </p>
        </div>
      </footer>
    </div>
  );
}
