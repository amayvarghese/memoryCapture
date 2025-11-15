"use client";

import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";

type FacingMode = "user" | "environment";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-zinc-100 px-4 pb-14 pt-8 text-zinc-900 dark:from-black dark:via-zinc-900 dark:to-black dark:text-zinc-100 sm:px-6 md:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 sm:gap-10">
        <header className="flex flex-col gap-2 sm:gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-zinc-500 sm:text-sm">
            MemoryPhoto · Camera Anywhere
          </p>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-5xl">
            Capture memories on laptop or phone without any native app.
          </h1>
          <p className="text-base text-zinc-600 dark:text-zinc-300 sm:text-lg">
            Give your browser camera permission, snap a photo, download it
            instantly, or upload an existing picture. Works on modern desktop
            browsers, iOS Safari, and Android Chrome.
          </p>
        </header>

        <CameraStudio />

        <section className="rounded-2xl border border-zinc-200 bg-white/80 p-4 shadow-lg shadow-zinc-800/5 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70 sm:p-6">
          <h2 className="text-2xl font-semibold">How to deploy</h2>
          <ol className="mt-4 space-y-3 text-base text-zinc-700 dark:text-zinc-300">
            <li>
              <span className="font-semibold text-zinc-900 dark:text-white">
                1. Push to GitHub
              </span>
              : inside the `web` folder run `git remote add origin YOUR_REPO_URL`,
              then `git push -u origin main`.
            </li>
            <li>
              <span className="font-semibold text-zinc-900 dark:text-white">
                2. Import in Vercel
              </span>
              : choose the GitHub repo, keep the `web` folder as the root (or set
              it via “Monorepo configuration”), and use the default build command
              `npm run build`.
            </li>
            <li>
              <span className="font-semibold text-zinc-900 dark:text-white">
                3. Camera permissions
              </span>
              : Vercel serves the site over HTTPS so mobile browsers will allow
              camera access. You’re ready to share the link.
            </li>
          </ol>
        </section>
      </div>
    </main>
  );
}

function CameraStudio() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [facingMode, setFacingMode] = useState<FacingMode>("environment");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoMeta, setPhotoMeta] = useState<{ width: number; height: number } | null>(null);

  const mediaSupported = useMemo(() => {
    if (typeof navigator === "undefined") {
      return false;
    }
    return Boolean(navigator.mediaDevices?.getUserMedia);
  }, []);

  const stopStream = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const stream = video.srcObject as MediaStream | null;
    stream?.getTracks().forEach((track) => track.stop());
    video.srcObject = null;
    setIsStreaming(false);
  }, []);

  const startCamera = useCallback(
    async (mode: FacingMode) => {
      if (!mediaSupported) return;
      setIsLoading(true);
      setError(null);
      try {
        stopStream();
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });

        const video = videoRef.current;
        if (!video) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        video.srcObject = stream;
        await video.play();
        setIsStreaming(true);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Camera access failed. Please check permissions.";
        setError(message);
        setIsStreaming(false);
      } finally {
        setIsLoading(false);
      }
    },
    [mediaSupported, stopStream],
  );

  useEffect(() => {
    if (!mediaSupported) return;
    startCamera(facingMode);

    return () => {
      stopStream();
    };
  }, [mediaSupported, facingMode, startCamera, stopStream]);

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !isStreaming) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setPhoto(dataUrl);
    setPhotoMeta({ width: canvas.width, height: canvas.height });
  };

  const downloadPhoto = () => {
    if (!photo) return;
    const link = document.createElement("a");
    link.href = photo;
    link.download = `memory-${Date.now()}.jpeg`;
    link.click();
  };

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPhoto(result);
      const img = new window.Image();
      img.onload = () => {
        setPhotoMeta({ width: img.width, height: img.height });
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const clearPhoto = () => {
    setPhoto(null);
    setPhotoMeta(null);
  };

  if (!mediaSupported) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-white/80 p-6 text-rose-900 shadow-lg dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-100">
        <h2 className="text-2xl font-semibold">Camera not supported</h2>
        <p className="mt-2 text-base">
          Your browser does not expose the MediaDevices API. Please update to a
          modern version of Chrome, Safari, Edge, or Firefox.
        </p>
      </div>
    );
  }

  return (
    <section className="grid gap-5 rounded-3xl border border-zinc-200 bg-white/80 p-4 shadow-xl shadow-zinc-800/5 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70 sm:p-6 md:grid-cols-2 md:gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="flex flex-col gap-4">
        <div className="relative overflow-hidden rounded-2xl bg-black">
          <video
            ref={videoRef}
            playsInline
            autoPlay
            muted
            className="aspect-[9/16] w-full rounded-2xl object-cover md:aspect-[3/4]"
          />
          {!isStreaming && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-center text-white">
              {isLoading ? (
                <p className="text-lg font-semibold">Starting camera…</p>
              ) : (
                <p className="text-lg font-semibold">
                  Grant permission to start the camera.
                </p>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-3 sm:gap-4">
          <button
            className="flex-1 rounded-full bg-zinc-900 px-4 py-3 text-base font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-zinc-900"
            onClick={capturePhoto}
            disabled={!isStreaming || isLoading}
          >
            Capture photo
          </button>
          <button
            className="rounded-full border border-zinc-300 px-4 py-3 text-base font-semibold text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-white dark:hover:text-white sm:flex-1"
            onClick={() =>
              setFacingMode((prev) => (prev === "user" ? "environment" : "user"))
            }
            disabled={isLoading}
          >
            Switch camera
          </button>
          <button
            className="rounded-full border border-transparent px-4 py-3 text-sm font-semibold text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            onClick={() => startCamera(facingMode)}
            disabled={isLoading}
          >
            Refresh
          </button>
        </div>
        {error && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-200">
            {error}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-zinc-300 p-4 dark:border-zinc-700">
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-semibold">Shots & uploads</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 sm:hidden">
            Scroll down after a capture to view the preview and actions.
          </p>
        </div>
        {photo ? (
          <div className="space-y-4">
            <div
              className="relative w-full overflow-hidden rounded-2xl border border-zinc-200 shadow-sm dark:border-zinc-700"
              style={{ aspectRatio: photoMeta ? `${photoMeta.width} / ${photoMeta.height}` : "3 / 4" }}
            >
              <Image
                src={photo}
                alt="Captured preview"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                className="flex-1 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
                onClick={downloadPhoto}
              >
                Download JPEG
              </button>
              <button
                className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-900 dark:border-zinc-600 dark:text-zinc-200 dark:hover:border-white dark:hover:text-white"
                onClick={clearPhoto}
              >
                Retake
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Captured and uploaded photos will appear here. Save them to your
            device or retake a new shot.
          </p>
        )}

        <label className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-zinc-50/60 p-4 text-sm font-medium text-zinc-700 transition hover:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-200">
          Upload an existing image
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleUpload}
            className="text-base text-zinc-900 file:mr-4 file:rounded-full file:border-0 file:bg-zinc-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white dark:text-white dark:file:bg-white dark:file:text-zinc-900"
          />
        </label>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Tip: Mobile browsers require HTTPS to access cameras. localhost and
          Vercel previews are automatically allowed.
        </p>
    </div>

      <canvas ref={canvasRef} className="hidden" />
    </section>
  );
}
