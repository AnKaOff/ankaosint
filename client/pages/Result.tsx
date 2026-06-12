import { useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Shield,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Download,
  Copy,
} from "lucide-react";

interface BreachData {
  name: string;
  date: string;
  count: number;
  dataTypes: string[];
  severity: "low" | "medium" | "high" | "critical";
}

const MOCK_BREACHES: Record<string, BreachData[]> = {
  email: [
    {
      name: "LinkedIn Data Breach",
      date: "2021-06",
      count: 700_000_000,
      dataTypes: ["emails", "passwords", "names"],
      severity: "critical",
    },
    {
      name: "Facebook Scrape",
      date: "2021-04",
      count: 533_000_000,
      dataTypes: ["emails", "phone numbers", "user IDs"],
      severity: "high",
    },
  ],
  phone: [
    {
      name: "T-Mobile Breach",
      date: "2021-08",
      count: 54_000_000,
      dataTypes: ["phone numbers", "names", "SSN"],
      severity: "critical",
    },
  ],
  domain: [
    {
      name: "Cloudflare DNS Records",
      date: "2022-03",
      count: 15_000_000,
      dataTypes: ["DNS records", "IP addresses"],
      severity: "high",
    },
  ],
};

export default function Result() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [found, setFound] = useState(false);
  const [copied, setCopied] = useState(false);

  const query = searchParams.get("query") || "";
  const type = (searchParams.get("type") || "email") as string;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      const mockBreaches = MOCK_BREACHES[type as keyof typeof MOCK_BREACHES];
      setFound(mockBreaches && mockBreaches.length > 0);
    }, 1500);

    return () => clearTimeout(timer);
  }, [query, type]);

  const mockBreaches = MOCK_BREACHES[type as keyof typeof MOCK_BREACHES] || [];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-900/30 border-red-500/50 text-red-300";
      case "high":
        return "bg-orange-900/30 border-orange-500/50 text-orange-300";
      case "medium":
        return "bg-yellow-900/30 border-yellow-500/50 text-yellow-300";
      default:
        return "bg-blue-900/30 border-blue-500/50 text-blue-300";
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(query);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm bg-black/50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg">
              <Shield className="text-black" size={24} />
            </div>
            <h1 className="text-2xl font-bold text-white">
              Leak Scanner
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          Back to Scanner
        </button>

        {isLoading ? (
          /* Loading State */
          <div className="flex flex-col items-center justify-center min-h-96">
            <div className="mb-6">
              <svg className="animate-spin h-12 w-12 text-white" viewBox="0 0 24 24">
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
            </div>
            <p className="text-white text-lg">Scanning for breaches...</p>
            <p className="text-gray-500 text-sm mt-2">This may take a few moments</p>

            {/* Animated scan line */}
            <div className="w-full max-w-md h-1 bg-gray-800 rounded-full mt-8 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-transparent via-white to-transparent animate-scan-line"></div>
            </div>
          </div>
        ) : (
          /* Results */
          <div className="space-y-8">
            {/* Query Summary */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-8">
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-400">Checked {type}</p>
                <button
                  onClick={copyToClipboard}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
                  title="Copy to clipboard"
                >
                  <Copy size={18} />
                </button>
              </div>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-2xl font-mono text-white break-all">{query}</p>
                </div>
              </div>
              {copied && (
                <p className="text-white text-sm mt-4">Copied to clipboard!</p>
              )}
            </div>

            {/* Result Status */}
            <div
              className={`rounded-xl border p-8 ${
                found
                  ? "border-red-400/50 bg-red-950/30"
                  : "border-green-400/50 bg-green-950/30"
              }`}
            >
              <div className="flex items-start gap-4">
                {found ? (
                  <AlertCircle className="text-red-400 flex-shrink-0 mt-1" size={24} />
                ) : (
                  <CheckCircle className="text-green-400 flex-shrink-0 mt-1" size={24} />
                )}
                <div>
                  <h2 className="text-xl font-bold mb-2">
                    {found ? (
                      <span className="text-red-200">
                        ⚠️ Found in {mockBreaches.length} breach
                        {mockBreaches.length !== 1 ? "es" : ""}
                      </span>
                    ) : (
                      <span className="text-green-200">✅ No breaches found</span>
                    )}
                  </h2>
                  <p className="text-gray-300">
                    {found
                      ? "Your information was exposed in the following data breaches. Take action immediately."
                      : "Great news! Your data was not found in any known breaches we monitor."}
                  </p>
                </div>
              </div>
            </div>

            {/* Breaches List */}
            {found && (
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white">
                  Exposed In These Breaches
                </h3>
                {mockBreaches.map((breach, index) => (
                  <div
                key={index}
                className="rounded-xl border border-gray-700 bg-gray-900/30 hover:border-white/30 transition-all p-6"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-white mb-2">
                      {breach.name}
                    </h4>
                    <p className="text-gray-400 text-sm">
                      Breach Date: {breach.date}
                    </p>
                  </div>
                      <div
                        className={`px-4 py-2 rounded-lg border font-semibold text-sm whitespace-nowrap ${getSeverityColor(
                          breach.severity
                        )}`}
                      >
                        {breach.severity.toUpperCase()}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-gray-500 text-sm">Records Exposed</p>
                        <p className="text-white font-semibold text-lg">
                          {(breach.count / 1_000_000).toFixed(1)}M+
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Data Types</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {breach.dataTypes.map((type) => (
                            <span
                              key={type}
                              className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs"
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-400 text-sm">
                      Your information may include email, password, or other
                      personal data. Change your password immediately and
                      enable two-factor authentication if available.
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Recommendations */}
            <div className="rounded-xl border border-white/20 bg-white/10 p-8">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Shield size={20} /> Recommended Actions
              </h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex gap-3">
                  <span className="text-white font-bold">→</span>
                  {found
                    ? "Change your password immediately on all affected accounts"
                    : "Keep your passwords strong and unique across websites"}
                </li>
                <li className="flex gap-3">
                  <span className="text-white font-bold">→</span>
                  Enable two-factor authentication (2FA) where available
                </li>
                <li className="flex gap-3">
                  <span className="text-white font-bold">→</span>
                  {found
                    ? "Monitor your accounts for unauthorized access"
                    : "Monitor your accounts regularly for suspicious activity"}
                </li>
                <li className="flex gap-3">
                  <span className="text-white font-bold">→</span>
                  Consider using a password manager for secure credential storage
                </li>
                <li className="flex gap-3">
                  <span className="text-white font-bold">→</span>
                  Set up breach alerts to be notified of future incidents
                </li>
              </ul>
            </div>

            {/* Export Report Button */}
            <button className="w-full button-primary flex items-center justify-center gap-2 py-4">
              <Download size={20} />
              Download Full Report (PDF)
            </button>

            {/* New Search */}
            <button
              onClick={() => navigate("/")}
              className="w-full py-4 rounded-xl border border-white/30 text-white hover:border-white hover:bg-white/10 transition-all font-semibold"
            >
              Run Another Scan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
