import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LogIn, GraduationCap, ExternalLink, Menu, X } from 'lucide-react';
import daterraLogo from '../assets/daterra-logo.svg';
import bannerFinanciamento from '../assets/banner-financiamento.svg';

export const PublicLayout: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-[#F2F2F2]">
      {/* Barra de Formação Superior: Divulgação da Academia DATERRA */}
      <div className="bg-daterra-primary text-slate-100 text-xs py-2 px-4 border-b border-daterra-secondary/30">
        <div className="max-w-7xl mx-auto flex items-center justify-center text-center">
          <a
            href="https://academia.daterra.com.pt"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 hover:text-[#3CA64C] transition-colors group"
          >
            <GraduationCap className="w-4 h-4 text-[#3CA64C] shrink-0 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] sm:text-xs">
              Formação e capacitação contínua para profissionais agrícolas: Conheça a{' '}
              <strong className="text-white font-bold underline decoration-[#3CA64C] decoration-2 underline-offset-2">
                Academia DATERRA
              </strong>
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#3CA64C] shrink-0 ml-0.5" />
          </a>
        </div>
      </div>

      {/* Header Público com daterra-logo.svg */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo DATERRA no Topo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src={daterraLogo}
              alt="DATERRA Logo"
              className="h-12 w-auto object-contain"
            />
          </Link>

          {/* Menu Desktop */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
            <Link
              to="/"
              className={`transition-colors ${isActive('/') ? 'text-daterra-accent font-bold' : 'text-slate-700 hover:text-daterra-primary'}`}
            >
              Início
            </Link>
            <a
              href="#sobre"
              className="text-slate-700 hover:text-daterra-primary transition-colors"
            >
              Sobre
            </a>
            <Link
              to="/login"
              className="text-slate-700 hover:text-daterra-primary transition-colors"
            >
              Academia
            </Link>
            <Link
              to="/login"
              className="px-5 py-2.5 bg-daterra-primary hover:bg-daterra-primary-hover text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 touch-target"
            >
              <LogIn className="w-4 h-4 text-daterra-accent" />
              <span>Login</span>
            </Link>
          </nav>

          {/* Botão Menu Mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-700 hover:text-daterra-primary touch-target flex items-center justify-center"
            aria-label="Abrir Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Menu Drawer Mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 py-5 space-y-3 shadow-lg">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 px-4 rounded-xl text-base font-bold text-slate-800 hover:bg-slate-100"
            >
              Início
            </Link>
            <a
              href="#sobre"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 px-4 rounded-xl text-base font-semibold text-slate-700 hover:bg-slate-100"
            >
              Sobre
            </a>
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 px-4 rounded-xl text-base font-semibold text-slate-700 hover:bg-slate-100"
            >
              Academia DATERRA
            </Link>
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 bg-daterra-primary text-white text-center font-bold rounded-xl flex items-center justify-center gap-2 shadow-md touch-target"
            >
              <LogIn className="w-5 h-5 text-daterra-accent" />
              <span>Aceder à Plataforma</span>
            </Link>
          </div>
        )}
      </header>

      {/* Conteúdo da Página */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Banner de Financiamento PRR — sem fundo CSS, transparência nativa respeitada */}
      <div className="w-full">
        <img
          src={bannerFinanciamento}
          alt="Banner de Financiamento PRR - AgroSmart DATERRA"
          className="w-full h-auto object-contain"
          style={{ display: 'block' }}
        />
      </div>

      {/* Rodapé Institucional com daterra-logo.svg */}
      <footer className="bg-daterra-primary text-white border-t border-daterra-secondary/30 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            {/* Logo daterra-logo.svg no rodapé */}
            <div className="mb-4">
              <img
                src={daterraLogo}
                alt="DATERRA Logo"
                className="h-10 w-auto object-contain brightness-0 invert"
              />
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tecnologia de precisão e capacitação Offline-First para o setor agroalimentar e proteção de culturas.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-daterra-accent mb-3">Financiamento</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              PRR - Plano de Recuperação e Resiliência<br />
              Projeto N.º 23703 - AgroSmart DATERRA
            </p>
          </div>

          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-daterra-accent mb-3">Módulos SaaS</h4>
            <ul className="text-xs text-slate-300 space-y-1.5">
              <li>Calculadoras de Precisão</li>
              <li>Agromonitoring Weather & NDVI</li>
              <li>Academia Moodle DATERRA</li>
              <li>Gestão de Equipamento & Caldas</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-daterra-accent mb-3">Suporte & Contacto</h4>
            <p className="text-xs text-slate-300">
              Email: suporte@daterra-smart.pt<br />
              Telefone: +351 210 000 000<br />
              Portugal
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-white/10 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} DATERRA Smart. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
};
