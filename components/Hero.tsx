import React from 'react';
import { ArrowRight, Leaf, ShieldCheck, Shovel, Calendar, Sprout } from 'lucide-react';
import Button from './Button';

interface HeroProps {
  onStartDiagnosis: () => void;
  onStartPlanning: () => void;
}

const Hero: React.FC<HeroProps> = ({ onStartDiagnosis, onStartPlanning }) => {
  return (
    <div className="relative overflow-hidden bg-earth-50 py-16 sm:py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-serif font-bold text-earth-900 mb-6 leading-tight">
            Regenerate Your Soil. <br/>
            <span className="text-leaf-700">Plan Your Harvest.</span>
          </h1>
          <p className="text-lg sm:text-xl text-earth-700 mb-10 leading-relaxed">
            Follow the principles of minimal disturbance gardening. 
            Diagnose soil issues or turn your seed packets into a succession planting calendar tailored to your location.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Button onClick={onStartDiagnosis} className="text-lg px-8 py-4 group shadow-lg">
              <Shovel className="mr-2 w-5 h-5" />
              Diagnose My Soil
            </Button>
            <Button onClick={onStartPlanning} variant="secondary" className="text-lg px-8 py-4 group shadow-md bg-white border-2 border-earth-200 hover:border-leaf-400">
              <Calendar className="mr-2 w-5 h-5" />
              Create Planting Plan
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <Feature 
              icon={<Shovel className="w-6 h-6" />}
              title="No Dig Method"
              desc="Preserve soil structure and fungal networks by layering organic matter instead of tilling."
            />
            <Feature 
              icon={<ShieldCheck className="w-6 h-6" />}
              title="Soil Armor"
              desc="Keep soil covered year-round to protect against erosion and moisture loss."
            />
            <Feature 
              icon={<Sprout className="w-6 h-6" />}
              title="Succession Planting"
              desc="Maximize small spaces by planting new crops immediately after harvesting others."
            />
          </div>
        </div>
      </div>
      
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-leaf-400 rounded-full blur-3xl"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-earth-400 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

const Feature = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-earth-100 shadow-sm">
    <div className="w-12 h-12 bg-leaf-100 text-leaf-700 rounded-full flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="font-bold text-earth-900 text-lg mb-2">{title}</h3>
    <p className="text-earth-600 text-sm leading-relaxed">{desc}</p>
  </div>
);

export default Hero;