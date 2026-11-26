import React from "react";
import { Key, ExternalLink, Eye, EyeOff, ShieldCheck } from "lucide-react";

interface ApiKeyPanelProps {
  apiKey: string;
  showKey: boolean;
  rememberKey: boolean;
  onKeyChange: (value: string) => void;
  onToggleShowKey: () => void;
  onToggleRemember: (checked: boolean) => void;
}

/**
 * Renders the Bring-Your-Own Gemini API key input with client-side visibility
 * and ephemeral localStorage opt-in controls.
 */
export const ApiKeyPanel: React.FC<ApiKeyPanelProps> = ({
  apiKey,
  showKey,
  rememberKey,
  onKeyChange,
  onToggleShowKey,
  onToggleRemember,
}) => {
  return (
    <div className="bento-card rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor="apiKey"
          className="text-xs font-bold uppercase tracking-wider text-zinc-950 flex items-center gap-2"
        >
          <Key className="w-4 h-4 text-zinc-950" aria-hidden="true" />
          <span>Your Gemini API Key</span>
          <span className="text-rose-700" aria-hidden="true">
            *
          </span>
        </label>
        <a
          href="https://aistudio.google.com/app/apikey"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-semibold text-zinc-950 hover:underline flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 rounded"
        >
          <span>Free Key from Google</span>
          <ExternalLink className="w-3 h-3" aria-hidden="true" />
        </a>
      </div>

      <div className="relative">
        <input
          id="apiKey"
          type={showKey ? "text" : "password"}
          value={apiKey}
          onChange={(e) => onKeyChange(e.target.value)}
          placeholder="AIzaSy... or AQ..."
          required
          aria-required="true"
          autoComplete="off"
          className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-950/30 focus:border-zinc-950 text-xs font-mono text-zinc-950 placeholder-zinc-500 pr-12"
        />
        <button
          type="button"
          onClick={onToggleShowKey}
          aria-label={showKey ? "Hide Gemini API key" : "Show Gemini API key"}
          aria-pressed={showKey}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-700 hover:text-zinc-950 px-2 py-1 rounded bg-zinc-100 border border-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950"
        >
          {showKey ? (
            <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
          ) : (
            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
          )}
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-600 pt-1">
        <label htmlFor="rememberKey" className="flex items-center gap-2 cursor-pointer select-none">
          <input
            id="rememberKey"
            type="checkbox"
            checked={rememberKey}
            onChange={(e) => onToggleRemember(e.target.checked)}
            className="rounded border-zinc-300 text-zinc-950 focus-visible:ring-2 focus-visible:ring-zinc-950 w-3.5 h-3.5 accent-zinc-950"
          />
          <span className="text-[11px] text-zinc-700">Save key in local browser storage</span>
        </label>

        <span className="text-[11px] text-zinc-700 font-mono flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-zinc-950" aria-hidden="true" />
          <span>Never stored on server</span>
        </span>
      </div>
    </div>
  );
};
