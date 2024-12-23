"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

interface CapturedImage {
  id: string;
  dataUrl: string;
  selected: boolean;
  timestamp: number;
}

export default function Home() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      setStream(mediaStream);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError(
        "カメラへのアクセスに失敗しました。ブラウザの設定を確認してください。"
      );
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  const captureImage = useCallback(() => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL("image/jpeg");
        const newImage: CapturedImage = {
          id: `img-${Date.now()}`,
          dataUrl,
          selected: false,
          timestamp: Date.now(),
        };
        setCapturedImages((prev) => [...prev, newImage]);
      }
    }
  }, []);

  const toggleImageSelection = useCallback((id: string) => {
    setCapturedImages((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, selected: !img.selected } : img
      )
    );
  }, []);

  const deleteSelectedImages = useCallback(() => {
    setCapturedImages((prev) => prev.filter((img) => !img.selected));
  }, []);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start w-full max-w-4xl">
        <Image
          className="dark:invert"
          src="https://nextjs.org/icons/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />

        {/* カメラセクション */}
        <div className="w-full">
          <div className="bg-black/[.05] dark:bg-white/[.06] p-4 rounded-lg mb-4">
            {stream ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full rounded-lg aspect-video"
              />
            ) : (
              <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">
                  {error || "カメラオフ"}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-center gap-4 mb-8">
            {!stream ? (
              <button
                onClick={startCamera}
                className="rounded-full border border-solid border-transparent transition-all duration-200 flex items-center justify-center bg-blue-500 text-white gap-2 hover:bg-blue-600 text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
              >
                カメラを起動
              </button>
            ) : (
              <>
                <button
                  onClick={captureImage}
                  className="rounded-full border border-solid border-transparent transition-all duration-200 flex items-center justify-center bg-green-500 text-white gap-2 hover:bg-green-600 text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
                >
                  撮影
                </button>
                <button
                  onClick={stopCamera}
                  className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-all duration-200 flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-transparent text-red-500 hover:text-red-600 text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
                >
                  カメラを停止
                </button>
              </>
            )}
          </div>

          {/* 撮影した画像の表示エリア */}
          {capturedImages.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">撮影した画像</h2>
                {capturedImages.some((img) => img.selected) && (
                  <button
                    onClick={deleteSelectedImages}
                    className="text-red-500 hover:text-red-600 text-sm px-4 py-2 rounded-full border border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                  >
                    選択した画像を削除
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {capturedImages.map((img) => (
                  <div
                    key={img.id}
                    onClick={() => toggleImageSelection(img.id)}
                    className={`relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200 transform hover:scale-105 ${
                      img.selected
                        ? "ring-2 ring-blue-500 shadow-lg scale-105"
                        : ""
                    }`}
                  >
                    <div className="aspect-video relative">
                      <img
                        src={img.dataUrl}
                        alt={`Captured ${img.id}`}
                        className={`w-full h-full object-cover transition-opacity duration-200 ${
                          img.selected ? "opacity-90" : ""
                        }`}
                      />
                      {img.selected && (
                        <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                          <div className="bg-blue-500 text-white rounded-full p-2">
                            ✓
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 既存のコンテンツ */}
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="https://nextjs.org/icons/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            Deploy now
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div>
      </main>

      {/* 既存のフッター */}
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="https://nextjs.org/icons/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="https://nextjs.org/icons/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="https://nextjs.org/icons/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
