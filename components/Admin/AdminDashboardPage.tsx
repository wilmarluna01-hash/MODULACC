
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../App';
import { User, Role, ProgressData, Module } from '../../types';
import { LoadingSpinner } from '../Shared/LoadingSpinner';
import { AccessibleButton } from '../Shared/AccessibleButton';
import { AccessibleInput } from '../Shared/AccessibleInput';
import { toast } from '../Shared/Toast';
import { getUserAttempts, getProgressStats } from '../../services/audioProgressService';

// ... (rest of the file remains same, just adding new reporting logic inside handleViewReport)

const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(r => Object.values(r).join(','));
  const csv = [headers, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
};

// Mock API calls for admin functions
const mockAdminApi = {
  getUsers: async (): Promise<User[]> => {
    console.log("API Call: Admin fetching users");
    await new Promise(resolve => setTimeout(resolve, 1000));
    return [
      { id: "student1", email: "student@example.com", role: Role.Student, name: "Estudiante Uno" },
      { id: "student2", email: "student.two@example.com", role: Role.Student, name: "Estudiante Dos" },
      { id: "tutor1", email: "tutor@example.com", role: Role.Tutor, name: "Tutor Ejemplo" },
    ];
  },
  updateUser: async (userId: string, updates: Partial<User>): Promise<User> => {
    console.log(`API Call: Admin updating user ${userId}`, updates);
    await new Promise(resolve => setTimeout(resolve, 500));
    return { id: userId, email: updates.email || 'test@example.com', role: updates.role || Role.Student, name: updates.name || 'Updated User' };
  },
  deleteUser: async (userId: string): Promise<void> => {
    console.log(`API Call: Admin deleting user ${userId}`);
    await new Promise(resolve => setTimeout(resolve, 500));
  },
  getStudentReport: async (studentId: string): Promise<ProgressData[]> => {
    console.log(`API Call: Admin fetching report for student ${studentId}`);
    await new Promise(resolve => setTimeout(resolve, 700));
    return [
      { moduleId: 'Atención Auditiva', score: Math.floor(Math.random()*30+70), completedExercises: Math.floor(Math.random()*5+5), totalExercises: 10, lastAccessed: new Date() },
      { moduleId: 'Memoria Auditiva', score: Math.floor(Math.random()*40+60), completedExercises: Math.floor(Math.random()*4+3), totalExercises: 7, lastAccessed: new Date() },
    ];
  },
  getModules: async (): Promise<Module[]> => {
    console.log("API Call: Admin fetching modules");
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      { id: 'auditory-attention', title: 'Atención Auditiva', description: 'Ejercicios para mejorar la concentración y el enfoque auditivo.', icon: 'fas fa-headphones', path: '/modules/auditory-attention' },
      { id: 'auditory-memory', title: 'Memoria Auditiva', description: 'Actividades para fortalecer la retención de información sonora.', icon: 'fas fa-brain', path: '/modules/auditory-memory' },
      { id: 'sound-survey', title: 'Encuesta Sonora', description: 'Exploración de paisajes sonoros y reconocimiento de entornos.', icon: 'fas fa-poll', path: '/modules/sound-survey' },
      { id: 'interview', title: 'Entrevista', description: 'Práctica de escucha activa y comprensión en diálogos.', icon: 'fas fa-comments', path: '/modules/interview' },
    ];
  },
  saveModule: async (module: Module): Promise<Module> => {
    console.log("API Call: Admin saving module", module);
    await new Promise(resolve => setTimeout(resolve, 500));
    return module;
  },
  deleteModule: async (moduleId: string): Promise<void> => {
    console.log(`API Call: Admin deleting module ${moduleId}`);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
};

interface UserManagementTableProps {
  users: User[];
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  onViewReport: (userId: string) => void;
}

