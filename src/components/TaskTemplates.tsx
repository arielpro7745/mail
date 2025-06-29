import { useState } from "react";
import { Task } from "../types";
import { streets } from "../data/streets";
import { BookTemplate as FileTemplate, Plus, Clock, MapPin, Building, Truck, Wrench, Package, AlertTriangle } from "lucide-react";

interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  type: Task['type'];
  priority: Task['priority'];
  estimatedTime: number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  category: 'delivery' | 'maintenance' | 'sorting' | 'urgent';
}

interface Props {
  onCreateFromTemplate: (template: TaskTemplate, customData?: Partial<Task>) => void;
  currentArea: 14 | 45;
}

export default function TaskTemplates({ onCreateFromTemplate, currentArea }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showTemplates, setShowTemplates] = useState(false);

  const templates: TaskTemplate[] = [
    // תבניות חלוקה
    {
      id: 'delivery-regular',
      name: 'חלוקת דואר רגילה',
      description: 'חלוקת דואר שגרתית ברחוב',
      type: 'delivery',
      priority: 'medium',
      estimatedTime: 30,
      icon: Truck,
      category: 'delivery'
    },
    {
      id: 'delivery-urgent',
      name: 'חלוקה דחופה',
      description: 'חלוקת דואר דחופה או רגיסטר',
      type: 'delivery',
      priority: 'urgent',
      estimatedTime: 20,
      icon: AlertTriangle,
      category: 'urgent'
    },
    {
      id: 'delivery-big-street',
      name: 'חלוקה ברחוב גדול',
      description: 'חלוקת דואר ברחוב גדול עם הרבה בניינים',
      type: 'delivery',
      priority: 'medium',
      estimatedTime: 45,
      icon: Building,
      category: 'delivery'
    },

    // תבניות תחזוקה
    {
      id: 'maintenance-mailboxes',
      name: 'בדיקת תיבות דואר',
      description: 'בדיקה ותחזוקה של תיבות דואר בבניין',
      type: 'maintenance',
      priority: 'low',
      estimatedTime: 15,
      icon: Wrench,
      category: 'maintenance'
    },
    {
      id: 'maintenance-building-access',
      name: 'בדיקת גישה לבניין',
      description: 'בדיקת קודי כניסה ונגישות לבניין',
      type: 'maintenance',
      priority: 'medium',
      estimatedTime: 10,
      icon: Building,
      category: 'maintenance'
    },
    {
      id: 'maintenance-route-check',
      name: 'בדיקת מסלול',
      description: 'בדיקה ועדכון מסלול חלוקה',
      type: 'maintenance',
      priority: 'low',
      estimatedTime: 25,
      icon: MapPin,
      category: 'maintenance'
    },

    // תבניות מיון
    {
      id: 'sorting-daily',
      name: 'מיון יומי',
      description: 'מיון דואר יומי לפי רחובות',
      type: 'sorting',
      priority: 'medium',
      estimatedTime: 30,
      icon: Package,
      category: 'sorting'
    },
    {
      id: 'sorting-registered',
      name: 'מיון רגיסטר',
      description: 'מיון ועיבוד דואר רגיסטר',
      type: 'sorting',
      priority: 'high',
      estimatedTime: 20,
      icon: FileTemplate,
      category: 'sorting'
    },
    {
      id: 'sorting-packages',
      name: 'מיון חבילות',
      description: 'מיון וארגון חבילות לחלוקה',
      type: 'sorting',
      priority: 'medium',
      estimatedTime: 40,
      icon: Package,
      category: 'sorting'
    }
  ];

  const categories = [
    { key: 'all', label: 'הכל', count: templates.length },
    { key: 'delivery', label: 'חלוקה', count: templates.filter(t => t.category === 'delivery').length },
    { key: 'maintenance', label: 'תחזוקה', count: templates.filter(t => t.category === 'maintenance').length },
    { key: 'sorting', label: 'מיון', count: templates.filter(t => t.category === 'sorting').length },
    { key: 'urgent', label: 'דחוף', count: templates.filter(t => t.category === 'urgent').length }
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const handleCreateFromTemplate = (template: TaskTemplate) => {
    // אם זו משימת חלוקה, נסה להציע רחוב מהאזור הנוכחי
    let customData: Partial<Task> = {};
    
    if (template.category === 'delivery') {
      const areaStreets = streets.filter(s => s.area === currentArea);
      const undeliveredStreets = areaStreets.filter(s => 
        !s.lastDelivered || 
        (Date.now() - new Date(s.lastDelivered).getTime()) > 7 * 24 * 60 * 60 * 1000
      );
      
      if (undeliveredStreets.length > 0) {
        customData.streetId = undeliveredStreets[0].id;
        customData.assignedArea = currentArea;
      }
    }

    onCreateFromTemplate(template, customData);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6">
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileTemplate size={20} className="text-indigo-600" />
            <h3 className="font-semibold text-gray-800">תבניות משימות</h3>
          </div>
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm transition-colors"
          >
            <Plus size={14} />
            {showTemplates ? 'סגור תבניות' : 'הצג תבניות'}
          </button>
        </div>
      </div>

      {showTemplates && (
        <div className="p-4">
          {/* סינון קטגוריות */}
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map(category => (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category.key
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.label} ({category.count})
              </button>
            ))}
          </div>

          {/* רשימת תבניות */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map(template => {
              const Icon = template.icon;
              return (
                <div
                  key={template.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer"
                  onClick={() => handleCreateFromTemplate(template)}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${
                      template.category === 'delivery' ? 'bg-blue-100' :
                      template.category === 'maintenance' ? 'bg-yellow-100' :
                      template.category === 'sorting' ? 'bg-green-100' :
                      'bg-red-100'
                    }`}>
                      <Icon size={20} className={
                        template.category === 'delivery' ? 'text-blue-600' :
                        template.category === 'maintenance' ? 'text-yellow-600' :
                        template.category === 'sorting' ? 'text-green-600' :
                        'text-red-600'
                      } />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800 mb-1">{template.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className={`px-2 py-1 rounded-full ${
                        template.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                        template.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                        template.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {template.priority === 'urgent' ? 'דחוף' :
                         template.priority === 'high' ? 'גבוה' :
                         template.priority === 'medium' ? 'בינוני' : 'נמוך'}
                      </span>
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        {template.estimatedTime} דק׳
                      </div>
                    </div>
                    <button className="p-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}