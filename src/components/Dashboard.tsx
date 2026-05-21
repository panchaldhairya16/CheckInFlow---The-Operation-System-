import { useState } from "react";
import { Users, Calendar, Clock, BarChart3, TrendingUp, Sparkles, Filter, Search } from "lucide-react";

interface DashboardProps {
  events: Array<{ id: string; eventName: string; date: string; venue: string }>;
  attendance: Array<{ id: string; attendeeName: string; attendeeEmail: string; company: string; designation: string; event: string; scannedAt: string }>;
  onViewEvent?: (eventName: string) => void;
}

export default function Dashboard({ events, attendance, onViewEvent }: DashboardProps) {
  const [filterEvent, setFilterEvent] = useState("all");
  const [searchVal, setSearchVal] = useState("");

  const totalAttendees = attendance.length;
  const totalEventsCount = events.length;

  // Process registrations over last hours/days for Area chart
  // Group attendance by event
  const eventAttendanceCount: Record<string, number> = {};
  events.forEach((ev) => {
    eventAttendanceCount[ev.eventName] = 0;
  });
  attendance.forEach((rec) => {
    if (eventAttendanceCount[rec.event] !== undefined) {
      eventAttendanceCount[rec.event]++;
    } else {
      eventAttendanceCount[rec.event] = 1;
    }
  });

  const eventCountEntries = Object.entries(eventAttendanceCount);
  const maxAttendanceCount = Math.max(...eventCountEntries.map(([, count]) => count), 1);

  // Filter attendance records based on choice & search query
  const filteredRecords = attendance.filter((rec) => {
    const matchEvent = filterEvent === "all" || rec.event === filterEvent;
    const matchSearch =
      rec.attendeeName.toLowerCase().includes(searchVal.toLowerCase()) ||
      rec.attendeeEmail.toLowerCase().includes(searchVal.toLowerCase()) ||
      rec.company.toLowerCase().includes(searchVal.toLowerCase()) ||
      rec.designation.toLowerCase().includes(searchVal.toLowerCase());
    return matchEvent && matchSearch;
  });

  // Calculate companies breakdown
  const companyCounts: Record<string, number> = {};
  attendance.forEach((r) => {
    const c = r.company || "Independent";
    companyCounts[c] = (companyCounts[c] || 0) + 1;
  });
  const topCompanies = Object.entries(companyCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <div className="w-full space-y-6" id="dashboard-main-view">
      {/* Top Welcome Title Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-2xl">
        <div>
          <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent flex items-center gap-2">
            <span>Event Registry Workspace</span>
            <Sparkles size={18} className="text-indigo-400 shrink-0" />
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Live telemetry tracking of check-ins, networking coordinates, and cohort metrics. Use the laser scanning terminal to parse passes.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-950/80 px-4 py-2 border border-slate-800 rounded-xl">
          <Clock size={16} className="text-cyan-400 shrink-0 animate-pulse" />
          <span className="text-xs font-bold text-white tracking-wide">
            Live Stream: ACTIVE
          </span>
        </div>
      </div>

      {/* Numerical Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-slate-900/30 backdrop-blur-md hover:bg-slate-900/50 transition-all duration-300 p-5 rounded-2xl border border-slate-800 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:scale-125 transition-all"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Total Checked In</span>
            <p className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20"><Users size={18} /></p>
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight">{totalAttendees}</div>
          <div className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider mt-1 flex items-center gap-1.5">
            <TrendingUp size={12} />
            <span>+100% attendance rate</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900/30 backdrop-blur-md hover:bg-slate-900/50 transition-all duration-300 p-5 rounded-2xl border border-slate-800 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl group-hover:scale-125 transition-all"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Active Events</span>
            <p className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg border border-cyan-500/20"><Calendar size={18} /></p>
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight">{totalEventsCount}</div>
          <div className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wider mt-1">
            Tracking Event Schedule
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900/30 backdrop-blur-md hover:bg-slate-900/50 transition-all duration-300 p-5 rounded-2xl border border-slate-800 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl group-hover:scale-125 transition-all"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Today's Registry</span>
            <p className="p-2 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20"><Clock size={18} /></p>
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight">
            {attendance.filter(r => new Date(r.scannedAt).toDateString() === new Date().toDateString()).length}
          </div>
          <div className="text-[10px] text-purple-400 font-semibold uppercase tracking-wider mt-1">
            Scanned during event session
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-900/30 backdrop-blur-md hover:bg-slate-900/50 transition-all duration-300 p-5 rounded-2xl border border-slate-800 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:scale-125 transition-all"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Unique Orgs</span>
            <p className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20"><BarChart3 size={18} /></p>
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight">
            {Object.keys(companyCounts).length}
          </div>
          <div className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider mt-1">
            Partner representation
          </div>
        </div>
      </div>

      {/* Visual Charts Grid Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Event Distribution - Elegant Custom Bar Chart */}
        <div className="lg:col-span-2 bg-slate-900/30 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-white">Event Attendance Breakdown</h3>
              <p className="text-[11px] text-slate-400">Comparing active check-in counts between active panels.</p>
            </div>
            <BarChart3 size={16} className="text-slate-450" />
          </div>

          <div className="space-y-5 flex-1 flex flex-col justify-center">
            {eventCountEntries.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">Create events to map checking metrics.</div>
            ) : (
              eventCountEntries.map(([name, val], index) => {
                const percent = (val / maxAttendanceCount) * 100;
                return (
                  <div key={name} className="space-y-1.5 w-full text-left">
                    <div className="flex justify-between items-center text-xs text-slate-300 font-medium">
                      <span className="truncate max-w-[200px] md:max-w-md">{name}</span>
                      <span className="font-mono text-indigo-400 font-bold">{val} checked</span>
                    </div>
                    <div className="h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80 flex items-center">
                      <div
                        className="h-full rounded-full transition-all duration-750"
                        style={{
                          width: `${percent}%`,
                          background: index % 3 === 0 
                            ? "linear-gradient(90deg, #6C63FF, #A855F7)" 
                            : index % 3 === 1 
                            ? "linear-gradient(90deg, #22D3EE, #6C63FF)" 
                            : "linear-gradient(90deg, #A855F7, #22D3EE)"
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Company Node Share - Representation Dashboard Area */}
        <div className="bg-slate-900/30 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-2">Partner Organizations</h3>
            <p className="text-[11px] text-slate-400 mb-5">Concentration of registrations by corporate banner.</p>
          </div>

          <div className="space-y-4 flex-1 flex flex-col justify-center">
            {topCompanies.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">Scan QR passes to capture corporate coordinates.</div>
            ) : (
              topCompanies.map(([name, count]) => {
                const percent = (count / totalAttendees) * 100;
                return (
                  <div key={name} className="space-y-1 text-left">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-bold truncate max-w-[120px]">{name}</span>
                      <span className="text-slate-400 text-[11px] font-semibold">
                        {count} pass{count > 1 ? "es" : ""} ({Math.round(percent)}%)
                      </span>
                    </div>
                    {/* Gauge bar */}
                    <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 rounded-full"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          <div className="mt-5 border-t border-slate-800/80 pt-4 text-center">
            <span className="text-[10px] text-slate-500 tracking-wider font-semibold uppercase">
              Total Networking Verticals: {Object.keys(companyCounts).length} Companies
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Logs Filtering list */}
      <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="text-left">
            <h3 className="text-sm font-bold text-white">Live Attendee Roster</h3>
            <p className="text-[11px] text-slate-400">Double-check coordinates and adjust mapping structures.</p>
          </div>

          {/* Controls Box */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-48">
              <input
                type="text"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg text-slate-300 placeholder-slate-500 text-xs py-2 px-3 pl-8 focus:outline-none focus:border-indigo-500"
                placeholder="Search..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
              />
              <Search size={14} className="absolute left-2.5 top-2.5 text-slate-500" />
            </div>

            {/* Event Filter Selector */}
            <div className="relative w-full sm:w-52">
              <select
                className="w-full bg-slate-950 border border-slate-800 rounded-lg text-slate-300 text-xs py-2 px-3 pl-8 focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
                value={filterEvent}
                onChange={(e) => setFilterEvent(e.target.value)}
              >
                <option value="all">All Registered Events</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.eventName}>
                    {ev.eventName}
                  </option>
                ))}
              </select>
              <Filter size={14} className="absolute left-2.5 top-2.5 text-slate-500" />
            </div>
          </div>
        </div>

        {/* Table representation */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Attendee / Contact</th>
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4">Mapped Event</th>
                <th className="py-3 px-4 text-right">Checked In</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No attending matches found. Adjust criteria or scan a new passenger card.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-900/35 transition-colors group">
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="font-bold text-white group-hover:text-indigo-400 transition-colors">
                          {rec.attendeeName}
                        </div>
                        <div className="text-[10px] text-slate-500 font-semibold">{rec.attendeeEmail}</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] bg-slate-950 border border-slate-800/80 text-cyan-300 font-bold">
                        {rec.company}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-semibold">{rec.designation}</td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => onViewEvent && onViewEvent(rec.event)}
                        className="text-left font-bold text-slate-300 hover:text-white hover:underline transition max-w-[150px] truncate block cursor-pointer"
                        title={rec.event}
                      >
                        {rec.event}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-400 text-[10px]">
                      {new Date(rec.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