const UserManagementTable: React.FC<UserManagementTableProps> = ({ users, onEditUser, onDeleteUser, onViewReport }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 shadow-sm rounded-2xl overflow-hidden border border-slate-100" aria-label="Tabla de gestión de usuarios">
        <thead className="bg-slate-50">
          <tr>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nombre</th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Rol</th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-100">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{user.name || 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{user.email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.role === Role.Admin ? 'bg-indigo-100 text-indigo-700' : 
                  user.role === Role.Tutor ? 'bg-emerald-100 text-emerald-700' : 
                  'bg-sky-100 text-sky-700'
                }`}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <AccessibleButton onClick={() => onEditUser(user)} variant="ghost" size="sm" ariaLabel={`Editar usuario ${user.name || user.email}`}>
                  <i className="fas fa-edit"></i>
                </AccessibleButton>
                {user.role === Role.Student && (
                    <AccessibleButton onClick={() => onViewReport(user.id)} variant="ghost" size="sm" ariaLabel={`Ver reporte de ${user.name || user.email}`}>
                        <i className="fas fa-chart-bar"></i>
                    </AccessibleButton>
                )}
                <AccessibleButton onClick={() => onDeleteUser(user.id)} variant="danger" size="sm" ariaLabel={`Eliminar usuario ${user.name || user.email}`}>
                  <i className="fas fa-trash"></i>
                </AccessibleButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

interface ModuleManagementTableProps {
  modules: Module[];
  onEditModule: (module: Module) => void;
  onDeleteModule: (moduleId: string) => void;
}

const ModuleManagementTable: React.FC<ModuleManagementTableProps> = ({ modules, onEditModule, onDeleteModule }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 shadow-sm rounded-2xl overflow-hidden border border-slate-100" aria-label="Tabla de gestión de módulos">
        <thead className="bg-slate-50">
          <tr>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Título</th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Icono</th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Ruta</th>
            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-100">
          {modules.map((module) => (
            <tr key={module.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{module.title}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                <i className={`${module.icon} mr-2`}></i> {module.icon}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{module.path}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <AccessibleButton onClick={() => onEditModule(module)} variant="ghost" size="sm" ariaLabel={`Editar módulo ${module.title}`}>
                  <i className="fas fa-edit"></i>
                </AccessibleButton>
                <AccessibleButton onClick={() => onDeleteModule(module.id)} variant="danger" size="sm" ariaLabel={`Eliminar módulo ${module.title}`}>
                  <i className="fas fa-trash"></i>
                </AccessibleButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Basic Modal Component (simplified)
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-lg w-full border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h2 id="modal-title" className="text-2xl font-bold text-slate-800">{title}</h2>
          <AccessibleButton onClick={onClose} variant="ghost" ariaLabel="Cerrar modal"><i className="fas fa-times text-slate-400"></i></AccessibleButton>
        </div>
        {children}
      </div>
    </div>
  );
};


export const AdminDashboardPage: React.FC = () => {
  const auth = useContext(AuthContext);
  const [users, setUsers] = useState<User[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [studentReport, setStudentReport] = useState<ProgressData[] | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'modules'>('users');


  const fetchData = async () => {
    setLoading(true);
    try {
      const [fetchedUsers, fetchedModules] = await Promise.all([
        mockAdminApi.getUsers(),
        mockAdminApi.getModules()
      ]);
      setUsers(fetchedUsers);
      setModules(fetchedModules);
    } catch (error) {
      toast.error("Error al cargar datos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.")) {
      try {
        await mockAdminApi.deleteUser(userId);
        toast.success("Usuario eliminado exitosamente.");
        setUsers(users.filter(user => user.id !== userId));
      } catch (error) {
        toast.error("Error al eliminar el usuario.");
      }
    }
  };
  
  const handleViewReport = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    setSelectedUser(user);
    setIsReportModalOpen(true);
    setReportLoading(true);
    try {
        const report = await mockAdminApi.getStudentReport(userId);
        setStudentReport(report);
    } catch (error) {
        toast.error("Error al cargar el reporte del estudiante.");
        setStudentReport(null);
    } finally {
        setReportLoading(false);
    }
  };

  const handleSaveUser = async (updatedUser: User) => {
    try {
      const savedUser = await mockAdminApi.updateUser(updatedUser.id, updatedUser);
      toast.success("Usuario actualizado.");
      setUsers(users.map(u => u.id === savedUser.id ? savedUser : u));
      setIsEditModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      toast.error("Error al actualizar usuario.");
    }
  };

  const handleEditModule = (module: Module) => {
    setSelectedModule(module);
    setIsModuleModalOpen(true);
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este módulo?")) {
      try {
        await mockAdminApi.deleteModule(moduleId);
        toast.success("Módulo eliminado.");
        setModules(modules.filter(m => m.id !== moduleId));
      } catch (error) {
        toast.error("Error al eliminar el módulo.");
      }
    }
  };

  const handleSaveModule = async (module: Module) => {
    try {
      const savedModule = await mockAdminApi.saveModule(module);
      toast.success("Módulo guardado.");
      if (modules.find(m => m.id === savedModule.id)) {
        setModules(modules.map(m => m.id === savedModule.id ? savedModule : m));
      } else {
        setModules([...modules, savedModule]);
      }
      setIsModuleModalOpen(false);
      setSelectedModule(null);
    } catch (error) {
      toast.error("Error al guardar el módulo.");
    }
  };

  const handleCreateModule = () => {
    setSelectedModule({ id: `mod-${Date.now()}`, title: '', description: '', icon: 'fas fa-book', path: '/modules/' });
    setIsModuleModalOpen(true);
  };

  const handleCreateUser = () => {
      setSelectedUser({id: `new-${Date.now()}`, email: '', role: Role.Student, name: ''});
      setIsEditModalOpen(true);
  };


  if (loading) {
    return <LoadingSpinner text="Cargando panel de administración..." fullScreen />;
  }
  
  if (auth?.currentUser?.role !== Role.Admin) {
    return <p className="text-center text-error">Acceso denegado.</p>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-8 bg-white min-h-screen">
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">Panel de Administración</h1>
        <p className="text-slate-500 text-lg">Gestiona usuarios, módulos y supervisa el progreso de la plataforma.</p>
      </header>

      <div className="flex space-x-1 bg-slate-100 p-1 rounded-2xl w-fit mb-8">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'users' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Usuarios
        </button>
        <button
          onClick={() => setActiveTab('modules')}
          className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'modules' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Módulos
        </button>
      </div>

      {activeTab === 'users' ? (
        <section aria-labelledby="user-management-title" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center mb-6">
              <h2 id="user-management-title" className="text-2xl font-bold text-slate-800">
              Gestión de Usuarios
              </h2>
              <AccessibleButton onClick={handleCreateUser} variant="primary" iconLeft={<i className="fas fa-user-plus"></i>}>
                  Crear Usuario
              </AccessibleButton>
          </div>
          {users.length > 0 ? (
            <UserManagementTable users={users} onEditUser={handleEditUser} onDeleteUser={handleDeleteUser} onViewReport={handleViewReport} />
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <p className="text-slate-500">No hay usuarios para mostrar.</p>
            </div>
          )}
        </section>
      ) : (
        <section aria-labelledby="module-management-title" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center mb-6">
              <h2 id="module-management-title" className="text-2xl font-bold text-slate-800">
              Gestión de Módulos
              </h2>
              <AccessibleButton onClick={handleCreateModule} variant="primary" iconLeft={<i className="fas fa-plus"></i>}>
                  Añadir Módulo
              </AccessibleButton>
          </div>
          {modules.length > 0 ? (
            <ModuleManagementTable modules={modules} onEditModule={handleEditModule} onDeleteModule={handleDeleteModule} />
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <p className="text-slate-500">No hay módulos registrados.</p>
            </div>
          )}
        </section>
      )}

      {/* Edit User Modal */}
      {selectedUser && (
        <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setSelectedUser(null);}} title={selectedUser.id.startsWith('new-') ? "Crear Nuevo Usuario" : "Editar Usuario"}>
          <EditUserForm user={selectedUser} onSave={handleSaveUser} onCancel={() => { setIsEditModalOpen(false); setSelectedUser(null); }} />
        </Modal>
      )}

      {/* Edit Module Modal */}
      {selectedModule && (
        <Modal isOpen={isModuleModalOpen} onClose={() => { setIsModuleModalOpen(false); setSelectedModule(null);}} title={selectedModule.id.startsWith('mod-') ? "Añadir Módulo" : "Editar Módulo"}>
          <EditModuleForm module={selectedModule} onSave={handleSaveModule} onCancel={() => { setIsModuleModalOpen(false); setSelectedModule(null); }} />
        </Modal>
      )}

      {/* Student Report Modal */}
        <Modal isOpen={isReportModalOpen} onClose={() => { setIsReportModalOpen(false); setSelectedUser(null); setStudentReport(null); }} title={`Reporte de ${selectedUser?.name || 'Estudiante'}`}>
            {reportLoading && <LoadingSpinner text="Cargando reporte..." />}
            {!reportLoading && studentReport && studentReport.length > 0 && (
                <div className="space-y-4">
                  {studentReport.map(item => (
                      <div key={item.moduleId} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-slate-800">{item.moduleId}</span>
                            <span className="text-primary font-bold">{item.score}%</span>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div className="bg-primary h-full" style={{ width: `${item.score}%` }}></div>
                          </div>
                          <p className="text-xs text-slate-500 mt-2">
                            {item.completedExercises} de {item.totalExercises} ejercicios completados
                          </p>
                      </div>
                  ))}
                </div>
            )}
            {!reportLoading && studentReport && studentReport.length === 0 && (
                <p className="text-center text-slate-500 py-8">Este estudiante aún no tiene progreso registrado.</p>
            )}
            {!reportLoading && !studentReport && (
                <p className="text-center text-error py-8">No se pudo cargar el reporte.</p>
            )}
        </Modal>
    </div>
  );
};

// EditUserForm component
interface EditUserFormProps {
  user: User;
  onSave: (user: User) => void;
  onCancel: () => void;
}
const EditUserForm: React.FC<EditUserFormProps> = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState<User>(user);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData(user);
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(formData);
    setIsSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <AccessibleInput id="userName" name="name" label="Nombre Completo" value={formData.name || ''} onChange={handleChange} required />
      <AccessibleInput id="userEmail" name="email" label="Correo Electrónico" type="email" value={formData.email} onChange={handleChange} required />
      <div>
        <label htmlFor="userRole" className="block text-sm font-semibold text-slate-700 mb-2">Rol del Usuario</label>
        <select id="userRole" name="role" value={formData.role} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-slate-50">
          {Object.values(Role).map(roleValue => (
            <option key={roleValue} value={roleValue}>{roleValue.charAt(0).toUpperCase() + roleValue.slice(1)}</option>
          ))}
        </select>
      </div>
      <div className="flex justify-end space-x-3 pt-6">
        <AccessibleButton type="button" onClick={onCancel} variant="ghost" disabled={isSaving}>Cancelar</AccessibleButton>
        <AccessibleButton type="submit" variant="primary" disabled={isSaving} iconLeft={isSaving ? <LoadingSpinner size="sm"/> : null}>
          {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </AccessibleButton>
      </div>
    </form>
  );
};

// EditModuleForm component
interface EditModuleFormProps {
  module: Module;
  onSave: (module: Module) => void;
  onCancel: () => void;
}
const EditModuleForm: React.FC<EditModuleFormProps> = ({ module, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Module>(module);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData(module);
  }, [module]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(formData);
    setIsSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <AccessibleInput id="modTitle" name="title" label="Título del Módulo" value={formData.title} onChange={handleChange} required />
      <div>
        <label htmlFor="modDesc" className="block text-sm font-semibold text-slate-700 mb-2">Descripción</label>
        <textarea
          id="modDesc"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-slate-50"
        />
      </div>
      <AccessibleInput id="modIcon" name="icon" label="Icono (FontAwesome class)" value={formData.icon} onChange={handleChange} required />
      <AccessibleInput id="modPath" name="path" label="Ruta (URL path)" value={formData.path} onChange={handleChange} required />
      
      <div className="flex justify-end space-x-3 pt-6">
        <AccessibleButton type="button" onClick={onCancel} variant="ghost" disabled={isSaving}>Cancelar</AccessibleButton>
        <AccessibleButton type="submit" variant="primary" disabled={isSaving} iconLeft={isSaving ? <LoadingSpinner size="sm"/> : null}>
          {isSaving ? 'Guardar Módulo' : 'Guardar Módulo'}
        </AccessibleButton>
      </div>
    </form>
  );
};
