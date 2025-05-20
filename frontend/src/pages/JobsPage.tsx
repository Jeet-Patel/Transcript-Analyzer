import React, { useState } from "react";
import api from "../api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Modal from "../components/Modal";
import { Eye, Play, Trash, Trash2 } from "lucide-react";
import styles from "../styles/JobsPage.module.css";



type Job = {
  job_id: string;
  status: string;
  candidate_name?: string;
  position?: string;
};

export default function JobsPage() {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);

  const queryClient = useQueryClient();

  const { data: jobs, isLoading } = useQuery<Job[]>({
    queryKey: ["jobs"],
    queryFn: async () => {
      const response = await api.get("/api/jobs");
      return response.data;
    },
    refetchInterval: 5000,
  });

  const [isViewingTranscript, setIsViewingTranscript] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handleViewTranscript = async (jobId: string) => {
    const response = await api.get(`/api/job/${jobId}/transcript`);
    setTranscript(response.data.transcript || "Transcript not available.");
    setSelectedJobId(jobId);
    setIsViewingTranscript(true);
    setIsPlayingAudio(false);
  };

  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handlePlayAudio = (jobId: string) => {
    const url = `http://localhost:8000/api/job/${jobId}/audio`;
    setAudioUrl(url);
    setSelectedJobId(jobId);
    setIsPlayingAudio(true);
    setIsViewingTranscript(false);
  };

  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      return await api.delete(`/api/job/${jobId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    }
  });

  const deleteAllJobsMutation = useMutation({
    mutationFn: async () => {
      return await api.delete(`/api/jobs/delete_all`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    }
  });

  const handleDeleteJob = (jobId: string) => {
    setJobToDelete(jobId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteJob = () => {
    if (jobToDelete) {
      deleteJobMutation.mutate(jobToDelete);
      setShowDeleteConfirm(false);
      setJobToDelete(null);
    }
  };

  const handleDeleteAllJobs = () => {
    setShowDeleteAllConfirm(true);
  };

  const confirmDeleteAllJobs = () => {
    deleteAllJobsMutation.mutate();
    setShowDeleteAllConfirm(false);
  };

  if (isLoading) return <div className={styles.loadingState}>Loading jobs...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Jobs Dashboard</h1>
        {jobs && jobs.length > 0 && (
          <button 
            onClick={handleDeleteAllJobs}
            className={`${styles.actionButton} ${styles.deleteAllButton}`}
            title="Delete All Jobs"
          >
            <Trash2 size={16} />
            <span>Delete All</span>
          </button>
        )}
      </div>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead className={styles.tableHead}>
            <tr>
              <th className={styles.tableHeadCell}>Job ID</th>
              <th className={styles.tableHeadCell}>Status</th>
              <th className={styles.tableHeadCell}>Candidate Name</th>
              <th className={styles.tableHeadCell}>Position</th>
              <th className={styles.tableHeadCell}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs && jobs.length > 0 ? (
              jobs.map((job) => (
                <tr
                  key={job.job_id}
                  className={styles.tableRow}
                >
                  <td className={`${styles.tableCell} ${styles.monospace}`}>{job.job_id}</td>
                  <td className={styles.tableCell}>
                    <span className={`${styles.statusBadge} ${
                      job.status === "PENDING" ? styles.pending : 
                      job.status === "IN_PROGRESS" ? styles.inProgress :
                      job.status === "COMPLETED" ? styles.completed :
                      job.status === "FAILED" ? styles.failed : ""
                    }`}>
                      {job.status}
                    </span>
                  </td>
                  <td className={styles.tableCell}>{job.candidate_name || "-"}</td>
                  <td className={styles.tableCell}>{job.position || "-"}</td>
                  <td className={`${styles.tableCell} ${styles.actionsCell}`}>
                    <button
                      onClick={() => handleViewTranscript(job.job_id)}
                      className={`${styles.actionButton} ${styles.viewButton}`}
                      title="View Transcript"
                    >
                      <Eye size={16} />
                    </button>

                    <button
                      onClick={() => handlePlayAudio(job.job_id)}
                      className="bg-green-500 text-white p-2 rounded hover:bg-green-600 shadow"
                      title="Play Audio"
                    >
                      <Play size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteJob(job.job_id)}
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                      title="Delete Job"
                    >
                      <Trash size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className={styles.emptyState} colSpan={5}>
                  No jobs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Transcript Viewer Modal */}
      <Modal
        open={!!selectedJobId && isViewingTranscript}
        onOpenChange={() => {
          setSelectedJobId(null);
          setIsViewingTranscript(false);
        }}
        title="Transcript"
      >
        {transcript}
      </Modal>

      {/* Audio Player Modal */}
      <Modal
        open={!!selectedJobId && isPlayingAudio}
        onOpenChange={() => {
          setSelectedJobId(null);
          setIsPlayingAudio(false);
        }}
        title="Audio Player"
      >
        {audioUrl && (
          <audio controls className="w-full mt-4">
            <source src={audioUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        )}
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        open={showDeleteConfirm}
        onOpenChange={() => setShowDeleteConfirm(false)}
        title="Confirm Delete"
      >
        <div className={styles.confirmModal}>
          <p>Are you sure you want to delete this job?</p>
          <div className={styles.modalButtons}>
            <button 
              onClick={() => setShowDeleteConfirm(false)}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button 
              onClick={confirmDeleteJob}
              className={styles.confirmButton}
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete All Confirmation Modal */}
      <Modal
        open={showDeleteAllConfirm}
        onOpenChange={() => setShowDeleteAllConfirm(false)}
        title="Confirm Delete All"
      >
        <div className={styles.confirmModal}>
          <p>Are you sure you want to delete all jobs? This action cannot be undone.</p>
          <div className={styles.modalButtons}>
            <button 
              onClick={() => setShowDeleteAllConfirm(false)}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button 
              onClick={confirmDeleteAllJobs}
              className={styles.confirmButton}
            >
              Delete All
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}


