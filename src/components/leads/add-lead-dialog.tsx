"use client";

import { useState } from "react";
import { z } from "zod";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

const schema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  email: z.string().email("Invalid email"),
  company: z.string().min(1, "Required"),
  title: z.string().min(1, "Required"),
  linkedinUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
});

type FieldErrors = Partial<Record<keyof z.infer<typeof schema>, string[]>>;

export function AddLeadDialog({
  campaignId,
  onAdded,
}: {
  campaignId: string;
  onAdded: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      firstName: fd.get("firstName") as string,
      lastName: fd.get("lastName") as string,
      email: fd.get("email") as string,
      company: fd.get("company") as string,
      title: fd.get("title") as string,
      linkedinUrl: fd.get("linkedinUrl") as string,
    };

    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...parsed.data, campaignId }),
      });
      if (res.ok) {
        setOpen(false);
        onAdded();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={cn(buttonVariants({ size: "sm" }))}>
        <Plus className="h-4 w-4 mr-1" /> Add Lead
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Lead</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" name="firstName" />
              {errors.firstName && (
                <p className="text-xs text-destructive">{errors.firstName[0]}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" name="lastName" />
              {errors.lastName && (
                <p className="text-xs text-destructive">{errors.lastName[0]}</p>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" />
            {errors.email && <p className="text-xs text-destructive">{errors.email[0]}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="company">Company</Label>
              <Input id="company" name="company" />
              {errors.company && (
                <p className="text-xs text-destructive">{errors.company[0]}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="title">Job Title</Label>
              <Input id="title" name="title" />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title[0]}</p>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="linkedinUrl">LinkedIn URL (optional)</Label>
            <Input id="linkedinUrl" name="linkedinUrl" placeholder="https://linkedin.com/in/…" />
            {errors.linkedinUrl && (
              <p className="text-xs text-destructive">{errors.linkedinUrl[0]}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Adding…" : "Add Lead"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
