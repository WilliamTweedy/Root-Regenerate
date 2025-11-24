import React from 'react';
import { Shovel, Calendar, ArrowRight } from 'lucide-react';

interface ToolsHubProps {
  onSelectTool: (tool: 'soil' | 'planner') => void;
}

const ToolsHub: React.FC<ToolsHubProps> = ({ onSelectTool }) => {
  return (
    <div className="pb-24 px-4 pt-6 max-w-md mx-auto">
      <h2 className="text-3xl font-serif font-bold text-sage-900 mb-2">Garden Tools</h2>
      <p className="text-sage-600 mb-8">Advanced utilities for the serious grower.</p>

      <div className="space-y-6">
        {/* Soil Doctor Card */}
        <button 
          onClick={() => onSelectTool('soil')}
          className="w-full bg-white rounded-3xl p-6 shadow-sm border border-sage-200 text-left hover:shadow-md hover:border-terra-300 transition-all group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="bg-sage-100 text-sage-700 p-4 rounded-2xl">
              <Shovel className="w-8 h-8" />
            </div>
            <div className="bg-sage-50 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="w-5 h-5 text-sage-400" />
            </div>
          </div>
          <h3 className="text-xl font-serif font-bold text-sage-900 mb-2">Soil Doctor</h3>
          <p className="text-sage-600 text-sm leading-relaxed">
            Diagnose soil health issues using minimal disturbance principles. Get a custom regeneration plan.
          </p>
        </button>

        {/* Planner Card */}
        <button 
          onClick={() => onSelectTool('planner')}
          className="w-full bg-white rounded-3xl p-6 shadow-sm border border-sage-200 text-left hover:shadow-md hover:border-terra-300 transition-all group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="bg-terra-100 text-terra-700 p-4 rounded-2xl">
              <Calendar className="w-8 h-8" />
            </div>
            <div className="bg-sage-50 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="w-5 h-5 text-sage-400" />
            </div>
          </div>
          <h3 className="text-xl font-serif font-bold text-sage-900 mb-2">Smart Planner</h3>
          <p className="text-sage-600 text-sm leading-relaxed">
            Scan multiple seed packets or list your inventory to generate a comprehensive succession planting schedule.
          </p>
        </button>
      </div>
    </div>
  );
};

export default ToolsHub;