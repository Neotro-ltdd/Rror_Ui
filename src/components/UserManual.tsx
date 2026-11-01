import React, { useState } from 'react';
import { BookOpen, Bot, Check, Code2, Copy, Download, FileText, Layers, Lock, ShieldCheck, Terminal, Users } from 'lucide-react';

export const UserManual: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'overview' | 'operator' | 'pbac' | 'ai' | 'csharp' | 'jsts' | 'python' | 'rest' | 'security'>('overview');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fullManualMarkdown = `# Rorr System Error Intelligence & Diagnostics Hub - User Manual & Technical SRS Guide (v1.1.0)

## 1. System Architecture & High-Performance Pipeline
Rorr eliminates developer dependency on SSH/RDP access to production or staging servers by centralizing runtime exceptions, stack traces, and request payloads into an intuitive, role-isolated web interface.

### Technology Stack:
- **Backend**: ASP.NET Core (.NET 8/9 Web API) using Clean Architecture & MediatR / CQRS pattern.
- **Database Layer**: Entity Framework Core (PostgreSQL / SQL Server / SQLite) with Dapper read-only reporting optimizations.
- **Real-time Engine**: ASP.NET Core SignalR Telemetry Hub (\`/hubs/telemetry\`) for live WebSocket log streaming.
- **Frontend Stack**: React 18+ (Vite + TypeScript) + Tailwind CSS + Lucide Icons + TanStack Query + Axios Interceptors.
- **Security & Auth**: ASP.NET Core Identity with JWT Bearer authentication + Provider-based SMTP Email Dispatch.
- **AI Diagnostics**: Google Gemini 1.5/2.0 Integration (\`GeminiOrchestratorService\`) for interactive error root-cause explanation.

### Ingestion Flow:
[ Client App ] --(HTTP POST /api/v1/errors/ingest w/ X-Api-Key)--> [ Channel<ErrorLog> (10,000 Capacity Buffer) ] --> [ IngestionBackgroundWorker ] --> [ EF Core DB ] & [ SignalR TelemetryHub ]

---

## 2. Identity, Onboarding & User Administration
- **Supported Roles**:
  - \`Admin\`: Global platform visibility over all projects, logs, user management, and system metrics.
  - \`Engineer\` (Developer): Scoped access to explicitly assigned projects.
  - \`Viewer\`: Read-only incident inspection for assigned projects.

- **Onboarding Workflow**:
  1. Platform Admin invites/creates a user by specifying Username, Email, Full Name, and Role.
  2. System generates a cryptographically secure, temporary password-reset token / credential payload.
  3. SMTP Email Dispatcher automatically emails the onboarding credentials to the user's email address.
  4. The user logs in via JWT authentication endpoint (\`POST /api/v1/auth/login\`) to obtain a 24-hour Bearer token.

---

## 3. Project Ownership & Strict Access Isolation (PBAC)
- **Admin Project Lifecycle**:
  - Admins can create projects globally (\`POST /api/v1/projects\`), generating cryptographically hashed \`ApiKey\` credentials.
  - Admins can dynamically assign or revoke developer access using Project Member Mapping (\`ProjectMember\` table).
- **Self-Service Developer Lifecycle**:
  - Developers can register projects and issue API keys, becoming the primary project owner/member.
- **STRICT Security Constraint (PBAC Isolation)**:
  - Non-admin developers MUST ONLY query, search, view, or stream errors for projects explicitly assigned to them or owned by them.
  - Attempts to inspect project details or logs outside assigned projects return **HTTP 403 Forbidden**.
  - SignalR WebSocket telemetry subscriptions enforce PBAC project membership validation before broadcasting log frames.

---

## 4. Low-Overhead Log Ingestion Engine
- **Ingestion Endpoint**: \`POST /api/v1/errors/ingest\`
- **Authentication**: Validates header \`X-Api-Key\` matching a registered project's SHA-256 hashed key.
- **Performance Constraint**: Non-blocking submission! The controller writes records to \`System.Threading.Channels.Channel<ErrorLog>\` in-memory queue and immediately returns **HTTP 202 Accepted** within \u2264 50ms.
- **Background Persistence**: \`IngestionBackgroundWorker\` drains and batch-persists records to EF Core, broadcasting to authorized SignalR subscribers.

---

## 5. React Web Console & Diagnostic Inspector
- **Live Stream Explorer**:
  - Real-time log table with severity badges (\`Critical\`, \`Error\`, \`Warning\`, \`Information\`), search, and date filters.
- **Diagnostic Inspector Modal**:
  1. Error summary banner & caller metadata grid (Caller IP, Route, Initiating user, Source).
  2. Monospaced stack trace viewer with 1-click line-wrapped copy.
  3. Inner exception chain tab.
  4. Serialized payload context (formatted JSON tree viewer).
  5. **DevOps / Bug Note Generator**: Converts incident data into Markdown template for Jira / Azure DevOps / GitHub Issues.
- **Rorr AI Assistant (Gemini Powered)**:
  - Interactive bottom-right chatbot. Explain error cause, recommended code fixes, and step-by-step remediation.
  - Auto-resets session context upon drawer closure to prevent context pollution.

---

## 6. Multi-Language SDK & REST Ingestion Spec
- **.NET C#**: Non-blocking \`RorrClient\` wrapper.
- **JavaScript / TypeScript**: Axios / fetch helper with \`x-api-key\` header.
- **Python**: Requests non-blocking error handler.
- **cURL / REST**: Raw HTTP POST spec.
`;

  const handleDownloadMarkdown = () => {
    const blob = new Blob([fullManualMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Rorr_User_Manual_and_Integration_Guide.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Rorr Error Intelligence & Diagnostics Hub - User Manual</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
    
    @page {
      size: A4;
      margin: 18mm;
    }
    
    body {
      font-family: 'Inter', sans-serif;
      color: #0f172a;
      background: #ffffff;
      line-height: 1.5;
      font-size: 12px;
      margin: 0;
      padding: 0;
    }

    .header-banner {
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
      color: #ffffff;
      padding: 20px 24px;
      border-radius: 12px;
      margin-bottom: 20px;
      border: 1px solid #312e81;
    }

    .header-banner h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.5px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .badge {
      display: inline-block;
      background: rgba(99, 102, 241, 0.2);
      color: #818cf8;
      border: 1px solid rgba(99, 102, 241, 0.4);
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
    }

    .header-banner p {
      margin: 6px 0 0 0;
      color: #94a3b8;
      font-size: 11px;
    }

    h2 {
      font-size: 15px;
      font-weight: 700;
      color: #1e1b4b;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 4px;
      margin-top: 20px;
      margin-bottom: 10px;
      page-break-after: avoid;
    }

    h3 {
      font-size: 13px;
      font-weight: 600;
      color: #334155;
      margin-top: 14px;
      margin-bottom: 6px;
    }

    .card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 12px;
    }

    .flow-box {
      background: #0f172a;
      color: #a5b4fc;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10.5px;
      padding: 12px;
      border-radius: 8px;
      margin: 10px 0;
      line-height: 1.4;
    }

    code {
      font-family: 'JetBrains Mono', monospace;
      background: #f1f5f9;
      color: #4338ca;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10.5px;
    }

    pre {
      background: #0f172a;
      color: #818cf8;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10.5px;
      padding: 12px;
      border-radius: 8px;
      overflow-x: auto;
      line-height: 1.4;
      margin: 8px 0;
    }

    .table-spec {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
      font-size: 11px;
    }

    .table-spec th {
      background: #f1f5f9;
      text-align: left;
      padding: 6px 10px;
      border: 1px solid #cbd5e1;
      font-weight: 600;
    }

    .table-spec td {
      padding: 6px 10px;
      border: 1px solid #cbd5e1;
    }

    .footer {
      margin-top: 30px;
      padding-top: 10px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 9.5px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="header-banner">
    <h1>RORR SYSTEM ERROR INTELLIGENCE & DIAGNOSTICS HUB <span class="badge">v1.1.0</span></h1>
    <p>Official Platform Architecture, User Manual & Integration Specification</p>
  </div>

  <h2>1. System Architecture & High-Performance Pipeline</h2>
  <p>Rorr centralizes real-time runtime exceptions, stack traces, and request payloads into an intuitive web interface with strict role-based (RBAC) and project-based (PBAC) access control.</p>
  
  <div class="flow-box">
    [ Upstream Apps ] --(POST /api/v1/errors/ingest w/ X-Api-Key)--&gt; [ System.Threading.Channels.Channel&lt;ErrorLog&gt; ] --(Batch)--&gt; [ EF Core Database ] &amp; [ SignalR Telemetry Hub ]
  </div>

  <h2>2. Identity, Onboarding & User Administration</h2>
  <div class="card">
    <h3>RBAC & Automatic Email Credential Provisioning</h3>
    <p>Admins provision new users (Admin, Engineer, Viewer) by email. The system generates secure credentials and dispatches an onboarding email via SMTP. Users log in to receive a 24-hour JWT Bearer token.</p>
  </div>

  <h2>3. Project Ownership & Strict Access Isolation (PBAC)</h2>
  <div class="card">
    <h3>PBAC Security Boundary</h3>
    <p>Non-admin developers are strictly restricted to projects assigned to them. Unassigned project access requests return <code>HTTP 403 Forbidden</code>. SignalR WebSocket streams check project membership before broadcasting frames.</p>
  </div>

  <h2>4. Low-Overhead Log Ingestion Engine</h2>
  <div class="card">
    <h3>Non-Blocking Channel Ingestion Spec (POST /api/v1/errors/ingest)</h3>
    <p>Accepts JSON payloads with header <code>X-Api-Key</code> (validated via SHA-256). Ingests into an in-memory 10,000 capacity <code>Channel&lt;T&gt;</code> queue and returns <strong>HTTP 202 Accepted</strong> within &#8804; 50ms.</p>
  </div>

  <h2>5. React Web Console & Diagnostic Inspector</h2>
  <div class="card">
    <h3>Web Inspector & Gemini AI Assistant</h3>
    <p>Features Live Stream Explorer, Diagnostic Modal (Stack Trace, Inner Exception, JSON Context, DevOps Bug Ticket Generator), and an embedded Rorr AI Assistant (Google Gemini 1.5/2.0) for root cause analysis.</p>
  </div>

  <h2>6. Developer Integration Code Snippet (.NET / C#)</h2>
  <pre>using Rorr.Client;

builder.Services.AddHttpClient&lt;RorrClient&gt;();
builder.Services.AddSingleton(sp =&gt; new RorrClient(
    sp.GetRequiredService&lt;HttpClient&gt;(),
    new RorrClientOptions {
        BaseUrl = "http://localhost:5000",
        ApiKey = "rorr_live_YOUR_API_KEY",
        ProjectCode = "CORE_API"
    }));

try {
    // Parent application execution
} catch (Exception ex) {
    await _rorr.ReportAsync(ex, endpoint: "/api/v1/checkout", userId: "usr_9812", severity: "Critical");
    throw;
}</pre>

  <div class="footer">
    Rorr System Error Intelligence Platform v1.1.0 &mdash; Confidential Technical Documentation
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 400);
    };
  </script>
</body>
</html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleCopySnippet = (key: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(key);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const snippets = {
    csharp: `using Rorr.Client;

// Register in Program.cs
builder.Services.AddHttpClient<RorrClient>();
builder.Services.AddSingleton(sp => new RorrClient(
    sp.GetRequiredService<HttpClient>(),
    new RorrClientOptions
    {
        BaseUrl = "http://localhost:5000",
        ApiKey = "rorr_live_YOUR_API_KEY",
        ProjectCode = "CORE_API"
    }));

// Report Exception in Controller/Service
try {
    // Logic
} catch (Exception ex) {
    await _rorr.ReportAsync(ex, endpoint: "/api/v1/checkout", userId: "usr_9812", severity: "Critical");
    throw;
}`,
    jsts: `import axios from 'axios';

export async function reportToRorr(error: Error, endpoint?: string, contextPayload?: object) {
  try {
    await axios.post('http://localhost:5000/api/v1/errors/ingest', {
      projectCode: 'WEB_FRONTEND',
      message: error.message,
      errorCode: 'ERR_' + (error.name || 'UNKNOWN').toUpperCase(),
      severity: 'Error',
      stackTrace: error.stack,
      endpoint: endpoint || window.location.pathname,
      payload: contextPayload ? JSON.stringify(contextPayload) : null
    }, {
      headers: { 'x-api-key': 'rorr_live_YOUR_API_KEY' },
      timeout: 2000
    });
  } catch {
    // Non-blocking catch
  }
}`,
    python: `import requests, traceback

def report_exception(ex: Exception, endpoint: str = None, payload: dict = None):
    try:
        body = {
            "projectCode": "PY_WORKER",
            "message": str(ex),
            "errorCode": f"ERR_{type(ex).__name__.upper()}",
            "severity": "Error",
            "stackTrace": traceback.format_exc(),
            "endpoint": endpoint,
            "payload": str(payload) if payload else None
        }
        headers = {"Content-Type": "application/json", "x-api-key": "rorr_live_YOUR_API_KEY"}
        requests.post("http://localhost:5000/api/v1/errors/ingest", json=body, headers=headers, timeout=2.0)
    except Exception:
        pass`,
    rest: `POST /api/v1/errors/ingest HTTP/1.1
Host: localhost:5000
Content-Type: application/json
x-api-key: rorr_live_YOUR_API_KEY

{
  "projectCode": "CORE_API",
  "message": "Payment gateway handshake failed",
  "errorCode": "ERR_GATEWAY_TIMEOUT",
  "severity": "Critical",
  "endpoint": "/api/v1/payments/checkout",
  "stackTrace": "at PaymentController.Checkout()...",
  "payload": "{\"amount\": 249.99, \"cartId\": \"c_9981\"}"
}`
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-slate-950">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 flex items-center justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-400" />
            <h2 className="text-xl font-bold text-white tracking-wide">Rorr System User Manual & Technical SRS Guide</h2>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              v1.1.0 SRS
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Complete platform manual for operating the Rorr web console, configuring PBAC project boundaries, and embedding zero-overhead error reporting.
          </p>
        </div>

        {/* Dual Download Options */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadPdf}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 flex items-center gap-2 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Manual (PDF)</span>
          </button>

          <button
            onClick={handleDownloadMarkdown}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-2 transition cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Markdown (.md)</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'overview', label: '1. Architecture & Overview' },
          { id: 'operator', label: '2. Console Manual' },
          { id: 'pbac', label: '3. PBAC & Security' },
          { id: 'ai', label: '4. AI Diagnostics Assistant' },
          { id: 'csharp', label: '5.1 .NET / C# SDK' },
          { id: 'jsts', label: '5.2 JS / TS / Node' },
          { id: 'python', label: '5.3 Python Integration' },
          { id: 'rest', label: '5.4 REST API Spec' },
          { id: 'security', label: '6. Production Security' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-lg transition whitespace-nowrap ${
              activeSection === tab.id
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Section Views */}
      <div className="space-y-6 max-w-5xl">
        {activeSection === 'overview' && (
          <div className="space-y-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-300 text-xs leading-relaxed">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" /> System Architecture & Pipeline Flow
            </h3>
            <p>
              Rorr operates as an autonomous telemetry microservice. Upstream applications submit JSON payloads via HTTPS. An internal bounded memory queue (<code className="text-indigo-300 font-mono">System.Threading.Channels.Channel&lt;ErrorLog&gt;</code>) immediately accepts events with <strong className="text-emerald-400">HTTP 202 Accepted</strong> within &#8804; 50ms, ensuring error logging never degrades host application execution speed.
            </p>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-indigo-300 overflow-x-auto">
              [ Upstream Services ] --(POST /api/v1/errors/ingest)--&gt; [ Channel Buffer (10,000 logs) ] --(Batch)--&gt; [ EF Core DB ] &amp; [ SignalR Telemetry Hub ]
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="font-bold text-white text-xs block">⚡ Non-Blocking Ingestion</span>
                <p className="text-slate-400">Processes and acknowledges events in &#8804; 50ms via in-memory channel queue.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="font-bold text-white text-xs block">📡 SignalR WebSockets</span>
                <p className="text-slate-400">Pushes new error events live to authorized project subscribers with zero latency.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="font-bold text-white text-xs block">🔒 PBAC Security Boundary</span>
                <p className="text-slate-400">Strict project isolation ensuring developers only view logs for assigned projects.</p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'operator' && (
          <div className="space-y-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-300 text-xs leading-relaxed">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" /> Platform Operator Manual
            </h3>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="font-bold text-indigo-300 text-xs">Step 1: Register Projects & Assign Team Members</span>
                <p className="text-slate-400">
                  Go to <strong>Project Keys</strong> in the sidebar. Register a project, generate a raw SHA-256 hashed API Key, and click <strong>Manage Team</strong> to assign developer access (PBAC).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="font-bold text-indigo-300 text-xs">Step 2: Explore Real-Time Incidents</span>
                <p className="text-slate-400">
                  Open <strong>Live Explorer</strong>. Filter by severity (<code className="text-red-400">Critical</code>, <code className="text-rose-400">Error</code>, <code className="text-amber-400">Warning</code>, <code className="text-blue-400">Information</code>), or search matching endpoints/messages.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="font-bold text-indigo-300 text-xs">Step 3: Diagnostic Inspector Modal</span>
                <p className="text-slate-400">
                  Click any log row to open the inspector modal with 5 tabs: Summary Banner, Stack Trace, Inner Exception, JSON Request Context, and 1-click DevOps Bug Ticket Generator.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="font-bold text-indigo-300 text-xs">Step 4: Synthetic Payload Simulator</span>
                <p className="text-slate-400">
                  Use <strong>Payload Simulator</strong> to test ingestion presets (Critical DB Timeout, Null Reference, Auth Warning) and verify live WebSocket pushes.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'pbac' && (
          <div className="space-y-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-300 text-xs leading-relaxed">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <Lock className="w-4 h-4 text-indigo-400" /> Project-Based Access Control (PBAC) & RBAC
            </h3>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="font-bold text-indigo-300 text-xs">Platform Roles</span>
                <p className="text-slate-400">
                  <strong>Admin:</strong> Full administrative privileges. View all projects, manage users, assign team members, and view global analytics.<br/>
                  <strong>Engineer (Developer):</strong> Can access assigned project telemetry, manage own projects, and trigger AI error explanations.<br/>
                  <strong>Viewer:</strong> Read-only access to assigned projects.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="font-bold text-indigo-300 text-xs">Strict Access Isolation Policy</span>
                <p className="text-slate-400">
                  Requests to query logs or inspect project metrics outside explicit user assignments return <strong className="text-rose-400 font-mono">HTTP 403 Forbidden</strong>. SignalR telemetry streaming validates project membership before broadcasting updates.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'ai' && (
          <div className="space-y-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-300 text-xs leading-relaxed">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Bot className="w-4 h-4 text-purple-400" /> Rorr AI Assistant (Google Gemini Powered)
            </h3>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <p className="text-slate-300">
                The <strong>Rorr AI Assistant</strong> is accessible via the floating trigger button at the bottom-right of the web console. Powered by Google Gemini 1.5/2.0, it analyzes exception stack traces, request payloads, and error codes to provide instant root cause diagnosis and fix suggestions.
              </p>
              <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-lg text-indigo-200 text-xs">
                💡 <strong>Privacy & Fresh Context:</strong> When you close the AI Assistant drawer, the chat conversation history is automatically cleared so each session starts with a clean context slate.
              </div>
            </div>
          </div>
        )}

        {activeSection === 'csharp' && (
          <div className="space-y-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-300 text-xs leading-relaxed">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Code2 className="w-4 h-4 text-indigo-400" /> .NET / C# Integration (`RorrClient`)
              </h3>
              <button
                onClick={() => handleCopySnippet('csharp', snippets.csharp)}
                className="px-3 py-1 bg-slate-800 border border-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              >
                {copiedCode === 'csharp' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode === 'csharp' ? 'Copied' : 'Copy C# Code'}</span>
              </button>
            </div>

            <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[11px] text-indigo-300 overflow-x-auto leading-relaxed">
              {snippets.csharp}
            </pre>
          </div>
        )}

        {activeSection === 'jsts' && (
          <div className="space-y-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-300 text-xs leading-relaxed">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Code2 className="w-4 h-4 text-indigo-400" /> JS / TS / Node.js Integration
              </h3>
              <button
                onClick={() => handleCopySnippet('jsts', snippets.jsts)}
                className="px-3 py-1 bg-slate-800 border border-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              >
                {copiedCode === 'jsts' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode === 'jsts' ? 'Copied' : 'Copy JS Code'}</span>
              </button>
            </div>

            <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[11px] text-indigo-300 overflow-x-auto leading-relaxed">
              {snippets.jsts}
            </pre>
          </div>
        )}

        {activeSection === 'python' && (
          <div className="space-y-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-300 text-xs leading-relaxed">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Code2 className="w-4 h-4 text-indigo-400" /> Python Integration
              </h3>
              <button
                onClick={() => handleCopySnippet('python', snippets.python)}
                className="px-3 py-1 bg-slate-800 border border-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              >
                {copiedCode === 'python' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode === 'python' ? 'Copied' : 'Copy Python Code'}</span>
              </button>
            </div>

            <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[11px] text-indigo-300 overflow-x-auto leading-relaxed">
              {snippets.python}
            </pre>
          </div>
        )}

        {activeSection === 'rest' && (
          <div className="space-y-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-300 text-xs leading-relaxed">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" /> REST API Ingestion Spec (`POST /api/v1/errors/ingest`)
              </h3>
              <button
                onClick={() => handleCopySnippet('rest', snippets.rest)}
                className="px-3 py-1 bg-slate-800 border border-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              >
                {copiedCode === 'rest' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode === 'rest' ? 'Copied' : 'Copy HTTP Spec'}</span>
              </button>
            </div>

            <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[11px] text-emerald-300 overflow-x-auto leading-relaxed">
              {snippets.rest}
            </pre>
          </div>
        )}

        {activeSection === 'security' && (
          <div className="space-y-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-300 text-xs leading-relaxed">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Production Security & Data Masking
            </h3>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-400 text-xs">SHA-256 API Key Storage</span>
                <p className="text-slate-400">
                  Rorr never stores raw API keys. Keys presented in <code className="text-slate-200">x-api-key</code> headers are hashed via SHA-256 before database lookup.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-400 text-xs">Automatic Data Sanitizer</span>
                <p className="text-slate-400">
                  All JSON payload contexts pass through <code className="text-slate-200">DataSanitizer</code> to mask sensitive fields like passwords (<code className="text-slate-300">[REDACTED_SENSITIVE_DATA]</code>), Bearer tokens, and credit card numbers.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-400 text-xs">Non-Interfering Client Integration</span>
                <p className="text-slate-400">
                  Client SDKs wrap ingestion HTTP calls in silent exception suppressions, guaranteeing that Rorr network failures will never interrupt host application execution.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

