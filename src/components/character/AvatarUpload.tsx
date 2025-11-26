"use client";

import React, { useRef, useState, useCallback } from "react";
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Camera, Loader2, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface AvatarUploadProps {
  currentUrl?: string | null;
  onUpload: (file: Blob) => Promise<string | null>;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

async function getCroppedImg(
  image: HTMLImageElement,
  crop: PixelCrop
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  
  canvas.width = crop.width;
  canvas.height = crop.height;
  
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No 2d context");
  
  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height
  );
  
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas is empty"));
      },
      "image/jpeg",
      0.9
    );
  });
}

export function AvatarUpload({ 
  currentUrl, 
  onUpload, 
  size = "md",
  className 
}: AvatarUploadProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImgSrc(reader.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1));
  }, []);

  const handleCropComplete = async () => {
    if (!imgRef.current || !completedCrop) return;

    setUploading(true);
    try {
      const croppedBlob = await getCroppedImg(imgRef.current, completedCrop);
      await onUpload(croppedBlob);
      setShowCropper(false);
      setImgSrc(null);
    } catch (err) {
      console.error("Error cropping image:", err);
      alert("Failed to process image");
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setShowCropper(false);
    setImgSrc(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <>
      <div
        className={cn(
          "relative rounded-full overflow-hidden cursor-pointer group",
          "bg-gradient-to-br from-gray-700 to-gray-800",
          "border-2 border-gray-600 hover:border-amber-500/50",
          "transition-all duration-300",
          sizeClasses[size],
          className
        )}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={() => inputRef.current?.click()}
      >
        {currentUrl ? (
          <img
            src={currentUrl}
            alt="Character avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Camera className="w-1/3 h-1/3 text-gray-500" />
          </div>
        )}

        {/* Hover overlay */}
        <div
          className={cn(
            "absolute inset-0 bg-black/60 flex items-center justify-center",
            "transition-opacity duration-200",
            isHovering ? "opacity-100" : "opacity-0"
          )}
        >
          <Camera className="w-1/4 h-1/4 text-white" />
        </div>

        {/* Decorative frame */}
        <div className="absolute inset-0 rounded-full border-2 border-amber-500/20 pointer-events-none" />

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {/* Crop Modal */}
      {showCropper && imgSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-xl p-6 max-w-lg w-full mx-4 border border-gray-700">
            <h3 className="text-lg font-bold mb-4">Crop Avatar</h3>
            
            <div className="max-h-96 overflow-hidden rounded-lg mb-4">
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop
              >
                <img
                  ref={imgRef}
                  src={imgSrc}
                  alt="Crop preview"
                  onLoad={onImageLoad}
                  className="max-h-80"
                />
              </ReactCrop>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancel}
                disabled={uploading}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleCropComplete}
                disabled={uploading || !completedCrop}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-2"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
