# 🏷️ Registo Oficial de Versões — DATERRA Smart

> **Localização:** `docs/gestao/VERSION.md`  
> **Repositório Oficial:** `https://github.com/daterra-digital/daterra-smart`  
> **Padrão:** SemVer (`MAJOR.MINOR.PATCH`)

---

## 1. Quadro de Estados Atuais

| Estado do Fluxo | Versão Ativa | Tag Git | Commit SHA-40 | Ambiente / Destino | Data de Referência |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **V-PAGES (Atual)** | `1.0.0` | `v1.0.0-pages` *(a criar)* | `eb54766b1fcc54b201ffd6b1a8c51610bd6f3825` | GitHub Pages | 05/11/2026, 01:06:14 GMT |
| **V-DEV (Ativa)** | `1.0.1-dev` | *(Branch `develop`)* | `eb54766b1fcc54b201ffd6b1a8c51610bd6f3825` | Localhost (Ambiente de Testes) | 08/11/2026 |
| **V-RC** | *(Nenhuma)* | *(Pendente)* | — | Congelamento para Homologação | — |
| **V-PROD** | `1.0.0-prod` | `v1.0.0-prod` *(Pendente)* | — | cPanel (`smart.daterra.com.pt`) | — |

---

## 2. Regras Obrigatórias do Fluxo

$$\text{V-DEV} \longrightarrow \text{V-RC} \longrightarrow \text{V-PAGES} \longrightarrow \text{V-PROD}$$

1. **V-DEV (Branch `develop`):** Todo o trabalho de correção, limpeza e testes locais decorre exclusivamente nesta branch.
2. **V-RC (Tag `vX.Y.Z-rcN`):** Criada a partir de `develop` após validação integral. Fica congelada para testes sem novas funcionalidades.
3. **V-PAGES (Tag `vX.Y.Z-pages`):** Só após aprovação expressa da V-RC é que o workflow manual publica no GitHub Pages.
4. **V-PROD (Tag `vX.Y.Z-prod`):** O cPanel é o espelho público oficial e só é atualizado manualmente após validação em V-PAGES.

---

## 3. Histórico de Publicações e Tags Anteriores

- **Tag `v1.2.0-bilingual`:** Commit `236ec23` (27/10/2026) — Cobertura integral pt-PT/en-GB.
- **Tag `v1.0.0-fase1`:** Commit `cbbee56` (25/10/2026) — Conclusão do microlearning e Fase 1.
- **Commit `eb54766`:** 05/11/2026 — Integração da Calculadora de Aplicação Manual e base da V-PAGES-1.0.0.
