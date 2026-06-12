import { Shield } from "lucide-react";
import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";

export default function Header() {
  return (
    <header className="border-b border-white/10 backdrop-blur-sm bg-black/50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">

        {/* LEFT */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg">
            <Shield className="text-black" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-white">
            Leak Scanner
          </h1>
        </div>

        {/* CENTER NAV */}
        <nav className="hidden md:flex gap-6 text-sm">
          <a href="#features" className="text-gray-400 hover:text-white transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors">
            How It Works
          </a>
        </nav>

        {/* RIGHT */}
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
        </div>

      </div>
    </header>
  );
}