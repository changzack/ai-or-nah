interface BottomLineCardProps {
  message: string;
}

export function BottomLineCard({ message }: BottomLineCardProps) {
  return (
    <div className="bg-indigo-50 rounded-2xl p-6 border-2 border-indigo-200">
      <h3 className="text-xl font-semibold text-gray-900 mb-3">
        💡 BOTTOM LINE
      </h3>
      <p className="text-lg font-medium text-gray-900 leading-relaxed">
        {message}
      </p>
    </div>
  );
}
