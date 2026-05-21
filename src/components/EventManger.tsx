import React, { useState } from "react";
import { Calendar, MapPin, Plus, Trash2, Check, Star, Sparkles, MessageSquareCode } from "lucide-react";
import { Event } from "../types";

interface EventMangerProps {
  events: Event[];
  activeEvent: string;
  onSelectActiveEvent: (eventName: string) => void;
  onEventCreated: (newEvent: Event) => void;
  onEventDeleted: (id: string) => void;
}

export default function EventManger({
  events,
  activeEvent,
  onSelectActiveEvent,
  onEventCreated,
  onEventDeleted
}: EventMangerProps) {
  const [eventName, setEventName] = useState("");
  const [date, setDate] = useState("");
  const [venue, setVenue] = useState("");
  const [description, setDescription] = useState("");
  const [qrType, setQrType] = useState("Standard-JSON");
  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmitEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!eventName.trim() || !date) {
      setErrorMsg("Event Name and Scheduled Date are required parameters.");
      return;
    }

    setCreating(true);

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName: eventName.trim(),
          date,
          venue: venue.trim() || "TBD / Virtual",
          description: description.trim() || "Community event managed on CheckInFlow",
          qrType
        })
      });

      if (!res.ok) {
        throw new Error("Failed to persist scheduled event credentials inside cache.");
      }

      const data = await res.json();
      onEventCreated(data.event);

      // Auto-set as active event
      onSelectActiveEvent(data.event.eventName);

      // Reset
      setEventName("");
      setDate("");
      setVenue("");
      setDescription("");
    } catch (err: any) {
      setErrorMsg(err.message || "An issue occurred. Try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteEvent = async (id: string, eName: string) => {
    if (!window.confirm(`Are you sure you want to delete ${eName}? This will not delete scanned records but will remove the schedule block.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        onEventDeleted(id);
      }
    } catch (err) {
      console.error("Failed to delete event:", err);
    }
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6" id="event-manager-panel">
      {/* Event Insertion Form (Left 1 Column) */}
      <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-slate-800 h-fit text-left">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
            <Plus size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Create Event Grid</h3>
            <p className="text-xs text-slate-400">Initialize a scheduled event tracking token.</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 bg-rose-950/40 border border-rose-900/60 rounded-xl p-3 text-xs text-rose-300 font-semibold animate-fade-in">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmitEvent} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Event Name *
            </label>
            <input
              type="text"
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-white py-2.5 px-3.5 text-xs transition focus:outline-none"
              placeholder="e.g. Build with AI Hackathon"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              disabled={creating}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Scheduled Date *
            </label>
            <input
              type="date"
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-white py-2.5 px-3.5 text-xs transition focus:outline-none"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={creating}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Venue Location / Platform
            </label>
            <input
              type="text"
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-white py-2.5 px-3.5 text-xs transition focus:outline-none"
              placeholder="e.g. San Francisco Tech Hub"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              disabled={creating}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Token QR Type / Format
            </label>
            <select
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-white py-2.5 px-3.5 text-xs transition focus:outline-none cursor-pointer"
              value={qrType}
              onChange={(e) => setQrType(e.target.value)}
              disabled={creating}
            >
              <option value="Standard-JSON">Standard-JSON (Embedded Card)</option>
              <option value="RawText-Email">RawText-Email (Decoded Names)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Event Description
            </label>
            <textarea
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-white py-2 px-3 text-xs transition focus:outline-none h-20 resize-none"
              placeholder="State roundtable directions or registration goals..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={creating}
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={creating}
            className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
            id="create-event-submit"
          >
            {creating ? (
              <>
                <span className="w-3 h-3 border-2 border-slate-650 border-t-indigo-400 rounded-full animate-spin"></span>
                Creating...
              </>
            ) : (
              "Initialize Scheduled Event"
            )}
          </button>
        </form>
      </div>

      {/* Events scheduled List (Right 2 Columns) */}
      <div className="lg:col-span-2 space-y-4 text-left">
        <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-3">
            <Sparkles size={16} className="text-yellow-400 shrink-0" />
            <div>
              <h3 className="text-base font-bold text-white">Active Rosters</h3>
              <p className="text-xs text-slate-400">Designate the active checking roster. All scans assign automatically.</p>
            </div>
          </div>

          {events.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 font-semibold uppercase tracking-wider">
              No events scheduled in the matrix yet. Initiate your first event.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map((ev) => {
                const isActive = ev.eventName === activeEvent;
                return (
                  <div
                    key={ev.id}
                    className={`p-4.5 rounded-xl border transition-all flex flex-col justify-between ${
                      isActive
                        ? "bg-indigo-950/20 border-indigo-500/80 shadow-[0_0_20px_rgba(108,99,255,0.08)]"
                        : "bg-slate-950/60 border-slate-800/80 hover:border-slate-705"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-1.5">
                        <span className="text-xs text-indigo-400 font-mono font-bold uppercase tracking-widest">
                          {ev.qrType}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {isActive && (
                            <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-extrabold py-0.5 px-2 rounded-full border border-emerald-400/20 flex items-center gap-1">
                              <Star size={10} className="fill-current" />
                              Active Feed
                            </span>
                          )}
                          <button
                            onClick={() => handleDeleteEvent(ev.id, ev.eventName)}
                            className="p-1 px-1.5 rounded bg-slate-900 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 border border-slate-800 transition cursor-pointer"
                            title="Remove Event Block"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      <h4 className="text-sm font-extrabold text-white mb-2 leading-snug">
                        {ev.eventName}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-4 font-medium">
                        {ev.description || "No description provided."}
                      </p>
                    </div>

                    <div className="border-t border-slate-800/60 pt-3.5 mt-auto flex flex-col md:flex-row md:items-center justify-between gap-3 text-[11px] text-slate-350">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 font-semibold">
                          <Calendar size={12} className="text-indigo-400" />
                          <span>{new Date(ev.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate max-w-[170px] font-medium text-slate-400">
                          <MapPin size={12} className="text-cyan-400 shrink-0" />
                          <span className="truncate">{ev.venue}</span>
                        </div>
                      </div>

                      {!isActive && (
                        <button
                          onClick={() => onSelectActiveEvent(ev.eventName)}
                          className="shrink-0 text-[10px] font-bold bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white hover:bg-slate-850 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Check size={11} />
                          Load Feed
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Badge QR codes section */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-yellow-500/10 text-yellow-400 rounded-lg border border-yellow-500/20">
              <MessageSquareCode size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Mock QR Pass Simulator</h3>
              <p className="text-xs text-slate-400">
                Generate instant mock attendee passes with custom QR codes to test scanning and drag-and-drop file decoding!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Passenger card mockup 1 */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="text-left">
                <div className="text-xs font-bold text-white">Alexander Wang</div>
                <div className="text-[10px] text-slate-400">Scale AI / CEO</div>
                <div className="text-[9px] text-indigo-400 font-bold font-mono mt-1 mt-1.5 bg-indigo-500/10 py-0.5 px-2 rounded-md border border-indigo-500/20 w-fit">
                  Test Pass 1
                </div>
              </div>
              <div className="shrink-0 p-1.5 bg-white rounded-lg">
                <img
                  className="w-16 h-16"
                  referrerPolicy="no-referrer"
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
                    JSON.stringify({
                      name: "Alexander Wang",
                      email: "alexander@scale.com",
                      company: "Scale AI",
                      event: activeEvent || "Generative AI Hackathon SF",
                      designation: "Chief Executive Officer"
                    })
                  )}`}
                  alt="Alexander QR pass"
                />
              </div>
            </div>

            {/* Passenger card mockup 2 */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="text-left">
                <div className="text-xs font-bold text-white">Jane Foster</div>
                <div className="text-[10px] text-slate-400 font-medium">NASA / Astrophysicist</div>
                <div className="text-[9px] text-cyan-400 font-bold font-mono mt-1.5 bg-cyan-400/10 py-0.5 px-2 rounded-md border border-cyan-400/20 w-fit">
                  Test Pass 2
                </div>
              </div>
              <div className="shrink-0 p-1.5 bg-white rounded-lg">
                <img
                  className="w-16 h-16"
                  referrerPolicy="no-referrer"
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
                    JSON.stringify({
                      name: "Jane Foster",
                      email: "jfoster@nasa.gov",
                      company: "NASA Lab",
                      event: activeEvent || "Generative AI Hackathon SF",
                      designation: "Principal Astrophysicist"
                    })
                  )}`}
                  alt="Jane QR Pass"
                />
              </div>
            </div>
          </div>
          <div className="mt-3.5 text-[11px] text-slate-500 text-left leading-normal font-medium">
            <span className="text-yellow-400 font-bold">Pro Tip: </span>
            Right-click the QR image, click "Save image as", then upload it in the "Import Pass" panel to test drag-and-drop QR parsing!
          </div>
        </div>
      </div>
    </div>
  );
}
