import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

const Breadcrumbs = () => (
  <nav aria-label="Breadcrumb" className="text-sm text-slate-500 mt-2">
    <ol className="flex items-center space-x-2">
      <li><Link to="/dashboard" className="hover:text-primary">Inicio</Link></li>
      <li>/</li>
      <li><Link to="/dashboard" className="hover:text-primary">Curso</Link></li>
      <li>/</li>
      <li className="font-medium text-slate-800">General</li>
    </ol>
  </nav>
);

const CourseTabs = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) => {
  const tabs = ['Curso', 'Participantes', 'Calificaciones', 'Competencias'];
  return (
    <div className="flex border-b border-slate-200 mt-6" role="tablist">
      {tabs.map(tab => (
        <button
          key={tab}
          role="tab"
          aria-selected={activeTab === tab}
          onClick={() => setActiveTab(tab)}
          className={`px-6 py-3 font-medium text-sm transition-colors ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-slate-800'}`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

const ContentSubmenu = ({ activeSub, setActiveSub }: { activeSub: string, setActiveSub: (sub: string) => void }) => {
  const subs = ['General', 'Comunicaciones', 'Corte 1', 'Corte 2', 'Corte 3'];
  return (
    <div className="flex space-x-4 mt-6 bg-slate-50 p-2 rounded-xl" role="tablist">
      {subs.map(sub => (
        <button
          key={sub}
          role="tab"
          aria-selected={activeSub === sub}
          onClick={() => setActiveSub(sub)}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeSub === sub ? 'bg-white text-primary shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
        >
          {sub}
        </button>
      ))}
    </div>
  );
};

const ResourceItem = ({ icon, name }: { icon: string, name: string }) => (
  <div className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors">
    <div className="flex items-center space-x-4">
      <i className={`fas ${icon} text-slate-400 text-xl`}></i>
      <span className="font-medium text-slate-700">{name}</span>
    </div>
    <button className="text-primary hover:text-primary-dark font-medium text-sm">Abrir</button>
  </div>
);

const SectionBlock = ({ title, icon, resources }: { title: string, icon: string, resources: { icon: string, name: string }[] }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mt-8">
    <div className="flex items-center space-x-4 mb-6">
      <div className="w-12 h-12 rounded-xl bg-primary-light/20 text-primary flex items-center justify-center">
        <i className={`fas ${icon} text-xl`}></i>
      </div>
      <h3 className="text-2xl font-bold text-slate-800">{title}</h3>
    </div>
    <div className="space-y-2">
      {resources.map((res, i) => (
        <React.Fragment key={i}>
          <ResourceItem {...res} />
          {i < resources.length - 1 && <hr className="border-slate-100" />}
        </React.Fragment>
      ))}
    </div>
  </div>
);

export const CourseInternalView: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [courseTitle, setCourseTitle] = useState(courseId ? courseId.toUpperCase() : 'CURSO');
  const [activeTab, setActiveTab] = useState('Curso');
  const [activeSub, setActiveSub] = useState('General');
  const [isEditMode, setIsEditMode] = useState(false);
  const [resources, setResources] = useState([
    { icon: 'fa-file-pdf', name: 'Programa del Curso.pdf' },
    { icon: 'fa-link', name: 'Enlace a la plataforma de videoconferencias' },
    { icon: 'fa-file-alt', name: 'Reglamento interno.docx' }
  ]);

  const addResource = () => {
    const name = prompt("Nombre del nuevo recurso:");
    if (name) {
      setResources([...resources, { icon: 'fa-file-alt', name }]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-primary-dark p-10 rounded-[2.5rem] text-white shadow-lg relative">
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
        >
          <i className="fas fa-arrow-left"></i>
          <span>Volver</span>
        </button>
        <button 
          onClick={() => setIsEditMode(!isEditMode)}
          className="absolute top-4 right-4 flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
        >
          <i className={`fas ${isEditMode ? 'fa-save' : 'fa-edit'}`}></i>
          <span>{isEditMode ? 'Guardar Cambios' : 'Editar Curso'}</span>
        </button>
        {isEditMode ? (
          <input 
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
            className="text-4xl font-bold tracking-tight mt-8 bg-transparent border-b-2 border-white w-full outline-none"
          />
        ) : (
          <h1 className="text-4xl font-bold tracking-tight mt-8">{courseTitle}</h1>
        )}
        <Breadcrumbs />
      </header>

      {/* Menus */}
      <CourseTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      {activeTab === 'Curso' && <ContentSubmenu activeSub={activeSub} setActiveSub={setActiveSub} />}

      {/* Content */}
      <main className="mt-8">
        {activeTab === 'Curso' ? (
          <div className="p-8 bg-white rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Sección: {activeSub}</h2>
            <div className="space-y-4">
              {resources.map((res, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <span className="font-medium text-slate-700">{res.name}</span>
                  <button className="text-primary hover:text-primary-dark font-medium text-sm">Abrir</button>
                </div>
              ))}
              {isEditMode && (
                <button 
                  onClick={addResource}
                  className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-primary hover:text-primary transition-colors"
                >
                  <i className="fas fa-plus mr-2"></i> Añadir Recurso
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 bg-white rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Sección: {activeTab}</h2>
            <p className="text-slate-600">Aquí se mostrará la información de {activeTab}.</p>
          </div>
        )}
      </main>
    </div>
  );
};
