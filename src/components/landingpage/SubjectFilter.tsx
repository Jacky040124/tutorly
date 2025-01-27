import React from 'react';

interface SubjectFilterProps {
  subjects: string[];
  selectedSubject: string;
  onSelectSubject: (subject: string) => void;
}

const SubjectFilter: React.FC<SubjectFilterProps> = ({
  subjects,
  selectedSubject,
  onSelectSubject
}) => {
  return (
    <div className="mb-8">
      <div className="flex space-x-2 p-2">
        {subjects.map((subject) => (
          <button
            key={subject}
            onClick={() => onSelectSubject(subject)}
            className={`
              px-6 py-3 rounded-xl font-medium transition-all
              ${selectedSubject === subject
                ? 'bg-[#58cc02] text-white shadow-lg shadow-[#58cc02]/30'
                : 'bg-[#e5e5e5] text-gray-700 hover:bg-[#d1d1d1]'
              }
            `}
          >
            {subject}
          </button>
        ))}
      </div>
    </div>
  );
}

export default SubjectFilter;