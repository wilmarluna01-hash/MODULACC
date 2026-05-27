
import React, { useContext, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../App';
import { Role } from '../../types';
import { APP_ROUTES, APP_NAME, KEYBOARD_SHORTCUTS } from '../../constants';
import { AccessibleButton } from '../Shared/AccessibleButton';

interface NavLinkItem {
  to: string;
  label: string;
  shortcut: {
    name: string;
    key: string;
    path: string; 
  };
}

export const Navbar: React.FC = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [isModulesDropdownOpen, setIsModulesDropdownOpen] = useState(false);
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);

  const handleLogout = async () => {
    if (auth) {
      await auth.logout();
      navigate(APP_ROUTES.LOGIN);
    }
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium tracking-wide whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-accent ${
      isActive ? 'bg-primary-dark text-white' : 'text-gray-300 hover:bg-primary-light hover:text-white'
    }`;

  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block px-3 py-2 rounded-md text-base font-medium focus:outline-none focus:ring-2 focus:ring-accent ${
    isActive ? 'bg-primary-dark text-white' : 'text-gray-300 hover:bg-primary-light hover:text-white'
  }`;

  const commonLinks: NavLinkItem[] = [
    { to: APP_ROUTES.DASHBOARD, label: 'Panel Principal', shortcut: KEYBOARD_SHORTCUTS.DASHBOARD },
    { to: APP_ROUTES.FORUM, label: 'Foro de Consultas', shortcut: KEYBOARD_SHORTCUTS.FORUM },
    { to: APP_ROUTES.MY_PROGRESS, label: 'Mi Progreso', shortcut: KEYBOARD_SHORTCUTS.MY_PROGRESS },
    { to: APP_ROUTES.PERSONAL_EVALUATION, label: 'Evaluación Personal', shortcut: KEYBOARD_SHORTCUTS.PERSONAL_EVALUATION },
  ];

  const studentLinks: NavLinkItem[] = [
    { to: APP_ROUTES.SCIENCE, label: 'Atención Auditiva', shortcut: KEYBOARD_SHORTCUTS.ATTENTION },
    { to: APP_ROUTES.HISTORY, label: 'Memoria Auditiva', shortcut: KEYBOARD_SHORTCUTS.MEMORY },
    { to: APP_ROUTES.MATH, label: 'Discriminación Sonora', shortcut: KEYBOARD_SHORTCUTS.SURVEY },
    { to: APP_ROUTES.TECHNOLOGY, label: 'Tecnología e Informática', shortcut: KEYBOARD_SHORTCUTS.TECHNOLOGY },
  ];

  const adminLinks: NavLinkItem[] = [
    { to: APP_ROUTES.ADMIN_DASHBOARD, label: 'Panel Admin', shortcut: {key: 'a', name: 'Admin', path: APP_ROUTES.ADMIN_DASHBOARD } },
  ];

  let links: NavLinkItem[] = [...commonLinks];
  if (auth?.currentUser?.role === Role.Student) {
    links = [...links, ...studentLinks];
  }
  if (auth?.currentUser?.role === Role.Admin) {
    links = [...links, ...studentLinks, ...adminLinks]; // Admin can see student modules too
  }
  // Tutor might have a different set or subset of student links

  const renderNavLink = (link: NavLinkItem, isMobile: boolean = false) => (
    <NavLink
      key={link.to}
      to={link.to}
      className={isMobile ? mobileNavLinkClass : navLinkClass}
      onClick={() => {
        if (isMobile) setIsMobileMenuOpen(false);
        setIsModulesDropdownOpen(false);
      }}
      title={link.shortcut ? `${link.label} (Alt + ${link.shortcut.key.toUpperCase()})` : link.label}
    >
      {link.label}
      {link.shortcut && <span className="ml-1 text-xs opacity-75">(Alt+{link.shortcut.key.toUpperCase()})</span>}
    </NavLink>
  );

  return (
    <nav className="bg-primary-dark shadow-md" aria-label={APP_NAME}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center flex-shrink-0 relative">
            <button 
              onClick={() => setIsBrandDropdownOpen(!isBrandDropdownOpen)}
              onMouseEnter={() => setIsBrandDropdownOpen(true)}
              className="text-white text-xl font-bold tracking-wider hover:text-accent transition-colors flex items-center gap-2 focus:outline-none"
              aria-expanded={isBrandDropdownOpen}
              aria-haspopup="true"
            >
              {APP_NAME} <i className={`fas fa-chevron-down text-xs transition-transform ${isBrandDropdownOpen ? 'rotate-180' : ''}`}></i>
            </button>
            
            {isBrandDropdownOpen && (
              <div 
                className="absolute top-full left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 py-1"
                onMouseLeave={() => setIsBrandDropdownOpen(false)}
              >
                <Link 
                  to={APP_ROUTES.HELP} 
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                  onClick={() => setIsBrandDropdownOpen(false)}
                >
                  <i className="fas fa-question-circle text-primary"></i> Ayuda
                </Link>
              </div>
            )}
          </div>
          
          <div className="hidden md:flex items-center justify-end flex-1 ml-8">
            <div className="flex items-baseline space-x-1 lg:space-x-4 mr-6">
              {renderNavLink(commonLinks[0])} {/* Panel Principal */}
              
              {(auth?.currentUser?.role === Role.Student || auth?.currentUser?.role === Role.Admin) && (
                <div className="relative">
                  <button
                    onClick={() => setIsModulesDropdownOpen(!isModulesDropdownOpen)}
                    onMouseEnter={() => setIsModulesDropdownOpen(true)}
                    className={`px-3 py-2 rounded-md text-sm font-medium tracking-wide whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-accent flex items-center text-gray-300 hover:bg-primary-light hover:text-white transition-colors`}
                  >
                    Módulos <i className={`fas fa-chevron-down ml-2 text-xs transition-transform ${isModulesDropdownOpen ? 'rotate-180' : ''}`}></i>
                  </button>
                  
                  {isModulesDropdownOpen && (
                    <div 
                      className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 py-1"
                      onMouseLeave={() => setIsModulesDropdownOpen(false)}
                    >
                      {studentLinks.map(link => (
                        <NavLink
                          key={link.to}
                          to={link.to}
                          className={({ isActive }) => 
                            `block px-4 py-2 text-sm ${isActive ? 'bg-primary-light text-white' : 'text-slate-700 hover:bg-slate-100'}`
                          }
                          onClick={() => setIsModulesDropdownOpen(false)}
                        >
                          <div className="flex justify-between items-center">
                            <span>{link.label}</span>
                            <span className="text-[10px] opacity-50 font-mono">Alt+{link.shortcut.key.toUpperCase()}</span>
                          </div>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {commonLinks.slice(1).map(link => renderNavLink(link))}
              {auth?.currentUser?.role === Role.Admin && adminLinks.map(link => renderNavLink(link))}
            </div>
            
            {auth?.currentUser && (
              <div className="flex items-center border-l border-primary-light pl-6 gap-4">
                <span className="text-gray-300 mr-4 text-sm hidden lg:block">Hola, {auth.currentUser.name || auth.currentUser.email}</span>
                <AccessibleButton
                  onClick={handleLogout}
                  variant="secondary"
                  size="sm"
                  ariaLabel="Cerrar sesión"
                  title={`Cerrar Sesión (Alt + ${KEYBOARD_SHORTCUTS.LOGOUT.key.toUpperCase()})`}
                >
                  Salir <span className="ml-1 text-xs opacity-75">(Alt+{KEYBOARD_SHORTCUTS.LOGOUT.key.toUpperCase()})</span>
                </AccessibleButton>
              </div>
            )}
          </div>

          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              type="button"
              className="bg-primary-dark inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-dark focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Abrir menú principal</span>
              {isMobileMenuOpen ? (
                <i className="fas fa-times block h-6 w-6"></i>
              ) : (
                <i className="fas fa-bars block h-6 w-6"></i>
              )}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {renderNavLink(commonLinks[0], true)}
            
            {(auth?.currentUser?.role === Role.Student || auth?.currentUser?.role === Role.Admin) && (
              <div className="space-y-1">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Módulos</div>
                {studentLinks.map(link => renderNavLink(link, true))}
              </div>
            )}

            {commonLinks.slice(1).map(link => renderNavLink(link, true))}
            {auth?.currentUser?.role === Role.Admin && adminLinks.map(link => renderNavLink(link, true))}
          </div>
          {auth?.currentUser && (
            <div className="pt-4 pb-3 border-t border-primary-dark">
              <div className="flex items-center px-5">
                <div className="ml-3">
                  <div className="text-base font-medium leading-none text-white">{auth.currentUser.name || auth.currentUser.email}</div>
                  <div className="text-sm font-medium leading-none text-gray-400">{auth.currentUser.email}</div>
                </div>
              </div>
              <div className="mt-3 px-2 space-y-1">
                <AccessibleButton
                  onClick={handleLogout}
                  variant="ghost"
                  fullWidth
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-primary-light" // This className might be overridden by fullWidth styles in AccessibleButton
                  ariaLabel="Cerrar sesión"
                  title={`Cerrar Sesión (Alt + ${KEYBOARD_SHORTCUTS.LOGOUT.key.toUpperCase()})`}
                >
                  Salir <span className="ml-1 text-xs opacity-75">(Alt+{KEYBOARD_SHORTCUTS.LOGOUT.key.toUpperCase()})</span>
                </AccessibleButton>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>

  );
};
