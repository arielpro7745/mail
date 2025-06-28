import { useState } from "react";
import { nanoid } from "nanoid";
import { Building, BuildingEntrance, Mailbox } from "../types";
import { Plus, Edit, Trash2, Mail, Home, Phone, User, Key, DoorOpen, CheckCircle, XCircle } from "lucide-react";

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
      allowMailbox: true,
      allowDoor: false,
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
          <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-md">
            <Home size={24} className="text-white" />
          </div>
          <div>
            <h4 className="font-bold text-xl text-gray-800">ניהול כניסות ותיבות דואר</h4>
            <p className="text-sm text-gray-600 font-medium">{building.streetId} {building.number}</p>
          </div>
        </div>
        <button 
          onClick={addEntrance} 
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <Plus size={18} />
          הוסף כניסה
        </button>
      </div>

      <div className="space-y-6">
        {building.entrances?.map(entrance => (
          <div key={entrance.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-100 to-blue-100 rounded-xl flex items-center justify-center shadow-sm">
                  <span className="font-bold text-lg text-indigo-600">{entrance.name.slice(-1)}</span>
                </div>
                <div>
                  <h5 className="font-bold text-lg text-gray-800">{entrance.name}</h5>
                  {entrance.code && (
                    <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                      <Key size={14} className="text-yellow-500" />
                      קוד כניסה: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{entrance.code}</span>
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowMailboxes(showMailboxes === entrance.id ? null : entrance.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Mail size={16} />
                  תיבות ({entrance.mailboxes?.length || 0})
                </button>
                <button
                  onClick={() => setEditingEntrance(entrance)}
                  className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => deleteEntrance(entrance.id)}
                  className="p-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {showMailboxes === entrance.id && (
              <div className="mt-6 p-5 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-5">
                  <h6 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                    <Mail size={20} className="text-blue-500" />
                    תיבות דואר
                  </h6>
                  <button
                    onClick={() => addMailbox(entrance.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg text-sm transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <Plus size={14} />
                    הוסף תיבה
                  </button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {entrance.mailboxes?.map(mailbox => (
                    <div key={mailbox.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center shadow-sm">
                            <span className="text-sm font-bold text-blue-600">{mailbox.number}</span>
                          </div>
                          <div>
                            <span className="font-bold text-gray-800">תיבה {mailbox.number}</span>
                            {mailbox.familyName && (
                              <p className="text-sm text-gray-600 font-medium">{mailbox.familyName}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setEditingMailbox({entrance, mailbox})}
                            className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                            title="עריכה"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => deleteMailbox(entrance.id, mailbox.id)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                            title="מחיקה"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {mailbox.phone && (
                          <div className="flex items-center gap-2 text-gray-700 bg-gray-50 p-2 rounded-lg">
                            <Phone size={14} className="text-green-500" />
                            <span className="font-mono text-sm">{mailbox.phone}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4">
                          {mailbox.allowMailbox && (
                            <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                              <CheckCircle size={14} />
                              <span className="text-xs font-medium">מאשר תיבה</span>
                            </div>
                          )}
                          {mailbox.allowDoor && (
                            <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                              <DoorOpen size={14} />
                              <span className="text-xs font-medium">מאשר דלת</span>
                            </div>
                          )}
                          {mailbox.hasKey && (
                            <div className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-lg">
                              <Key size={14} />
                              <span className="text-xs font-medium">יש מפתח</span>
                            </div>
                          )}
                        </div>

                        {mailbox.notes && (
                          <div className="text-gray-600 text-sm bg-gray-100 p-3 rounded-lg border-r-4 border-blue-400">
                            <span className="font-medium">הערות:</span> {mailbox.notes}
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
              <h4 className="text-xl font-bold text-gray-800">עריכת כניסה</h4>
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
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    שם הכניסה
                  </label>
                  <input
                    name="name"
                    defaultValue={editingEntrance.name}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    קוד כניסה
                  </label>
                  <input
                    name="code"
                    defaultValue={editingEntrance.code}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="אופציונלי"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 px-4 rounded-xl transition-all duration-200 font-medium shadow-lg"
                >
                  שמור
                </button>
                <button
                  type="button"
                  onClick={() => setEditingEntrance(null)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-xl transition-all duration-200 font-medium"
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
              <h4 className="text-xl font-bold text-gray-800">עריכת תיבת דואר</h4>
              <p className="text-sm text-gray-600 mt-1">תיבה {editingMailbox.mailbox.number} - {editingMailbox.entrance.name}</p>
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
                  allowMailbox: formData.get('allowMailbox') === 'on',
                  allowDoor: formData.get('allowDoor') === 'on',
                  notes: formData.get('notes') as string || undefined,
                });
                setEditingMailbox(null);
              }}
              className="p-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    מספר תיבה
                  </label>
                  <input
                    name="number"
                    defaultValue={editingMailbox.mailbox.number}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    שם משפחה
                  </label>
                  <input
                    name="familyName"
                    defaultValue={editingMailbox.mailbox.familyName}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="משפ׳ כהן"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    טלפון
                  </label>
                  <input
                    name="phone"
                    defaultValue={editingMailbox.mailbox.phone}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="050-1234567"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    הערות
                  </label>
                  <textarea
                    name="notes"
                    defaultValue={editingMailbox.mailbox.notes}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    rows={3}
                    placeholder="הערות נוספות..."
                  />
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <h5 className="font-bold text-gray-700 mb-3">הרשאות</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                    <input
                      type="checkbox"
                      name="allowMailbox"
                      defaultChecked={editingMailbox.mailbox.allowMailbox || false}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500 w-4 h-4"
                    />
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-500" />
                      <label className="text-sm font-medium text-gray-700">
                        מאשר תיבה
                      </label>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                    <input
                      type="checkbox"
                      name="allowDoor"
                      defaultChecked={editingMailbox.mailbox.allowDoor || false}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <div className="flex items-center gap-2">
                      <DoorOpen size={16} className="text-blue-500" />
                      <label className="text-sm font-medium text-gray-700">
                        מאשר דלת
                      </label>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                    <input
                      type="checkbox"
                      name="hasKey"
                      defaultChecked={editingMailbox.mailbox.hasKey || false}
                      className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500 w-4 h-4"
                    />
                    <div className="flex items-center gap-2">
                      <Key size={16} className="text-yellow-500" />
                      <label className="text-sm font-medium text-gray-700">
                        יש מפתח
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 px-4 rounded-xl transition-all duration-200 font-medium shadow-lg"
                >
                  שמור
                </button>
                <button
                  type="button"
                  onClick={() => setEditingMailbox(null)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-xl transition-all duration-200 font-medium"
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