import { useEffect, useRef, useState, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  title: string;
  children: ReactNode;
  confirmLabel: string;
  busy: boolean;
  /** Si fourni, la confirmation exige de cocher cette case (ex : stratégies live concernées). */
  ackLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal = ({ title, children, confirmLabel, busy, ackLabel, onConfirm, onCancel }: Props) => {
  const [acked, setAcked] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onCancel]);

  const blocked = busy || (ackLabel !== undefined && !acked);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 outline-none"
      >
        <h2 id="confirm-title" className="text-lg font-heading font-bold text-primary flex items-center gap-2 mb-3">
          <AlertTriangle className="w-5 h-5 text-gold" /> {title}
        </h2>
        <div className="text-sm text-gray-700 space-y-3">{children}</div>

        {ackLabel !== undefined && (
          <label className="mt-4 flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
            <input type="checkbox" checked={acked} onChange={(e) => setAcked(e.target.checked)} className="mt-0.5" />
            <span>{ackLabel}</span>
          </label>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-bold disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={blocked}
            className="px-4 py-2 rounded-lg bg-gold hover:bg-gold-hover text-white text-sm font-bold disabled:opacity-50"
          >
            {busy ? "En cours…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
