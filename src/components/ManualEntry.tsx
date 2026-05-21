import React, { useState } from "react";
import { UserPlus, CheckCircle2, ChevronDown, Sparkles, Trash2 } from "lucide-react";
import canvasConfetti from "canvas-confetti";

interface ManualEntryProps {
  events: Array<{ id: string; eventName: string }>;
  activeEvent: string;
  onEntrySuccess: (record: any) => void;
  onEntryDeleted?: (id: string) => void;
  onEntryError: (error: string) => void;
}

export default function ManualEntry({ events, activeEvent, onEntrySuccess, onEntryDeleted, onEntryError }: ManualEntryProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [designation, setDesignation] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(activeEvent || (events[0]?.eventName || ""));
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [success, setSuccess] = useState(false);
  const [lastRecord, setLastRecord] = useState<any | null>(null);

  // Sync selectedEvent with activeEvent when activeEvent updates globally
  if (activeEvent && selectedEvent !== activeEvent) {
    setSelectedEvent(activeEvent);
  }

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");
    setSuccess(false);

    // Validation
    if (!name.trim()) {
      setValidationError("Full Name is required.");
      return;
    }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setValidationError("Please enter a valid email address.");
      return;
    }
    if (!selectedEvent) {
      setValidationError("Please associate this registration with an event.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/attendance/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          company: company.trim() || "Independent",
          designation: designation.trim() || "Attendee",
          event: selectedEvent,
          phone: phone.trim()
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to make manual attendance check-in.");
      }

      const parsed = await res.json();

      // Fun celebrant
      canvasConfetti({
        particleCount: 50,
        spread: 45,
        origin: { y: 0.8 },
        colors: ["#22D3EE", "#A855F7", "#6C63FF"]
      });

      setSuccess(true);
      setLastRecord(parsed.record);
      onEntrySuccess(parsed.record);

      // Clean non-sticky fields
      setName("");
      setEmail("");
      setCompany("");
      setDesignation("");
      setPhone("");
    } catch (err: any) {
      onEntryError(err.message || "Could not register check-in attendee.");
      setValidationError(err.message || "Could not complete check-in. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLastRecord = async () => {
    if (!lastRecord) return;

    try {
      const res = await fetch(`/api/attendance/${lastRecord.id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        if (onEntryDeleted) {
          onEntryDeleted(lastRecord.id);
        }
        setSuccess(false);
        setLastRecord(null);
      } else {
        setValidationError("Could not delete the check-in record.");
      }
    } catch (err) {
      console.error("Delete last record failed:", err);
      setValidationError("Failed to connect to server for deletion.");
    }
  };

  return (
    <div className="w-full max-w-lg bg-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-slate-800 shadow-xl" id="manual-entry-module">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
          <UserPlus size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white leading-5">Manual Ingestion</h3>
          <p className="text-xs text-slate-400">Add an attendee without scanning a QR code.</p>
        </div>
      </div>

      {success && (
        <div className="mb-5 bg-emerald-950/40 border border-emerald-800/80 rounded-xl p-4 flex flex-col gap-3 animate-fade-in text-left">
          <div className="flex items-start gap-3">
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-emerald-300 font-bold text-sm">Ingestion Success!</h4>
              <p className="text-xs text-emerald-400 leading-normal">
                Attendee <strong>{lastRecord?.attendeeName}</strong> ({lastRecord?.attendeeEmail}) successfully checked in.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-2 border-t border-emerald-900/40">
            <button
              type="button"
              onClick={handleDeleteLastRecord}
              className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-white rounded-lg border border-rose-500/20 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 size={12} />
              Delete / Undo Entry
            </button>
            <button
              type="button"
              onClick={() => { setSuccess(false); setLastRecord(null); }}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-800 text-xs font-bold transition flex items-center justify-center cursor-pointer"
            >
              Add New 1
            </button>
          </div>
        </div>
      )}

      {validationError && (
        <div className="mb-5 bg-rose-950/40 border border-rose-900/60 rounded-xl p-3 text-xs text-rose-300 font-medium text-left animate-fade-in">
          {validationError}
        </div>
      )}

      <form onSubmit={handleManualSubmit} className="space-y-4 text-left">
        {/* Core Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-white py-2.5 px-3.5 text-sm transition focus:outline-none"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={submitting}
          />
        </div>

        {/* Core Email */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Email Address <span className="text-rose-500">*</span>
          </label>
          <input
            type="email"
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-white py-2.5 px-3.5 text-sm transition focus:outline-none"
            placeholder="john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitting}
          />
        </div>

        {/* Association Event Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Assign to Event <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <select
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-white py-2.5 px-3.5 text-sm transition focus:outline-none appearance-none cursor-pointer"
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              disabled={submitting}
            >
              <option value="" disabled>Select an active Event</option>
              {events.map((e) => (
                <option key={e.id} value={e.eventName}>
                  {e.eventName}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-slate-400">
              <ChevronDown size={16} />
            </div>
          </div>
        </div>

        {/* Optional details (grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Company / Space
            </label>
            <input
              type="text"
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-white py-2.5 px-3.5 text-sm transition focus:outline-none"
              placeholder="e.g. Google"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Designation / Role
            </label>
            <input
              type="text"
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-white py-2.5 px-3.5 text-sm transition focus:outline-none"
              placeholder="e.g. Developer"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              disabled={submitting}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Phone Number <span className="text-[10px] text-slate-500">(Optional)</span>
          </label>
          <input
            type="text"
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-white py-2.5 px-3.5 text-sm transition focus:outline-none"
            placeholder="+1 (555) 019-2834"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={submitting}
          />
        </div>

        {/* Submission Panel */}
        <button
          type="submit"
          disabled={submitting}
          className={`w-full py-3 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer mt-2 shadow-md ${
            submitting
              ? "bg-slate-850 border border-slate-800 text-slate-500 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_4px_12px_rgba(108,99,255,0.2)]"
          }`}
          id="manual-submit-trigger"
        >
          {submitting ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-slate-600 border-t-indigo-400 rounded-full animate-spin"></span>
              Registering...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Add Record & Check In
            </>
          )}
        </button>
      </form>
    </div>
  );
}
