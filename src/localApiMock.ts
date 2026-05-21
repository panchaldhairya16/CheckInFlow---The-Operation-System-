// Client-side API Mock and Transparent Fallback System
// This ensures that the CheckInFlow app is 100% functional even when deployed to static hosts like Vercel or when offline.

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Event {
  id: string;
  eventName: string;
  date: string;
  venue: string;
  description: string;
  qrType: string;
  organizer: string;
}

interface Attendance {
  id: string;
  attendeeName: string;
  attendeeEmail: string;
  company: string;
  designation: string;
  event: string;
  scannedAt: string;
  attendanceStatus: 'checked-in' | 'absent' | 'pending';
}

interface LocalDB {
  users: User[];
  events: Event[];
  attendance: Attendance[];
}

const STORAGE_KEY = "checkinflow_local_db";

const DEFAULT_DB: LocalDB = {
  users: [
    { id: "u1", name: "Dhairya Panchal", email: "panchaldhairya2005@gmail.com", role: "Admin" },
    { id: "u2", name: "Alice Volunteer", email: "alice@presently.io", role: "Volunteer" }
  ],
  events: [
    {
      id: "ev-1",
      eventName: "Generative AI Hackathon SF",
      date: "2026-05-24",
      venue: "AI Hub SF, Mission District",
      description: "An intensive building session on multi-agent collaboration with Gemini models.",
      qrType: "Standard-JSON",
      organizer: "panchaldhairya2005@gmail.com"
    },
    {
      id: "ev-2",
      eventName: "Vercel Ship Conference 2026",
      date: "2026-05-22",
      venue: "Fort Mason, San Francisco",
      description: "Discover next-generation serverless stacks, edge deployments, and React developments.",
      qrType: "Standard-JSON",
      organizer: "panchaldhairya2005@gmail.com"
    },
    {
      id: "ev-3",
      eventName: "React Core Silicon Valley Meetup",
      date: "2026-06-15",
      venue: "Google HQ, Mountain View",
      description: "A deep dive into React 19 compiler architectures & server runtime strategies.",
      qrType: "Standard-JSON",
      organizer: "panchaldhairya2005@gmail.com"
    }
  ],
  attendance: [
    {
      id: "att-1",
      attendeeName: "Alex Rivera",
      attendeeEmail: "alex@vercel.com",
      company: "Vercel",
      designation: "Staff Developer Advocate",
      event: "Generative AI Hackathon SF",
      scannedAt: "2026-05-21T08:15:00.000Z",
      attendanceStatus: "checked-in"
    },
    {
      id: "att-2",
      attendeeName: "Sarah Chen",
      attendeeEmail: "schen@google.com",
      company: "Google",
      designation: "Developer Relations Manager",
      event: "Generative AI Hackathon SF",
      scannedAt: "2026-05-21T08:42:00.000Z",
      attendanceStatus: "checked-in"
    }
  ]
};

function getLocalDB(): LocalDB {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DB));
    return DEFAULT_DB;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DB));
    return DEFAULT_DB;
  }
}

function saveLocalDB(db: LocalDB) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

// Utility to create synthetic response objects
function createJSONResponse(data: any, status = 200, statusText = "OK") {
  const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
  return new Response(blob, {
    status,
    statusText,
    headers: { "Content-Type": "application/json" }
  });
}

