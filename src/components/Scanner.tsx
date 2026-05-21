import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, RefreshCw, Zap, VideoOff, CheckCircle2, Trash2 } from "lucide-react";
import canvasConfetti from "canvas-confetti";

interface ScannerProps {
  activeEvent: string;
  onScanSuccess: (record: any) => void;
  onScanDeleted?: (id: string) => void;
  onScanError: (error: string) => void;
}

export default function Scanner({ activeEvent, onScanSuccess, onScanDeleted, onScanError }: ScannerProps) {
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [scannedData, setScannedData] = useState<any | null>(null);
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const qrRef = useRef<Html5Qrcode | null>(null);
  const scanContainerId = "presently-qr-reader";

  // Scan cooldown to prevent rapid multi-firing
  const isProcessingRef = useRef(false);

  useEffect(() => {
    // Locate and register devices on mount
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setCameras(devices);
          // Prefer back camera if available
          const backCam = devices.find((d) => d.label.toLowerCase().includes("back") || d.label.toLowerCase().includes("environment"));
          setSelectedCameraId(backCam ? backCam.id : devices[0].id);
        } else {
          setErrorMessage("No camera devices detected. Ensure permissions are granted.");
        }
        setInitializing(false);
      })
      .catch((err) => {
        console.error("Camera acquisition error:", err);
        setErrorMessage("Camera access request denied or unavailable.");
        setInitializing(false);
      });

    return () => {
      // Destructor: make sure camera turns off when unmounting
      if (qrRef.current && qrRef.current.isScanning) {
        qrRef.current.stop().catch((e) => console.error("Error stopping on cleanup:", e));
      }
    };
  }, []);

  const startScanner = async (cameraId: string) => {
    if (!cameraId) return;
    setErrorMessage("");

    try {
      // Stop ongoing scan if exists
      if (qrRef.current && qrRef.current.isScanning) {
        await qrRef.current.stop();
      }

      const qrScanner = new Html5Qrcode(scanContainerId);
      qrRef.current = qrScanner;
      setIsScanning(true);
      setHasScanned(false);

      await qrScanner.start(
        cameraId,
        {
          fps: 15,
          qrbox: (width, height) => {
            const size = Math.min(width, height) * 0.7;
            return { width: size, height: size };
          }
        },
        async (decodedText) => {
          if (isProcessingRef.current) return;
          isProcessingRef.current = true;

          try {
            // Trigger animation celebrate
            canvasConfetti({
              particleCount: 80,
              spread: 60,
              origin: { y: 0.7 },
              colors: ["#6C63FF", "#7F5AF0", "#22D3EE"]
            });

            // Stop camera scan
            if (qrScanner.isScanning) {
              await qrScanner.stop();
            }
            setIsScanning(false);

            // POST to backend scan endpoint
            const res = await fetch("/api/attendance/scan", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                qrData: decodedText,
                activeEvent: activeEvent
              })
            });

            if (!res.ok) {
              const errData = await res.json();
              throw new Error(errData.message || "Failed to process scan data.");
            }

            const rData = await res.json();
            setScannedData(rData.record);
            setHasScanned(true);
            onScanSuccess(rData.record);
          } catch (err: any) {
            onScanError(err.message || "Error processing scanned attendance.");
            // Restart scanning automatically after error cooldown
            setTimeout(() => {
              isProcessingRef.current = false;
              if (selectedCameraId) startScanner(selectedCameraId);
            }, 3000);
          } finally {
            isProcessingRef.current = false;
          }
        },
        (errorMessage) => {
          // Failure callback triggers on every unaligned frame, quiet to avoid clogging console
        }
      );
    } catch (err: any) {
      console.error("Scanner failed to start:", err);
      setErrorMessage("Could not initialize camera feed. Confirm another app is not using it.");
      setIsScanning(false);
    }
  };

  const handleStopScanner = async () => {
    if (qrRef.current && qrRef.current.isScanning) {
      try {
        await qrRef.current.stop();
        setIsScanning(false);
      } catch (err) {
        console.error("Stop error:", err);
      }
    }
  };

  const toggleFlashlight = async () => {
    if (qrRef.current && qrRef.current.isScanning) {
      try {
        const flag = !flashlightOn;
        // Apply camera zoom/flash settings via driver options
        await (qrRef.current as any).applyVideoConstrains({
          advanced: [{ torch: flag }]
        });
        setFlashlightOn(flag);
      } catch (err) {
        console.warn("Torch control not supported by current camera hardware.", err);
      }
    }
  };

  const switchCamera = async (id: string) => {
    setSelectedCameraId(id);
    if (isScanning) {
      await startScanner(id);
    }
  };

  const resetScannerState = () => {
    setHasScanned(false);
    setScannedData(null);
    startScanner(selectedCameraId);
  };

  const handleDeleteLastScan = async () => {
    if (!scannedData) return;

    try {
      const res = await fetch(`/api/attendance/${scannedData.id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        if (onScanDeleted) {
          onScanDeleted(scannedData.id);
        }
        setHasScanned(false);
        setScannedData(null);
        startScanner(selectedCameraId);
      } else {
        onScanError("Could not delete check-in record.");
      }
    } catch (err) {
      console.error("Delete last scan failed:", err);
    }
  };

  return (
    <div className="flex flex-col items-center w-full" id="camera-scanner-module">
      {/* Target Selector */}
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-md rounded-xl p-4 border border-slate-800 mb-6">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 flex items-center justify-between">
          <span>Active Scanned Event</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
            Ready to Check-in
          </span>
        </label>
        <div className="text-base font-bold text-white mb-3 bg-slate-950/60 py-2.5 px-3.5 rounded-lg border border-slate-800">
          {activeEvent || "General Admits"}
        </div>

        {cameras.length > 1 && (
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
              Switch Cam Input
            </label>
            <div className="relative">
              <select
                className="w-full bg-slate-950 border border-slate-800 rounded-lg text-white text-sm py-2 px-3 focus:outline-none focus:border-indigo-500 appearance-none"
                value={selectedCameraId}
                onChange={(e) => switchCamera(e.target.value)}
              >
                {cameras.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label || `Camera ${cameras.indexOf(c) + 1}`}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                <RefreshCw size={14} className="animate-spin-slow" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Scanner Stage */}
      <div className="relative w-full max-w-md aspect-square bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-800 shadow-[0_0_50px_rgba(108,99,255,0.15)] flex flex-col justify-center items-center">
        {/* Decorative corner brackets */}
        <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-indigo-500 rounded-tl-lg z-20"></div>
        <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-indigo-500 rounded-tr-lg z-20"></div>
        <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-indigo-500 rounded-bl-lg z-20"></div>
        <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-indigo-500 rounded-br-lg z-20"></div>

        {initializing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 z-30 transition-opacity">
            <RefreshCw size={36} className="text-indigo-400 animate-spin mb-3" />
            <p className="text-sm font-medium text-slate-400">Loading optics matrices...</p>
          </div>
        )}

        {errorMessage && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 z-30 text-center p-6">
            <VideoOff size={44} className="text-rose-500 mb-3" />
            <h4 className="text-white font-bold mb-1">Camera Access Refused</h4>
            <p className="text-xs text-slate-400 max-w-xs">{errorMessage}</p>
          </div>
        )}

        {/* QR Scan Output Area */}
        <div id={scanContainerId} className="w-full h-full object-cover"></div>

        {/* Scanning laser sweep line */}
        {isScanning && (
          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent top-0 animate-laser-sweep z-10 shadow-[0_0_8px_cyan]"></div>
        )}

        {/* Scan success screen overlays */}
        {hasScanned && scannedData && (
          <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center z-30 animate-fade-in">
            <CheckCircle2 size={56} className="text-emerald-400 mb-4 animate-bounce" />
            <h3 className="text-xl font-bold text-white mb-1">Check-in Confirmed!</h3>
            <p className="text-xs text-indigo-300 font-semibold uppercase tracking-wider mb-4">
              {scannedData.event}
            </p>

            <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 w-full mb-5 text-left">
              <div className="text-sm font-bold text-white">{scannedData.attendeeName}</div>
              <div className="text-xs text-slate-400 mb-1">{scannedData.attendeeEmail}</div>
              <div className="text-xs font-semibold text-slate-300 flex items-center justify-between mt-2 border-t border-slate-800/80 pt-2">
                <span>{scannedData.designation}</span>
                <span className="text-cyan-400">{scannedData.company}</span>
              </div>
            </div>

            <div className="flex gap-2.5 w-full">
              <button
                onClick={handleDeleteLastScan}
                className="flex-1 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-white rounded-lg border border-rose-500/20 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 size={13} />
                Delete/Undo
              </button>
              <button
                onClick={resetScannerState}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 focus:ring-2 focus:ring-indigo-500 text-white font-bold rounded-lg transition text-xs shadow-md flex items-center justify-center"
                id="resume-scanning-button"
              >
                Scan Next
              </button>
            </div>
          </div>
        )}

        {/* Start Overlay Button if Idle */}
        {!isScanning && !hasScanned && !errorMessage && !initializing && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 z-10">
            <Camera size={48} className="text-indigo-400 mb-4 animate-pulse" />
            <h4 className="text-white font-bold text-lg mb-1">Camera Offline</h4>
            <p className="text-xs text-slate-400 text-center max-w-xs mb-5">
              Secure attendance scan process matches credentials instantly against the database.
            </p>
            <button
              onClick={() => startScanner(selectedCameraId)}
              className="bg-indigo-600 hover:bg-indigo-500 hover:scale-105 active:scale-95 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg transition-all"
              id="start-camera-feed"
            >
              Initialize Camera Lens
            </button>
          </div>
        )}
      </div>

      {/* Control Actions Panel */}
      {isScanning && (
        <div className="flex items-center gap-4 mt-5 transition">
          <button
            onClick={toggleFlashlight}
            className={`p-3.5 rounded-full border transition flex items-center justify-center cursor-pointer ${
              flashlightOn
                ? "bg-yellow-500 text-neutral-950 border-yellow-400"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white"
            }`}
            title="Toggle Flashlight"
            id="flashlight-trigger"
          >
            <Zap size={18} className={flashlightOn ? "fill-current" : ""} />
          </button>
          <button
            onClick={handleStopScanner}
            className="px-5 py-2.5 bg-rose-950/60 border border-rose-800 hover:bg-rose-900 text-rose-200 text-sm font-semibold rounded-lg shadow-md transition cursor-pointer"
            id="pause-optics-trigger"
          >
            Disable Lens
          </button>
        </div>
      )}
    </div>
  );
}
