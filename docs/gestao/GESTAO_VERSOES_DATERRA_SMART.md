# 📘 Manual de Gestão e Versionamento — DATERRA Smart

> **Localização:** `docs/gestao/GESTAO_VERSOES_DATERRA_SMART.md`  
> **Repositório Oficial Único:** `https://github.com/daterra-digital/daterra-smart`  
> **Referência Publicada Ativa:** `https://daterra-digital.github.io/daterra-smart/` (V-PAGES)  
> **Produção Oficial cPanel:** `https://smart.daterra.com.pt/` (V-PROD)

---

## 1. Regras Obrigatórias e Imutáveis

1. **Repositório Único:** Existe apenas UM repositório oficial (`daterra-digital/daterra-smart`). É proibido criar repositórios paralelos, bifurcações descontroladas ou pastas duplicadas fora da estrutura Git.
2. **Fluxo Estrito de 4 Estados:**
   $$\text{V-DEV} \longrightarrow \text{V-RC} \longrightarrow \text{V-PAGES} \longrightarrow \text{V-PROD}$$
3. **Preservação da V-PAGES:** A versão atualmente publicada no GitHub Pages é a referência inviolável e não pode ser substituída sem aprovação explícita e validação prévia.
4. **Publicação Automatizada com Gate de Aprovação Ilustrado:**
   - As publicações para o GitHub Pages e para o cPanel podem ser automáticas (via pipeline CI/CD de GitHub Actions), **mas são obrigatoriamente precedidas de um Relatório Ilustrativo de Prontidão de Release**.
   - O relatório deve ser simples, totalmente ilustrativo e visual, detalhando:
     - O que está em causa (o que mudou, testes realizados e impacto visual/agronómico).
     - Identificador da versão, SHA do commit e integridade das calculadoras.
   - **Apenas após a aprovação expressa do utilizador** é que a execução automatizada de publicação para o GitHub Pages (ou cPanel) é disparada.
5. **Segregação de Ambientes Firebase:**
   - **Firebase de Desenvolvimento / Testes (`daterra-smart-4c0cf`):** Usado em localhost e no GitHub Pages.
   - **Firebase de Produção:** Usado exclusivamente em `smart.daterra.com.pt`.
6. **Padrão SemVer (MAJOR.MINOR.PATCH):**
   - **PATCH (x.y.Z):** Correções de bugs, pequenas melhorias visuais e ajustes cosméticos.
   - **MINOR (x.Y.z):** Novas calculadoras, novas ferramentas ou novas secções da aplicação.
   - **MAJOR (X.y.z):** Alterações de arquitetura, mudança de modelos de dados, autenticação ou reestruturações profundas.
7. **Identificação Visível Obrigatória:** Em **Definições > Ajuda & Suporte**, a aplicação deve exibir de forma clara:
   - DATERRA Smart
   - Número da Versão (ex.: `1.0.0`)
   - Ambiente (`Desenvolvimento` / `Homologação GitHub Pages` / `Produção cPanel`)
   - Data da Versão
   - Hash do Commit Git

---

## 2. Definição Detalhada dos 4 Estados

| Estado | Significado | Branch / Origem | Finalidade |
| :--- | :--- | :--- | :--- |
| **V-DEV** | Versão de Desenvolvimento | `develop` | Trabalho local isolado, limpeza, correções e novas funcionalidades. |
| **V-RC** | Release Candidate | Tag `vX.Y.Z-rcN` | Versão congelada para validação e testes exaustivos sem novas adições de código. |
| **V-PAGES** | Versão de Homologação | Tag `vX.Y.Z-pages` | Versão validada em ambiente real no GitHub Pages após aprovação de relatório. |
| **V-PROD** | Versão Oficial de Produção | Tag `vX.Y.Z-prod` | Versão estável em produção no cPanel (`smart.daterra.com.pt`) após aprovação de relatório. |

---

## 3. Estrutura do Relatório Ilustrativo de Prontidão de Release

Antes de qualquer publicação para GitHub Pages ou cPanel, o agente gera e apresenta um relatório em Markdown (ou Artifact visual) com o seguinte esquema obrigatório:

```markdown
### 🚀 Relatório de Prontidão de Release (Gate de Aprovação)
- **Versão:** vX.Y.Z (Commit: abc1234)
- **Destino:** [GitHub Pages (Homologação) | cPanel (Produção)]
- **O que mudou:** [Resumo em linguagem simples de cada melhoria ou correção]
- **Impacto Visual:** [O que o agricultor vai ver no ecrã e comportamento móvel]
- **Impacto Agronómico:** [Garantia de conformidade com fórmulas DGAV/EPPO]
- **Evidências de Teste:** [Status de build, lint e testes matemáticos]
- **Plano de Rollback Imediato:** [Como reverter com 1 clique se necessário]

👉 *Aprova a publicação automática desta versão para o ambiente de destino?*
```

---

## 4. Checklists de Validação de Transição

### 4.1. Checklist para Criar V-RC (a partir da V-DEV)
- [ ] `npm ci` executa sem avisos críticos ou erros.
- [ ] `npm run build` compila a pasta `dist/` sem erros.
- [ ] `npm run lint` aprova o código sem violações de regras.
- [ ] Testes unitários e matemáticos (`test/*.test.mjs`) passam a 100%.
- [ ] Todas as calculadoras agrícolas homologadas abrem e calculam corretamente em localhost.
- [ ] Navegação móvel e desktop opera sem anomalias de layout.
- [ ] Versão atualizada em `VERSION.md`, `CHANGELOG.md` e em `Definições > Ajuda & Suporte`.

### 4.2. Checklist para Publicar V-PAGES no GitHub Pages
- [ ] Candidata V-RC validada e congelada.
- [ ] Tag Git `vX.Y.Z-pages` criada e associada ao commit aprovado.
- [ ] **Relatório Ilustrativo de Prontidão** apresentado e aprovado expressamente pelo utilizador.
- [ ] Execução automatizada do workflow de publicação para o GitHub Pages.
- [ ] Verificação da resposta HTTP 200 no URL público do GitHub Pages.

### 4.3. Checklist para Publicar V-PROD no cPanel
- [ ] Versão em execução no GitHub Pages comprovada em campo sem anomalias.
- [ ] Configuração do Firebase de Produção confirmada.
- [ ] Tag Git `vX.Y.Z-prod` criada.
- [ ] **Relatório Ilustrativo de Prontidão** apresentado e aprovado expressamente pelo utilizador.
- [ ] Execução automatizada do workflow do cPanel com credenciais FTP seguras.
- [ ] Verificação de funcionamento em `https://smart.daterra.com.pt/`.

---

## 5. Política de Retenção de 3 Versões e Rollback

Para garantir que a plataforma nunca fica refém de uma atualização com falhas, o sistema mantém sempre acessíveis pelo menos **três versões completas e recuperáveis**:
1. **Versão Ativa:** A versão atualmente em serviço no GitHub Pages.
2. **Versão Anterior (N-1):** A versão imediatamente anterior, identificada por Tag e Release.
3. **Versão de Referência (N-2):** A versão histórica anterior, identificada por Tag e Release.

### Procedimento de Rollback Imediato
Através do workflow dedicado `.github/workflows/rollback-github-pages.yml`, o administrador pode, a qualquer momento e com acionamento simples:
1. Introduzir o nome de uma tag anterior válida (ex.: `v1.0.0-pages`).
2. O workflow faz o checkout dessa tag exata, compila e republica no GitHub Pages.
3. A versão com problemas é substituída em minutos, sem tocar no cPanel.
