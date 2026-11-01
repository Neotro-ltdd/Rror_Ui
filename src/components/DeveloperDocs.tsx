import React, { useState } from 'react';
import { Check, Code2, Copy } from 'lucide-react';

export const DeveloperDocs: React.FC = () => {
  const [activeLang, setActiveLang] = useState<'curl' | 'csharp' | 'ts' | 'python' | 'go' | 'php'>('csharp');
  const [copied, setCopied] = useState(false);

  const snippets = {
    csharp: `
// Install Rorr.Client NuGet Package or add drop-in helper
using Rorr.Client;

var client = new RorrClient(new HttpClient(), new RorrClientOptions
{
    BaseUrl = "http://localhost:5000",
    ApiKey = "rorr_live_YOUR_API_KEY",
    ProjectCode = "CORE_API"
});

try
{
    // Primary application logic
    throw new InvalidOperationException("Payment gateway connection failed.");
}
catch (Exception ex)
{
    // Non-blocking report to Rorr
    await client.ReportAsync(ex, endpoint: "/api/v1/payments/checkout", userId: "usr_98123");
}
`.trim(),
    curl: `
curl -X POST http://localhost:5000/api/v1/errors/ingest \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: rorr_live_YOUR_API_KEY" \\
  -d '{
    "projectCode": "CORE_API",
    "message": "Database connection timeout during user checkout",
    "errorCode": "ERR_DB_TIMEOUT",
    "errorName": "TimeoutException",
    "severity": "Critical",
    "endpoint": "/api/v1/orders",
    "stackTrace": "at OrderController.Checkout() in Controllers/OrderController.cs:line 42",
    "payload": "{\\"cartId\\": \\"cart_781\\", \\"total\\": 149.99}"
  }'
`.trim(),
    ts: `
import axios from 'axios';

export async function reportToRorr(error: Error, endpoint?: string, payload?: object) {
  try {
    await axios.post('http://localhost:5000/api/v1/errors/ingest', {
      projectCode: 'FRONTEND_WEB',
      message: error.message,
      errorCode: 'ERR_' + error.name.toUpperCase(),
      errorName: error.name,
      severity: 'Error',
      stackTrace: error.stack,
      endpoint: endpoint || window.location.pathname,
      payload: JSON.stringify(payload || {})
    }, {
      headers: { 'x-api-key': 'rorr_live_YOUR_API_KEY' }
    });
  } catch {
    // Non-blocking silent catch
  }
}
`.trim(),
    python: `
import requests
import traceback

def report_exception(ex: Exception, endpoint: str = None, payload: dict = None):
    try:
        body = {
            "projectCode": "PY_WORKER",
            "message": str(ex),
            "errorCode": f"ERR_{type(ex).__name__.upper()}",
            "errorName": type(ex).__name__,
            "severity": "Error",
            "stackTrace": traceback.format_exc(),
            "endpoint": endpoint,
            "payload": str(payload) if payload else None
        }
        headers = {"x-api-key": "rorr_live_YOUR_API_KEY"}
        requests.post("http://localhost:5000/api/v1/errors/ingest", json=body, headers=headers, timeout=2)
    except Exception:
        pass
`.trim(),
    go: `
package main

import (
	"bytes"
	"encoding/json"
	"net/http"
)

func ReportToRorr(err error, endpoint string) {
	body, _ := json.Marshal(map[string]interface{}{
		"projectCode": "GO_MICROSERVICE",
		"message":     err.Error(),
		"errorCode":   "ERR_GO_RUNTIME",
		"severity":    "Error",
		"endpoint":    endpoint,
	})
	req, _ := http.NewRequest("POST", "http://localhost:5000/api/v1/errors/ingest", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("x-api-key", "rorr_live_YOUR_API_KEY")
	client := &http.Client{}
	client.Do(req)
}
`.trim(),
    php: `
<?php
function reportToRorr($exception, $endpoint = null) {
    $data = [
        'projectCode' => 'PHP_PORTAL',
        'message' => $exception->getMessage(),
        'errorCode' => 'ERR_' . strtoupper(get_class($exception)),
        'errorName' => get_class($exception),
        'severity' => 'Error',
        'stackTrace' => $exception->getTraceAsString(),
        'endpoint' => $endpoint
    ];
    $ch = curl_init('http://localhost:5000/api/v1/errors/ingest');
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json', 'x-api-key: rorr_live_YOUR_API_KEY']);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_TIMEOUT, 2);
    curl_exec($ch);
    curl_close($ch);
}
`.trim()
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(snippets[activeLang]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-slate-950">
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Code2 className="w-5 h-5 text-indigo-400" /> Integration SDKs & Code Snippets
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Copy and drop zero-overhead exception reporting code directly into your upstream applications.
        </p>
      </div>

      {/* Language Selector Pills */}
      <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800 w-fit">
        {(['csharp', 'curl', 'ts', 'python', 'go', 'php'] as const).map((lang) => (
          <button
            key={lang}
            onClick={() => setActiveLang(lang)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition uppercase ${
              activeLang === lang
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {lang === 'csharp' ? 'C# (.NET)' : lang === 'ts' ? 'TypeScript/Node' : lang}
          </button>
        ))}
      </div>

      {/* Snippet Code Container */}
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-6 font-mono text-xs text-slate-200 shadow-2xl">
        <button
          onClick={handleCopy}
          className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:text-white transition flex items-center gap-2 text-xs font-sans font-semibold"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied to Clipboard!' : 'Copy Code'}</span>
        </button>

        <pre className="whitespace-pre-wrap leading-relaxed text-indigo-200">
          {snippets[activeLang]}
        </pre>
      </div>
    </div>
  );
};
