import { useEffect, useState } from 'react';
import { useSettings } from '../hooks/useSettings';
import { Volume2, VolumeX, Mic, MicOff } from 'lucide-react';

interface Props {
  onStreetCompleted?: (streetName: string) => void;
  onTaskCompleted?: (taskName: string) => void;
}

export default function VoiceNotifications({ onStreetCompleted, onTaskCompleted }: Props) {
  const { settings } = useSettings();
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    // בדיקת תמיכה בזיהוי קול
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.lang = 'he-IL';
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        console.log('Voice command:', transcript);
        
        // פקודות קוליות
        if (transcript.includes('סיימתי') || transcript.includes('חולק')) {
          // יכול להיות מחובר לפונקציה שמסמנת רחוב כחולק
          playSound('success');
        }
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
    }
  }, []);

  // הפעלת צליל
  const playSound = (type: 'success' | 'warning' | 'notification') => {
    if (!settings.soundEnabled) return;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // תדרים שונים לצלילים שונים
    const frequencies = {
      success: [523, 659, 784], // C-E-G
      warning: [440, 440, 440], // A-A-A
      notification: [659, 523] // E-C
    };

    const freq = frequencies[type];
    let noteIndex = 0;

    const playNote = () => {
      if (noteIndex < freq.length) {
        oscillator.frequency.setValueAtTime(freq[noteIndex], audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        noteIndex++;
        setTimeout(playNote, 200);
      } else {
        oscillator.stop();
      }
    };

    oscillator.start();
    playNote();
  };

  // הודעה קולית
  const speak = (text: string) => {
    if (!settings.soundEnabled) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'he-IL';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    speechSynthesis.speak(utterance);
  };

  // התחלת/עצירת האזנה
  const toggleListening = () => {
    if (!recognition) return;
    
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  // פונקציות להפעלה מרכיבים אחרים
  useEffect(() => {
    if (onStreetCompleted) {
      // כשרחוב מושלם
      const handleStreetCompleted = (streetName: string) => {
        playSound('success');
        speak(`רחוב ${streetName} הושלם בהצלחה`);
      };
    }
  }, [onStreetCompleted, settings.soundEnabled]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Volume2 size={20} className="text-purple-600" />
          <div>
            <h3 className="font-semibold text-gray-800">התראות קוליות</h3>
            <p className="text-sm text-gray-600">פקודות קול והתראות אודיו</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => playSound('notification')}
            className={`p-2 rounded-lg transition-colors ${
              settings.soundEnabled 
                ? 'bg-green-500 hover:bg-green-600 text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            disabled={!settings.soundEnabled}
            title="נסה צליל"
          >
            {settings.soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          
          {speechSupported && (
            <button
              onClick={toggleListening}
              className={`p-2 rounded-lg transition-colors ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
              title={isListening ? 'עצור האזנה' : 'התחל האזנה'}
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
          )}
        </div>
      </div>

      {/* פקודות זמינות */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <h4 className="font-medium text-green-800 mb-1">פקודות קוליות</h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• "סיימתי" - סימון רחוב כחולק</li>
            <li>• "חולק" - סימון רחוב כחולק</li>
            <li>• "הבא" - מעבר לרחוב הבא</li>
          </ul>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="font-medium text-blue-800 mb-1">התראות אוטומטיות</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• השלמת רחוב</li>
            <li>• התחלת יום חדש</li>
            <li>• רחובות דחופים</li>
          </ul>
        </div>
      </div>

      {isListening && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-blue-700 font-medium">מאזין לפקודות קוליות...</span>
          </div>
        </div>
      )}

      {!speechSupported && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-700">
            הדפדפן לא תומך בזיהוי קול. התראות קוליות זמינות בלבד.
          </p>
        </div>
      )}
    </div>
  );
}

// הרחבת Window interface לתמיכה בזיהוי קול
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
    AudioContext: any;
    webkitAudioContext: any;
  }
}