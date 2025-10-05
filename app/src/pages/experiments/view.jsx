import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MdWarning, MdError, MdRefresh, MdArrowBack } from "react-icons/md";
import { FaFile, FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";

import api from "../../services/api";
import { readFileAsync } from "../../utils";
import { API_URL } from "../../config";

const View = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [experiment, setExperiment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [uploading, setUploading] = useState(false);

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if file is a PDF
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      return;
    }

    setUploading(true);
    try {
      // Convert file to base64 for the API
      const fileData = await readFileAsync(file);

      // Upload file to S3
      const { data: url } = await api.post("/file", {
        files: [{ rawBody: fileData, name: file.name }],
        folder: `/experiments/${id}/attachments`,
      });

      // Create simple document object
      const newDocument = {
        name: file.name,
        url: url[0],
        created_at: new Date().toISOString(),
      };

      // Update experiment with new attachment
      const updatedAttachments = [
        ...(experiment.attachments || []),
        newDocument,
      ];
      await api.put(`/experiments/${id}`, {
        attachments: updatedAttachments,
      });

      // Update local state
      setExperiment((prev) => ({ ...prev, attachments: updatedAttachments }));

      toast.success("PDF uploaded successfully");
    } catch (error) {
      console.error(error);
      toast.error("Error uploading PDF");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAttachment = async (index) => {
    if (!window.confirm("Are you sure you want to delete this attachment?")) {
      return;
    }

    try {
      const updatedAttachments = experiment.attachments.filter(
        (_, i) => i !== index
      );
      await api.put(`/experiments/${id}`, {
        attachments: updatedAttachments,
      });

      // Update local state
      setExperiment((prev) => ({ ...prev, attachments: updatedAttachments }));
      toast.success("Attachment deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Error deleting attachment");
    }
  };

  const handleViewFile = async (fileKey, fileName) => {
    try {
      // Create a blob URL from the authenticated download endpoint
      const response = await fetch(
        `${API_URL}/file/download?key=${encodeURIComponent(fileKey)}`,
        {
          method: "GET",
          headers: {
            Authorization: `JWT ${api.getToken()}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      // Open the file in a new tab
      const newWindow = window.open(blobUrl, "_blank");

      // Clean up the blob URL after a delay
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 1000);
    } catch (error) {
      console.error(error);
      toast.error("Error viewing file");
    }
  };

  useEffect(() => {
    if (id) {
      fetchExperiment();
    }
  }, [id]);

  const fetchExperiment = async () => {
    try {
      setLoading(true);
      setError(null);
      const { ok, data } = await api.get(`/experiments/${id}`);
      if (!ok)
        return setError("Failed to load experiment details. Please try again.");
      setExperiment(data);
    } catch (err) {
      console.error("Error fetching experiment:", err);
      setError("Failed to load experiment details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      planning: "bg-blue-100 text-blue-800",
      "in-progress": "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      "on-hold": "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
                <MdWarning className="w-8 h-8 text-red-600" />
              </div>
            </div>

            {/* Error Title */}
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Oops! Something went wrong
              </h2>
              <p className="text-gray-600 text-sm">
                We encountered an error while loading the experiment details.
              </p>
            </div>

            {/* Error Message */}
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <MdError className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800 font-medium">{error}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={fetchExperiment}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <MdRefresh className="w-4 h-4 mr-2" />
                Try Again
              </button>

              <button
                onClick={() => navigate("/experiments")}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <MdArrowBack className="w-4 h-4 mr-2" />
                Back to Experiments
              </button>
            </div>

            {/* Help Text */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                If this problem persists, please contact support.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!experiment) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">Experiment not found</div>
          <button
            onClick={() => navigate("/experiments")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Back to Experiments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/experiments")}
              className="flex items-center text-secondary hover:text-secondary-600 transition-colors"
            >
              <MdArrowBack className="w-5 h-5 mr-2" />
            </button>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {experiment.title}
            </h1>
          </div>
          <span
            className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadgeColor(
              experiment.status
            )}`}
          >
            {experiment.status.charAt(0).toUpperCase() +
              experiment.status.slice(1).replace("-", " ")}
          </span>
        </div>
      </div>

      {/* Experiment Details */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Experiment Information
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Detailed information about this experiment
          </p>
        </div>

        <div className="border-t border-gray-200">
          <dl>
            {/* Description */}
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {experiment.description}
              </dd>
            </div>

            {/* Research Focus */}
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Research Focus
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {experiment.research_focus}
              </dd>
            </div>

            {/* Collected Data */}
            {experiment.collected_data && (
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Collected Data
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {experiment.collected_data}
                </dd>
              </div>
            )}

            {/* Start Date */}
            <div
              className={`px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 ${
                experiment.collected_data ? "bg-white" : "bg-gray-50"
              }`}
            >
              <dt className="text-sm font-medium text-gray-500">Start Date</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formatDate(experiment.start_date)}
              </dd>
            </div>

            {/* End Date */}
            <div
              className={`px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 ${
                experiment.collected_data ? "bg-gray-50" : "bg-white"
              }`}
            >
              <dt className="text-sm font-medium text-gray-500">End Date</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formatDate(experiment.end_date)}
              </dd>
            </div>

            {/* Created At */}
            <div
              className={`px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 ${
                experiment.collected_data &&
                experiment.attachments &&
                experiment.attachments.length > 0
                  ? "bg-gray-50"
                  : experiment.collected_data ||
                    (experiment.attachments &&
                      experiment.attachments.length > 0)
                  ? "bg-white"
                  : "bg-gray-50"
              }`}
            >
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formatDateTime(experiment.created_at)}
              </dd>
            </div>

            {/* Last Updated */}
            <div
              className={`px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 ${
                experiment.collected_data &&
                experiment.attachments &&
                experiment.attachments.length > 0
                  ? "bg-white"
                  : experiment.collected_data ||
                    (experiment.attachments &&
                      experiment.attachments.length > 0)
                  ? "bg-gray-50"
                  : "bg-white"
              }`}
            >
              <dt className="text-sm font-medium text-gray-500">
                Last Updated
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formatDateTime(experiment.updated_at)}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Documents
          </h3>
        </div>
        <div className="flex items-center justify-center w-full mb-4 p-2">
          <label
            className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer ${
              uploading
                ? "bg-gray-100 border-gray-400"
                : "border-gray-300 bg-gray-50 hover:bg-gray-100"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();

              if (uploading) return;

              const droppedFiles = e.dataTransfer.files;
              if (droppedFiles.length > 0)
                handlePdfUpload({ target: { files: droppedFiles } });
            }}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {uploading ? (
                <>
                  <svg
                    className="w-6 h-6 mb-2 text-gray-500 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <p className="text-xs text-gray-500">Uploading...</p>
                </>
              ) : (
                <>
                  <FaFile className="w-6 h-6 mb-2 text-gray-500" />
                  <p className="text-xs font-medium text-gray-700">
                    <span className="font-semibold">Click to upload PDF</span>{" "}
                    or drag and drop
                  </p>
                </>
              )}
            </div>
            <input
              id="pdf-file"
              type="file"
              className="hidden"
              multiple
              accept="application/pdf"
              onChange={handlePdfUpload}
              disabled={uploading}
            />
          </label>
        </div>

        {experiment.attachments && experiment.attachments.length > 0 && (
          <div className="mt-2 space-y-2">
            {experiment.attachments.map((doc, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-2 overflow-hidden">
                  <FaFile className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-700 truncate">
                    {doc.name}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleViewFile(doc.url, doc.name)}
                    className="text-xs text-green-600 hover:text-green-800 px-2 py-1 rounded hover:bg-green-50"
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteAttachment(index)}
                    className="text-xs text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50"
                  >
                    <FaTrash className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 flex flex-col sm:flex-row gap-3 sm:justify-between">
        <button
          onClick={async () => {
            if (
              window.confirm(
                "Are you sure you want to delete this experiment? This action cannot be undone."
              )
            ) {
              const { ok } = await api.delete(`/experiments/${id}`);
              if (!ok) return setError("Failed to delete experiment");
              navigate("/experiments");
            }
          }}
          className="w-full sm:w-auto inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-500  hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          Delete
        </button>
        <button
          type="button"
          onClick={() => navigate(`/experiments/${id}/edit`)}
          className="w-full sm:w-auto inline-flex justify-center items-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          Edit
        </button>
      </div>
    </div>
  );
};

export default View;
