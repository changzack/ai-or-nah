import type { VerdictLevel } from "@/lib/types";

interface VerdictHeroProps {
  aiLikelihood: number;
  verdict: VerdictLevel;
  username: string;
}

export function VerdictHero({ aiLikelihood, verdict, username }: VerdictHeroProps) {
  const getVerdictColor = () => {
    if (aiLikelihood <= 30) return "text-green-500";
    if (aiLikelihood <= 60) return "text-amber-500";
    if (aiLikelihood <= 80) return "text-orange-500";
    return "text-red-500";
  };

  const getVerdictLabel = () => {
    if (aiLikelihood <= 30) return "✅ Probably Real";
    if (aiLikelihood <= 60) return "🤔 Hard to Tell";
    if (aiLikelihood <= 80) return "⚠️ Likely Fake";
    return "🤖 Almost Definitely Fake";
  };

  const getVerdictBg = () => {
    if (aiLikelihood <= 30) return "from-green-50 to-white";
    if (aiLikelihood <= 60) return "from-amber-50 to-white";
    if (aiLikelihood <= 80) return "from-orange-50 to-white";
    return "from-red-50 to-white";
  };

  return (
    <div className={`bg-gradient-to-b ${getVerdictBg()} rounded-2xl p-8 text-center mb-6`}>
      <p className="text-sm text-gray-600 mb-2">@{username}</p>

      <div className={`text-7xl font-bold mb-4 ${getVerdictColor()}`}>
        {aiLikelihood}%
      </div>

      <h2 className="text-3xl font-bold text-gray-900 mb-2">
        {getVerdictLabel()}
      </h2>

      <p className="text-gray-600">
        AI Likelihood Score
      </p>
    </div>
  );
}
