import { formatDateWithWeekday } from '../utils/dateFormatter';

interface AvailableDatesListProps {
  dates: string[];
}

export const AvailableDatesList = ({ dates }: AvailableDatesListProps) => {
  if (dates.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-8 mb-8">
      <h2 className="text-2xl font-bold text-kai-indigo mb-6">
        予約可能日
      </h2>
      <ul className="space-y-3">
        {dates.map((date) => (
          <li
            key={date}
            className="flex items-center text-kai-indigo border-l-4 border-kai-lavender pl-4 py-2"
          >
            <span className="mr-2">✅</span>
            <span className="text-lg">{formatDateWithWeekday(date)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

