import React from 'react';
import { InfographicItem } from '../types';
import { 
  ChartBarIcon, 
  LightBulbIcon, 
  UserGroupIcon, 
  GlobeAltIcon, 
  ClockIcon, 
  ShieldCheckIcon,
  TrophyIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface InfographicViewProps {
  data: InfographicItem[];
  isDarkMode?: boolean;
  showDescription?: boolean;
}

const IconMap: Record<string, React.ElementType> = {
  chart: ChartBarIcon,
  bulb: LightBulbIcon,
  users: UserGroupIcon,
  globe: GlobeAltIcon,
  time: ClockIcon,
  shield: ShieldCheckIcon,
  target: TrophyIcon,
  default: SparklesIcon
};

const InfographicView: React.FC<InfographicViewProps> = ({ 
    data, 
    isDarkMode = false,
    showDescription = true 
}) => {
  
  const cardClasses = isDarkMode 
    ? "bg-slate-700/60 border-slate-600 hover:shadow-blue-900/20 text-white" 
    : "glass-card border-white/60 text-gray-800";
    
  const iconBg = isDarkMode
    ? "bg-indigo-900/50 text-indigo-400"
    : "bg-gradient-to-br from-indigo-100 to-white text-indigo-600";

  const descColor = isDarkMode ? "text-gray-300" : "text-gray-600";

  return (
    <div className="w-full h-full p-8 overflow-y-auto no-scrollbar">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-full content-center">
        {data.map((item, index) => {
          const Icon = IconMap[item.icon] || IconMap.default;
          return (
            <div 
              key={index} 
              className={`p-6 rounded-2xl border hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group relative overflow-hidden ${cardClasses}`}
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                <Icon className={`w-24 h-24 ${isDarkMode ? 'text-white' : 'text-indigo-600'}`} />
              </div>
              
              <div className="flex flex-col gap-3 relative z-10">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${iconBg}`}>
                  <Icon className="w-6 h-6" />
                </div>
                
                <h3 className="text-lg font-bold leading-tight">
                  {item.title}
                </h3>
                
                {showDescription && (
                    <p className={`text-sm leading-relaxed ${descColor}`}>
                    {item.description}
                    </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InfographicView;