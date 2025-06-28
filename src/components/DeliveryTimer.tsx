import { Play, Pause, Square } from "lucide-react";
import { useDeliveryTimer } from "../hooks/useDeliveryTimer";

interface Props {
  onComplete: (timeInMinutes: number) => void;
  streetName: string;
}

export default function DeliveryTimer({ onComplete, streetName }: Props) {
  const { isRunning, startTimer, stopTimer, resetTimer, formatTime } = useDeliveryTimer();

  const handleComplete = () => {
    const timeInMinutes = stopTimer();
    onComplete(timeInMinutes);
    resetTimer();
  };

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">מדידת זמן חלוקה</h3>
        <div className="text-2xl font-mono text-indigo-600">
          {formatTime()}
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mb-3">רחוב: {streetName}</p>
      
      <div className="flex gap-2">
        {!isRunning ? (
          <button
            onClick={startTimer}
            className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
          >
            <Play size={16} />
            התחל
          </button>
        ) : (
          <button
            onClick={handleComplete}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            <Square size={16} />
            סיים
          </button>
        )}
        
        <button
          onClick={resetTimer}
          className="flex items-center gap-2 px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
        >
          <Pause size={16} />
          איפוס
        </button>
      </div>
    </div>
  );
}