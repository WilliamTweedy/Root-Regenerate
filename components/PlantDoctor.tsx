
import React, { useState, useRef } from 'react';
import { diagnosePlantHealth } from '../services/geminiService';
import { PlantHealthResult } from '../types';
import Button from './Button';
import { Upload, Camera, AlertTriangle, CheckCircle, Shield, Activity, X } from 'lucide-react';
import Loading from './Loading';

interface PlantDoctorProps {
  onBack: () => void;
}

const PlantDoctor: React.FC<PlantDoctorProps> = ({ onBack }) => {
  const [image, setImage] = useState<{ base64: string, mimeType: string, preview: string } | null>(null);
  const [result, setResult] = useState<PlantHealthResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64Data = result.split(',')[1];
        const mimeType = result.split(';')[0].split(':')[1];
        setImage({ base64: base64Data, mimeType, preview: result });
        setResult(null); // Reset previous result
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setIsLoading(true);
    try {
      const diagnosis = await diagnosePlantHealth({ base64: image.base64, mimeType: image.mimeType });
      setResult(diagnosis);
    } catch (err) {
      setError("Failed to analyze plant. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-serif font-bold text-sage-900">Dr. Green</h2>
        <button onClick={onBack} className="text-sm font-medium text-sage-500 hover:text-sage-800">
            Exit
        </button>
      </div>

      {!result ? (
        <div className="bg-white rounded-3xl p-8 border border-sage-200 shadow-sm text-center">
           {!image ? (
             <div className="space-y-6">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                    <Camera className="w-10 h-10" />
                </div>
                <div>
                   <h3 className="text-lg font-bold text-sage-900 mb-2">Upload a Photo</h3>
                   <p className="text-sage-600 max-w-xs mx-auto">
                      Take a clear photo of the leaf or plant showing symptoms of pests or disease.
                   </p>
                </div>
                <Button onClick={() => fileInputRef.current?.click()}>
                   <Upload className="w-5 h-5 mr-2" /> Select Photo
                </Button>
             </div>
           ) : (
             <div className="space-y-6">
                 <div className="relative w-full max-w-sm mx-auto aspect-square rounded-xl overflow-hidden shadow-md">
                     <img src={image.preview} alt="Plant" className="w-full h-full object-cover" />
                     <button 
                       onClick={() => setImage(null)}
                       className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                     >
                         <X className="w-4 h-4" />
                     </button>
                 </div>
                 <div className="flex gap-3 justify-center">
                    <Button variant="outline" onClick={() => setImage(null)}>Retake</Button>
                    <Button onClick={handleAnalyze}>Diagnose Issue</Button>
                 </div>
             </div>
           )}
           <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleCapture} />
           {error && <p className="text-red-500 mt-4 text-sm font-bold">{error}</p>}
        </div>
      ) : (
        <div className="animate-fade-in space-y-6">
            
            {/* Diagnosis Card */}
            <div className={`rounded-3xl p-6 border-2 shadow-sm ${
                result.isHealthy 
                  ? 'bg-leaf-50 border-leaf-200' 
                  : 'bg-amber-50 border-amber-200'
            }`}>
                <div className="flex items-start gap-4 mb-4">
                    <div className={`p-3 rounded-xl ${
                        result.isHealthy ? 'bg-leaf-100 text-leaf-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                        {result.isHealthy ? <CheckCircle className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold uppercase tracking-wide opacity-60">Diagnosis</span>
                            <span className="text-[10px] bg-white/50 px-2 py-0.5 rounded-full font-bold border border-black/5">
                                {result.confidence} Confidence
                            </span>
                        </div>
                        <h3 className="text-2xl font-serif font-bold text-sage-900 leading-tight">
                            {result.diagnosis}
                        </h3>
                    </div>
                </div>

                {!result.isHealthy && (
                    <div className="mb-4">
                        <h4 className="font-bold text-sage-800 text-sm mb-2 flex items-center gap-2">
                             <Activity className="w-4 h-4" /> Symptoms Detected
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {result.symptoms.map((sym, i) => (
                                <span key={i} className="bg-white/60 px-3 py-1 rounded-full text-sm text-sage-700 border border-black/5">
                                    {sym}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Remedy Card */}
            {!result.isHealthy && (
                <div className="bg-white rounded-3xl p-6 border border-sage-200 shadow-sm">
                    <div className="mb-6">
                        <h4 className="font-bold text-sage-900 text-lg mb-3 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-leaf-600" /> Organic Cure
                        </h4>
                        <div className="bg-leaf-50 p-4 rounded-xl text-sage-800 leading-relaxed text-sm border-l-4 border-leaf-400">
                             {result.organicCure}
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                         <div>
                            <h5 className="font-bold text-sage-900 text-sm mb-2">Root Cause</h5>
                            <p className="text-sage-600 text-sm">{result.cause}</p>
                         </div>
                         <div>
                            <h5 className="font-bold text-sage-900 text-sm mb-2">Prevention</h5>
                            <p className="text-sage-600 text-sm">{result.prevention}</p>
                         </div>
                    </div>
                </div>
            )}
             
            {result.isHealthy && (
                <div className="bg-white rounded-3xl p-8 border border-sage-200 text-center">
                    <p className="text-lg text-sage-700">Your plant looks happy! Keep doing what you're doing.</p>
                </div>
            )}

            <Button fullWidth onClick={() => { setResult(null); setImage(null); }}>
                Analyze Another Plant
            </Button>
        </div>
      )}
    </div>
  );
};

export default PlantDoctor;
