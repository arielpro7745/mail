import { useState } from "react";
import { nanoid } from "nanoid";
import { Building, BuildingEntrance, Mailbox } from "../types";
import { Plus, Edit, Trash2, Mail, Home, Phone, User, Key } from "lucide-react";

interface Props {
  building: Building;
  onUpdateBuilding: (id: string, patch: Partial<Building>) => void;
}

export default function BuildingEntranceManager({ building, onUpdateBuilding }: Props) {
  const [editingEntrance, setEditingEntrance] = useState<BuildingEntrance | null>(null);
  const [editingMailbox, setEditingMailbox] = useState<{entrance: BuildingEntrance, mailbox: Mailbox} | null>(null);
  const [showMailboxes, setShowMailboxes] = useState<string | null>(null);

  const addEntrance = () => {
    const newEntrance: BuildingEntrance = {
      id: nanoid(6),
      name: `כניסה ${String.fromCharCode(65 + (building.entrances?.length || 0))}`,
      mailboxes: [],
    };

    const updatedEntrances = [...(building.entrances || []), newEntrance];
    onUpdateBuilding(building.id, { entrances: updatedEntrances });
  };

  const updateEntrance = (entranceId: string, patch: Partial<BuildingEntrance>) => {
    const updatedEntrances = (building.entrances || []).map(e =>
      e.id === entranceId ? { ...e, ...patch } : e
    );
    onUpdateBuilding(building.id, { entrances: updatedEntrances });
    setEditingEntrance(null);
  };

  const deleteEntrance = (entranceId: string) => {
    if (window.confirm("בטוח למחוק כניסה זו?")) {
      const updatedEntrances = (building.entrances || []).filter(e => e.id !== entranceId);
      onUpdateBuilding(building.id, { entrances: updatedEntrances });
    }
  };

  const addMailbox = (entranceId: string) => {
    const entrance = building.entrances?.find(e => e.id === entranceId);
    if (!entrance) return;

    const newMailbox: Mailbox = {
      id: nanoid(6),
      number: String((entrance.mailboxes?.length || 0) + 1),
    };

    const updatedMailboxes = [...(entrance.mailboxes || []), newMailbox];
    updateEntrance(entranceId, { mailboxes: updatedMailboxes });
  };

  const updateMailbox = (entranceId: string, mailboxId: string, patch: Partial<Mailbox>) => {
    const entrance = building.entrances?.find(e => e.id === entranceId);
    if (!entrance) return;

    const updatedMailboxes = (entrance.mailboxes || []).map(m =>
      m.id === mailboxId ? { ...m, ...patch } : m
    );
    updateEntrance(entranceId, { mailboxes: updatedMailboxes });
  };

  const deleteMailbox = (entranceId: string, mailboxId: string) => {
    if (window.confirm("בטוח למחוק תיבה זו?")) {
      const entrance = building.entrances?.find(e => e.id === entranceId);
      if (!entrance) return;

      const updatedMailboxes = (entrance.mailboxes || []).filter(m => m.id !== mailboxId);
      updateEntrance(entranceId, { mailboxes: updatedMailboxes });
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mt-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500 rounded-lg">
            <Home size={20} className="text-white" />
          </div>
          <div>
            <h4 className="font-bold text-lg text-gray-800">ניהול כניסות ותיבות</h4>
            <p className="text-sm text-gray-600">{building.streetId} {building.number}</p>
          </div>
        </div>
        <button 
          onClick={addEntrance} 
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <Plus size={16} />
          הוסף כניסה
        </button>
      </div>

      <div className="space-y-4">
        {building.entrances?.map(entrance => (
          <div key={entrance.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <span className="font-bold text-indigo-600">{entrance.name.slice(-1)}</span>
                </div>
                <div>
                  <h5 className="font-semibold text-gray-800">{entrance.name}</h5>
                  {entrance.code && (
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Key size={12} />
                      קוד: {entrance.code}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowMailboxes(showMailboxes === entrance.id ? null : entrance.id)}
                  className="flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-200 text-sm"
                >
                  <Mail size={14} />
                  תיבות ({entrance.mailboxes?.length || 0})
                </button>
                <button
                  onClick={() => setEditingEntrance(entrance)}
                  className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-all duration-200"
                >
                  <Edit size={14} />
                </button>
                <button
                  onClick={() => deleteEntrance(entrance.id)}
                  className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {showMailboxes === entrance.id && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border-t">
                <div className="flex items-center justify-between mb-4">
                  <h6 className="font-semibold text-gray-700 flex items-center gap-2">
                    <Mail size={16} />
                    תיבות דואר
                  </h6>
                  <button
                    onClick={() => addMailbox(entrance.id)}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm transition-all duration-200"
                  >
                    <Plus size={12} />
                    הוסף תיבה
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {entrance.mailboxes?.map(mailbox => (
                    <div key={mailbox.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-blue-600">{mailbox.number}</span>
                          </div>
                          <span className="font-medium text-gray-800">תיבה {mailbox.number}</span>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setEditingMailbox({entrance, mailbox})}
                            className="p-1 text-blue-500 hover:text-blue-700 transition-colors"
                          >
                            <Edit size={12} />
                          </button>
                          <button
                            onClick={() => deleteMailbox(entrance.id, mailbox.id)}
                            className="p-1 text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        {mailbox.familyName && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <User size={12} />
                            <span>{mailbox.familyName}</span>
                          </div>
                        )}
                        {mailbox.phone && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <Phone size={12} />
                            <span>{mailbox.phone}</span>
                          </div>
                        )}
                        {mailbox.hasKey && (
                          <div className="flex items-center gap-2 text-green-600">
                            <Key size={12} />
                            <span>יש מפתח</span>
                          </div>
                        )}
                        {mailbox.notes && (
                          <div className="text-gray-600 text-xs bg-gray-100 p-2 rounded">
                            {mailbox.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal עריכת כניסה */}
      {editingEntrance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h4 className="text-lg font-bold text-gray-800">עריכת כניסה</h4>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                updateEntrance(editingEntrance.id, {
                  name: formData.get('name') as string,
                  code: formData.get('code') as string || undefined,
                });
              }}
              className="p-6"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    שם הכניסה
                  </label>
                  <input
                    name="name"
                    defaultValue={editingEntrance.name}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    קוד כניסה
                  </label>
                  <input
                    name="code"
                    defaultValue={editingEntrance.code}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="אופציונלי"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button 
                  type="submit" 
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  שמור
                </button>
                <button
                  type="button"
                  onClick={() => setEditingEntrance(null)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  בטל
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal עריכת תיבה */}
      {editingMailbox && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-200">
              <h4 className="text-lg font-bold text-gray-800">עריכת תיבת דואר</h4>
              <p className="text-sm text-gray-600">תיבה {editingMailbox.mailbox.number} - {editingMailbox.entrance.name}</p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                updateMailbox(editingMailbox.entrance.id, editingMailbox.mailbox.id, {
                  number: formData.get('number') as string,
                  familyName: formData.get('familyName') as string || undefined,
                  phone: formData.get('phone') as string || undefined,
                  hasKey: formData.get('hasKey') === 'on',
                  notes: formData.get('notes') as string || undefined,
                });
                setEditingMailbox(null);
              }}
              className="p-6"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    מספר תיבה
                  </label>
                  <input
                    name="number"
                    defaultValue={editingMailbox.mailbox.number}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    שם משפחה
                  </label>
                  <input
                    name="familyName"
                    defaultValue={editingMailbox.mailbox.familyName}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="משפ׳ כהן"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    טלפון
                  </label>
                  <input
                    name="phone"
                    defaultValue={editingMailbox.mailbox.phone}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="050-1234567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    הערות
                  </label>
                  <textarea
                    name="notes"
                    defaultValue={editingMailbox.mailbox.notes}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="הערות נוספות..."
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="hasKey"
                    defaultChecked={editingMailbox.mailbox.hasKey || false}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    יש מפתח לתיבה
                  </label>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button 
                  type="submit" 
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  שמור
                </button>
                <button
                  type="button"
                  onClick={() => setEditingMailbox(null)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  בטל
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}