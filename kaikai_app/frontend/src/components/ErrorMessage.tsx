interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage = ({ message }: ErrorMessageProps) => {
  return (
    <div className="bg-red-50 border-2 border-red-300 rounded-xl p-5 mb-6 md:mb-8 shadow-custom">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 bg-red-500 text-white p-2 rounded-lg">
          <span className="text-xl">⚠️</span>
        </div>
        <div className="flex-1">
          <p className="font-bold text-red-900 text-base mb-1">エラーが発生しました</p>
          <p className="text-sm text-red-800">{message}</p>
        </div>
      </div>
    </div>
  );
};

