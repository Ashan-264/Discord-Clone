import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useImageUpload() {
  const generateUploadUrl = useMutation(
    api.functions.storage.generateUploadUrl
  );
}

const handleImageChange;
