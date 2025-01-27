import React from 'react';
import { Star } from 'lucide-react';
import { Teacher } from '../types/teacher';

interface TeacherCardProps {
  teacher: Teacher;
}

const TeacherCard: React.FC<TeacherCardProps> = ({ teacher }) => {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-[#e5e5e5]">
      <div className="relative">
        <img 
          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${teacher.nickname}`} 
          alt={teacher.nickname}
          className="w-full h-48 object-cover bg-[#f7f7f7]"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 p-4">
          <h3 className="text-xl font-bold text-white">{teacher.nickname}</h3>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Star className="h-5 w-5 text-[#ffd900] fill-current" />
            <span className="text-gray-800 ml-1 font-medium">5.0/5</span>
          </div>
          <span className="text-[#58cc02] font-bold text-lg">${teacher.pricing}/hr</span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {teacher.description}
        </p>
        
        <div className="flex flex-wrap gap-2">
          {teacher.expertise?.split(',').map((skill, index) => (
            <span 
              key={index}
              className="px-3 py-1 bg-[#f7f7f7] text-gray-700 rounded-full text-sm font-medium"
            >
              {skill.trim()}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeacherCard;