import React from 'react';
import { 
  HelpCircle, MessageSquare, BookOpen, 
  Mail, ExternalLink
} from 'lucide-react';

export const HelpView: React.FC = () => {
  const faqs = [
    {
      q: 'O que é a DATERRA Smart?',
      a: 'A DATERRA Smart é uma plataforma digital para agricultura de precisão, que inclui calculadoras agrícolas, gestão de perfis e ferramentas para profissionais do setor.'
    },
    {
      q: 'Como alterar o meu perfil?',
      a: 'Acede a Definições > Perfil do Utilizador e edita os teus dados. As alterações são guardadas automaticamente no Supabase após clicares em "Guardar Alterações".'
    },
    {
      q: 'Como contactar o suporte?',
      a: 'Podes contactar-nos diretamente através do email suporte@daterra.com.pt para apoio técnico ou esclarecimento de dúvidas.'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12 max-w-4xl mx-auto">
      {/* Cabeçalho */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-slate-200">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[#1D734B] text-xs font-bold mb-3 border border-emerald-100">
          <HelpCircle className="w-4 h-4 text-[#3CA64C]" />
          <span>Centro de Ajuda</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#114037]">
          Ajuda & Suporte
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Perguntas frequentes, guias práticos e canais de assistência técnica.
        </p>
      </div>

      {/* Secção 1: FAQ */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-slate-200 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <MessageSquare className="w-5 h-5 text-[#1D734B]" />
          <h2 className="text-lg font-black text-[#114037]">
            Perguntas Frequentes (FAQ)
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2"
            >
              <h3 className="font-bold text-slate-900 text-sm flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#114037] text-white flex items-center justify-center text-xs shrink-0 mt-0.5 font-bold">
                  ?
                </span>
                <span>{faq.q}</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 pl-7 leading-relaxed font-medium">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Secção 2: Documentação & Suporte */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Guia de Utilização */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-slate-200 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#1D734B] flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-black text-[#114037]">
              Documentação e Guias
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Consulte os manuais técnicos, boas práticas fitossanitárias da DGAV/EPPO e tutoriais passo a passo.
            </p>
          </div>

          <a
            href="https://academia.daterra.com.pt"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 min-h-[48px] bg-[#114037] hover:bg-[#175348] text-white font-bold text-xs rounded-2xl transition-all shadow-md touch-target"
          >
            <span>Consultar guia de utilização</span>
            <ExternalLink className="w-4 h-4 text-[#3CA64C]" />
          </a>
        </div>

        {/* Reportar Problema / Contacto */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-soft border border-slate-200 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#1D734B] flex items-center justify-center font-bold">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="text-base font-black text-[#114037]">
              Apoio Técnico Direto
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Encontrou alguma anomalia ou precisa de apoio operacional no terreno? A nossa equipa técnica está disponível.
            </p>
          </div>

          <a
            href="mailto:suporte@daterra.com.pt?subject=DATERRA%20Smart%20-%20Suporte%20T%C3%A9cnico"
            className="inline-flex items-center justify-center gap-2 px-5 min-h-[48px] bg-[#3CA64C] hover:bg-[#3AAA35] text-white font-bold text-xs rounded-2xl transition-all shadow-md touch-target"
          >
            <span>Reportar um problema</span>
            <Mail className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Versão */}
      <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 text-center text-xs font-mono-numbers text-slate-500 font-bold">
        Versão: 1.0.0 (DATERRA Smart PWA)
      </div>
    </div>
  );
};
