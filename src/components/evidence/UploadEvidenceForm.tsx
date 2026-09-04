"use client";

import { useState } from "react";
import { uploadEvidence } from "@/features/evidence/actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";

export function UploadEvidenceForm({ caseId }: { caseId: string }) {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    // Example client-side validation
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error("File size must be under 10MB");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("caseId", caseId);
    formData.append("file", file);

    const res = await uploadEvidence(formData);
    
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Evidence uploaded successfully");
      setFile(null);
      // Reset form
      (e.target as HTMLFormElement).reset();
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4 border border-dashed rounded-md p-4 bg-muted/20">
      <div className="space-y-2">
        <Label htmlFor="evidence-file" className="font-semibold">Select Evidence File</Label>
        <Input 
          id="evidence-file" 
          type="file" 
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          accept="image/*,application/pdf"
        />
        <p className="text-xs text-muted-foreground mt-1">Supported formats: Images, PDF. Max size: 10MB.</p>
      </div>

      <Button type="submit" disabled={loading || !file} size="sm" className="w-fit">
        <Upload className="w-4 h-4 mr-2" />
        {loading ? "Uploading..." : "Upload File"}
      </Button>
    </form>
  );
}
