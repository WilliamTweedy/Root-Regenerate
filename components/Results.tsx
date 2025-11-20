import React from 'react';
import ReactMarkdown from 'react-markdown';
import Button from './Button';
import { Download, Share2 } from 'lucide-react';

interface ResultsProps {
  diagnosis: string;
  onReset: () => void;
}

const Results: React.FC<ResultsProps> = ({ diagnosis, onReset }) => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <div className="bg-white rounded-2xl shadow-xl border border-earth-100 overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-earth-100/50 p-8 border-b border-earth-200">
          <h2 className="text-3xl font-serif font-bold text-earth-900 mb-4">Your Regeneration Plan</h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="bg-white text-sm py-2 px-4 h-auto">
              <Download className="w-4 h-4 mr-2" /> Save PDF
            </Button>
            <Button variant="outline" className="bg-white text-sm py-2 px-4 h-auto">
              <Share2 className="w-4 h-4 mr-2" /> Share
            </Button>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8 sm:p-12">
          <article className="prose prose-stone prose-headings:font-serif prose-headings:text-earth-900 prose-p:text-earth-700 prose-li:text-earth-700 prose-strong:text-leaf-800 prose-a:text-leaf-600 max-w-none">
            <ReactMarkdown>{diagnosis}</ReactMarkdown>
          </article>
        </div>

        {/* Footer Action */}
        <div className="bg-earth-50 p-8 border-t border-earth-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-earth-600 italic text-sm">
                Based on Huw Richards' Minimal Disturbance principles. Nature knows best.
            </p>
            <Button onClick={onReset} variant="secondary">Start New Diagnosis</Button>
        </div>
      </div>
    </div>
  );
};

export default Results;