import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Play, Send } from 'lucide-react';
import { simulateError } from '../services/api';
import type { Project } from '../types/rorr';

interface Props {
  projects: Project[];
  onSuccess: () => void;
}

export const PayloadSimulator: React.FC<Props> = ({ projects, onSuccess }) => {
  const [projectCode, setProjectCode] = useState(projects[0]?.projectCode || 'DEMO_APP');
  const [apiKey, setApiKey] = useState('rorr_live_demo1234567890abcdef12345678');
  const [severity, setSeverity] = useState('Error');
  const [message, setMessage] = useState('PaymentGatewayException: Handshake failed with payment provider API.');
  const [errorCode, setErrorCode] = useState('ERR_GATEWAY_TIMEOUT');
  const [errorName, setErrorName] = useState('HttpRequestException');
  const [endpoint, setEndpoint] = useState('/api/v1/payments/checkout');
  const [stackTrace, setStackTrace] = useState(
    'at Rorr.PaymentService.Checkout(OrderDto dto) in PaymentService.cs:line 84\n' +
    'at Rorr.Api.Controllers.CheckoutController.Post(OrderDto dto) in CheckoutController.cs:line 29'
  );
  const [payloadContext, setPayloadContext] = useState(
    JSON.stringify({ orderId: 'ord_99812', amount: 249.99, currency: 'USD', retryCount: 3 }, null, 2)
  );

  const [loading, setLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResultMessage(null);

    try {
      const payloadObj = {
        projectCode,
        message,
        errorCode,
        errorName,
        severity,
        stackTrace,
        endpoint,
        createdById: 'simulated_user@rorr.dev',
        payload: payloadContext
      };

      const res = await simulateError(apiKey, payloadObj);
      setResultMessage(`Success! Ingested incident #${res.data?.incidentId || 'OK'}`);
      onSuccess();
    } catch (err: any) {
      setResultMessage(`Error dispatching payload: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadPreset = (presetName: string) => {
    if (presetName === 'db_timeout') {
      setMessage('SqlException: Execution Timeout Expired. The timeout period elapsed prior to completion of the operation.');
      setErrorCode('ERR_DB_TIMEOUT');
      setErrorName('SqlException');
      setSeverity('Critical');
      setEndpoint('/api/v1/reports/financial');
    } else if (presetName === 'auth_fail') {
      setMessage('UnauthorizedAccessException: Invalid OAuth JWT signature or expired token.');
      setErrorCode('ERR_UNAUTHORIZED');
      setErrorName('UnauthorizedAccessException');
      setSeverity('Warning');
      setEndpoint('/api/v1/auth/login');
    } else if (presetName === 'null_ref') {
      setMessage('NullReferenceException: Object reference not set to an instance of an object.');
      setErrorCode('ERR_NULL_REFERENCE');
      setErrorName('NullReferenceException');
      setSeverity('Error');
      setEndpoint('/api/v1/users/profile');
    }
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-slate-950">
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Play className="w-5 h-5 text-indigo-400" /> Synthetic Payload Simulator
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Dispatch synthetic error payloads to verify non-blocking channel ingestion, indexing, and SignalR live stream.
        </p>
      </div>

      {/* Preset Buttons */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-400 font-semibold">Load Sample Presets:</span>
        <button
          onClick={() => loadPreset('db_timeout')}
          className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg text-xs font-semibold hover:bg-red-500/20 transition"
        >
          Critical DB Timeout
        </button>
        <button
          onClick={() => loadPreset('null_ref')}
          className="px-3 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-semibold hover:bg-rose-500/20 transition"
        >
          Null Reference
        </button>
        <button
          onClick={() => loadPreset('auth_fail')}
          className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-semibold hover:bg-amber-500/20 transition"
        >
          Auth Warning
        </button>
      </div>

      {/* Simulator Form */}
      <form onSubmit={handleDispatch} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Target Project</label>
            <select
              value={projectCode}
              onChange={(e) => setProjectCode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 focus:border-indigo-500 outline-none"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.projectCode}>
                  {p.name} ({p.projectCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">API Key Header (`x-api-key`)</label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs font-mono rounded-lg px-3 py-2 focus:border-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Severity</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 focus:border-indigo-500 outline-none"
            >
              <option value="Critical">Critical</option>
              <option value="Error">Error</option>
              <option value="Warning">Warning</option>
              <option value="Information">Information</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Error Code</label>
            <input
              type="text"
              value={errorCode}
              onChange={(e) => setErrorCode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs font-mono rounded-lg px-3 py-2 focus:border-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Error Name / Class</label>
            <input
              type="text"
              value={errorName}
              onChange={(e) => setErrorName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs font-mono rounded-lg px-3 py-2 focus:border-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">HTTP Endpoint / Route</label>
            <input
              type="text"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs font-mono rounded-lg px-3 py-2 focus:border-indigo-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Error Summary Message</label>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs font-mono rounded-lg px-3 py-2 focus:border-indigo-500 outline-none"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Stack Trace</label>
            <textarea
              rows={4}
              value={stackTrace}
              onChange={(e) => setStackTrace(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs font-mono rounded-lg p-3 focus:border-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Request Payload Context (JSON)</label>
            <textarea
              rows={4}
              value={payloadContext}
              onChange={(e) => setPayloadContext(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-emerald-400 text-xs font-mono rounded-lg p-3 focus:border-indigo-500 outline-none"
            />
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/30 flex items-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{loading ? 'Dispatching...' : 'Dispatch Telemetry Payload'}</span>
          </button>

          {resultMessage && (
            <div className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border ${
              resultMessage.startsWith('Success')
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
            }`}>
              {resultMessage.startsWith('Success') ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
              <span>{resultMessage}</span>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};
