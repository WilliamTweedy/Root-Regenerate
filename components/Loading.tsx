import React from 'react';

const Loading: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-earth-200 rounded-full animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-full border-t-4 border-leaf-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">🌿</span>
        </div>
      </div>
      <h2 className="text-2xl font-serif font-bold text-earth-900 mb-3">Consulting Nature...</h2>
      <p className="text-earth-600 max-w-md animate-pulse">
        Analyzing your soil profile and generating a minimal disturbance regeneration plan based on your inputs.
      </p>
    </div>
  );
};

export default Loading;