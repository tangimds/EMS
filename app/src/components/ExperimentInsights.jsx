import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  TimeScale,
  PointElement,
  LineElement,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  MdTrendingUp,
  MdTrendingDown,
  MdSchedule,
  MdCheckCircle,
} from "react-icons/md";
import API from "../services/api";
import NewExperimentModal from "./NewExperimentModal";
import { Link } from "react-router-dom";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  TimeScale,
  PointElement,
  LineElement
);

const ExperimentInsights = () => {
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleCloseModal = () => {
    setShowModal(false);
    // Refresh the experiments list after closing modal
    fetchExperiments();
  };

  const handleOpenModal = () => {
    setShowModal(true);
  };

  useEffect(() => {
    fetchExperiments();
  }, []);

  const fetchExperiments = async () => {
    try {
      setLoading(true);
      const { ok, data } = await API.get("/experiments");
      if (!ok) return setError("Failed to load experiments");
      setExperiments(data);
    } catch (err) {
      console.error("Error fetching experiments:", err);
      setError("Failed to load experiments");
    } finally {
      setLoading(false);
    }
  };

  // Calculate completion rate
  const getCompletionRate = () => {
    if (!experiments || experiments.length === 0) return 0;
    const completed = experiments.filter(
      (exp) => exp.status === "completed"
    ).length;
    return Math.round((completed / experiments.length) * 100);
  };

  // Calculate average experiment duration
  const getAverageDuration = () => {
    if (!experiments || experiments.length === 0) return 0;
    const completedExperiments = experiments.filter(
      (exp) => exp.status === "completed" && exp.start_date && exp.end_date
    );

    if (completedExperiments.length === 0) return 0;

    const totalDays = completedExperiments.reduce((acc, exp) => {
      const start = new Date(exp.start_date);
      const end = new Date(exp.end_date);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return acc + diffDays;
    }, 0);

    return Math.round(totalDays / completedExperiments.length);
  };

  // Get research focus distribution
  const getResearchFocusDistribution = () => {
    if (!experiments || experiments.length === 0)
      return { labels: [], data: [], colors: [] };

    const focusCounts = experiments.reduce((acc, experiment) => {
      const focus = experiment.research_focus || "Unspecified";
      acc[focus] = (acc[focus] || 0) + 1;
      return acc;
    }, {});

    const labels = Object.keys(focusCounts);
    const data = Object.values(focusCounts);
    const colors = [
      "#3B82F6",
      "#10B981",
      "#F59E0B",
      "#EF4444",
      "#8B5CF6",
      "#06B6D4",
      "#84CC16",
      "#F97316",
      "#EC4899",
      "#6B7280",
    ].slice(0, labels.length);

    return { labels, data, colors };
  };

  // Get experiments over time (monthly)
  const getExperimentsOverTime = () => {
    if (!experiments || experiments.length === 0)
      return { labels: [], datasets: [] };

    const monthlyData = experiments.reduce((acc, experiment) => {
      const date = new Date(experiment.created_at);
      const monthYear = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      acc[monthYear] = (acc[monthYear] || 0) + 1;
      return acc;
    }, {});

    const labels = Object.keys(monthlyData).sort();
    const data = labels.map((label) => monthlyData[label]);

    return {
      labels,
      datasets: [
        {
          label: "Experiments Created",
          data,
          borderColor: "#3B82F6",
          backgroundColor: "#3B82F680",
          tension: 0.4,
          fill: true,
        },
      ],
    };
  };

  // Get status distribution (enhanced from existing)
  const getStatusDistribution = () => {
    if (!experiments || experiments.length === 0)
      return { labels: [], data: [], colors: [] };

    const statusCounts = experiments.reduce((acc, experiment) => {
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
    const colors = ["#3B82F6", "#10B981", "#059669", "#F59E0B", "#EF4444"];

    return { labels, data, colors };
  };

  // Get active experiments (in-progress)
  const getActiveExperiments = () => {
    if (!experiments || experiments.length === 0) return 0;
    return experiments.filter((exp) => exp.status === "in-progress").length;
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

  if (!experiments || experiments.length === 0) {
    return (
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
            Create your first experiment to see insights
          </p>
          <button
            onClick={handleOpenModal}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-secondary hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500 transition-colors duration-200"
          >
            Create Experiment
          </button>
        </div>
        {showModal && <NewExperimentModal onClose={handleCloseModal} />}
      </div>
    );
  }

  const completionRate = getCompletionRate();
  const averageDuration = getAverageDuration();
  const activeExperiments = getActiveExperiments();
  const statusDistribution = getStatusDistribution();
  const researchFocusData = getResearchFocusDistribution();
  const timelineData = getExperimentsOverTime();

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Experiments */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                <MdTrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-4 flex-1">
              <div className="flex items-center justify-between gap-2 w-full">
                <p className="text-sm font-medium text-gray-600">
                  Total Experiments
                </p>
                <Link
                  to="/experiments"
                  className="text-sm font-medium text-secondary-600 hover:text-secondary-900 hover:underline"
                >
                  View all
                </Link>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {experiments.length}
              </p>
            </div>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                <MdCheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Completion Rate
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {completionRate}%
              </p>
            </div>
          </div>
        </div>

        {/* Active Experiments */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                <MdSchedule className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Active Experiments
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {activeExperiments}
              </p>
            </div>
          </div>
        </div>

        {/* Average Duration */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                <MdTrendingDown className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Duration</p>
              <p className="text-2xl font-bold text-gray-900">
                {averageDuration} days
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Status Distribution
          </h3>
          <div className="h-64">
            <Doughnut
              data={{
                labels: statusDistribution.labels,
                datasets: [
                  {
                    data: statusDistribution.data,
                    backgroundColor: statusDistribution.colors,
                    borderColor: statusDistribution.colors.map(
                      (color) => color + "80"
                    ),
                    borderWidth: 2,
                  },
                ],
              }}
              options={{
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
                        const total = context.dataset.data.reduce(
                          (a, b) => a + b,
                          0
                        );
                        const percentage = (
                          (context.parsed / total) *
                          100
                        ).toFixed(1);
                        return `${context.label}: ${context.parsed} (${percentage}%)`;
                      },
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Research Focus Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Research Focus Areas
          </h3>
          <div className="h-64">
            <Bar
              data={{
                labels: researchFocusData.labels,
                datasets: [
                  {
                    label: "Number of Experiments",
                    data: researchFocusData.data,
                    backgroundColor: researchFocusData.colors,
                    borderColor: researchFocusData.colors.map(
                      (color) => color + "80"
                    ),
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1,
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Timeline Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Experiments Created Over Time
        </h3>
        <div className="h-64">
          <Line
            data={timelineData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1,
                  },
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ExperimentInsights;
