"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  SELLER_LOTS_STORAGE_KEY,
  createLotId,
  type SellerLot,
  type SellerLotStatus,
} from "@/lib/seller-lots";
import { countUserCreatedLots } from "@/lib/seller-lots-store";
import {
  FREE_SELLER_LOT_LIMIT,
  getLotQuota,
  lotLimitReachedMessage,
} from "@/lib/seller-plan";

const CONDITIONS = ["New", "Good", "Fair", "Mixed", "For parts"] as const;

const inputClass =
  "mt-1.5 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]";

const labelClass = "block text-sm font-medium text-[var(--ink)]";

async function fileToCompressedDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const maxEdge = 1200;
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return URL.createObjectURL(file);
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.78);
}

function readLots(): SellerLot[] {
  try {
    const raw = localStorage.getItem(SELLER_LOTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SellerLot[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLots(lots: SellerLot[]) {
  localStorage.setItem(SELLER_LOTS_STORAGE_KEY, JSON.stringify(lots));
}

export default function AddLotForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [condition, setCondition] = useState<string>("Good");
  const [models, setModels] = useState("");
  const [includes, setIncludes] = useState("");
  const [bidDeadline, setBidDeadline] = useState("");
  const [status, setStatus] = useState<SellerLotStatus>("Draft");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [usedLots, setUsedLots] = useState(0);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    const used = countUserCreatedLots();
    setUsedLots(used);
    const quota = getLotQuota(used);
    setIsPro(quota.plan === "pro");
    setBlocked(!quota.canAddLot);
  }, []);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    setUploading(true);
    try {
      const next: string[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          setError("Only image files can be uploaded.");
          continue;
        }
        if (file.size > 12 * 1024 * 1024) {
          setError("Each photo must be under 12MB.");
          continue;
        }
        next.push(await fileToCompressedDataUrl(file));
      }
      setImages((prev) => [...prev, ...next].slice(0, 8));
    } catch {
      setError("Could not process one or more images. Try a different file.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const quota = getLotQuota(countUserCreatedLots());
    if (!quota.canAddLot) {
      setBlocked(true);
      setError(lotLimitReachedMessage());
      return;
    }

    const qty = Number.parseInt(quantity, 10);
    if (!title.trim()) {
      setError("Add a title for this lot.");
      return;
    }
    if (!description.trim()) {
      setError("Add a description so buyers know what they are bidding on.");
      return;
    }
    if (!Number.isFinite(qty) || qty < 1) {
      setError("Quantity must be at least 1.");
      return;
    }
    if (images.length === 0) {
      setError("Upload at least one photo of the items.");
      return;
    }

    setSaving(true);
    try {
      const lot: SellerLot = {
        id: createLotId(),
        title: title.trim(),
        description: description.trim(),
        quantity: qty,
        condition,
        models: models.trim(),
        includes: includes.trim(),
        bidDeadline,
        status,
        bids: 0,
        images,
        createdAt: new Date().toISOString(),
      };
      const existing = readLots();
      if (existing.length >= FREE_SELLER_LOT_LIMIT && quota.plan === "free") {
        setError(lotLimitReachedMessage());
        setSaving(false);
        setBlocked(true);
        return;
      }
      writeLots([lot, ...existing]);
      window.dispatchEvent(new Event("harbor-inventory-updated"));
      router.push("/dashboard/seller");
      router.refresh();
    } catch {
      setError(
        "Could not save this lot. Photos may be too large for local storage—try fewer or smaller images."
      );
      setSaving(false);
    }
  }

  if (blocked) {
    return (
      <div className="border border-[var(--border)] bg-white p-6">
        <h2 className="text-lg font-semibold text-[var(--ink)]">
          Lot limit reached
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {lotLimitReachedMessage()}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/pricing"
            className="rounded-md bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-dark)]"
          >
            Upgrade to Pro
          </Link>
          <Link
            href="/dashboard/seller"
            className="rounded-md border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--mist)]"
          >
            Back to seller admin
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-8">
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <p className="text-sm text-[var(--muted)]">
        {isPro
          ? "Pro plan: you can add unlimited device lots."
          : `Free plan: ${usedLots} / ${FREE_SELLER_LOT_LIMIT} device lots used. Upgrade to Pro for unlimited lots.`}
      </p>

      <section className="border border-[var(--border)] bg-white p-6">
        <h2 className="text-lg font-semibold text-[var(--ink)]">Photos</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Upload clear photos of the devices. The first image is used as the
          thumbnail. Up to 8 images.
        </p>

        <div className="mt-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            id="lot-photos"
            onChange={(e) => void handleFiles(e.target.files)}
          />
          <label
            htmlFor="lot-photos"
            className="flex cursor-pointer flex-col items-center justify-center border border-dashed border-[var(--border)] bg-[var(--mist)] px-4 py-10 text-center transition hover:border-[var(--accent)]"
          >
            <span className="text-sm font-semibold text-[var(--ink)]">
              {uploading ? "Processing photos…" : "Click to upload photos"}
            </span>
            <span className="mt-1 text-xs text-[var(--muted)]">
              JPG, PNG, or WebP · drag-and-drop also works in most browsers
            </span>
          </label>
        </div>

        {images.length > 0 && (
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {images.map((src, index) => (
              <li
                key={`${index}-${src.slice(0, 24)}`}
                className="relative overflow-hidden border border-[var(--border)] bg-[var(--mist)]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Lot photo ${index + 1}`}
                  className="aspect-square w-full object-cover"
                />
                {index === 0 && (
                  <span className="absolute left-2 top-2 bg-[var(--accent)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                    Cover
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute right-2 top-2 bg-white/90 px-2 py-0.5 text-xs font-medium text-[var(--ink)] hover:bg-white"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="border border-[var(--border)] bg-white p-6">
        <h2 className="text-lg font-semibold text-[var(--ink)]">
          Lot details
        </h2>
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="title" className={labelClass}>
              Title
            </label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Chromebooks · Grade 6–8 fleet"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label htmlFor="description" className={labelClass}>
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="Describe the items, condition notes, wipe status, packaging, and anything buyers should know."
              className={inputClass}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="quantity" className={labelClass}>
                Quantity
              </label>
              <input
                id="quantity"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label htmlFor="condition" className={labelClass}>
                Condition
              </label>
              <select
                id="condition"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className={inputClass}
              >
                {CONDITIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="models" className={labelClass}>
              Models / specs
            </label>
            <input
              id="models"
              value={models}
              onChange={(e) => setModels(e.target.value)}
              placeholder="e.g. Lenovo 100e Gen 3 · mixed 2021–2023"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="includes" className={labelClass}>
              What&apos;s included
            </label>
            <input
              id="includes"
              value={includes}
              onChange={(e) => setIncludes(e.target.value)}
              placeholder="e.g. Devices only · chargers sold separately"
              className={inputClass}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="deadline" className={labelClass}>
                Bid deadline
              </label>
              <input
                id="deadline"
                type="date"
                value={bidDeadline}
                onChange={(e) => setBidDeadline(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="status" className={labelClass}>
                Listing status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as SellerLotStatus)}
                className={inputClass}
              >
                <option value="Draft">Draft</option>
                <option value="Accepting bids">Accepting bids</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={saving || uploading}
          className="rounded-md bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-dark)] disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save lot"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/dashboard/seller")}
          className="rounded-md border border-[var(--border)] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--mist)]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
