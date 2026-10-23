// src/features/agri-chat/AgriChatView.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Skill, SkillId, ChatMessage } from './types';
import { SKILLS_CATALOG } from './data/skillsCatalog';
import { agriChatService } from './services/agriChatService';
import { useAgriChatExploration } from './hooks/useAgriChatExploration';
import { ChatHeader } from './components/ChatHeader';
import { ChatDesktopSidebar } from './components/ChatDesktopSidebar';
import { ChatConversationPane } from './components/ChatConversationPane';
import { SkillSelectorBar } from './components/SkillSelectorBar';
import { ExplorationProfileBar } from './components/ExplorationProfileBar';
import { SkillPaywallModal } from './components/SkillPaywallModal';

const INITIAL_WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: 'Olá! Sou o Assistente DATERRA. Estou configurado com os seus perfis de exploração e com o catálogo de 10 skills especializadas.\n\nSelecione uma skill e a sua parcela/pulverizador para obter respostas totalmente adaptadas ao seu caso real.',
  skillId: 'geral',
  createdAt: new Date().toISOString()
};

export const AgriChatView: React.FC = () => {
  const navigate = useNavigate();
  const [activeSkillId, setActiveSkillId] = useState<SkillId>('geral');
  const [unlockedSkills, setUnlockedSkills] = useState<Record<SkillId, boolean>>(
    agriChatService.getUserSkillAccess()
  );
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [paywallModalSkill, setPaywallModalSkill] = useState<Skill | null>(null);

  const {
    cultures,
    equipments,
    nozzles,
    calibrations,
    activeContext,
    setActiveContext,
    isContextEnabled,
    setIsContextEnabled
  } = useAgriChatExploration();

  const handleSelectSkill = (id: SkillId) => {
    setActiveSkillId(id);
    const skill = SKILLS_CATALOG.find((s) => s.id === id);
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: 'system',
        content: `Módulo ativo alterado para: **${skill?.name}** (v${skill?.version})`,
        skillId: id,
        createdAt: new Date().toISOString()
      }
    ]);
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text.trim(),
      skillId: activeSkillId,
      explorationContext: isContextEnabled ? activeContext : undefined,
      createdAt: new Date().toISOString()
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await agriChatService.sendMessage(
        text.trim(),
        activeSkillId,
        messages,
        isContextEnabled ? activeContext : undefined
      );
      setMessages((prev) => [...prev, response]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Ocorreu um erro ao processar a consulta. Por favor, tente novamente.',
          skillId: activeSkillId,
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetConversation = () => {
    setMessages([{ ...INITIAL_WELCOME_MESSAGE, id: crypto.randomUUID(), createdAt: new Date().toISOString() }]);
  };

  const activeSkill = SKILLS_CATALOG.find((s) => s.id === activeSkillId);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* 1. Header do Assistente perfeitamente enquadrado na grelha da página */}
      <ChatHeader
        activeSkill={activeSkill}
        onBack={() => navigate(-1)}
        activeContext={activeContext}
        isContextEnabled={isContextEnabled}
      />

      {/* 2. Seletores Mobile (Ocultos em desktop lg:) */}
      <div className="lg:hidden shrink-0 space-y-2 mb-2">
        <SkillSelectorBar
          activeSkillId={activeSkillId}
          unlockedSkills={unlockedSkills}
          onSelectSkill={handleSelectSkill}
          onRequestUnlock={(skill) => setPaywallModalSkill(skill)}
        />
        <ExplorationProfileBar
          cultures={cultures}
          equipments={equipments}
          nozzles={nozzles}
          calibrations={calibrations}
          activeContext={activeContext}
          isContextEnabled={isContextEnabled}
          onToggleContext={setIsContextEnabled}
          onUpdateContext={(updates) => setActiveContext((prev) => ({ ...prev, ...updates }))}
        />
      </div>

      {/* 3. Área Principal do Workspace: 2 Colunas em Desktop / 1 Coluna em Mobile */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden min-h-0">
        <ChatDesktopSidebar
          activeSkillId={activeSkillId}
          unlockedSkills={unlockedSkills}
          onSelectSkill={handleSelectSkill}
          onRequestUnlock={(skill) => setPaywallModalSkill(skill)}
          cultures={cultures}
          equipments={equipments}
          nozzles={nozzles}
          calibrations={calibrations}
          activeContext={activeContext}
          isContextEnabled={isContextEnabled}
          onToggleContext={setIsContextEnabled}
          onUpdateContext={(updates) => setActiveContext((prev) => ({ ...prev, ...updates }))}
        />

        <ChatConversationPane
          activeSkill={activeSkill}
          activeSkillId={activeSkillId}
          activeContext={isContextEnabled ? activeContext : undefined}
          messages={messages}
          isLoading={isLoading}
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSendMessage={handleSendMessage}
          onResetConversation={handleResetConversation}
          onRequestUnlockSkill={(id) => {
            const target = SKILLS_CATALOG.find((s) => s.id === id);
            if (target) setPaywallModalSkill(target);
          }}
        />
      </div>

      {/* 4. Modal de Subscrição / Desbloqueio de Skills */}
      <SkillPaywallModal
        skill={paywallModalSkill}
        isOpen={Boolean(paywallModalSkill)}
        onClose={() => setPaywallModalSkill(null)}
        onConfirmUnlock={(skillId) => {
          agriChatService.unlockSkillLocally(skillId);
          setUnlockedSkills(agriChatService.getUserSkillAccess());
          setPaywallModalSkill(null);
          handleSelectSkill(skillId);
        }}
      />
    </div>
  );
};