async function handleLocalMockRequest(urlStr: string, init?: RequestInit): Promise<Response> {
  const db = getLocalDB();
  const url = new URL(urlStr, window.location.origin);
  const path = url.pathname;
  const method = (init?.method || "GET").toUpperCase();

  // Try parsing request body if applicable
  let body: any = {};
  if (init?.body && typeof init.body === "string") {
    try {
      body = JSON.parse(init.body);
    } catch (_) {}
  }

  // 1. Auth Login: /api/auth/login
  if (path === "/api/auth/login" && method === "POST") {
    const email = (body.email || "").trim();
    if (!email) {
      return createJSONResponse({ message: "Email is required" }, 400);
    }

    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      return createJSONResponse({ success: true, user });
    } else {
      const newUser: User = {
        id: "u_" + Date.now(),
        name: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
        email: email.toLowerCase(),
        role: "Organizer"
      };
      db.users.push(newUser);
      saveLocalDB(db);
      return createJSONResponse({ success: true, user: newUser });
    }
  }

  // 2. Auth Register: /api/auth/register
  if (path === "/api/auth/register" && method === "POST") {
    const email = (body.email || "").trim().toLowerCase();
    const name = (body.name || "").trim();
    const role = body.role || "Organizer";

    if (!email || !name) {
      return createJSONResponse({ message: "Name and email are required" }, 400);
    }

    const existingIndex = db.users.findIndex(u => u.email.toLowerCase() === email);
    const newUser: User = {
      id: "u_" + Date.now(),
      name,
      email,
      role
    };

    if (existingIndex > -1) {
      db.users[existingIndex] = newUser;
    } else {
      db.users.push(newUser);
    }

    saveLocalDB(db);
    return createJSONResponse({ success: true, user: newUser });
  }

  // 3. Events List: /api/events
  if (path === "/api/events") {
    if (method === "GET") {
      return createJSONResponse(db.events);
    }
    if (method === "POST") {
      const { eventName, date, venue, description, qrType, organizer } = body;
      if (!eventName || !date) {
        return createJSONResponse({ message: "Event name and date are required" }, 400);
      }

      const newEvent: Event = {
        id: "ev-" + Date.now(),
        eventName: eventName.trim(),
        date,
        venue: (venue || "TBD / Virtual").trim(),
        description: (description || "Community event managed on CheckInFlow").trim(),
        qrType: qrType || "Standard-JSON",
        organizer: organizer || "panchaldhairya2005@gmail.com"
      };

      db.events.push(newEvent);
      saveLocalDB(db);
      return createJSONResponse(newEvent);
    }
  }

  // 4. Delete Event: /api/events/:id
  if (path.startsWith("/api/events/") && method === "DELETE") {
    const id = path.substring("/api/events/".length);
    const index = db.events.findIndex(e => e.id === id);
    if (index > -1) {
      db.events.splice(index, 1);
      saveLocalDB(db);
    }
    return createJSONResponse({ success: true });
  }

  // 5. Attendance Retrieval: /api/attendance
  if (path === "/api/attendance") {
    if (method === "GET") {
      return createJSONResponse(db.attendance);
    }
    if (method === "DELETE") {
      db.attendance = [];
      saveLocalDB(db);
      return createJSONResponse({ success: true, message: "Registry database cleared successfully." });
    }
  }

  // 6. Record Scan Check-in: /api/attendance/scan
  if (path === "/api/attendance/scan" && method === "POST") {
    const { qrData, activeEvent } = body;
    if (!qrData) {
      return createJSONResponse({ message: "No QR Data received." }, 400);
    }

    let parsed: any;
    try {
      if (qrData.trim().startsWith("{")) {
        parsed = JSON.parse(qrData);
      } else {
        const parts = qrData.split(",");
        if (parts.length >= 2) {
          parsed = {
            name: parts[0]?.trim(),
            email: parts[1]?.trim(),
            company: parts[2]?.trim() || "Independent",
            designation: parts[3]?.trim() || "Developer",
            event: activeEvent || "Standard Event"
          };
        } else {
          parsed = {
            name: qrData.trim(),
            email: qrData.toLowerCase().replace(/\s+/g, "") + "@example.com",
            company: "Decoded Guest",
            designation: "Attendee",
            event: activeEvent || "Standard Event"
          };
        }
      }
    } catch (_) {
      parsed = {
        name: "Unknown Attendee",
        email: "unknown-" + Date.now() + "@example.com",
        company: "Parsing Failed",
        designation: "Attendee",
        event: activeEvent || "Standard Event"
      };
    }

    const { name, email, company, designation, event } = parsed;
    if (!name || !email) {
      return createJSONResponse({ message: "Decoded QR does not contain name and email." }, 400);
    }

    const selectedEvent = activeEvent || event || "Standard Event";
    const duplicate = db.attendance.some(
      record =>
        record.attendeeEmail.toLowerCase() === email.toLowerCase() &&
        record.event.toLowerCase() === selectedEvent.toLowerCase()
    );

    if (duplicate) {
      return createJSONResponse({ message: "Attendee has already checked in for this event!" }, 409);
    }

    const newLog: Attendance = {
      id: "att-" + Date.now(),
      attendeeName: name,
      attendeeEmail: email.toLowerCase(),
      company: company || "Freelancer",
      designation: designation || "Professional",
      event: selectedEvent,
      scannedAt: new Date().toISOString(),
      attendanceStatus: "checked-in"
    };

    db.attendance.unshift(newLog);
    saveLocalDB(db);
    return createJSONResponse({ success: true, record: newLog });
  }

  // 7. Manual Entry Check-in: /api/attendance/manual
  if (path === "/api/attendance/manual" && method === "POST") {
    const { name, email, company, designation, event } = body;
    if (!name || !email || !event) {
      return createJSONResponse({ message: "Name, email, and target event are required fields." }, 400);
    }

    const duplicate = db.attendance.some(
      record =>
        record.attendeeEmail.toLowerCase() === email.toLowerCase() &&
        record.event.toLowerCase() === event.toLowerCase()
    );

    if (duplicate) {
      return createJSONResponse({ message: "Attendee is already registered for this event." }, 409);
    }

    const newLog: Attendance = {
      id: "att-" + Date.now(),
      attendeeName: name,
      attendeeEmail: email.toLowerCase(),
      company: company || "Independent",
      designation: designation || "Attendee",
      event: event,
      scannedAt: new Date().toISOString(),
      attendanceStatus: "checked-in"
    };

    db.attendance.unshift(newLog);
    saveLocalDB(db);
    return createJSONResponse({ success: true, record: newLog });
  }

  // 8. Edit Attendance Item: /api/attendance/:id (PUT/DELETE)
  if (path.startsWith("/api/attendance/")) {
    const id = path.substring("/api/attendance/".length);
    const index = db.attendance.findIndex(a => a.id === id);

    if (method === "PUT") {
      if (index === -1) {
        return createJSONResponse({ message: "Attendance record not found." }, 404);
      }

      db.attendance[index] = {
        ...db.attendance[index],
        ...(body.attendeeName && { attendeeName: body.attendeeName }),
        ...(body.attendeeEmail && { attendeeEmail: body.attendeeEmail.toLowerCase() }),
        ...(body.company !== undefined && { company: body.company }),
        ...(body.designation !== undefined && { designation: body.designation }),
        ...(body.attendanceStatus !== undefined && { attendanceStatus: body.attendanceStatus })
      };

      saveLocalDB(db);
      return createJSONResponse({ success: true, record: db.attendance[index] });
    }

    if (method === "DELETE") {
      if (index === -1) {
        return createJSONResponse({ message: "Record not found" }, 404);
      }

      db.attendance.splice(index, 1);
      saveLocalDB(db);
      return createJSONResponse({ success: true });
    }
  }

  // 9. AI Insights: /api/ai/insights
  if (path === "/api/ai/insights" && method === "GET") {
    if (db.attendance.length === 0) {
      return createJSONResponse({
        summary: "Gather more check-ins to unlock smart networking suggestions and cluster insights.",
        groupings: [],
        suggestions: ["Start scanning QR codes to assemble cross-functional networking cohorts."]
      });
    }

    // Dynamic analysis based on current attendees
    const companyCounts: Record<string, string[]> = {};
    const roles: string[] = [];
    db.attendance.forEach(a => {
      const co = a.company || "Independent";
      if (!companyCounts[co]) companyCounts[co] = [];
      companyCounts[co].push(a.attendeeName);
      roles.push(a.designation || "Professional");
    });

    const activeCount = db.attendance.length;
    const sortedComp = Object.entries(companyCounts).sort((x, y) => y[1].length - x[1].length);
    const mainCo = sortedComp[0] ? sortedComp[0][0] : "Multiple organizations";

    const groupings = sortedComp.slice(0, 3).map(([coName, members]) => ({
      categoryName: `${coName} Alliance`,
      members: members.slice(0, 3),
      reasoning: `Highly concentrated hub of professionals representing ${coName}, focusing on shared platform expansion.`
    }));

    if (groupings.length < 2 && db.attendance.length > 1) {
      groupings.push({
        categoryName: "General Network Summit",
        members: db.attendance.slice(0, 3).map(a => a.attendeeName),
        reasoning: "A cross-disciplinary cohort looking at technical growth, system frameworks, and business logic."
      });
    }

    const offlineInsights = {
      summary: `Analyzed registration logs: we have ${activeCount} active check-ins representing top groups from ${mainCo}. Tech professionals comprise the core cohort.`,
      groupings,
      suggestions: [
        "Host an 'Open Space' discussion matching attendees across companies to co-create solution frameworks.",
        "Facilitate a lightning round for professionals to pitch their skills and find immediate collaborators.",
        "Initiate focused chat circles centered around deployment models and scalable user experience stacks."
      ]
    };

    return createJSONResponse(offlineInsights);
  }

  // 10. AI Assistant conversation: /api/ai/assistant
  if (path === "/api/ai/assistant" && method === "POST") {
    const q = (body.question || "").toLowerCase();
    
    let reply = "I am parsing your session data context. Ask me about attendee lists, active events, top registering companies, or scan status.";
    if (q.includes("checked") || q.includes("attendee") || q.includes("who")) {
      const list = db.attendance.map(a => `${a.attendeeName} (${a.designation} @ ${a.company})`).join(", ");
      reply = `According to check-in reports, we have **${db.attendance.length} checked-in participants**: ${list || "no active scans recorded yet"}.`;
    } else if (q.includes("company") || q.includes("organization") || q.includes("corporate")) {
      const companies = db.attendance.map(a => a.company);
      const count: Record<string, number> = {};
      companies.forEach(c => count[c] = (count[c] || 0) + 1);
      const sorted = Object.entries(count).sort((x, y) => y[1] - x[1]);
      const top = sorted.map(([name, num]) => `**${name}** (${num} scan${num > 1 ? 's' : ''})`).join(", ");
      reply = `We have active attendee profiles representing: ${top || "no companies recorded yet"}.`;
    } else if (q.includes("event") || q.includes("hackathon") || q.includes("venue")) {
      const events = db.events.map(e => `• **${e.eventName}** at *${e.venue}* (${e.date})`);
      reply = `CheckInFlow currently has **${db.events.length} schedule slots**:\n\n${events.join("\n")}`;
    } else if (q.includes("hi") || q.includes("hello") || q.includes("greet")) {
      reply = `Hello! I am CheckInFlow's Local AI Assistant. I can help guide directory analyses, count check-ins, list representing organizations, or inspect active schedules!`;
    }

    return createJSONResponse({ response: reply });
  }

  return createJSONResponse({ message: "Mock Route Not Found" }, 404);
}

// Override window.fetch safely (using Object.defineProperty to handle read-only/getter-only environments)
const originalFetch = window.fetch.bind(window);

const customFetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;

  if (url.includes("/api/")) {
    try {
      const response = await originalFetch(input, init);
      
      // Let's analyze if this response is a valid API response or static fallback (HTML)
      const contentType = response.headers.get("content-type");
      if (response.status >= 400 || (contentType && contentType.includes("text/html"))) {
        return await handleLocalMockRequest(url, init);
      }
      return response;
    } catch (e) {
      // Offline fallback
      return await handleLocalMockRequest(url, init);
    }
  }

  return originalFetch(input, init);
};

try {
  Object.defineProperty(window, "fetch", {
    value: customFetch,
    configurable: true,
    writable: true,
    enumerable: true
  });
} catch (e) {
  // Fallback to direct assignment
  try {
    (window as any).fetch = customFetch;
  } catch (err) {
    console.error("Could not override search/fetch system:", err);
  }
}
