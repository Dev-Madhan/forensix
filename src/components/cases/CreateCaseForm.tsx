"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCase } from "@/features/cases/actions";
import { CaseStatus, CasePriority } from "@prisma/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function CreateCaseForm({ currentUserId }: { currentUserId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title"),
      description: formData.get("description"),
      status: formData.get("status"),
      priority: formData.get("priority"),
      assignedToId: currentUserId, // For simplicity, assigning to current user initially
    };

    const res = await createCase(data);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Case created successfully");
      router.push(`/dashboard/cases/${res.data?.id}`);
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required placeholder="e.g. Robbery at 5th Ave" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" placeholder="Initial details about the case..." rows={4} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            defaultValue={CaseStatus.OPEN}
          >
            {Object.values(CaseStatus).map((s) => (
              <option key={String(s)} value={String(s)}>
                {String(s).replace("_", " ")}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <select
            id="priority"
            name="priority"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            defaultValue={CasePriority.MEDIUM}
          >
            {Object.values(CasePriority).map((p) => (
              <option key={String(p)} value={String(p)}>
                {String(p)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Case"}
      </Button>
    </form>
  );
}
