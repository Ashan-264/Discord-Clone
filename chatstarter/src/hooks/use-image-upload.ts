import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useRef, useState } from "react";
import { toast } from "sonner";

export function useImageUpload() {
  const generateUploadUrl = useMutation(
    api.functions.storage.generateUploadUrl
  );
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [storageId, setStorageId] = useState<Id<"_storage"> | undefined>();
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement | null>(null);
  // Object URLs have to be revoked by hand or every picked file leaks for the
  // lifetime of the document.
  const objectUrlRef = useRef<string | undefined>(undefined);

  const setPreview = (url: string | undefined) => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }
    objectUrlRef.current = url;
    setPreviewUrl(url);
  };

  const open = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };
  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setPreview(URL.createObjectURL(file));
    try {
      const url = await generateUploadUrl({});
      const res = await fetch(url, {
        method: "POST",
        body: file,
      });
      if (!res.ok) {
        throw new Error(`Upload failed with status ${res.status}`);
      }
      const data = (await res.json()) as { storageId: Id<"_storage"> };
      setStorageId(data.storageId);
    } catch (error) {
      // Without this the preview would sit there looking uploaded while
      // isUploading stayed true forever, permanently disabling the submit path.
      setPreview(undefined);
      setStorageId(undefined);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      toast.error("Failed to upload image", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const reset = () => {
    setStorageId(undefined);
    setPreview(undefined);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return {
    storageId,
    previewUrl,
    isUploading,
    open,
    reset,
    InputProps: {
      type: "file",
      className: "hidden",
      ref: inputRef,
      onChange: handleImageChange,
    },
  };
}
