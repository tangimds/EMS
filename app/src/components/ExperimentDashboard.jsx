import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import api from "../services/api";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const ExperimentDashboard = () => {
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchExperiments();
  }, []);

  const fetchExperiments = async () => {
    try {
      setLoading(true);
      const { ok, data } = await api.get("/experiments");
      if (!ok) return setError("Failed to load experiments");
      setExperiments(data);
    } catch (err) {
      console.error("Error fetching experiments:", err);
      setError("Failed to load experiments");
    } finally {
      setLoading(false);
    }
  };

  // Calculate status distribution
  const getStatusDistribution = () => {
    if (!experiments) return { labels: [], data: [], colors: [] };
    const statusCounts = experiments?.reduce((acc, experiment) => {
      acc[experiment.status] = (acc[experiment.status] || 0) + 1;
      return acc;
    }, {});

    const statusLabels = {
      planning: "Planning",
      "in-progress": "In Progress",
      completed: "Completed",
      "on-hold": "On Hold",
      cancelled: "Cancelled",
    };

    const labels = Object.keys(statusCounts).map(
      (status) => statusLabels[status] || status
    );
    const data = Object.values(statusCounts);
    const colors = [
      "#3B82F6", // Blue for planning
      "#10B981", // Green for in-progress
      "#059669", // Dark green for completed
      "#F59E0B", // Yellow for on-hold
      "#EF4444", // Red for cancelled
    ];

    console.log(`✌️ ~ { labels, data, colors }:`, { labels, data, colors });
    return { labels, data, colors };
  };

  const { labels, data, colors } = getStatusDistribution();

  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: colors,
        borderColor: colors.map((color) => color + "80"),
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          },
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Experiment Count Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900">
              Total Experiments
            </h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {experiments?.length}
            </p>
            {experiments?.length > 0 && (
              <button
                onClick={() => navigate("/experiments")}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-secondary hover:bg-secondary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 transition-colors duration-200"
              >
                View All Experiments
                <svg
                  className="ml-2 -mr-1 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            )}
          </div>
          <div className="bg-blue-100 rounded-full p-3">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Status Distribution Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Status Distribution
        </h3>
        {experiments?.length > 0 ? (
          <div className="h-64">
            <Doughnut data={chartData} options={chartOptions} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <p>No experiments found</p>
              <p className="text-sm">
                Create your first experiment to see the dashboard
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Status Summary Cards */}
      {experiments?.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {(() => {
            const statusDistribution = getStatusDistribution();
            return statusDistribution.labels.map((label, index) => {
              const count = statusDistribution.data[index];
              const color = statusDistribution.colors[index];

              return (
                <div key={label} className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 capitalize">
                        {label.replace("-", " ")}
                      </p>
                      <p className="text-2xl font-bold" style={{ color }}>
                        {count}
                      </p>
                    </div>
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: color }}
                    ></div>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      )}
    </div>
  );
};

export default ExperimentDashboard;
