import { useReservableDates } from './hooks/useReservableDates';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { DateForm } from './components/DateForm';
import { ErrorMessage } from './components/ErrorMessage';
import { AvailableDatesList } from './components/AvailableDatesList';
import { InfoBox } from './components/InfoBox';

function App() {
  const {
    shiftStartDate, setShiftStartDate,
    dueDate, setDueDate,
    dueDateRule, setDueDateRule,
    reservableDates, loading, error, handleSubmit
  } = useReservableDates();

  return (
    <div className="min-h-screen bg-gray-50 font-noto">
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        {/* ヘッダー */}
        <Header />

        {/* 入力フォーム */}
        <DateForm
          shiftStartDate={shiftStartDate}
          dueDate={dueDate}
          dueDateRule={dueDateRule}
          loading={loading}
          onShiftStartDateChange={setShiftStartDate}
          onDueDateChange={setDueDate}
          onDueDateRuleChange={setDueDateRule}
          onSubmit={handleSubmit}
        />

        {/* エラー表示 */}
        {error && <ErrorMessage message={error} />}

        {/* 結果表示 */}
        <AvailableDatesList dates={reservableDates} />

        {/* 補足情報 */}
        <InfoBox />

        {/* フッター */}
        <Footer />
      </div>
    </div>
  );
}

export default App;
