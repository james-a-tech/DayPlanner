import { useAppStore } from '../store/appStore';
export const DatePicker = () => {
  const selectedDate = useAppStore((state) => state.selectedDate);
  const setSelectedDate = useAppStore((state) => state.setSelectedDate);

  // Format date as yyyy-MM-dd for input[type=date]
  const formatDate = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val) {
      const [yyyy, mm, dd] = val.split('-').map(Number);
      setSelectedDate(new Date(yyyy, mm - 1, dd));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-col items-center">
      <input
        type="date"
        value={formatDate(selectedDate)}
        onChange={handleChange}
        className="text-lg font-semibold border rounded px-4 py-2 mb-2"
      />
    </div>
  );
};
