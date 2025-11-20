import React from 'react';
import { ArrowRight, Leaf, ShieldCheck, Shovel } from 'lucide-react';
import Button from './Button';

interface HeroProps {
  onStart: () => void;
}

const Hero: React.FC<HeroProps> = ({ onStart }) => {
  return (
    <div className="relative overflow-hidden bg-earth-50 py-16 sm:py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-serif font-bold text-earth-900 mb-6 leading-tight">
            Heal Your Soil, <br/>
            <span className="text-leaf-700">Disturb Nothing.</span>
          </h1>
          <p className="text-lg sm:text-xl text-earth-700 mb-10 leading-relaxed">
            Following the principles of minimal disturbance gardening. 
            Identify your soil's needs and receive a tailored, regenerative plan to boost biodiversity and harvest without digging.
          </p>
          
          <div className="flex justify-center gap-4 mb-16">
            <Button onClick={onStart} className="text-lg px-8 py-4 group">
              Diagnose My Soil
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
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
              icon={<Leaf className="w-6 h-6" />}
              title="Living Roots"
              desc="Utilize plants to feed soil biology and naturally aerate compacted earth."
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