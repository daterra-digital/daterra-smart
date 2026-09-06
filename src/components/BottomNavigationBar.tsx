import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calculator, GraduationCap, Map } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const BottomNavigationBar: React.FC = () => {
  const { t } = useLanguage();

  const navItems = [
    {
      to: '/dashboard',
      label: t('nav.home', 'Início'),
      icon: LayoutDashboard,
      ariaLabel: t('nav.home', 'Início')
    },
    {
      to: '/ferramentas',
      label: t('nav.tools', 'Ferramentas'),
      icon: Calculator,
      ariaLabel: t('nav.tools', 'Ferramentas')
    },
    {
      to: '/academia',
      label: t('nav.academy', 'Academia'),
      icon: GraduationCap,
      ariaLabel: t('nav.academy', 'Academia')
    },
    {
      to: '/exploracao',
      label: t('nav.parcels', 'Parcelas'),
      icon: Map,
      ariaLabel: t('nav.parcels', 'Parcelas')
    }
  ];

  return (
    <nav
      role="navigation"
      aria-label="Navegação móvel principal"
      className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
      style={{
        paddingBottom: 'var(--bottom-safe-area, env(safe-area-inset-bottom, 0px))'
      }}
    >
      <div
        className="grid grid-cols-4 items-center w-full px-1"
        style={{
          height: 'var(--bottom-nav-content-height, 4rem)'
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              aria-label={item.ariaLabel}
              className={({ isActive }) =>
                `h-full w-full min-h-[48px] min-w-[48px] flex flex-col items-center justify-center gap-1 transition-colors motion-reduce:transition-none select-none ${
                  isActive
                    ? 'text-daterra-primary font-bold'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`relative flex items-center justify-center px-3 py-0.5 rounded-full transition-all motion-reduce:transition-none ${
                      isActive ? 'bg-daterra-accent-light text-daterra-primary shadow-xs' : ''
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 transition-transform motion-reduce:transform-none ${
                        isActive ? 'scale-110 text-daterra-primary' : 'text-slate-600'
                      }`}
                      aria-hidden="true"
                    />
                  </div>
                  <span
                    className={`text-[11px] leading-none tracking-tight truncate max-w-full px-1 ${
                      isActive ? 'text-daterra-primary font-extrabold' : 'text-slate-600 font-medium'
                    }`}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
