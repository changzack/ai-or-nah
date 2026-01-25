import type { VerdictLevel } from "@/lib/types";

interface EducationCardProps {
  verdict: VerdictLevel;
}

export function EducationCard({ verdict }: EducationCardProps) {
  const getEducationContent = () => {
    if (verdict === "real") {
      return {
        title: "✅ Signs this appears real:",
        tips: [
          "Natural skin texture and imperfections",
          "Consistent facial features across photos",
          "Varied photo settings and backgrounds",
          "Normal engagement patterns",
        ],
      };
    }

    return {
      title: "🚩 Red flags to spot yourself:",
      tips: [
        "Perfect, poreless skin in every photo",
        "Identical facial features despite different angles",
        "Backgrounds that don't quite make sense",
        "Generic captions or repetitive language",
        "New account with massive followers",
        "OnlyFans links + very high AI scores",
      ],
    };
  };

  const content = getEducationContent();

  return (
    <div className="bg-gray-50 rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {content.title}
      </h3>
      <ul className="space-y-2">
        {content.tips.map((tip, index) => (
          <li key={index} className="flex items-start gap-2 text-gray-700">
            <span className="text-gray-400 mt-1">•</span>
            <span className="text-sm">{tip}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
