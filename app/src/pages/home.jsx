import React from "react";
import ExperimentInsights from "../components/ExperimentInsights";

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Experiment Dashboard
              </h1>
              <p className="text-gray-600">
                Overview of your research experiments
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Key Insights Section */}
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Key Insights
              </h2>
              <p className="text-gray-600">
                Comprehensive analysis of your experiment portfolio
              </p>
            </div>
            <ExperimentInsights />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
