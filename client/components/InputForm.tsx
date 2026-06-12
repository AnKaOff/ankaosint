import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Phone, Globe, Search } from "lucide-react";

export default function InputForm() {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<"email" | "phone" | "domain">(
    "email"
  );
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      navigate(`/result?query=${encodeURIComponent(query)}&type=${searchType}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-float-in">
      <form onSubmit={handleSearch} className="space-y-6">
        {/* Search Type Toggle */}
        <div className="flex gap-3 justify-center flex-wrap">
          {[
            { type: "email" as const, label: "Email", icon: Mail },
            { type: "phone" as const, label: "Phone", icon: Phone },
            { type: "domain" as const, label: "Domain", icon: Globe },
          ].map(({ type, label, icon: Icon }) => (
            <button
              key={type}
              type="button"
              onClick={() => setSearchType(type)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                searchType === type
                  ? "bg-white text-black shadow-lg"
                  : "bg-gray-900 border border-gray-700 text-gray-300 hover:border-white/50"
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              searchType === "email"
                ? "Enter email address"
                : searchType === "phone"
                  ? "Enter phone number"
                  : "Enter domain"
            }
            className="input-cyber w-full pl-5 pr-14 py-4 text-lg rounded-xl border-2"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <Search className="text-white" size={24} />
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className={`w-full button-primary text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed btn-glow font-bold ${
            isLoading ? "animate-pulse" : ""
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Scanning...
            </span>
          ) : (
            "Start Security Scan"
          )}
        </button>

        {/* Info Text */}
        <p className="text-center text-gray-400 text-sm">
          Check if your data has been exposed in known data breaches
        </p>
      </form>
    </div>
  );
}
