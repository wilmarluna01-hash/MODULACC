import React, { useState } from 'react';
import { CourseCard } from './CourseCard';

interface Course {
  id: string;
  title: string;
  status: string;
  progress: number;
  thumbnailUrl: string;
  linkTo: string;
}

export const CourseList: React.FC<{ courses: Course[] }> = ({ courses }) => {
  const [filter, setFilter] = useState('Todos');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('Nombre');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 p-4 bg-white shadow-sm border border-slate-100 rounded-2xl">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="p-2 border border-slate-200 rounded-lg">
          <option>Todos</option>
          <option>En curso</option>
          <option>Completados</option>
        </select>
        <input 
          type="text" 
          placeholder="Buscar curso..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="flex-grow p-2 border border-slate-200 rounded-lg"
        />
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="p-2 border border-slate-200 rounded-lg">
          <option>Ordenar por nombre</option>
          <option>Ordenar por progreso</option>
        </select>
      </div>
      <div className="space-y-4">
        {courses.map(course => (
          <CourseCard key={course.id} {...course} />
        ))}
      </div>
    </div>
  );
};
