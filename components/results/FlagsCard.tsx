import type { RedFlag } from "@/lib/types";

interface FlagsCardProps {
  title: string;
  emoji: string;
  flags: RedFlag[];
}

export function FlagsCard({ title, emoji, flags }: FlagsCardProps) {
  if (flags.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        {emoji} {title}
      </h3>

      <div className="space-y-3">
        {flags.map((flag, index) => (
          <div key={index} className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0 mt-0.5">
              {flag.type === "negative" ? "❌" : "✅"}
            </span>
            <p className="text-base text-gray-700 leading-relaxed">
              {flag.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
