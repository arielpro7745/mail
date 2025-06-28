import { useState } from "react";
import { nanoid } from "nanoid";
import { Building, BuildingEntrance, Mailbox } from "../types";
import { Plus, Edit, Trash2, Mail } from "lucide-react";

interface Props {
  building: Building;
  onUpdateBuilding: (id: string, patch: Partial<Building>) => void;
}

export default function BuildingEntranceManager({ building, onUpdateBuilding }: Props) {
  const [editingEntrance, setEditingEntrance] = useState<BuildingEntrance | null>(null);
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
    <div className="border rounded-lg p-4 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold">ניהול כניסות - {building.streetId} {building.number}</h4>
        <button onClick={addEntrance} className="btn-sm flex items-center gap-1">
          <Plus size={14} />
          הוסף כניסה
        </button>
      </div>

      {building.entrances?.map(entrance => (
        <div key={entrance.id} className="border rounded p-3 mb-3 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-medium">{entrance.name}</h5>
            <div className="flex gap-1">
              <button
                onClick={() => setShowMailboxes(showMailboxes === entrance.id ? null : entrance.id)}
                className="btn-sm bg-blue-500 hover:bg-blue-600 flex items-center gap-1"
              >
                <Mail size={14} />
                תיבות ({entrance.mailboxes?.length || 0})
              </button>
              <button
                onClick={() => setEditingEntrance(entrance)}
                className="btn-sm bg-yellow-500 hover:bg-yellow-600"
              >
                <Edit size={14} />
              </button>
              <button
                onClick={() => deleteEntrance(entrance.id)}
                className="btn-sm bg-red-500 hover:bg-red-600"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {entrance.code && (
            <p className="text-sm text-gray-600">קוד: {entrance.code}</p>
          )}

          {showMailboxes === entrance.id && (
            <div className="mt-3 border-t pt-3">
              <div className="flex items-center justify-between mb-2">
                <h6 className="font-medium text-sm">תיבות דואר</h6>
                <button
                  onClick={() => addMailbox(entrance.id)}
                  className="btn-sm text-xs"
                >
                  הוסף תיבה
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {entrance.mailboxes?.map(mailbox => (
                  <div key={mailbox.id} className="flex items-center justify-between bg-white p-2 rounded border">
                    <div>
                      <span className="font-medium">תיבה {mailbox.number}</span>
                      {mailbox.residentId && (
                        <span className="text-xs text-gray-500 block">
                          דייר: {building.residents.find(r => r.id === mailbox.residentId)?.fullName}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <label className="flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          checked={mailbox.hasKey || false}
                          onChange={(e) => updateMailbox(entrance.id, mailbox.id, { hasKey: e.target.checked })}
                        />
                        מפתח
                      </label>
                      <button
                        onClick={() => deleteMailbox(entrance.id, mailbox.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      {editingEntrance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h4 className="font-semibold mb-4">עריכת כניסה</h4>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                updateEntrance(editingEntrance.id, {
                  name: formData.get('name') as string,
                  code: formData.get('code') as string || undefined,
                });
              }}
            >
              <div className="space-y-3">
                <label className="block">
                  שם הכניסה
                  <input
                    name="name"
                    defaultValue={editingEntrance.name}
                    className="w-full border rounded px-2 py-1 mt-1"
                    required
                  />
                </label>
                <label className="block">
                  קוד כניסה
                  <input
                    name="code"
                    defaultValue={editingEntrance.code}
                    className="w-full border rounded px-2 py-1 mt-1"
                  />
                </label>
              </div>
              <div className="flex gap-2 mt-4">
                <button type="submit" className="btn-sm">שמור</button>
                <button
                  type="button"
                  onClick={() => setEditingEntrance(null)}
                  className="btn-sm bg-gray-500 hover:bg-gray-600"
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