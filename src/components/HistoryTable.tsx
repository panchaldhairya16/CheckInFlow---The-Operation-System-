import { useState } from "react";
import { Search, Filter, Download, Trash2, Edit2, Check, X, Printer, Sheet } from "lucide-react";
import { Attendance } from "../types";

interface HistoryTableProps {
  attendance: Attendance[];
  events: Array<{ id: string; eventName: string }>;
  onUpdateRecord: (updatedRecord: Attendance) => void;
  onDeleteRecord: (id: string) => void;
  onClearAllRecords?: () => void;
}

export default function HistoryTable({
  attendance,
  events,
  onUpdateRecord,
  onDeleteRecord,
  onClearAllRecords
}: HistoryTableProps) {
  const [filterEvent, setFilterEvent] = useState("all");
  const [searchVal, setSearchVal] = useState("");

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [editDesignation, setEditDesignation] = useState("");
  const [editStatus, setEditStatus] = useState<'checked-in' | 'pending' | 'flagged'>('checked-in');

  // Multi-user & Sandbox Confirmation Dialog States
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [singleDeleteConfirm, setSingleDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // Filter attendance data
  const filteredRecords = attendance.filter((rec) => {
    const matchEvent = filterEvent === "all" || rec.event === filterEvent;
    const matchSearch =
      rec.attendeeName.toLowerCase().includes(searchVal.toLowerCase()) ||
      rec.attendeeEmail.toLowerCase().includes(searchVal.toLowerCase()) ||
      rec.company.toLowerCase().includes(searchVal.toLowerCase()) ||
      rec.designation.toLowerCase().includes(searchVal.toLowerCase());
    return matchEvent && matchSearch;
  });

  const triggerEdit = (rec: Attendance) => {
    setEditingId(rec.id);
    setEditName(rec.attendeeName);
    setEditEmail(rec.attendeeEmail);
    setEditCompany(rec.company);
    setEditDesignation(rec.designation);
    setEditStatus(rec.attendanceStatus);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim() || !editEmail.trim()) {
      setErrorToast("Name and Email are mandatory fields.");
      return;
    }

    try {
      const res = await fetch(`/api/attendance/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attendeeName: editName.trim(),
          attendeeEmail: editEmail.trim().toLowerCase(),
          company: editCompany.trim(),
          designation: editDesignation.trim(),
          attendanceStatus: editStatus
        })
      });

      if (res.ok) {
        const data = await res.json();
        onUpdateRecord(data.record);
        setEditingId(null);
      } else {
        setErrorToast("Could not save attendee edits.");
      }
    } catch (err) {
      console.error("Save edit failed:", err);
      setErrorToast("Failed to connect to the server.");
    }
  };

  const triggerDelete = async (id: string, name: string) => {
    setSingleDeleteConfirm({ id, name });
  };

  const handleClearAll = async () => {
    if (attendance.length === 0) {
      setErrorToast("No attendance records to clear.");
      return;
    }
    setShowClearConfirm(true);
  };

  // True browser level CSV Exporter
  const handleExportCSV = () => {
    if (filteredRecords.length === 0) {
      setErrorToast("No attendance records to export.");
      return;
    }

    const headers = [
      "Record ID",
      "Attendee Name",
      "Attendee Email",
      "Company/Space",
      "Designation/Role",
      "Associated Event",
      "Scan Timestamp",
      "Check-In Status"
    ];

    const rows = filteredRecords.map((r) => [
      r.id,
      `"${r.attendeeName.replace(/"/g, '""')}"`,
      r.attendeeEmail,
      `"${r.company.replace(/"/g, '""')}"`,
      `"${r.designation.replace(/"/g, '""')}"`,
      `"${r.event.replace(/"/g, '""')}"`,
      r.scannedAt,
      r.attendanceStatus
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `presently_${filterEvent}_roster_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Browser printer view trigger for PDF simulation
  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-6 relative" id="attendance-log-directory">
      {/* Absolute Overlay Confirm Clear Dialog */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl text-left">
            <h3 className="text-rose-400 font-bold text-lg mb-2 flex items-center gap-2">
              <Trash2 size={20} className="text-rose-400" />
              Wipe Database Registry?
            </h3>
            <p className="text-slate-300 text-xs leading-relaxed mb-4">
              WARNING: You are about to permanently delete <strong>ALL {attendance.length} attendance check-in records</strong> in the registry! This is irreversible.
            </p>
            <p className="text-red-400 font-bold text-[11.5px] uppercase tracking-wider mb-5">
              ⚠️ All local attendance matrix indices and device credentials will be lost.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setShowClearConfirm(false);
                  try {
                    const res = await fetch("/api/attendance", {
                      method: "DELETE"
                    });
                    if (res.ok) {
                      if (onClearAllRecords) {
                        onClearAllRecords();
                      }
                    } else {
                      setErrorToast("Failed to clear database registry.");
                    }
                  } catch (err) {
                    console.error("Clear database failed:", err);
                    setErrorToast("Failed to reach server.");
                  }
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition cursor-pointer"
              >
                Yes, Clear All Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Absolute Overlay Single Record Delete Dialog */}
      {singleDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl text-left">
            <h3 className="text-slate-200 font-bold text-base mb-2 flex items-center gap-2">
              <Trash2 size={18} className="text-rose-400" />
              Delete Check-in Record?
            </h3>
            <p className="text-slate-300 text-xs leading-relaxed mb-4">
              Are you sure you want to delete the check-in record for <strong>{singleDeleteConfirm.name}</strong>?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setSingleDeleteConfirm(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const targetId = singleDeleteConfirm.id;
                  setSingleDeleteConfirm(null);
                  try {
                    const res = await fetch(`/api/attendance/${targetId}`, {
                      method: "DELETE"
                    });
                    if (res.ok) {
                      onDeleteRecord(targetId);
                    } else {
                      setErrorToast("Could not delete the check-in record.");
                    }
                  } catch (err) {
                    console.error("Delete call failed:", err);
                    setErrorToast("Failed to connect to the server.");
                  }
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition cursor-pointer"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inline Feedback Banner */}
      {errorToast && (
        <div className="mb-4 bg-rose-950/40 border border-rose-800/80 rounded-xl p-3 flex items-center justify-between text-left text-xs text-rose-300 animate-fade-in">
          <span>{errorToast}</span>
          <button
            onClick={() => setErrorToast(null)}
            className="text-rose-400 hover:text-white font-bold ml-2 cursor-pointer transition"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Table Title and Actions panel */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
        <div className="text-left">
          <h3 className="text-base font-bold text-white">Registry Database</h3>
          <p className="text-xs text-slate-400">Complete historical check-in roster, filters, and datasheet exports.</p>
        </div>

        {/* Filters/Actions Control Deck */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* Text input search */}
          <div className="relative flex-1 sm:flex-initial sm:w-56">
            <input
              type="text"
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg text-slate-300 placeholder-slate-500 text-xs py-2 px-3 pl-8 focus:outline-none"
              placeholder="Search Name or Company..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
            />
            <Search size={14} className="absolute left-2.5 top-2.5 text-slate-500" />
          </div>

          {/* Category Dropdown */}
          <div className="relative flex-1 sm:flex-initial sm:w-52">
            <select
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg text-slate-300 text-xs py-2 px-3 pl-8 focus:outline-none appearance-none cursor-pointer"
              value={filterEvent}
              onChange={(e) => setFilterEvent(e.target.value)}
            >
              <option value="all">All Registered Events</option>
              {events.map((e) => (
                <option key={e.id} value={e.eventName}>
                  {e.eventName}
                </option>
              ))}
            </select>
            <Filter size={14} className="absolute left-2.5 top-2.5 text-slate-500" />
          </div>

          {/* Export Action Triggers */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearAll}
              className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/30 text-rose-300 hover:text-white rounded-lg border border-rose-500/20 hover:border-rose-500/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
              title="Delete all stored attendance records in one click"
              id="clear-registry-action"
            >
              <Trash2 size={12} />
              <span>Delete All Data</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
              title="Export filtered records as CSV"
              id="export-csv-action"
            >
              <Sheet size={14} />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handlePrintPDF}
              className="px-2 py-2 bg-slate-950 hover:bg-slate-900 text-slate-300 hover:text-white rounded-lg border border-slate-800 transition cursor-pointer"
              title="Print Roster Logs"
              id="print-roster-action"
            >
              <Printer size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Table logs listing */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <th className="py-3 px-4">Attendee Name</th>
              <th className="py-3 px-4">Contact Info</th>
              <th className="py-3 px-4">Company</th>
              <th className="py-3 px-4">Designation</th>
              <th className="py-3 px-4">Associated Event</th>
              <th className="py-3 px-4">Scanned Time</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 font-medium">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-slate-500 font-medium uppercase tracking-wider">
                  No matching attendee records located. Set up manual inputs or scan additional passes.
                </td>
              </tr>
            ) : (
              filteredRecords.map((rec) => {
                const isEditing = editingId === rec.id;
                return (
                  <tr key={rec.id} className="hover:bg-slate-900/30 transition-colors group">
                    {/* Inline edit or Standard list mapping */}
                    {isEditing ? (
                      <>
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white w-full text-xs font-semibold focus:outline-none focus:border-indigo-500"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white w-full text-xs font-semibold focus:outline-none focus:border-indigo-500"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            value={editCompany}
                            onChange={(e) => setEditCompany(e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white w-full text-xs font-semibold focus:outline-none focus:border-indigo-500"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="text"
                            value={editDesignation}
                            onChange={(e) => setEditDesignation(e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white w-full text-xs font-semibold focus:outline-none focus:border-indigo-500"
                          />
                        </td>
                        <td className="py-2 px-4 text-slate-400 font-semibold">{rec.event}</td>
                        <td className="py-2 px-4 text-slate-400 font-mono text-[10px]">
                          {new Date(rec.scannedAt).toLocaleTimeString()}
                        </td>
                        <td className="py-2 px-2">
                          <select
                            value={editStatus}
                            onChange={(e: any) => setEditStatus(e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-white text-xs font-semibold focus:outline-none cursor-pointer"
                          >
                            <option value="checked-in">Checked In</option>
                            <option value="pending">Pending</option>
                            <option value="flagged">Flagged</option>
                          </select>
                        </td>
                        <td className="py-2 px-2 text-center">
                          <div className="flex justify-center gap-1">
                            <button
                              onClick={() => handleSaveEdit(rec.id)}
                              className="p-1 px-1.5 bg-indigo-950 hover:bg-indigo-900 rounded text-indigo-400 border border-indigo-900 transition cursor-pointer"
                              title="Commit Edits"
                            >
                              <Check size={11} />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1 px-1.5 bg-slate-950 hover:bg-slate-900 rounded text-slate-405 border border-slate-800 transition cursor-pointer"
                              title="Cancel"
                            >
                              <X size={11} />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-3.5 px-4 font-bold text-white group-hover:text-indigo-400 transition-colors">
                          {rec.attendeeName}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 font-semibold">{rec.attendeeEmail}</td>
                        <td className="py-3.5 px-4">
                          <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800 text-cyan-300 font-bold text-[10px]">
                            {rec.company}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300 font-semibold">{rec.designation}</td>
                        <td className="py-3.5 px-4 text-slate-350 font-semibold max-w-[150px] truncate" title={rec.event}>
                          {rec.event}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono text-[10px]">
                          {new Date(rec.scannedAt).toLocaleDateString([], { month: '2-digit', day: '2-digit' })}{" "}
                          {new Date(rec.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              rec.attendanceStatus === "checked-in"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-400/20"
                                : rec.attendanceStatus === "flagged"
                                ? "bg-rose-500/10 text-rose-450 border border-rose-500/20"
                                : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                            }`}
                          >
                            {rec.attendanceStatus === "checked-in"
                              ? "Checked In"
                              : rec.attendanceStatus === "flagged"
                              ? "Flagged"
                              : "Pending"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex justify-center gap-1.5 opacity-60 group-hover:opacity-100 transition duration-300">
                            <button
                              onClick={() => triggerEdit(rec)}
                              className="p-1 px-1.5 bg-slate-950 hover:bg-slate-900 rounded text-slate-300 hover:text-white border border-slate-800 transition cursor-pointer"
                              title="Edit Credentials"
                            >
                              <Edit2 size={11} />
                            </button>
                            <button
                              onClick={() => triggerDelete(rec.id, rec.attendeeName)}
                              className="p-1 px-1.5 bg-slate-950 hover:bg-slate-900 rounded text-slate-400 hover:text-rose-450 border border-slate-800 hover:border-rose-950/30 transition cursor-pointer"
                              title="Remove Log"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
