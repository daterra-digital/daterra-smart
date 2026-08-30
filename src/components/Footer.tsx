import React from 'react';
import { Link } from 'react-router-dom';
import daterraLogo from '../assets/daterra-logo.svg';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-daterra-primary text-white border-t border-daterra-secondary/30 py-12 px-4 sm:px-6 lg:px-8 mt-auto">
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
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            Ferramentas digitais práticas e capacitação técnica para o setor agroalimentar e proteção das culturas.
          </p>
        </div>

        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-daterra-accent mb-3">
            Financiamento
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            Projeto AgroSmart DATERRA<br />
            Projeto n.º 23703<br />
            Apoiado pelo PRR — Plano de Recuperação e Resiliência
          </p>
          <Link
            to="/projeto-agrosmart"
            className="inline-flex items-center gap-1.5 text-xs text-daterra-accent hover:text-white font-bold mt-2.5 transition-colors group"
          >
            <span>Ver detalhes do projeto</span>
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </Link>
        </div>

        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-daterra-accent mb-3">
            Ferramentas & Recursos
          </h4>
          <ul className="text-xs text-slate-300 space-y-1.5 font-medium">
            <li>Calculadoras Agrícolas de Precisão</li>
            <li>Informação e Acompanhamento Técnico</li>
            <li>
              <a
                href="https://academia.daterra.com.pt"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-daterra-accent transition-colors"
              >
                Academia DATERRA
              </a>
            </li>
            <li>Preparação e Calibração de Caldas</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-daterra-accent mb-3">
            Suporte & Contacto
          </h4>
          <p className="text-xs text-slate-300 font-medium">
            Email: suporte@daterra.com.pt<br />
            Telefone: +351 210 000 000<br />
            Portugal
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-white/10 text-center text-xs text-slate-400 font-medium">
        © {new Date().getFullYear()} DATERRA Smart. Todos os direitos reservados.
      </div>
    </footer>
  );
};
