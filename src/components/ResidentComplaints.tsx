import { useState, useEffect } from 'react';
import { AlertCircle, MessageSquare, CheckCircle, Clock, XCircle, Plus, Filter, Search } from 'lucide-react';

interface Complaint {
  id: string;
  date: string;
  residentName: string;
  phone: string;
  address: string;
  area: number;
  type: 'missing' | 'damaged' | 'wrong_address' | 'late' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  description: string;
  resolution?: string;
  resolvedDate?: string;
  notes: string[];
}

const COMPLAINTS_STORAGE_KEY = 'delivery_complaints';

export default function ResidentComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const [formData, setFormData] = useState({
    residentName: '',
    phone: '',
    address: '',
    area: '',
    type: 'missing' as Complaint['type'],
    priority: 'medium' as Complaint['priority'],
    description: ''
  });

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = () => {
    try {
      const saved = localStorage.getItem(COMPLAINTS_STORAGE_KEY);
      if (saved) {
        setComplaints(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading complaints:', error);
    }
  };

  const saveComplaints = (newComplaints: Complaint[]) => {
    try {
      localStorage.setItem(COMPLAINTS_STORAGE_KEY, JSON.stringify(newComplaints));
      setComplaints(newComplaints);
    } catch (error) {
      console.error('Error saving complaints:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const complaint: Complaint = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      residentName: formData.residentName,
      phone: formData.phone,
      address: formData.address,
      area: parseInt(formData.area),
      type: formData.type,
      priority: formData.priority,
      status: 'open',
      description: formData.description,
      notes: []
    };

    saveComplaints([complaint, ...complaints]);
    resetForm();
    setIsAdding(false);
  };

  const resetForm = () => {
    setFormData({
      residentName: '',
      phone: '',
      address: '',
      area: '',
      type: 'missing',
      priority: 'medium',
      description: ''
    });
  };

  const updateComplaintStatus = (id: string, status: Complaint['status'], resolution?: string) => {
    const updated = complaints.map(c => {
      if (c.id === id) {
        const updates: Partial<Complaint> = { status };
        if (status === 'resolved' || status === 'closed') {
          updates.resolvedDate = new Date().toISOString();
          if (resolution) {
            updates.resolution = resolution;
          }
        }
        return { ...c, ...updates };
      }
      return c;
    });
    saveComplaints(updated);
    setSelectedComplaint(null);
  };

  const addNote = (id: string, note: string) => {
    const updated = complaints.map(c => {
      if (c.id === id) {
        return { ...c, notes: [...c.notes, `${new Date().toLocaleDateString('he-IL')} - ${note}`] };
      }
      return c;
    });
    saveComplaints(updated);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'missing': return 'דואר חסר';
      case 'damaged': return 'דואר פגום';
      case 'wrong_address': return 'כתובת שגויה';
      case 'late': return 'איחור';
      case 'other': return 'אחר';
      default: return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'missing': return '📪';
      case 'damaged': return '📦';
      case 'wrong_address': return '🏠';
      case 'late': return '⏰';
      case 'other': return '📝';
      default: return '📋';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 border-red-400 text-red-800';
      case 'high': return 'bg-orange-100 border-orange-400 text-orange-800';
      case 'medium': return 'bg-yellow-100 border-yellow-400 text-yellow-800';
      case 'low': return 'bg-blue-100 border-blue-400 text-blue-800';
      default: return 'bg-gray-100 border-gray-400 text-gray-800';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'דחוף מאוד';
      case 'high': return 'גבוה';
      case 'medium': return 'בינוני';
      case 'low': return 'נמוך';
      default: return priority;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'פתוח';
      case 'in_progress': return 'בטיפול';
      case 'resolved': return 'נפתר';
      case 'closed': return 'סגור';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="text-red-600" size={20} />;
      case 'in_progress': return <Clock className="text-yellow-600" size={20} />;
      case 'resolved': return <CheckCircle className="text-green-600" size={20} />;
      case 'closed': return <XCircle className="text-gray-600" size={20} />;
      default: return <MessageSquare className="text-gray-600" size={20} />;
    }
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.residentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.phone.includes(searchTerm) ||
                         complaint.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || complaint.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || complaint.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const stats = {
    total: complaints.length,
    open: complaints.filter(c => c.status === 'open').length,
    inProgress: complaints.filter(c => c.status === 'in_progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl shadow-lg p-6 border-2 border-red-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-to-br from-red-500 to-orange-600 p-3 rounded-xl">
            <MessageSquare className="text-white" size={28} />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800">תלונות ופניות דיירים</h2>
            <p className="text-sm text-gray-600">מעקב וניהול פניות מדיירים</p>
          </div>
          <button
            onClick={() => {
              setIsAdding(!isAdding);
              setSelectedComplaint(null);
              resetForm();
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            פנייה חדשה
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-gray-200">
            <div className="text-sm text-gray-600 mb-1">סה"כ פניות</div>
            <div className="text-3xl font-bold text-gray-800">{stats.total}</div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-red-200">
            <div className="text-sm text-gray-600 mb-1">פתוחות</div>
            <div className="text-3xl font-bold text-red-600">{stats.open}</div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-yellow-200">
            <div className="text-sm text-gray-600 mb-1">בטיפול</div>
            <div className="text-3xl font-bold text-yellow-600">{stats.inProgress}</div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border-2 border-green-200">
            <div className="text-sm text-gray-600 mb-1">נפתרו</div>
            <div className="text-3xl font-bold text-green-600">{stats.resolved}</div>
          </div>
        </div>

        {isAdding && (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 shadow-md border border-gray-200 mb-6">
            <h3 className="font-bold text-lg mb-4">פנייה חדשה</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">שם הדייר</label>
                  <input
                    type="text"
                    value={formData.residentName}
                    onChange={(e) => setFormData({ ...formData, residentName: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">טלפון</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">כתובת</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">אזור</label>
                  <input
                    type="number"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">סוג פנייה</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as Complaint['type'] })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="missing">דואר חסר</option>
                    <option value="damaged">דואר פגום</option>
                    <option value="wrong_address">כתובת שגויה</option>
                    <option value="late">איחור</option>
                    <option value="other">אחר</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">עדיפות</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as Complaint['priority'] })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="low">נמוכה</option>
                    <option value="medium">בינונית</option>
                    <option value="high">גבוהה</option>
                    <option value="urgent">דחופה מאוד</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">תיאור הפנייה</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent min-h-[100px]"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  שמור פנייה
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    resetForm();
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  ביטול
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="חיפוש לפי שם, כתובת, טלפון או תיאור..."
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">כל הסטטוסים</option>
              <option value="open">פתוח</option>
              <option value="in_progress">בטיפול</option>
              <option value="resolved">נפתר</option>
              <option value="closed">סגור</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">כל העדיפויות</option>
              <option value="urgent">דחוף מאוד</option>
              <option value="high">גבוה</option>
              <option value="medium">בינוני</option>
              <option value="low">נמוך</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {filteredComplaints.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-white rounded-lg">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">אין פניות להצגה</p>
              <p className="text-sm">כל הפניות שתקבל יופיעו כאן</p>
            </div>
          ) : (
            filteredComplaints.map((complaint) => (
              <div
                key={complaint.id}
                className={`rounded-lg p-5 border-2 transition-all duration-300 hover:shadow-md ${getPriorityColor(complaint.priority)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-3xl">{getTypeIcon(complaint.type)}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-xl">{complaint.residentName}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(complaint.status)}`}>
                          {getStatusLabel(complaint.status)}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-white bg-opacity-50">
                          {getPriorityLabel(complaint.priority)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700 space-y-1">
                        <div>📍 {complaint.address} (אזור {complaint.area})</div>
                        <div>📞 {complaint.phone}</div>
                        <div>📋 {getTypeLabel(complaint.type)}</div>
                        <div>📅 {new Date(complaint.date).toLocaleDateString('he-IL', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</div>
                      </div>
                    </div>
                  </div>

                  {getStatusIcon(complaint.status)}
                </div>

                <div className="bg-white bg-opacity-50 rounded-lg p-3 mb-3">
                  <p className="text-gray-800 font-medium mb-1">תיאור:</p>
                  <p className="text-gray-700">{complaint.description}</p>
                </div>

                {complaint.resolution && (
                  <div className="bg-green-50 bg-opacity-50 rounded-lg p-3 mb-3">
                    <p className="text-green-800 font-medium mb-1">פתרון:</p>
                    <p className="text-green-700">{complaint.resolution}</p>
                    {complaint.resolvedDate && (
                      <p className="text-xs text-green-600 mt-1">
                        נפתר ב-{new Date(complaint.resolvedDate).toLocaleDateString('he-IL')}
                      </p>
                    )}
                  </div>
                )}

                {complaint.notes.length > 0 && (
                  <div className="bg-white bg-opacity-50 rounded-lg p-3 mb-3">
                    <p className="text-gray-800 font-medium mb-2">הערות:</p>
                    <ul className="space-y-1 text-sm text-gray-700">
                      {complaint.notes.map((note, idx) => (
                        <li key={idx} className="pr-4">• {note}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mt-4">
                  {complaint.status === 'open' && (
                    <button
                      onClick={() => updateComplaintStatus(complaint.id, 'in_progress')}
                      className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors text-sm"
                    >
                      התחל טיפול
                    </button>
                  )}
                  {complaint.status === 'in_progress' && (
                    <button
                      onClick={() => {
                        const resolution = prompt('תאר את הפתרון:');
                        if (resolution) {
                          updateComplaintStatus(complaint.id, 'resolved', resolution);
                        }
                      }}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors text-sm"
                    >
                      סמן כנפתר
                    </button>
                  )}
                  {(complaint.status === 'resolved' || complaint.status === 'in_progress') && (
                    <button
                      onClick={() => updateComplaintStatus(complaint.id, 'closed')}
                      className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors text-sm"
                    >
                      סגור פנייה
                    </button>
                  )}
                  <button
                    onClick={() => {
                      const note = prompt('הוסף הערה:');
                      if (note) {
                        addNote(complaint.id, note);
                      }
                    }}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors text-sm"
                  >
                    הוסף הערה
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
