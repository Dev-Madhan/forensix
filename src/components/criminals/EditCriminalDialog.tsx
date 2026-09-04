"use client";

import React, { useState } from "react";
import { updateCriminal, uploadMugshot } from "@/features/criminals/actions";
import { CriminalStatus } from "@prisma/client";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Edit, Save, Camera } from "lucide-react";

interface EditCriminalDialogProps {
  criminal: {
    id: string;
    criminalId: string;
    firstName: string;
    lastName: string;
    alias: string | null;
    dateOfBirth: Date | string | null;
    gender: string | null;
    nationality: string | null;
    address: string | null;
    lastKnownLocation: string | null;
    description: string | null;
    status: CriminalStatus;
    mugshotUrl: string | null;
  };
}

export function EditCriminalDialog({ criminal }: EditCriminalDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [firstName, setFirstName] = useState(criminal.firstName);
  const [lastName, setLastName] = useState(criminal.lastName);
  const [alias, setAlias] = useState(criminal.alias || "");
  const [dateOfBirth, setDateOfBirth] = useState(
    criminal.dateOfBirth ? new Date(criminal.dateOfBirth).toISOString().split("T")[0] : ""
  );
  const [gender, setGender] = useState(criminal.gender || "");
  const [nationality, setNationality] = useState(criminal.nationality || "");
  const [address, setAddress] = useState(criminal.address || "");
  const [lastKnownLocation, setLastKnownLocation] = useState(criminal.lastKnownLocation || "");
  const [description, setDescription] = useState(criminal.description || "");
  const [status, setStatus] = useState<CriminalStatus>(criminal.status);
  const [newMugshotFile, setNewMugshotFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    let mugshotKey = criminal.mugshotUrl || undefined;

    if (newMugshotFile) {
      const mugshotData = new FormData();
      mugshotData.append("file", newMugshotFile);
      const uploadRes = await uploadMugshot(mugshotData);

      if (uploadRes.error) {
        toast.error(`Failed to upload photo: ${uploadRes.error}`);
        setLoading(false);
        return;
      }
      mugshotKey = uploadRes.storageKey;
    }

    const res = await updateCriminal({
      id: criminal.id,
      firstName,
      lastName,
      alias: alias || undefined,
      dateOfBirth: dateOfBirth || undefined,
      gender: gender || undefined,
      nationality: nationality || undefined,
      address: address || undefined,
      lastKnownLocation: lastKnownLocation || undefined,
      description: description || undefined,
      status,
      mugshotUrl: mugshotKey,
    });

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Criminal record updated");
      setIsOpen(false);
    }

    setLoading(false);
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        <Edit className="w-3.5 h-3.5 mr-1.5" />
        Edit Profile
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => !loading && setIsOpen(false)}
        title={`Edit Profile: ${criminal.firstName} ${criminal.lastName}`}
        description={`Record ID: ${criminal.criminalId}`}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-first-name">First Name *</Label>
              <Input
                id="edit-first-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-last-name">Last Name *</Label>
              <Input
                id="edit-last-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-alias">Known Aliases</Label>
              <Input
                id="edit-alias"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-status">Status</Label>
              <select
                id="edit-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as CriminalStatus)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {Object.values(CriminalStatus).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-dob">Date of Birth</Label>
              <Input
                id="edit-dob"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-gender">Gender</Label>
              <Input
                id="edit-gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-nat">Nationality</Label>
              <Input
                id="edit-nat"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-loc">Last Known Location</Label>
              <Input
                id="edit-loc"
                value={lastKnownLocation}
                onChange={(e) => setLastKnownLocation(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-addr">Registered Address</Label>
            <Input
              id="edit-addr"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-desc">Physical Description & Marks</Label>
            <Textarea
              id="edit-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-1.5 p-3 rounded-lg border border-border/60 bg-muted/20">
            <Label htmlFor="edit-mugshot">Update Photo / Mugshot</Label>
            <div className="flex items-center gap-2 mt-1">
              <label
                htmlFor="edit-mugshot"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-input bg-background text-xs font-medium cursor-pointer hover:bg-muted transition"
              >
                <Camera className="w-3.5 h-3.5" />
                {newMugshotFile ? newMugshotFile.name : "Choose New Photo"}
              </label>
              <input
                id="edit-mugshot"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setNewMugshotFile(e.target.files?.[0] || null)}
              />
              {newMugshotFile && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setNewMugshotFile(null)}
                  className="text-xs h-7"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loading}
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              <Save className="w-3.5 h-3.5 mr-1.5" />
              {loading ? "Saving..." : "Save Record"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
