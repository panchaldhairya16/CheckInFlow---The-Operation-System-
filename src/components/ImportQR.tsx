import React, { useState, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Upload, FileImage, AlertCircle, CheckCircle, Trash2 } from "lucide-react";
import canvasConfetti from "canvas-confetti";

interface ImportQRProps {
  activeEvent: string;
  onImportSuccess: (record: any) => void;
  onImportDeleted?: (id: string) => void;
  onImportError: (error: string) => void;
}

export default function ImportQR({ activeEvent, onImportSuccess, onImportDeleted, onImportError }: ImportQRProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [decoding, setDecoding] = useState(false);
  const [successRecord, setSuccessRecord] = useState<any | null>(null);
  const [localError, setLocalError] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (selectedFile: File) => {
    const validTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!validTypes.includes(selectedFile.type)) {
      setLocalError("Invalid file type. Please upload a PNG or JPEG image.");
      setFile(null);
      setImagePreview(null);
      return;
    }

    setLocalError("");
    setSuccessRecord(null);
    setFile(selectedFile);

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const decodeUploadedImage = async () => {
    if (!file) return;
    setDecoding(true);
    setLocalError("");

    try {
      // Create element on-the-fly for scanner to bind to briefly
      const hiddenReaderId = "hidden-file-reader";
      let hiddenReader = document.getElementById(hiddenReaderId);
      if (!hiddenReader) {
        hiddenReader = document.createElement("div");
        hiddenReader.id = hiddenReaderId;
        hiddenReader.style.display = "none";
        document.body.appendChild(hiddenReader);
      }

      const html5QrCode = new Html5Qrcode(hiddenReaderId);

      // Scan file
      const decodedText = await html5QrCode.scanFile(file, true);
      
      // Clean up scanning binding
      html5QrCode.clear();

      // Submit data to backend
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
        throw new Error(errData.message || "Failed to save decoded ticket information.");
      }

      const parsed = await res.json();
      
      // Celebrate
      canvasConfetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      setSuccessRecord(parsed.record);
      onImportSuccess(parsed.record);
    } catch (err: any) {
      console.error("Image file decoding error:", err);
      const errMsg = err.message || "Could not find a valid checked-in QR code in this image.";
      setLocalError(errMsg);
      onImportError(errMsg);
    } finally {
      setDecoding(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setImagePreview(null);
    setSuccessRecord(null);
    setLocalError("");
  };

  const handleDeleteImportedRecord = async () => {
    if (!successRecord) return;

    try {
      const res = await fetch(`/api/attendance/${successRecord.id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        if (onImportDeleted) {
          onImportDeleted(successRecord.id);
        }
        handleReset();
      } else {
        setLocalError("Could not delete the check-in record.");
      }
    } catch (err) {
      console.error("Delete imported scan failed:", err);
      setLocalError("Failed to connect to server for deletion.");
    }
  };

  return (
    <div className="w-full max-w-md bg-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-slate-800 shadow-xl" id="import-qr-container">
      <div className="mb-4">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center justify-between">
          <span>Upload Attendee Pass</span>
          <span className="text-indigo-400 font-mono text-[10px]">PNG / JPG support</span>
        </label>
        <div className="text-sm font-bold text-slate-200 bg-slate-950/60 py-2 px-3 rounded-lg border border-slate-800/80 mb-4">
          Target Event: {activeEvent}
        </div>
      </div>

      {!imagePreview ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`group border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all h-60 text-center ${
            dragActive
              ? "border-indigo-400 bg-indigo-950/20"
              : "border-slate-800 bg-slate-950/20 hover:border-slate-700 hover:bg-slate-950/40"
          }`}
          id="dropzone-area"
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".png,.jpg,.jpeg"
            onChange={handleChange}
          />
          <div className="p-3 bg-slate-900 rounded-full text-indigo-400 border border-slate-800 group-hover:scale-110 group-hover:text-cyan-400 transition mb-3">
            <Upload size={24} />
          </div>
          <h4 className="text-white font-semibold text-sm mb-1">Drag and drop attendee QR pass</h4>
          <p className="text-xs text-slate-500 max-w-xs">
            Or click to pick an image file from your computer or photos library.
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          {/* Preview Element */}
          <div className="relative w-full aspect-video max-h-48 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center p-2 mb-4 animate-fade-in">
            <img
              src={imagePreview}
              alt="QR Code File Preview"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            {!successRecord && (
              <div className="absolute top-2 right-2 bg-slate-900/95 text-slate-300 font-semibold text-[10px] py-1 px-2.5 rounded-full border border-slate-800">
                Loaded
              </div>
            )}
          </div>

          {/* Success Screen Info */}
          {successRecord ? (
            <div className="w-full bg-slate-950/60 rounded-xl p-4 border border-emerald-950 text-left mb-4 animate-fade-in">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-3">
                <CheckCircle size={16} />
                <span>Attendance Authenticated!</span>
              </div>
              <div className="text-sm font-semibold text-white">{successRecord.attendeeName}</div>
              <div className="text-xs text-slate-400 mb-2">{successRecord.attendeeEmail}</div>
              <div className="text-xs text-slate-300 flex items-center justify-between border-t border-slate-800/80 pt-2 font-medium">
                <span>{successRecord.designation}</span>
                <span className="text-indigo-400 font-bold">{successRecord.company}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3 text-sm text-slate-300 font-medium bg-slate-950/40 p-3 rounded-lg border border-slate-800/60 w-full mb-4">
              <div className="flex items-center gap-2 truncate">
                <FileImage size={16} className="text-cyan-400 shrink-0" />
                <span className="truncate text-xs">{file?.name}</span>
              </div>
              <button
                onClick={handleReset}
                className="text-xs font-bold text-rose-400 hover:text-rose-300 transition cursor-pointer"
              >
                Clear
              </button>
            </div>
          )}

          {/* Local validation feedback */}
          {localError && (
            <div className="flex items-start gap-2 bg-rose-950/40 border border-rose-900/60 text-rose-200 text-xs rounded-lg p-3 w-full mb-4 animate-fade-in font-medium">
              <AlertCircle size={16} className="shrink-0 text-rose-400" />
              <span>{localError}</span>
            </div>
          )}

          {/* Action Trigger */}
          {!successRecord ? (
            <button
              onClick={decodeUploadedImage}
              disabled={decoding}
              className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                decoding
                  ? "bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_4px_12px_rgba(108,99,255,0.2)]"
              }`}
              id="process-file-qr-decoder"
            >
              {decoding ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-slate-600 border-t-indigo-400 rounded-full animate-spin"></span>
                  Decoding Vector Nodes...
                </>
              ) : (
                "Scan & Register Attendance"
              )}
            </button>
          ) : (
            <div className="flex gap-2.5 w-full">
              <button
                onClick={handleDeleteImportedRecord}
                className="flex-1 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-white rounded-lg border border-rose-500/20 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 size={13} />
                Delete/Undo
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-2.5 bg-slate-850 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl border border-slate-800 transition cursor-pointer"
                id="import-qr-reset-trigger"
              >
                Upload Pass
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
