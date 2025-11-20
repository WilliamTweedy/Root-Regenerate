import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Questionnaire from './components/Questionnaire';
import Results from './components/Results';
import Loading from './components/Loading';
import { SoilDiagnosisInputs } from './types';
import { generateSoilDiagnosis } from './services/geminiService';

type ViewState = 'home' | 'questionnaire' | 'loading' | 'results';

function App() {
  const [view, setView] = useState<ViewState>('home');
  const [diagnosis, setDiagnosis] = useState<string>('');

  const handleStart = () => {
    setView('questionnaire');
    window.scrollTo(0, 0);
  };

  const handleComplete = async (inputs: SoilDiagnosisInputs) => {
    setView('loading');
    window.scrollTo(0, 0);
    
    try {
      const result = await generateSoilDiagnosis(inputs);
      setDiagnosis(result);
      setView('results');
    } catch (error) {
      console.error(error);
      // Simple error handling for this demo
      setDiagnosis("An error occurred while connecting to the knowledge base. Please try again.");
      setView('results');
    }
  };

  const handleReset = () => {
    setDiagnosis('');
    setView('home');
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-earth-50/30 flex flex-col">
      <Header onReset={handleReset} />
      
      <main className="flex-grow">
        {view === 'home' && <Hero onStart={handleStart} />}
        
        {view === 'questionnaire' && (
          <div className="animate-fade-in">
            <Questionnaire onComplete={handleComplete} />
          </div>
        )}
        
        {view === 'loading' && <Loading />}
        
        {view === 'results' && (
          <div className="animate-fade-in">
            <Results diagnosis={diagnosis} onReset={handleReset} />
          </div>
        )}
      </main>

      <footer className="bg-earth-800 text-earth-200 py-8 text-center">
        <div className="max-w-5xl mx-auto px-4">
          <p className="mb-2 font-serif text-lg">Root & Regenerate</p>
          <p className="text-sm opacity-70">Inspired by minimal disturbance gardening principles.</p>
          <p className="text-xs mt-4 opacity-50">
            This tool uses AI to generate advice. Always observe your local conditions.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;