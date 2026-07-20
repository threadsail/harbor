"use client";

import { useEffect, useState } from "react";

type CopyGalleryLinkProps = {
  path: string;
};

export default function CopyGalleryLink({ path }: CopyGalleryLinkProps) {
  const [fullUrl, setFullUrl] = useState(path);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setFullUrl(`${window.location.origin}${path}`);
  }, [path]);

  async function handleCopy() {
    const url = `${window.location.origin}${path}`;
    setFullUrl(url);

    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }

    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={handleCopy}
        className="group w-full break-all rounded-md border border-[var(--border)] bg-[var(--mist)] px-4 py-3 text-left font-mono text-sm text-[var(--accent)] transition hover:border-[var(--accent)] hover:bg-white"
        title="Click to copy full URL"
      >
        {fullUrl}
      </button>
      <p className="mt-2 text-xs text-[var(--muted)]">
        {copied
          ? "Copied full URL to clipboard."
          : "Click the link to copy the full URL. Anyone with it can open the seller inventory after signing in."}
      </p>
    </div>
  );
}
