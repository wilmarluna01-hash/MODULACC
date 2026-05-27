import React from 'react';
import { Link } from 'react-router-dom';
import { AccessibleButton } from '../Shared/AccessibleButton';

interface CourseCardProps {
  title: string;
  status: string;
  progress: number;
  thumbnailUrl: string;
  linkTo: string;
}

export const CourseCard: React.FC<CourseCardProps> = ({ title, status, progress, thumbnailUrl, linkTo }) => (
  <div className="flex items-center p-4 bg-white shadow-sm border border-slate-100 rounded-2xl hover:shadow-md transition-all duration-300">
    <Link to={linkTo} className="flex items-center flex-grow">
      <img src={thumbnailUrl} alt="" className="w-20 h-20 rounded-xl object-cover mr-6" referrerPolicy="no-referrer" />
      <div className="flex-grow">
        <h3 className="text-lg font-bold text-slate-800 mb-1">{title}</h3>
        <p className="text-sm text-slate-500 mb-2">{status}</p>
        <div className="w-full bg-slate-100 rounded-full h-2">
          <div className="bg-primary h-2 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
    </Link>
    <button className="p-2 text-slate-400 hover:text-slate-600 ml-4" aria-label="Opciones">
      <i className="fas fa-ellipsis-v"></i>
    </button>
  </div>
);
