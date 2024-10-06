"use client";

import { ImagePlus, Trash } from "lucide-react";
import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

interface ImageUploadProperties {
  disabled?: boolean;
  onChange: (value: string) => void;
  onRemove: (value: string) => void;
  value: string[];
}

const ImageUpload: React.FC<ImageUploadProperties> = ({ disabled, onChange, onRemove, value }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onSuccess = (result: any) => {
    onChange(result.info.secure_url);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        {value.map((url) => (
          <div key={url} className="relative size-[200px] overflow-hidden rounded-md">
            <div className="absolute right-2 top-2 z-10">
              <Button type="button" onClick={() => onRemove(url)} variant="destructive" size="sm">
                <Trash className="size-4" />
              </Button>
            </div>
            <Image fill className="object-cover" alt="Изображение" src={url} />
          </div>
        ))}
      </div>
      <CldUploadWidget
        onSuccess={onSuccess}
        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_IMAGE_UPLOAD_PRESET}
      >
        {({ open }) => {
          const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            open();
          };

          return (
            <Button type="button" disabled={disabled} variant="secondary" onClick={onClick}>
              <ImagePlus className="mr-2 size-4" />
              Загрузить изображение
            </Button>
          );
        }}
      </CldUploadWidget>
    </div>
  );
};

export default ImageUpload;
