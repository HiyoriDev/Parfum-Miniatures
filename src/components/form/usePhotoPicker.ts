"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import { preparePhoto } from "@/lib/photo";

/**
 * Choix d'une nouvelle photo : redimensionnée dans le navigateur et affichée en
 * aperçu, elle n'est envoyée qu'à l'enregistrement (rien ne part si on annule).
 */
export function usePhotoPicker() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(false);

  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = event.target.files?.[0];
    event.target.value = "";
    if (!picked) return;

    setPreparing(true);
    try {
      const prepared = await preparePhoto(picked);
      setFile(prepared);
      setPreviewUrl(URL.createObjectURL(prepared));
    } catch {
      toast.error("Cette image n'a pas pu être lue.");
    } finally {
      setPreparing(false);
    }
  }

  return {
    file,
    previewUrl,
    preparing,
    open: () => inputRef.current?.click(),
    reset: () => {
      setFile(null);
      setPreviewUrl(null);
    },
    /** À étaler sur un <input> caché : `<input {...photo.inputProps} />`. */
    inputProps: {
      ref: inputRef,
      type: "file",
      accept: "image/*",
      hidden: true,
      onChange: handleChange,
    } satisfies React.ComponentProps<"input">,
  };
}
