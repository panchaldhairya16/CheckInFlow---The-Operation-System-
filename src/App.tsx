import React, { useState, useEffect } from "react";
import {
  QrCode,
  Compass,
  Sparkles,
  LogIn,
  LogOut,
  Calendar,
  Users,
  Brain,
  History,
  Activity,
  UserPlus,
  Moon,
  Sun,
  Database,
  ArrowRight,
  Globe,
  Lock,
  Mail,
  Smartphone,
  Award
} from "lucide-react";
import { User, Event, Attendance } from "./types";
import Scanner from "./components/Scanner";
import ImportQR from "./components/ImportQR";
import ManualEntry from "./components/ManualEntry";
import Dashboard from "./components/Dashboard";
import AnalyticsPanel from "./components/AnalyticsPanel";
import EventManger from "./components/EventManger";
import HistoryTable from "./components/HistoryTable";

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("presently_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (localStorage.getItem("checkinflow_theme") as "dark" | "light") || "dark";
  });

  useEffect(() => {
    localStorage.setItem("checkinflow_theme", theme);
  }, [theme]);

  const [activeTab, setActiveTab] = useState<string>("landing");
  const [events, setEvents] = useState<Event[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [activeEvent, setActiveEvent] = useState<string>("");

  // Scan success feedback
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Authentication inputs
  const [authEmail, setAuthEmail] = useState("");
  const [authName, setAuthName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState("");

  // Sub-tab selection inside Scanner view: 'camera' | 'upload'
  const [scannerSubTab, setScannerSubTab] = useState<"camera" | "upload">("camera");

  // Fetch Events and Attendance from core server
  useEffect(() => {
    fetchEvents();
    fetchAttendance();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/events");
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
        if (data.length > 0 && !activeEvent) {
          setActiveEvent(data[0].eventName);
        }
      }
    } catch (err) {
      console.error("Failed to load events:", err);
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await fetch("/api/attendance");
      if (res.ok) {
        const data = await res.json();
        setAttendance(data);
      }
    } catch (err) {
      console.error("Failed to load attendance log:", err);
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Auth actions
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (!authEmail.trim()) {
      setAuthError("Email address is required.");
      return;
    }

    try {
      if (isRegistering) {
        if (!authName.trim()) {
          setAuthError("Full Name is required for registration.");
          return;
        }
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: authName.trim(),
            email: authEmail.trim(),
            role: "Organizer"
          })
        });
        if (res.ok) {
          const data = await res.json();
          saveUserSession(data.user);
        } else {
          const err = await res.json();
          setAuthError(err.message || "Registration failed.");
        }
      } else {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: authEmail.trim() })
        });
        if (res.ok) {
          const data = await res.json();
          saveUserSession(data.user);
        } else {
          setAuthError("Could not retrieve user session profile.");
        }
      }
    } catch (err) {
      setAuthError("Network connection error.");
    }
  };

  const saveUserSession = (userObj: User) => {
    setUser(userObj);
    localStorage.setItem("presently_user", JSON.stringify(userObj));
    setActiveTab("dashboard");
    showToast(`Welcome back, ${userObj.name}! Space active.`, "success");
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("presently_user");
    setActiveTab("landing");
    showToast("Session cleared successfully.", "success");
  };

  const triggerBypassSandbox = () => {
    const sandboxUser: User = {
      id: "sandbox-u1",
      name: "Dhairya Panchal",
      email: "panchaldhairya2005@gmail.com",
      role: "Admin"
    };
    saveUserSession(sandboxUser);
  };

  return (
    <div className={`min-h-screen ${theme === "dark" ? "theme-dark bg-[#070b13]" : "theme-light bg-[#fafbfe]"} text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-white relative overflow-hidden`}>
      
      {/* Dynamic Background Glowing Spheres */}
      <div className="absolute top-[-10%] left-[-15%] w-[50vw] h-[50vw] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-15%] w-[45vw] h-[45vw] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Floating toast notification panel */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl border shadow-xl flex items-center gap-3 animate-fade-in ${
            toast.type === "success"
              ? "bg-slate-900/95 border-emerald-500/30 text-emerald-400"
              : "bg-slate-900/95 border-rose-500/30 text-rose-450"
          }`}
        >
          <span className="w-2 h-2 rounded-full animate-ping bg-current"></span>
          <p className="text-xs font-bold leading-tight select-none">{toast.message}</p>
        </div>
      )}

      {/* Navigation Header */}
      <header className={`sticky top-0 z-40 ${theme === "dark" ? "bg-[#070b13]/80" : "bg-[#fafbfe]/80"} backdrop-blur-md border-b border-slate-900/80 transition-all`}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          
          {/* Logo Branding */}
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => setActiveTab(user ? "dashboard" : "landing")}
          >
            <div className="p-2 bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 rounded-xl text-white shadow-[0_0_15px_rgba(99,102,241,0.25)] flex items-center justify-center">
              <QrCode size={18} className="animate-pulse" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-tight font-display bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
                CheckInFlow
              </h1>
              <p className="text-[10px] text-slate-500 tracking-wider uppercase font-semibold leading-none">
                Smart Operations
              </p>
            </div>
          </div>

          {/* Authed Workspace Navigation Tabs */}
          {user && (
            <nav className="hidden lg:flex items-center gap-1 bg-slate-950/40 p-1 border border-slate-900 rounded-xl">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "dashboard"
                    ? "bg-indigo-600/10 border border-indigo-500/30 text-indigo-300"
                    : "text-slate-400 hover:text-white border border-transparent"
                }`}
              >
                <Activity size={13} />
                Dashboard
              </button>

              <button
                onClick={() => setActiveTab("scanner")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "scanner"
                    ? "bg-indigo-600/10 border border-indigo-500/30 text-indigo-300"
                    : "text-slate-400 hover:text-white border border-transparent"
                }`}
              >
                <QrCode size={13} />
                Terminal
              </button>

              <button
                onClick={() => setActiveTab("manual")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "manual"
                    ? "bg-indigo-600/10 border border-indigo-500/30 text-indigo-300"
                    : "text-slate-400 hover:text-white border border-transparent"
                }`}
              >
                <UserPlus size={13} />
                Ingestion
              </button>

              <button
                onClick={() => setActiveTab("events")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "events"
                    ? "bg-indigo-600/10 border border-indigo-500/30 text-indigo-300"
                    : "text-slate-400 hover:text-white border border-transparent"
                }`}
              >
                <Calendar size={13} />
                Scheduler
              </button>

              <button
                onClick={() => setActiveTab("analytics")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "analytics"
                    ? "bg-indigo-600/10 border border-indigo-500/30 text-indigo-300"
                    : "text-slate-400 hover:text-white border border-transparent"
                }`}
              >
                <Brain size={13} />
                AI Deck
              </button>

              <button
                onClick={() => setActiveTab("history")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "history"
                    ? "bg-indigo-600/10 border border-indigo-500/30 text-indigo-300"
                    : "text-slate-400 hover:text-white border border-transparent"
                }`}
              >
                <Database size={13} />
                Roster
              </button>
            </nav>
          )}

          {/* User Accounts Profile Panel actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggler Button */}
            <button
              onClick={() => setTheme(prev => prev === "dark" ? "light" : "dark")}
              className="p-2.5 bg-slate-900/60 hover:bg-slate-850 border border-slate-800 rounded-xl text-slate-400 hover:text-indigo-400 transition flex items-center justify-center cursor-pointer shadow-sm active:scale-95"
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
              id="theme-toggler-action"
            >
              {theme === "dark" ? (
                <Sun size={15} className="text-amber-400 animate-pulse" />
              ) : (
                <Moon size={15} className="text-indigo-500" />
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-3.5">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-white tracking-tight">{user.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono font-bold leading-none mt-0.5 uppercase tracking-wider">
                    {user.role} mode
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 bg-slate-950 hover:bg-slate-900 border border-slate-900 hover:border-slate-800 rounded-xl text-slate-400 hover:text-white transition flex items-center gap-2 text-xs font-bold cursor-pointer"
                  title="Disconnect Workspace"
                  id="disconnect-session-trigger"
                >
                  <LogOut size={14} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab("login")}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-[0_4px_12px_rgba(99,102,241,0.2)] hover:scale-[1.03] active:scale-[0.98] transition flex items-center gap-1.5 cursor-pointer"
                id="connect-account-feed"
              >
                <LogIn size={13} />
                <span>Launch Desk</span>
              </button>
            )}
          </div>
        </div>

        {/* Responsive Mobile Navigation Bar */}
        {user && (
          <div className="lg:hidden bg-slate-950/60 border-t border-slate-900 overflow-x-auto select-none scrollbar-none flex">
            <div className="flex items-center gap-1 p-2 w-full max-w-full">
              {[
                { key: "dashboard", label: "Registry", icon: <Activity size={12} /> },
                { key: "scanner", label: "Decoder", icon: <QrCode size={12} /> },
                { key: "manual", label: "Add", icon: <UserPlus size={12} /> },
                { key: "events", label: "Schedules", icon: <Calendar size={12} /> },
                { key: "analytics", label: "GenAI", icon: <Brain size={12} /> },
                { key: "history", label: "Roster", icon: <Database size={12} /> }
              ].map((navItem) => (
                <button
                  key={navItem.key}
                  onClick={() => setActiveTab(navItem.key)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] shrink-0 font-bold tracking-wide transition flex items-center gap-1 cursor-pointer ${
                    activeTab === navItem.key
                      ? "bg-indigo-600/10 border border-indigo-500/30 text-indigo-300"
                      : "text-slate-400 border border-transparent"
                  }`}
                >
                  {navItem.icon}
                  <span>{navItem.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Body Stage View wrapper */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8 flex flex-col justify-center items-center">
        
        {/* VIEW 1: LANDING PAGE */}
        {activeTab === "landing" && (
          <div className="w-full flex flex-col items-center py-6 text-center space-y-12 animate-fade-in" id="landing-page-deck">
            {/* Tagline / Headline text */}
            <div className="max-w-3xl space-y-4">
              <span className="px-3.5 py-1.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold tracking-widest uppercase rounded-full inline-flex items-center gap-2">
                <Sparkles size={13} className="animate-spin-slow text-indigo-400" />
                CheckInFlow Operations Console active
              </span>

              <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight font-display text-white">
                Smart Attendance & <br />
                <span className="bg-gradient-to-r from-indigo-400 via-indigo-500 to-cyan-400 bg-clip-text text-transparent">
                  Attendee Networking
                </span>
              </h2>
              
              <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed font-semibold">
                An AI-driven operational scanner tailored for community gatherings, technical hackathons, summits, and corporate workshops.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <button
                  onClick={() => setActiveTab(user ? "dashboard" : "login")}
                  className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_16px_rgba(99,102,241,0.3)] hover:scale-105"
                  id="getting-started-trigger"
                >
                  <span>Launch Workspace Desk</span>
                  <ArrowRight size={15} />
                </button>
                <button
                  onClick={triggerBypassSandbox}
                  className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 hover:bg-slate-850 text-indigo-300 hover:text-white font-bold text-sm rounded-xl border border-indigo-500/10 hover:border-indigo-500/30 transition flex items-center justify-center gap-2 cursor-pointer"
                  id="bypass-auth-test-button"
                >
                  <span>Sandbox Auth Bypass</span>
                </button>
              </div>
            </div>

            {/* Simulated Live Vector Visualizer Mockup */}
            <div className="w-full max-w-4xl bg-slate-950 rounded-2xl overflow-hidden border border-slate-900 shadow-[0_0_80px_rgba(99,102,241,0.06)] relative p-6 md:p-8">
              <div className="absolute top-1 border-b border-indigo-500/20 left-0 right-0 h-10 bg-slate-900/40 backdrop-blur-sm px-4 flex items-center justify-between text-[10px] text-slate-500 tracking-wider font-mono">
                <span>PROJECT_CONSOLE // PORT_3000</span>
                <span>STATE: READY_TO_INGEST</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 text-left">
                
                {/* Feature Card 1 */}
                <div className="p-5 rounded-xl border border-slate-900/80 bg-slate-900/10 space-y-3">
                  <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-lg w-fit border border-indigo-500/20">
                    <QrCode size={18} />
                  </div>
                  <h4 className="font-bold text-white text-sm">Optics Laser scanning</h4>
                  <p className="text-xs text-slate-450 leading-relaxed font-semibold">
                    Instantly resolve JSON ticket nodes, authenticate attendee coordinates, and guard against duplicate check-ins.
                  </p>
                </div>

                {/* Feature Card 2 */}
                <div className="p-5 rounded-xl border border-slate-900/80 bg-slate-900/10 space-y-3">
                  <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-lg w-fit border border-cyan-500/20">
                    <Brain size={18} />
                  </div>
                  <h4 className="font-bold text-white text-sm">AI-driven Synthesis</h4>
                  <p className="text-xs text-slate-450 leading-relaxed font-semibold">
                    Leverage Gemini 3.5 Flash server-side integration to dynamically assemble attendee clusters and networking rundowns.
                  </p>
                </div>

                {/* Feature Card 3 */}
                <div className="p-5 rounded-xl border border-slate-900/80 bg-slate-900/10 space-y-3">
                  <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-lg w-fit border border-purple-500/20">
                    <Database size={18} />
                  </div>
                  <h4 className="font-bold text-white text-sm">Dynamic Datasheets</h4>
                  <p className="text-xs text-slate-450 leading-relaxed font-semibold">
                    Maintain detailed timetables and check-in logs, and export rosters cleanly as printable schedules or CSV books.
                  </p>
                </div>
              </div>
            </div>

            {/* Social Proof Showcase */}
            <div className="pt-4 max-w-4xl w-full border-t border-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-6 text-[10px] text-slate-500 tracking-wider font-mono">
              <span className="flex items-center gap-2">
                <Globe size={11} className="text-cyan-400" />
                COMPATIBLE WITH MEETUPS, WORKSHOPS & CONFERENCES
              </span>
              <span className="flex items-center gap-2">
                <Lock size={11} className="text-indigo-400" />
                SECURE SERVER-SIDE SECURITY RULES FOR CHIPS
              </span>
            </div>
          </div>
        )}

        {/* VIEW 2: LOGIN / REGISTER DESK */}
        {activeTab === "login" && (
          <div className="w-full max-w-md bg-slate-950 p-6 rounded-2xl border border-slate-900 shadow-2xl relative overflow-hidden animate-fade-in" id="auth-screen-panel">
            <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl"></div>
            
            <div className="text-center mb-6">
              <div className="p-3 bg-indigo-650/10 text-indigo-400 border border-indigo-500/20 rounded-full w-fit mx-auto mb-3">
                <Award size={24} className="animate-pulse" />
              </div>
              <h3 className="text-xl font-extrabold text-white">CheckInFlow Workspace Desk</h3>
              <p className="text-xs text-slate-400 mt-1">Connect your workspace email profile or bypass using Sandbox Mode.</p>
            </div>

            {authError && (
              <div className="mb-4 bg-rose-950/40 border border-rose-900/60 rounded-xl p-3 text-xs text-rose-300 font-semibold text-left animate-fade-in">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4 text-left">
              {isRegistering && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <UserPlus size={11} />
                    <span>Your Full Name</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 text-white rounded-xl py-2.5 px-3.5 text-xs focus:outline-none transition"
                    placeholder="e.g. Dhairya Panchal"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Mail size={11} />
                  <span>Workspace Email Address</span>
                </label>
                <input
                  type="email"
                  required
                  className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 text-white rounded-xl py-2.5 px-3.5 text-xs focus:outline-none transition"
                  placeholder="name@company.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-[0_4px_12px_rgba(99,102,241,0.2)] transition cursor-pointer flex items-center justify-center gap-1.5"
                  id="auth-submit-trigger"
                >
                  <span>{isRegistering ? "Register Workspace Profile" : "Connect Credentials"}</span>
                </button>
              </div>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-900/80 flex flex-col items-center justify-between gap-3 text-center">
              <button
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-xs font-bold text-slate-450 hover:text-white hover:underline transition cursor-pointer"
              >
                {isRegistering ? "Existing account? Sign in indeed" : "Configure new registration account"}
              </button>

              <div className="w-full mt-3">
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-900"></div>
                  <span className="flex-shrink mx-3 text-[10px] text-slate-500 uppercase tracking-widest font-bold">or</span>
                  <div className="flex-grow border-t border-slate-900"></div>
                </div>

                <button
                  onClick={triggerBypassSandbox}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 text-indigo-400 hover:text-white font-bold text-xs rounded-xl border border-indigo-500/10 hover:border-indigo-500/20 transition cursor-pointer"
                >
                  Instantly Launch Workspace Sandbox
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AUTHED SCREEN CONTAINER */}
        {user && (
          <div className="w-full">
            
            {/* VIEW 3: MAIN WORKSPACE DASHBOARD */}
            {activeTab === "dashboard" && (
              <div className="animate-fade-in">
                <Dashboard
                  events={events}
                  attendance={attendance}
                  onViewEvent={(eName) => {
                    setActiveEvent(eName);
                    setActiveTab("scanner");
                    showToast(`Feed context locked onto: ${eName}`, "success");
                  }}
                />
              </div>
            )}

            {/* VIEW 4: QR SCANNER PAGE (Combined camera & file upload) */}
            {activeTab === "scanner" && (
              <div className="max-w-2xl mx-auto space-y-6 animate-fade-in text-center" id="optics-ingestion-stage">
                
                {/* Header Context panel */}
                <div>
                  <h2 className="text-xl font-black bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent flex justify-center items-center gap-2">
                    <span>Decryption Terminal</span>
                    <QrCode size={18} className="text-cyan-400 animate-pulse" />
                  </h2>
                  <p className="text-slate-400 text-xs mt-1">
                    Select scanning mechanism below to execute check-ins.
                  </p>
                </div>

                {/* Sub Tab Switch buttons */}
                <div className="flex bg-slate-950 p-1 border border-slate-900 rounded-xl max-w-sm mx-auto">
                  <button
                    onClick={() => setScannerSubTab("camera")}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      scannerSubTab === "camera"
                        ? "bg-indigo-600 text-white shadow-md"
                        : "text-slate-405 hover:text-white"
                    }`}
                  >
                    <Smartphone size={13} />
                    Live Camera Scanning
                  </button>
                  <button
                    onClick={() => setScannerSubTab("upload")}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      scannerSubTab === "upload"
                        ? "bg-indigo-600 text-white shadow-md"
                        : "text-slate-405 hover:text-white"
                    }`}
                  >
                    <Compass size={13} />
                    Import Pass File
                  </button>
                </div>

                 {/* Scanning stage display */}
                <div className="flex justify-center">
                  {scannerSubTab === "camera" ? (
                    <Scanner
                      activeEvent={activeEvent}
                      onScanSuccess={(record) => {
                        fetchAttendance();
                        showToast(`Check-in confirm: ${record.attendeeName}!`, "success");
                      }}
                      onScanDeleted={(id) => {
                        fetchAttendance();
                        showToast("Deleted scan history entry.", "success");
                      }}
                      onScanError={(err) => {
                        showToast(err || "Duplicate check-in node flagged.", "error");
                      }}
                    />
                  ) : (
                    <ImportQR
                      activeEvent={activeEvent}
                      onImportSuccess={(record) => {
                        fetchAttendance();
                        showToast(`Check-In authenticated: ${record.attendeeName}!`, "success");
                      }}
                      onImportDeleted={(id) => {
                        fetchAttendance();
                        showToast("Deleted imported pass entry.", "success");
                      }}
                      onImportError={(err) => {
                        showToast(err || "Problem scanning uploaded file.", "error");
                      }}
                    />
                  )}
                </div>
              </div>
            )}

            {/* VIEW 5: MANUAL ENTRY PAGE */}
            {activeTab === "manual" && (
              <div className="flex justify-center animate-fade-in">
                <ManualEntry
                  events={events}
                  activeEvent={activeEvent}
                  onEntrySuccess={() => {
                    fetchAttendance();
                    showToast("Attendee profile successfully loaded.", "success");
                  }}
                  onEntryDeleted={(id) => {
                    fetchAttendance();
                    showToast("Attendee manual check-in entry deleted.", "success");
                  }}
                  onEntryError={(err) => {
                    showToast(err || "Duplicate or corrupted registry record.", "error");
                  }}
                />
              </div>
            )}

            {/* VIEW 6: SCHEDULE EVENT MANAGER */}
            {activeTab === "events" && (
              <div className="animate-fade-in">
                <EventManger
                  events={events}
                  activeEvent={activeEvent}
                  onSelectActiveEvent={(eName) => {
                    setActiveEvent(eName);
                    showToast(`Default active event switched to: ${eName}`, "success");
                  }}
                  onEventCreated={(newEvent) => {
                    setEvents((prev) => [...prev, newEvent]);
                    showToast("New event initialized successfully.", "success");
                  }}
                  onEventDeleted={(id) => {
                    setEvents((prev) => prev.filter((e) => e.id !== id));
                    showToast("Event schedule block cleaned.", "success");
                  }}
                />
              </div>
            )}

            {/* VIEW 7: AI SECURITY INSIGHTS & NLG ASSISTANT */}
            {activeTab === "analytics" && (
              <div className="animate-fade-in">
                <AnalyticsPanel />
              </div>
            )}

            {/* VIEW 8: ATTENDANCE HISTORY DIRECTORY */}
            {activeTab === "history" && (
              <div className="animate-fade-in">
                <HistoryTable
                  attendance={attendance}
                  events={events}
                  onUpdateRecord={(updated) => {
                    setAttendance((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
                    showToast("Attendee profile edits committed.", "success");
                  }}
                  onDeleteRecord={(id) => {
                    setAttendance((prev) => prev.filter((a) => a.id !== id));
                    showToast("Attendance ledger index deleted.", "success");
                  }}
                  onClearAllRecords={() => {
                    setAttendance([]);
                    showToast("Attendance database registry fully cleared.", "success");
                  }}
                />
              </div>
            )}

          </div>
        )}

      </main>

      {/* Unified Footer */}
      <footer className="border-t border-slate-950 bg-slate-950/20 py-6 mt-12 select-none">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-xs font-medium">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></span>
            <span>CheckInFlow Operations System v1.5</span>
          </div>
          <div className="text-[10px] md:text-xs">
            Admin Profile: <span className="font-bold text-slate-400">Dhairya Panchal</span> (panchaldhairya2005@gmail.com)
          </div>
          <div className="text-[11px] font-mono tracking-wider">
            SECURE RECOGNITION LEDGER ACTIVE
          </div>
        </div>
      </footer>
    </div>
  );
}
