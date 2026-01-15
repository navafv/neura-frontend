import { useState, useRef, useEffect } from "react";
import { Scan, Search, Check, AlertTriangle } from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";

export const QRScanner = ({ onScanSuccess }) => {
  const [scanInput, setScanInput] = useState("");
  const [scanning, setScanning] = useState(false);
  const inputRef = useRef(null);

  // Keep focus on input for "gun" style scanners
  useEffect(() => {
    if (scanning) inputRef.current?.focus();
  }, [scanning]);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!scanInput) return;

    try {
      // Backend expects: { "qr_data": "..." }
      const res = await api.post("participants/scan_qr/", {
        qr_data: scanInput,
      });
      toast.success(res.data.message);
      if (onScanSuccess) onScanSuccess();
      setScanInput(""); // Clear for next scan
    } catch (err) {
      toast.error(err.response?.data?.error || "Invalid QR Code");
      setScanInput("");
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl mb-6">
      <div className="flex items-center gap-4 mb-4">
        <div
          className={`p-3 rounded-full ${
            scanning
              ? "bg-green-500/20 text-green-400 animate-pulse"
              : "bg-slate-800 text-slate-400"
          }`}
        >
          <Scan size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Attendance Scanner</h3>
          <p className="text-xs text-slate-500">
            {scanning ? "Ready to scan..." : "Click to activate scanner input"}
          </p>
        </div>
        <button
          onClick={() => setScanning(!scanning)}
          className={`ml-auto px-4 py-2 rounded-xl font-bold text-sm transition-all ${
            scanning ? "bg-red-500/20 text-red-400" : "bg-cyan-600 text-white"
          }`}
        >
          {scanning ? "Stop" : "Activate"}
        </button>
      </div>

      {scanning && (
        <form onSubmit={handleScan} className="relative">
          <input
            ref={inputRef}
            autoFocus
            value={scanInput}
            onChange={(e) => setScanInput(e.target.value)}
            className="w-full bg-black border border-green-500/50 rounded-xl p-4 pl-12 text-green-400 font-mono text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Scan QR or type ID..."
            onBlur={() => setTimeout(() => inputRef.current?.focus(), 100)} // Auto-refocus logic for scanner guns
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500/50" />
        </form>
      )}
    </div>
  );
};
