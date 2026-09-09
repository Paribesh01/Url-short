"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createShortUrl, ApiError } from "@/lib/api";
import type { ShortUrl } from "@/types";
import { toast } from "sonner";

interface CreateUrlFormProps {
  onCreated: (url: ShortUrl) => void;
}

export function CreateUrlForm({ onCreated }: CreateUrlFormProps) {
  const [url, setUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    try {
      const shortUrl = await createShortUrl({
        url: url.trim(),
        custom_code: customCode.trim() || undefined,
        title: title.trim() || undefined,
      });
      onCreated(shortUrl);
      toast.success("Short link created", { description: shortUrl.short_url });
      setUrl("");
      setCustomCode("");
      setTitle("");
      setShowAdvanced(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to create short link.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a short link</CardTitle>
        <CardDescription>Paste a URL, optionally set a custom code and title.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="url">Destination URL</Label>
              <Input
                id="url"
                type="url"
                required
                placeholder="https://example.com/a-very-long-path"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={loading} className="gap-2 sm:w-auto w-full">
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                Create
              </Button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            {showAdvanced ? "Hide options" : "Custom code & title (optional)"}
          </button>

          {showAdvanced && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="custom-code">Custom code</Label>
                <Input
                  id="custom-code"
                  placeholder="my-link"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Launch announcement"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
