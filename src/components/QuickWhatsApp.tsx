import { useState } from "react";
import { MessageCircle, Send, Copy, Check, Package, CreditCard, Clock } from "lucide-react";

interface Props {
  recipientName?: string;
  phone?: string;
  address?: string;
  type: 'id' | 'package' | 'general';
}

export default function QuickWhatsApp({ recipientName = '', phone = '', address = '', type }: Props) {
  const [copied, setCopied] = useState(false);

  // טמפלטים מהירים
  const quickTemplates = {
    id: `שלום ${recipientName},

זה דוור מדואר ישראל 📮

יש לי תעודת זהות למסירה עבורך.

אני צריך את קוד המסירה בן 4 הספרות שקיבלת מרשות האוכלוסין.

תודה!`,
    
    package: `שלום ${recipientName},

יש לי חבילה למסירה 📦

אני צריך:
🏢 קומה: ___
🚪 דירה: ___
🔑 קוד בניין: ___
📍 להניח ליד הדלת? ___

כתובת: ${address}

תודה!`,
    
    general: `שלום ${recipientName},

זה דוור מדואר ישראל 📮

יש לי דואר רשום למסירה עבורך.
אני אגיע אליך במהלך היום.
האם תרצה שאניח את הרשום בתיבה?

תודה!`
  };

  const message = quickTemplates[type];

  const createWhatsAppLink = () => {
    const cleanPhone = phone.replace(/[^\d]/g, '');
    const formattedPhone = cleanPhone.startsWith('0') ? '972' + cleanPhone.slice(1) : '972' + cleanPhone;
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getIcon = () => {
    switch (type) {
      case 'id': return <CreditCard size={16} className="text-blue-600" />;
      case 'package': return <Package size={16} className="text-green-600" />;
      default: return <MessageCircle size={16} className="text-purple-600" />;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'id': return 'border-blue-200 bg-blue-50';
      case 'package': return 'border-green-200 bg-green-50';
      default: return 'border-purple-200 bg-purple-50';
    }
  };

  return (
    <div className={`border rounded-lg p-3 ${getColor()}`}>
      <div className="flex items-center gap-2 mb-2">
        {getIcon()}
        <span className="font-medium text-gray-800">
          {type === 'id' ? 'ת.ז.' : type === 'package' ? 'חבילה' : 'כללי'}
        </span>
      </div>
      
      <div className="bg-white border border-gray-300 rounded-lg p-3 mb-3 text-sm font-mono whitespace-pre-wrap">
        {message}
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1 px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'הועתק!' : 'העתק'}
        </button>
        {phone && (
          <a
            href={createWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition-colors"
          >
            <Send size={14} />
            שלח
          </a>
        )}
      </div>
    </div>
  );
}