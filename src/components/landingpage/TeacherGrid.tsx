import React from 'react';
import TeacherCard from './TeacherCard';
import { Teacher } from '@/types/user';

interface TeacherGridProps {
  teachers: Teacher[];
}

const TeacherGrid: React.FC<TeacherGridProps> = ({ teachers }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 px-10">
      {teachers.map((teacher) => (
        <TeacherCard key={teacher.uid} teacher={teacher} />
      ))}
    </div>
  );
};

export default TeacherGrid;