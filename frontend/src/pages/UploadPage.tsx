import React, { useState, useEffect } from "react";
import api from "../api";
import { useMutation } from "@tanstack/react-query";
import styles from "../styles/UploadPage.module.css";
import { CheckCircle, X } from "lucide-react";

const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={styles.toast}>
      <div className={styles.toastContent}>
        <CheckCircle size={20} className={styles.toastIcon} />
        <span>{message}</span>
      </div>
      <button onClick={onClose} className={styles.toastClose}>
        <X size={16} />
      </button>
    </div>
  );
};

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: (data) => {
      setSuccessMessage(`Job submitted successfully! Job ID: ${data.job_id}`);
      setShowSuccess(true);
      setFile(null);
    },
    onError: () => {
      setSuccessMessage("Upload failed. Please try again.");
      setShowSuccess(true);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    uploadMutation.mutate(formData);
  };

  const [isDragActive, setIsDragActive] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Upload Transcript or Audio</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div 
          className={`${styles.fileInput} ${isDragActive || file ? styles.fileInputActive : ''}`}
          onDragEnter={() => setIsDragActive(true)}
          onDragLeave={() => setIsDragActive(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => setIsDragActive(false)}
        >
          <input
            type="file"
            accept=".mp3,.txt"
            onChange={(e) => {
              setFile(e.target.files ? e.target.files[0] : null);
              setIsDragActive(false);
            }}
            style={{ width: '100%' }}
          />
          <div className="text-center mt-2">
            {file ? `Selected: ${file.name}` : 'Drop your file here or click to select'}
          </div>
        </div>
        <button
          type="submit"
          className={styles.submitButton}
          disabled={uploadMutation.isPending || !file}
        >
          {uploadMutation.isPending ? "Uploading..." : "Submit Job"}
        </button>
      </form>
      {showSuccess && (
        <Toast 
          message={successMessage} 
          onClose={() => setShowSuccess(false)} 
        />
      )}
    </div>
  );
}
