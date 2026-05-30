"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

function parseCSV(text: string) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/\s+/g, ""));
  const headerMap: Record<string, string> = {
    firstname: "firstName",
    lastname: "lastName",
    email: "email",
    company: "company",
    title: "title",
    jobtitle: "title",
    linkedinurl: "linkedinUrl",
    linkedin: "linkedinUrl",
  };

  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      const key = headerMap[h];
      if (key) row[key] = values[i] ?? "";
    });
    return row;
  });
}

export function ImportLeadsButton({
  campaignId,
  onImported,
}: {
  campaignId: string;
  onImported: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const leads = parseCSV(text);
    if (leads.length === 0) {
      setStatus("No valid rows found in CSV.");
      return;
    }

    setLoading(true);
    setStatus("");
    try {
      const res = await fetch("/api/leads/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId, leads }),
      });
      const json = await res.json();
      if (res.ok) {
        setStatus(`Imported ${json.count} leads.`);
        onImported();
      } else {
        setStatus("Import failed. Check CSV format.");
      }
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
      <Button
        size="sm"
        variant="outline"
        disabled={loading}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="h-4 w-4 mr-1" />
        {loading ? "Importing…" : "Import CSV"}
      </Button>
      {status && <span className="text-xs text-muted-foreground">{status}</span>}
    </div>
  );
}
