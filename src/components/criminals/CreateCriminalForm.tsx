"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createCriminal, uploadMugshot } from "@/features/criminals/actions";
import { CriminalStatus } from "@prisma/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, User, X } from "lucide-react";

export function CreateCriminalForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mugshotFile, setMugshotFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }
      setMugshotFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setMugshotFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    let uploadedMugshotKey: string | undefined = undefined;

    // If a mugshot was selected, upload it to Tigris S3
    if (mugshotFile) {
      const mugshotData = new FormData();
      mugshotData.append("file", mugshotFile);
      const uploadRes = await uploadMugshot(mugshotData);

      if (uploadRes.error) {
        toast.error(`Mugshot upload failed: ${uploadRes.error}`);
        setLoading(false);
        return;
      }
      uploadedMugshotKey = uploadRes.storageKey;
    }

    const formData = new FormData(e.currentTarget);
    const data = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      alias: formData.get("alias") || undefined,
      dateOfBirth: formData.get("dateOfBirth") || undefined,
      gender: formData.get("gender") || undefined,
      nationality: formData.get("nationality") || undefined,
      address: formData.get("address") || undefined,
      description: formData.get("description") || undefined,
      status: formData.get("status"),
      lastKnownLocation: formData.get("lastKnownLocation") || undefined,
      mugshotUrl: uploadedMugshotKey,
    };

    const res = await createCriminal(data);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Criminal record created");
      router.push(`/dashboard/criminals/${res.data?.id}`);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-card border border-border/80 rounded-xl p-6 shadow-xs">
      {/* Mugshot Image Picker */}
      <div className="space-y-2">
        <Label>Mugshot / Subject Photograph</Label>
        <div className="flex items-center gap-5">
          <div className="relative w-24 h-24 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted/40 overflow-hidden shrink-0">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="Mugshot Preview" className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-muted-foreground/60" />
            )}
            {previewUrl && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white hover:bg-black transition"
                title="Remove Image"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="mugshot-input"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-input bg-background text-xs font-medium text-foreground hover:bg-muted cursor-pointer transition"
            >
              <Camera className="w-3.5 h-3.5" />
              {previewUrl ? "Change Photo" : "Upload Mugshot"}
            </label>
            <input
              id="mugshot-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
            <p className="text-[11px] text-muted-foreground">
              JPG, PNG, or WEBP up to 5MB. Uploaded securely to Tigris S3.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="firstName">First Name *</Label>
          <Input id="firstName" name="firstName" required placeholder="Legal first name" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input id="lastName" name="lastName" required placeholder="Legal last name" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="alias">Known Alias(es)</Label>
          <Input id="alias" name="alias" placeholder="e.g. The Ghost, Jimmy" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input id="dateOfBirth" name="dateOfBirth" type="date" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="gender">Gender</Label>
          <Input id="gender" name="gender" placeholder="e.g. Male, Female, Non-binary" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="nationality">Nationality</Label>
          <Input id="nationality" name="nationality" placeholder="e.g. United States" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="address">Registered Address</Label>
        <Input id="address" name="address" placeholder="Residential or last verified address" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="lastKnownLocation">Last Known Location</Label>
        <Input id="lastKnownLocation" name="lastKnownLocation" placeholder="City, district, or GPS coordinate" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Physical Description & Identifying Marks</Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          placeholder="Height, eye color, tattoos, scars, distinctive behavioral patterns..."
        />
      </div>

      <div className="space-y-1.5 max-w-xs">
        <Label htmlFor="status">Subject Status</Label>
        <select
          id="status"
          name="status"
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          defaultValue={CriminalStatus.ACTIVE}
        >
          {Object.values(CriminalStatus).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="pt-2 border-t border-border/60 flex justify-end gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Creating Profile..." : "Save Criminal Record"}
        </Button>
      </div>
    </form>
  );
}
