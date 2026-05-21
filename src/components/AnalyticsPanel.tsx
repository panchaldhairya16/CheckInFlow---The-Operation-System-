import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Brain, Code, Send, Loader2, RefreshCw, Layers, Compass, HelpCircle } from "lucide-react";
import { AIInsight } from "../types";

export default function AnalyticsPanel() {
  const [insights, setInsights] = useState<AIInsight | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'presently'; text: string }>>([
    { sender: 'presently', text: "Hello! I am CheckInFlow's AI Event Analytics Assistant. Ask me anything about attendee distribution, active hosts, check-in timelines, or cohort groupings!" }
  ]);
  const [submittingChat, setSubmittingChat] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Load static Insights on mount
  useEffect(() => {
    fetchInsights();
  }, []);

  useEffect(() => {
    // Keep chat pinned to bottom
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, submittingChat]);

  const fetchInsights = async () => {
    setLoadingInsights(true);
    try {
      const res = await fetch("/api/ai/insights");
      if (res.ok) {
        const data = await res.json();
        setInsights(data);
      }
    } catch (err) {
      console.error("Failed to load registration AI insights.", err);
    } finally {
      setLoadingInsights(false);
    }
  };

  const handleSendPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || submittingChat) return;

    const userPrompt = chatInput.trim();
    setChatMessages((prev) => [...prev, { sender: 'user', text: userPrompt }]);
    setChatInput("");
    setSubmittingChat(true);

    try {
      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userPrompt })
      });

      if (!res.ok) {
        throw new Error("Analytics agent was overwhelmed. Please retry.");
      }

      const parsed = await res.json();
      setChatMessages((prev) => [...prev, { sender: 'presently', text: parsed.response }]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        { sender: 'presently', text: `Sorry, I encountered an issue: ${err.message || "Failed to parse stream data."}` }
      ]);
    } finally {
      setSubmittingChat(false);
    }
  };

  const handleSuggestionClick = (promptText: string) => {
    setChatInput(promptText);
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6" id="ai-command-deck">
      {/* Left 7 Columns - Smart Cohort Clustering */}
      <div className="lg:col-span-7 space-y-6 flex flex-col text-left">
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-2xl flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-5 border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                <Brain size={22} className="animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>AI Cohort Insights</span>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded-full border border-indigo-500/30">
                    MOCK/GEMINI MODEL
                  </span>
                </h3>
                <p className="text-xs text-slate-400">Smart event matchmaking & matchmaking matrix groupings.</p>
              </div>
            </div>

            <button
              onClick={fetchInsights}
              disabled={loadingInsights}
              className="p-2 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg border border-slate-800 transition cursor-pointer"
              title="Refresh AI Clusters"
            >
              <RefreshCw size={14} className={loadingInsights ? "animate-spin" : ""} />
            </button>
          </div>

          {loadingInsights ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16">
              <Loader2 size={36} className="text-indigo-400 animate-spin mb-3" />
              <p className="text-xs text-slate-400 font-medium font-mono text-center max-w-xs animate-pulse">
                Consulting Gemini 3.5... Synthesizing cross-over interest graphs...
              </p>
            </div>
          ) : insights ? (
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              {/* Executive summary block */}
              <div className="bg-indigo-950/10 border border-indigo-900/40 rounded-xl p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl"></div>
                <h4 className="text-xs font-bold text-indigo-400 tracking-wider uppercase mb-1.5 flex items-center gap-1.5">
                  <Compass size={12} />
                  <span>Executive Cohort Summary</span>
                </h4>
                <p className="text-xs text-slate-350 leading-relaxed font-medium">
                  {insights.summary}
                </p>
              </div>

              {/* Groupings / Category groupings */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-cyan-400 tracking-wider uppercase flex items-center gap-1.5">
                  <Layers size={12} />
                  <span>Smart Network Clustering</span>
                </h4>

                {insights.groupings && insights.groupings.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {insights.groupings.map((g, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 hover:border-slate-700/80 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-white mb-2">
                            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
                            <span className="text-indigo-300 font-mono tracking-wide">{g.categoryName}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-normal mb-3">
                            {g.reasoning}
                          </p>
                        </div>

                        {/* Members tag array */}
                        <div className="flex flex-wrap gap-1 border-t border-slate-800/50 pt-2.5 mt-auto">
                          {g.members.map((m, mIdx) => (
                            <span
                              key={mIdx}
                              className="bg-slate-900 text-slate-300 text-[10px] font-bold py-0.5 px-2 rounded-md border border-slate-800"
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 py-6 text-center">No cohorts synthesized yet. Scan more elements to construct maps.</div>
                )}
              </div>

              {/* Matchmaking Roundtable cues */}
              <div className="space-y-3 pt-3 border-t border-slate-800/60 mt-auto">
                <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
                  <Code size={12} />
                  <span>Networking Session Prompts</span>
                </h4>
                <ul className="space-y-2 text-xs">
                  {insights.suggestions && insights.suggestions.map((s, idx) => (
                    <li key={idx} className="flex gap-2 text-slate-300 leading-relaxed font-semibold">
                      <span className="text-indigo-500 font-bold shrink-0">{idx + 1}.</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-16">
              <Compass size={40} className="text-slate-700 mb-3 animate-pulse" />
              <p className="text-xs text-slate-500 font-medium text-center">
                Click refresh to synthesize clustering relationships.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right 5 Columns - Live NLP Assistant Conversation Deck */}
      <div className="lg:col-span-5 flex flex-col text-left">
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl flex-1 flex flex-col h-[520px] overflow-hidden">
          {/* Chat Title header */}
          <div className="bg-slate-950/60 border-b border-slate-800/80 px-5 py-4 flex items-center gap-2.5">
            <Sparkles size={18} className="text-cyan-400 shrink-0" />
            <div>
              <h3 className="text-xs font-bold text-white tracking-wide uppercase">CheckInFlow NLP Assistant</h3>
              <p className="text-[10px] text-slate-500">Query directory metrics in real-time.</p>
            </div>
          </div>

          {/* Interactive Message scrollable */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col max-w-[85%] ${
                  msg.sender === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                } animate-fade-in`}
              >
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                  {msg.sender === "user" ? "Organizer" : "Gemini Analyst"}
                </span>
                <div
                  className={`rounded-xl p-3 text-xs leading-relaxed border ${
                    msg.sender === 'user'
                      ? "bg-indigo-650 border-indigo-700 text-white font-semibold"
                      : "bg-slate-950/95 border-slate-800 text-slate-200"
                  }`}
                  style={{ whiteSpace: "pre-line" }}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {submittingChat && (
              <div className="flex flex-col items-start max-w-[80%] animate-pulse mr-auto">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                  Analyst Core
                </span>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-400 flex items-center gap-2">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></span>
                  Analyzing record indices...
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Prompt Suggestions Drawer */}
          <div className="px-4 py-2 border-t border-slate-800/40 bg-slate-950/20">
            <div className="flex items-center gap-1.5 text-[10px] text-indigo-400 font-bold uppercase tracking-wide mb-1.5">
              <HelpCircle size={10} />
              <span>Suggested Queries</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 select-none scrollbar-none">
              <button
                onClick={() => handleSuggestionClick("Who is checked in?")}
                className="shrink-0 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white text-[10px] py-1 px-2.5 rounded-lg transition font-medium cursor-pointer"
              >
                Roster List
              </button>
              <button
                onClick={() => handleSuggestionClick("List representing organizations")}
                className="shrink-0 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white text-[10px] py-1 px-2.5 rounded-lg transition font-medium cursor-pointer"
              >
                Corporate Counts
              </button>
              <button
                onClick={() => handleSuggestionClick("List scheduled hackathons/events")}
                className="shrink-0 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white text-[10px] py-1 px-2.5 rounded-lg transition font-medium cursor-pointer"
              >
                Active Schedule
              </button>
            </div>
          </div>

          {/* Form Action input */}
          <form onSubmit={handleSendPrompt} className="bg-slate-950 border-t border-slate-800 p-3 flex gap-2">
            <input
              type="text"
              className="flex-1 bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-indigo-500"
              placeholder="Ask presently AI (e.g. who is registered?)"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={submittingChat}
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || submittingChat}
              className={`p-2 rounded-lg transition flex items-center justify-center cursor-pointer ${
                !chatInput.trim() || submittingChat
                  ? "bg-slate-900 border border-slate-850 text-slate-600"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
              }`}
              id="send-ai-prompt"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
