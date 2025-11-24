import React, { useEffect, useState } from 'react';
import { User, getUserPlans } from '../services/firebase';
import { SavedPlan } from '../types';
import Button from './Button';
import { Calendar, ArrowRight, Clock } from 'lucide-react';

interface SavedPlansListProps {
  user: User;
  onSelectPlan: (plan: SavedPlan) => void;
  onBack: () => void;
}

const SavedPlansList: React.FC<SavedPlansListProps> = ({ user, onSelectPlan, onBack }) => {
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      if (user) {
        const data = await getUserPlans(user.uid);
        setPlans(data);
        setLoading(false);
      }
    };
    fetchPlans();
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-serif font-bold text-earth-900">Your Saved Plans</h2>
        <Button variant="outline" onClick={onBack}>Back Home</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-leaf-200 border-t-leaf-600 rounded-full animate-spin"></div>
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-earth-200">
          <Calendar className="w-12 h-12 text-earth-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-earth-900 mb-2">No plans yet</h3>
          <p className="text-earth-600 mb-6">Create your first planting strategy to see it here.</p>
          <Button onClick={onBack}>Create New Plan</Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              onClick={() => onSelectPlan(plan)}
              className="bg-white p-6 rounded-xl border border-earth-200 shadow-sm hover:shadow-md hover:border-leaf-300 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-leaf-50 rounded-lg text-leaf-700 group-hover:bg-leaf-100 transition-colors">
                  <Calendar className="w-6 h-6" />
                </div>
                <span className="text-xs text-earth-400 flex items-center">
                   <Clock className="w-3 h-3 mr-1" />
                   {new Date(plan.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-earth-900 mb-2 group-hover:text-leaf-700 transition-colors">
                {plan.name}
              </h3>
              <p className="text-earth-600 text-sm line-clamp-2 mb-4">
                {plan.data.seasonalStrategy}
              </p>
              
              <div className="text-leaf-600 text-sm font-medium flex items-center">
                View Plan <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedPlansList;