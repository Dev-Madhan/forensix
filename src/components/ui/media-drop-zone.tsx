"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  createHttpError,
  useMediaDrop,
  type MediaDropFile,
  type UseMediaDropOptions,
  type MediaDropValidator,
  type UploadTransport,
} from "react-mediadrop";
import { createXhrUploadTransport } from "react-mediadrop/xhr-upload";
import { cn } from "cn";
import {
  UploadCloud,
  FileText,
  FileVideo,
  FileImage,
  FileAudio,
  File,
  X,
  AlertCircle,
  Shield,
} from "lucide-react";
import {
  TIGRIS_UPLOAD_LIMITS,
  ALL_ALLOWED_MIME_TYPES,
  tigrisEvidenceValidator,
  getFileCategory,
} from "@/lib/evidence-upload-config";

export {
  TIGRIS_UPLOAD_LIMITS,
  ALL_ALLOWED_MIME_TYPES,
  tigrisEvidenceValidator,
  getFileCategory,
};

/**
 * 1. Basic Example
 */
export function BasicExample() {
  const { acceptedFiles, getRootProps, getInputProps, isDragActive } =
    useMediaDrop();

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-lg border-2 border-dashed px-6 py-10 text-center
          border-zinc-300 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400
          ${isDragActive ? "border-sky-500 bg-zinc-100 dark:bg-zinc-900" : ""}`}
      >
        <input {...getInputProps()} />
        <p>Drag files here, or click to browse</p>
      </div>
      {acceptedFiles.length > 0 && (
        <ul className="space-y-2">
          {acceptedFiles.map((file) => (
            <li
              key={file.id}
              className="flex items-start gap-2 rounded-md border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
            >
              <span className="truncate">{file.name}</span>
              <span className="text-xs text-zinc-500">
                {file.size.toLocaleString()} bytes
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * 2. Accepting File Types Example
 */
export function AcceptExample() {
  const { acceptedFiles, rejectedFiles, getRootProps, getInputProps } =
    useMediaDrop({ restrictions: { accept: ["image/png", "image/jpeg"] } });

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className="cursor-pointer rounded-lg border-2 border-dashed border-zinc-300 px-6 py-10 text-center dark:border-zinc-700"
      >
        <input {...getInputProps()} />
        <p>Drag files here, or click to browse</p>
      </div>
      <ul className="space-y-2">
        {acceptedFiles.map((file) => (
          <li
            key={file.id}
            className="rounded-md border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
          >
            {file.name} — {file.size.toLocaleString()} bytes
          </li>
        ))}
        {rejectedFiles.map((file) => (
          <li
            key={file.id}
            className="rounded-md border border-red-200 px-3 py-2 text-sm dark:border-red-900/60"
          >
            {file.name} — {file.size.toLocaleString()} bytes ·{" "}
            {file.errors.map((e) => e.message).join(", ")}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * 3. Max Files Example
 */
export function MaxFilesExample() {
  const { acceptedFiles, rejectedFiles, getRootProps, getInputProps } =
    useMediaDrop({ restrictions: { maxFiles: 3 } });

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className="cursor-pointer rounded-lg border-2 border-dashed border-zinc-300 px-6 py-10 text-center dark:border-zinc-700"
      >
        <input {...getInputProps()} />
        <p>Drag files here, or click to browse</p>
      </div>
      <ul className="space-y-2">
        {acceptedFiles.map((file) => (
          <li
            key={file.id}
            className="rounded-md border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
          >
            {file.name} — {file.size.toLocaleString()} bytes
          </li>
        ))}
        {rejectedFiles.map((file) => (
          <li
            key={file.id}
            className="rounded-md border border-red-200 px-3 py-2 text-sm dark:border-red-900/60"
          >
            {file.name} — {file.size.toLocaleString()} bytes ·{" "}
            {file.errors[0]?.message}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * 4. Custom Validator & Example
 */
export function noSpacesValidator(file: File) {
  if (file.name.includes(" ")) {
    return {
      code: "validator-error" as const,
      message: "Filenames can't contain spaces",
    };
  }
  return null;
}

export function ValidatorExample() {
  const { acceptedFiles, rejectedFiles, getRootProps, getInputProps } =
    useMediaDrop({ validator: noSpacesValidator });

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className="cursor-pointer rounded-lg border-2 border-dashed border-zinc-300 px-6 py-10 text-center dark:border-zinc-700"
      >
        <input {...getInputProps()} />
        <p>Drag files here, or click to browse</p>
      </div>
      <ul className="space-y-2">
        {acceptedFiles.map((file) => (
          <li
            key={file.id}
            className="rounded-md border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
          >
            {file.name} — {file.size.toLocaleString()} bytes
          </li>
        ))}
        {rejectedFiles.map((file) => (
          <li
            key={file.id}
            className="rounded-md border border-red-200 px-3 py-2 text-sm dark:border-red-900/60"
          >
            {file.name} — {file.size.toLocaleString()} bytes ·{" "}
            {file.errors?.[0]?.message}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * 5. Error Codes Inspection Example
 */
export function ErrorCodesExample({ transport }: { transport?: UploadTransport }) {
  const mediaDrop = useMediaDrop({
    restrictions: {
      accept: "image/*",
      minSize: 1024,
      maxSize: 2_000_000,
      maxFiles: 3,
    },
    validator: (file: File) =>
      file.name.includes(" ")
        ? { code: "validator-error" as const, message: "Filenames can't contain spaces" }
        : null,
    ...(transport ? { transport } : {}),
  });

  const { files, getRootProps, getInputProps } = mediaDrop;

  useEffect(() => {
    for (const file of files) {
      for (const error of file.errors) {
        console.log(error.code, error.message);
      }
      if (file.uploadError) {
        console.log(file.uploadError.code, file.uploadError.message);
      }
    }
  }, [files]);

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className="cursor-pointer rounded-lg border-2 border-dashed border-zinc-300 px-6 py-10 text-center dark:border-zinc-700"
      >
        <input {...getInputProps()} />
        <p>Drag images here (1KB - 2MB, max 3 files, no spaces)</p>
      </div>

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file) => {
            const hasErrors = file.errors.length > 0 || !!file.uploadError;
            return (
              <li
                key={file.id}
                className={cn(
                  "rounded-md border px-3 py-2 text-sm",
                  hasErrors
                    ? "border-red-200 bg-red-500/5 dark:border-red-900/60"
                    : "border-zinc-200 dark:border-zinc-800"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{file.name}</span>
                  <span className="text-xs text-zinc-500">
                    {file.size.toLocaleString()} bytes
                  </span>
                </div>
                {file.errors.map((error, idx) => (
                  <p key={idx} className="mt-1 text-xs text-red-500">
                    <span className="font-mono uppercase text-[10px] bg-red-500/10 px-1 py-0.5 rounded mr-1.5 font-semibold">
                      {error.code}
                    </span>
                    {error.message}
                  </p>
                ))}
                {file.uploadError && (
                  <p className="mt-1 text-xs text-amber-500">
                    <span className="font-mono uppercase text-[10px] bg-amber-500/10 px-1 py-0.5 rounded mr-1.5 font-semibold">
                      {file.uploadError.code}
                    </span>
                    {file.uploadError.message}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/**
 * 6. Drag States Example
 */
export function DragStatesExample() {
  const {
    acceptedFiles,
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
    isFocused,
    isDragGlobal,
  } = useMediaDrop({ restrictions: { accept: ["image/*"] } });

  return (
    <div className="w-full space-y-3">
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-lg border-2 border-dashed px-6 py-10 text-center
          border-zinc-300 dark:border-zinc-700
          ${isDragAccept ? "border-green-500" : ""}
          ${isDragReject ? "border-red-500" : ""}
          ${isDragActive && !isDragAccept && !isDragReject ? "border-sky-500" : ""}`}
      >
        <input {...getInputProps()} />
        <p>Drag an image here, or click to browse</p>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <span>isDragActive: {String(isDragActive)}</span>
        <span>isDragAccept: {String(isDragAccept)}</span>
        <span>isDragReject: {String(isDragReject)}</span>
        <span>isFocused: {String(isFocused)}</span>
        <span>isDragGlobal: {String(isDragGlobal)}</span>
      </div>

      <ul className="m-0 w-full list-none space-y-2 p-0">
        {acceptedFiles.map((file) => (
          <li key={file.id}>
            {file.name} — {file.size.toLocaleString()} bytes
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * 7. Opening the file dialog manually (FileDialogExample)
 */
export function FileDialogExample() {
  const { acceptedFiles, getRootProps, getInputProps, open } = useMediaDrop({
    noClick: true,
    noKeyboard: true,
  });

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className="rounded-lg border-2 border-dashed border-zinc-300 px-6 py-10 text-center dark:border-zinc-700"
      >
        <input {...getInputProps()} />
        <p>Drag files here — clicking the dropzone itself does nothing</p>
        <button
          type="button"
          onClick={open}
          className="mt-2 rounded bg-zinc-900 px-3 py-1.5 text-xs text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 cursor-pointer"
        >
          Choose files
        </button>
      </div>
      <ul className="space-y-2">
        {acceptedFiles.map((file) => (
          <li
            key={file.id}
            className="rounded-md border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
          >
            {file.name} — {file.size.toLocaleString()} bytes
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * 8. Styling Example
 */
export function StylingExample() {
  const {
    acceptedFiles,
    getRootProps,
    getInputProps,
    isFocused,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useMediaDrop({ restrictions: { accept: ["image/*"] } });

  const border = isDragAccept
    ? "border-green-500"
    : isDragReject
      ? "border-red-500"
      : isDragActive
        ? "border-sky-500"
        : isFocused
          ? "border-sky-600"
          : "border-zinc-300 dark:border-zinc-700";

  return (
    <div className="w-full space-y-3">
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-lg border-2 border-dashed px-6 py-10 text-center ${border}`}
      >
        <input {...getInputProps()} />
        <p>Drag an image here, or click to browse</p>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <span>isFocused: {String(isFocused)}</span>
        <span>isDragActive: {String(isDragActive)}</span>
        <span>isDragAccept: {String(isDragAccept)}</span>
        <span>isDragReject: {String(isDragReject)}</span>
      </div>

      <ul className="m-0 w-full list-none space-y-2 p-0">
        {acceptedFiles.map((file) => (
          <li key={file.id}>
            {file.name} — {file.size.toLocaleString()} bytes
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * 9. Event Propagation Example
 */
export function EventsExample() {
  const { acceptedFiles, getRootProps, getInputProps } = useMediaDrop();

  return (
    <div className="space-y-3">
      <div
        {...getRootProps({
          onDrop: (event) => {
            event.stopPropagation(); // skips react-mediadrop's own drop handling
          },
        })}
        className="cursor-pointer rounded-lg border-2 border-dashed border-zinc-300 px-6 py-10 text-center dark:border-zinc-700"
      >
        <input {...getInputProps()} />
        <p>Drag files here, or click to browse</p>
      </div>
      <ul className="space-y-2">
        {acceptedFiles.map((file) => (
          <li
            key={file.id}
            className="rounded-md border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
          >
            {file.name} — {file.size.toLocaleString()} bytes
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * 10. Upload Progress Transport & Example
 */
export const simulatedTransport: UploadTransport = {
  upload(file, { onProgress, signal }) {
    return new Promise((resolve, reject) => {
      const total = file.size;
      const durationMs = 1500;
      const start = performance.now();

      const onAbort = () => {
        clearInterval(interval);
        reject(createHttpError("Aborted"));
      };

      const interval = setInterval(() => {
        const elapsed = performance.now() - start;
        const loaded = Math.min(
          total,
          Math.round((elapsed / durationMs) * total)
        );
        onProgress({ loaded, total });

        if (elapsed >= durationMs) {
          clearInterval(interval);
          signal.removeEventListener("abort", onAbort);
          resolve({ response: { simulated: true } });
        }
      }, 100);

      signal.addEventListener("abort", onAbort, { once: true });
    });
  },
};

export function UploadProgressExample({
  transport = simulatedTransport,
}: {
  transport?: UploadTransport;
} = {}) {
  const { files, getRootProps, getInputProps, uploadFile } = useMediaDrop({
    transport,
  });

  useEffect(() => {
    for (const file of files) {
      if (file.status === "accepted" && file.uploadStatus === undefined) {
        uploadFile(file.id);
      }
    }
  }, [files, uploadFile]);

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className="cursor-pointer rounded-lg border-2 border-dashed border-zinc-300 px-6 py-10 text-center dark:border-zinc-700"
      >
        <input {...getInputProps()} />
        <p>Drag files here, or click to browse</p>
      </div>
      <ul className="space-y-2">
        {files.map((file) => (
          <li
            key={file.id}
            className="rounded-md border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
          >
            <div className="flex justify-between">
              <span>{file.name}</span>
              <span className="text-xs text-zinc-500">
                {file.size.toLocaleString()} bytes ·{" "}
                {file.uploadStatus ?? file.status}
              </span>
            </div>
            <progress
              className="mt-2 h-1.5 w-full rounded accent-sky-500"
              value={file.progress?.loaded ?? 0}
              max={file.progress?.total ?? file.size}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * 11. Cancel & Retry Example
 */
const failedOnce = new Set<string>();

export const cancelRetryTransport: UploadTransport = {
  upload(file, { onProgress, signal }) {
    return new Promise((resolve, reject) => {
      const total = file.size;
      const durationMs = 4000;
      const start = performance.now();

      const onAbort = () => {
        clearInterval(interval);
        reject(createHttpError("Aborted"));
      };

      const interval = setInterval(() => {
        const elapsed = performance.now() - start;
        const loaded = Math.min(
          total,
          Math.round((elapsed / durationMs) * total)
        );
        onProgress({ loaded, total });

        if (elapsed >= durationMs) {
          clearInterval(interval);
          signal.removeEventListener("abort", onAbort);
          if (!failedOnce.has(file.id)) {
            failedOnce.add(file.id);
            reject(createHttpError("Simulated upload failure", 500));
          } else {
            resolve({ response: { simulated: true } });
          }
        }
      }, 100);

      signal.addEventListener("abort", onAbort, { once: true });
    });
  },
};

export function CancelRetryExample() {
  const {
    files,
    getRootProps,
    getInputProps,
    uploadFile,
    cancelUpload,
    retryUpload,
  } = useMediaDrop({ transport: cancelRetryTransport });

  useEffect(() => {
    for (const file of files) {
      if (file.status === "accepted" && file.uploadStatus === undefined) {
        uploadFile(file.id);
      }
    }
  }, [files, uploadFile]);

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className="cursor-pointer rounded-lg border-2 border-dashed border-zinc-300 px-6 py-10 text-center dark:border-zinc-700"
      >
        <input {...getInputProps()} />
        <p>Drag files here, or click to browse</p>
      </div>
      <ul className="space-y-2">
        {files.map((file) => (
          <li
            key={file.id}
            className="rounded-md border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="truncate">{file.name}</span>
              <span className="text-xs text-zinc-500">
                {file.size.toLocaleString()} bytes ·{" "}
                {file.uploadStatus ?? file.status}
              </span>
              {(file.uploadStatus === "queued" ||
                file.uploadStatus === "uploading") && (
                  <button
                    type="button"
                    aria-label="Cancel"
                    onClick={() => cancelUpload(file.id)}
                    className="rounded p-1 text-xs text-red-500 hover:bg-red-500/10 cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              {file.uploadStatus === "error" && (
                <button
                  type="button"
                  aria-label="Retry"
                  onClick={() => retryUpload(file.id)}
                  className="rounded p-1 text-xs text-sky-500 hover:bg-sky-500/10 cursor-pointer"
                >
                  ↻
                </button>
              )}
            </div>
            <progress
              className="mt-2 h-1.5 w-full rounded accent-sky-500"
              value={file.progress?.loaded ?? 0}
              max={file.progress?.total ?? file.size}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * 12. Concurrency Limit Example
 */
export const concurrencyTransport: UploadTransport = {
  upload(file, { onProgress, signal }) {
    return new Promise((resolve, reject) => {
      const total = file.size;
      const durationMs = 2000;
      const start = performance.now();

      const onAbort = () => {
        clearInterval(interval);
        reject(createHttpError("Aborted"));
      };

      const interval = setInterval(() => {
        const elapsed = performance.now() - start;
        const loaded = Math.min(
          total,
          Math.round((elapsed / durationMs) * total)
        );
        onProgress({ loaded, total });

        if (elapsed >= durationMs) {
          clearInterval(interval);
          signal.removeEventListener("abort", onAbort);
          resolve({ response: { simulated: true } });
        }
      }, 100);

      signal.addEventListener("abort", onAbort, { once: true });
    });
  },
};

export function ConcurrencyExample() {
  const { files, getRootProps, getInputProps, uploadFile } = useMediaDrop({
    transport: concurrencyTransport,
    concurrency: 2,
  });

  useEffect(() => {
    for (const file of files) {
      if (file.status === "accepted" && file.uploadStatus === undefined) {
        uploadFile(file.id);
      }
    }
  }, [files, uploadFile]);

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className="cursor-pointer rounded-lg border-2 border-dashed border-zinc-300 px-6 py-10 text-center dark:border-zinc-700"
      >
        <input {...getInputProps()} />
        <p>Drop several files at once</p>
      </div>
      <ul className="space-y-2">
        {files.map((file) => (
          <li
            key={file.id}
            className="rounded-md border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="truncate">{file.name}</span>
              <span className="text-xs text-zinc-500">
                {file.size.toLocaleString()} bytes ·{" "}
                {file.uploadStatus ?? file.status}
              </span>
            </div>
            <progress
              className="mt-2 h-1.5 w-full rounded accent-sky-500"
              value={file.progress?.loaded ?? 0}
              max={file.progress?.total ?? file.size}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * 13. Presigned URL Upload Example
 */
export function PresignedUploadExample() {
  const [urls, setUrls] = useState<Record<string, string>>({});
  const requested = useRef(new Set<string>());

  const transport = createXhrUploadTransport({
    formData: false, // send the raw file body, not multipart/form-data
    endpoint: (file) => urls[file.id],
  });

  const { files, getRootProps, getInputProps, uploadFile } = useMediaDrop({
    transport,
  });

  useEffect(() => {
    for (const file of files) {
      if (
        file.status === "accepted" &&
        file.uploadStatus === undefined &&
        !requested.current.has(file.id)
      ) {
        requested.current.add(file.id);
        fetch(`/api/presign?filename=${encodeURIComponent(file.name)}`)
          .then((response) => response.json())
          .then(({ url }) => {
            setUrls((previous) => ({ ...previous, [file.id]: url }));
            uploadFile(file.id);
          })
          .catch((err) => {
            console.error("Presign fetch error:", err);
          });
      }
    }
  }, [files, uploadFile]);

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className="cursor-pointer rounded-lg border-2 border-dashed border-zinc-300 px-6 py-10 text-center dark:border-zinc-700"
      >
        <input {...getInputProps()} />
        <p>Drag files here, or click to browse</p>
      </div>
      <ul className="space-y-2">
        {files.map((file) => (
          <li
            key={file.id}
            className="rounded-md border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-800"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="truncate">{file.name}</span>
              <span className="text-xs text-zinc-500">
                {file.uploadStatus ?? file.status}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export interface MediaDropZoneProps {
  onFilesChange?: (files: File[]) => void;
  onAcceptedFilesChange?: (acceptedFiles: MediaDropFile[]) => void;
  accept?: string | string[];
  minSize?: number;
  maxSize?: number;
  maxFiles?: number;
  validator?: MediaDropValidator;
  className?: string;
  dropzoneClassName?: string;
  title?: string;
  description?: string;
  disabled?: boolean;
  showFileList?: boolean;
  options?: Partial<UseMediaDropOptions>;
}

export function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function getFileIcon(fileName: string, mimeType?: string) {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  const type = (mimeType || "").toLowerCase();

  if (type.startsWith("image/") || ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) {
    return <FileImage className="size-4 text-emerald-500 shrink-0" />;
  }
  if (type.startsWith("video/") || ["mp4", "mov", "avi", "mkv", "webm"].includes(ext)) {
    return <FileVideo className="size-4 text-sky-500 shrink-0" />;
  }
  if (type.startsWith("audio/") || ["mp3", "wav", "ogg", "flac", "m4a"].includes(ext)) {
    return <FileAudio className="size-4 text-purple-500 shrink-0" />;
  }
  if (type.includes("pdf") || ["pdf", "doc", "docx", "txt", "rtf", "md"].includes(ext)) {
    return <FileText className="size-4 text-amber-500 shrink-0" />;
  }
  return <File className="size-4 text-muted-foreground shrink-0" />;
}

export function MediaDropZone({
  onFilesChange,
  onAcceptedFilesChange,
  accept = ALL_ALLOWED_MIME_TYPES,
  minSize = TIGRIS_UPLOAD_LIMITS.MIN_FILE_SIZE_BYTES,
  maxSize = TIGRIS_UPLOAD_LIMITS.VIDEO.maxSizeBytes,
  maxFiles = TIGRIS_UPLOAD_LIMITS.MAX_BATCH_FILES,
  validator = tigrisEvidenceValidator,
  className,
  dropzoneClassName,
  title = "Drag files here, or click to browse",
  description = "Photos up to 5 MB · Videos up to 40 MB · Audio & Docs up to 10 MB",
  disabled = false,
  showFileList = true,
  options,
}: MediaDropZoneProps) {
  const mediaDrop = useMediaDrop({
    restrictions: {
      accept,
      minSize,
      maxSize,
      maxFiles,
    },
    validator,
    noClick: disabled,
    noDrag: disabled,
    noKeyboard: disabled,
    ...options,
  });

  const {
    acceptedFiles,
    rejectedFiles,
    getRootProps,
    getInputProps,
    isFocused,
    isDragActive,
    isDragAccept,
    isDragReject,
    removeFile,
  } = mediaDrop;

  useEffect(() => {
    if (onAcceptedFilesChange) {
      onAcceptedFilesChange(acceptedFiles);
    }
    if (onFilesChange) {
      onFilesChange(acceptedFiles.map((item) => item.file));
    }
  }, [acceptedFiles, onAcceptedFilesChange, onFilesChange]);

  const borderClass = isDragAccept
    ? "border-green-500 bg-green-500/10 dark:bg-green-500/15 ring-2 ring-green-500/20 scale-[1.01]"
    : isDragReject
      ? "border-red-500 bg-red-500/10 dark:bg-red-500/15 ring-2 ring-red-500/20 scale-[1.01]"
      : isDragActive
        ? "border-sky-500 bg-sky-500/10 dark:bg-sky-500/15 ring-2 ring-sky-500/20 scale-[1.01]"
        : isFocused
          ? "border-sky-600 dark:border-sky-500 ring-2 ring-sky-500/20"
          : "border-zinc-300 dark:border-zinc-700/80 bg-zinc-50/50 dark:bg-zinc-900/40 text-zinc-500 dark:text-zinc-400 hover:border-sky-500/70 hover:bg-zinc-100/70 dark:hover:border-sky-500/60 dark:hover:bg-zinc-900/80";

  return (
    <div className={cn("space-y-3 w-full", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "cursor-pointer rounded-xl border-2 border-dashed px-5 py-7 text-center transition-all duration-200 select-none",
          borderClass,
          disabled && "opacity-50 pointer-events-none cursor-not-allowed",
          dropzoneClassName
        )}
      >
        <input {...getInputProps()} disabled={disabled} />
        <div className="flex flex-col items-center justify-center gap-2.5">
          <div
            className={cn(
              "size-10 rounded-full flex items-center justify-center transition-transform duration-200",
              isDragAccept
                ? "bg-green-500/20 text-green-500 scale-110"
                : isDragReject
                  ? "bg-red-500/20 text-red-500 scale-110"
                  : isDragActive
                    ? "bg-sky-500/20 text-sky-500 scale-110"
                    : isFocused
                      ? "bg-sky-600/20 text-sky-600 scale-105"
                      : "bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
            )}
          >
            <UploadCloud className="size-5" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              {isDragAccept
                ? "Release to attach files"
                : isDragReject
                  ? "File type or size not supported"
                  : isDragActive
                    ? "Drop files to attach"
                    : title}
            </p>
            {description && (
              <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Rejected files error notice with detailed reasons & codes */}
      {rejectedFiles.length > 0 && (
        <ul className="space-y-1.5">
          {rejectedFiles.map((file) => (
            <li
              key={file.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-500/10 px-3 py-2 text-xs text-red-600 dark:text-red-400"
            >
              <div className="flex items-center gap-2 min-w-0">
                <AlertCircle className="size-3.5 shrink-0 text-red-500" />
                <span className="truncate font-medium">{file.name}</span>
                <span className="text-[10px] opacity-75 shrink-0">
                  ({formatFileSize(file.size)})
                </span>
                <span className="text-[11px] opacity-90 truncate">
                  · {file.errors.map((e) => `${e.code ? `[${e.code}] ` : ""}${e.message}`).join(", ")}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Accepted files list */}
      {showFileList && acceptedFiles.length > 0 && (
        <ul className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {acceptedFiles.map((file) => (
            <li
              key={file.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 px-3 py-2 text-xs transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {getFileIcon(file.name, file.type)}
                <div className="min-w-0">
                  <p className="font-medium text-zinc-800 dark:text-zinc-200 truncate max-w-[220px] sm:max-w-[320px]">
                    {file.name}
                  </p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(file.id);
                }}
                className="text-zinc-400 hover:text-red-500 p-1 rounded-md transition-colors cursor-pointer"
                title="Remove file"
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
