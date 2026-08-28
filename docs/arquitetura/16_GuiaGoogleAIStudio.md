GUIA EDITORIAL MESTRE — DATERRA SMART 2.0
1. Papel deste guia
Este guia é a fonte editorial principal da DATERRA Smart 2.0. Serve para garantir consistência absoluta quando a aplicação for gerada ficheiro a ficheiro no Google AI Studio, evitando contradições entre páginas, componentes, textos, funcionalidades, base de dados e assistente IA.

A DATERRA Smart 2.0 é uma PWA agrícola mobile-first, orientada para uso real em campo, com foco no smartphone, possibilidade de uso em tablet e computador, e prioridade absoluta para clareza, rapidez, contraste visual e simplicidade funcional.

Este guia deve ser seguido sempre que houver geração de:
páginas.
componentes.
formulários.
mensagens.
botões i.
ajuda contextual.
textos editoriais.
conteúdo premium.
conteúdo público.
conteúdos de IA.
ecrãs administrativos.
microcopy de erro e validação.

2. Princípios estruturais
A aplicação deve crescer por fases, com decisões estáveis e controladas, evitando deriva de arquitetura, repetição inútil e contradições entre prompts, código e backend.
As decisões já validadas não devem ser rediscutidas sem motivo real, objetivo e comprovado. Se houver necessidade de alteração estrutural, isso deve ser feito por substituição formal da decisão anterior e não por omissão ou contradição informal.

A DATERRA Smart deve ser construída com:
núcleo estável;
módulos funcionais;
dados protegidos por Supabase;
RLS ativo;
assistência IA com fontes autorizadas;
organização editorial coerente.

3. Público-alvo e tom
O utilizador é um especialista agrícola com zero conhecimentos de programação. Tudo deve ser explicado em linguagem simples, direta e prática, sem jargão desnecessário.

A linguagem deve ser:
clara;
objetiva;
funcional;
respeitosa;
em português de Portugal;
adequada a uso no terreno.

Nunca se deve escrever como se a app fosse um produto técnico para programadores. A app deve parecer uma ferramenta agrícola útil, rápida e confiável.

4. Arquitetura editorial da app
A DATERRA Smart deve organizar-se por grupos funcionais claros:
marketing.
auth.
app autenticada.
admin.
biblioteca.
ferramentas.
definições.
histórico.
assistência IA.

Cada grupo deve ter linguagem própria, mas sempre consistente com a identidade geral do produto. As páginas públicas devem ser mais explicativas; as áreas autenticadas devem ser mais práticas; a área admin deve ser direta e operacional.

5. Nomenclatura oficial
5.1 Regra geral
Cada elemento deve ter:
nome público curto.
nome técnico interno estável.
slug consistente.
categoria funcional.
descrição curta.

5.2 Regras para ferramentas
O nome público é para o utilizador. O nome técnico interno é para organização, backend, histórico e prompts.

Exemplo:
Nome público: Volume de Calda.
Nome técnico: volume-calda-adequado.
Categoria: Calibração e débito.

5.3 Regras para ações
A mesma ação deve usar sempre o mesmo verbo:
criar.
editar.
publicar.
despublicar.
ativar.
desativar.
validar.
rever.
associar.
sincronizar.

5.4 Regras para termos agrícolas
Manter terminologia agrícola uniforme:
calda.
dose.
bicos.
entrelinha.
parede foliar.
volume de copa.
débito.
cultura.
pulverização.

Não introduzir variantes desnecessárias quando já existe nomenclatura consolidada.

6. Regras de UX mobile-first
A DATERRA Smart é mobile-first. O smartphone é o dispositivo principal. O tablet é suportado, mas não deve ser tratado como simples cópia do desktop.

6.1 Princípios obrigatórios
leitura rápida.
toque fácil.
baixa densidade de elementos por zona.
poucos passos por tarefa.
ação principal evidente.
contraste visual forte.
texto claro.
componentes grandes.
feedback imediato.
navegação simples.

6.2 Contexto real de uso
A interface deve funcionar em:
campo.
armazém.
viatura parada.
utilização rápida em movimento lento.
pouca conectividade.
luz exterior forte.

6.3 Estrutura visual
organização vertical simples.
uma tarefa principal por ecrã.
cartões claros.
resultados abaixo dos inputs.
evitar grelhas complexas em smartphone.
evitar múltiplas colunas em mobile.

6.4 Botões
botões grandes.
zonas de toque amplas.
ação principal dominante.
evitar elementos pequenos.
evitar dependência de hover.

7. Teclado personalizado
Este ponto é obrigatório e deve ser aplicado em smartphone e tablet pequeno.

Regra editorial
Em smartphone e tablet pequeno, todos os campos de introdução manual devem abrir o teclado mais adequado ao tipo de dado, com preferência por teclado numérico para valores agrícolas, medidas e quantidades, de forma a reduzir erros, acelerar o preenchimento e melhorar a usabilidade em campo.

Aplicação prática
Deve ser aplicado em:
calculadoras agrícolas.
formulários rápidos.
login e registo.
pedidos Moodle.
histórico e filtros.
campos de dose, volume, altura, largura, distância, tempo e preços.

Regras operacionais
usar input adaptado ao tipo de campo.
abrir teclado numérico quando o campo for numérico.
reduzir alternância entre teclados.
facilitar escrita de medidas e valores.
mostrar unidades junto ao campo.
evitar escrita longa desnecessária.

Frase pronta para prompts
“Em smartphone e tablet pequeno, todos os campos de introdução manual devem abrir o teclado mais adequado ao tipo de dado, com preferência por teclado numérico para valores agrícolas, medidas e quantidades, de forma a reduzir erros, acelerar o preenchimento e melhorar a usabilidade em campo.”

8. Formulários e inputs
Os formulários devem ser desenhados para execução rápida no terreno.

Regras obrigatórias
poucos campos por ecrã, quando possível.
labels curtas e claras.
unidades visíveis junto aos campos.
validação simples e imediata.
feedback rápido ao preencher.
evitar ambiguidade de campo.

Regras de ajuda
Cada campo pode ter ajuda breve, mas nunca deve ficar pesado ou confuso. A ajuda deve aparecer só quando necessária.

Regras de erro
Os erros devem dizer:
o que aconteceu.
o que corrigir.
como corrigir.
sem linguagem técnica excessiva.

9. Botão i
O botão i é obrigatório em ferramentas e campos relevantes.

Estrutura do botão i principal
O que faz.
Utilidades.
Fórmula, quando existir.
Link “Mais Informação” para o Moodle.
Botão i por campo

Cada campo pode ter:
explicação curta.
dica prática.
unidade.
intervalo mínimo.
intervalo máximo.
até cinco valores comuns.
exemplo simples, quando útil.

Regra editorial
O botão i não é decoração. É uma camada de apoio estruturada e consistente.

10. Mensagens e microcopy
As mensagens devem ser:
curtas.
úteis.
acionáveis.
em português de Portugal.
sem jargão técnico desnecessário.

Estrutura ideal
o que aconteceu.
o que o utilizador deve fazer.
o motivo, se necessário, em linguagem simples.

Exemplo
“Falta preencher a altura da vegetação. Introduz um valor válido para continuar.”

O que evitar
frases vagas.
linguagem excessivamente técnica.
textos longos.
tons frios ou mecânicos demais.

11. Estados e visibilidade
A app deve tratar conteúdos e estados com clareza editorial.

Estados de conteúdo
draft.
in_review.
published.
hidden.
archived.

Visibilidade
public.
premium.
internal.

Regra editorial
Estado editorial e visibilidade não são a mesma coisa. Um conteúdo pode estar publicado mas ser premium, ou estar visível internamente apenas para admin.

12. Conteúdos técnicos
A app deve distinguir claramente entre:
PDF original.
ficha resumida mobile.
conteúdo da biblioteca.
conteúdo usado pelo assistente IA.

Regra editorial
PDF original = fonte completa.
ficha resumida = consulta rápida em campo.
conteúdo da biblioteca = referência organizada.
conteúdo IA = apenas se estiver validado e autorizado.

Ligação a fontes
Toda peça técnica deve ser ligada a uma fonte válida. A IA só deve usar fontes autorizadas e aprovadas.

13. Assistente IA
O assistente agrícola com IA deve ser fonte-associado, contextual e conservador em decisões críticas.

O que pode fazer
explicar conceitos.
resumir fichas.
ajudar a navegar a biblioteca.
contextualizar um módulo.
ler histórico próprio do utilizador.
apoiar interpretação, quando autorizado.

O que não pode fazer
inventar informação.
usar fontes não autorizadas.
aceder a dados de outros utilizadores.
responder com alta confiança sem base suficiente.
substituir validação humana em decisões críticas.

Fronteira IA vs validação humana
resposta automática: conteúdo seguro, publicado e autorizado.
validação humana: risco agronómico, baixa confiança, contexto incompleto.
bloqueio: dados privados, fontes não autorizadas, conteúdo em revisão, risco elevado.

14. Privacidade e RLS
A segurança deve ser aplicada na base de dados, não apenas na interface.

Regra de ouro
O que não está explicitamente permitido por policy, não está permitido na prática.

Princípios
utilizador vê apenas o que é seu.
premium vê apenas o que o plano permite.
admin vê o que precisa de gerir.
logs e dados sensíveis têm acesso restrito.
chaves secretas nunca ficam no frontend.

15. Admin e governação
A área admin deve ser operacional, clara e protegida.

O que o admin controla
utilizadores.
planos.
módulos.
documentos.
publicidade.
pedidos Moodle.
assistente IA.
logs.

Regra editorial do admin
As páginas administrativas devem ser diretas, densas apenas no essencial e sem floreados visuais desnecessários.

16. Quotas e limites
As quotas existem para proteger margem, evitar abuso e manter o desempenho previsível.

O que deve ter quota
IA.
storage.
PDFs.
uploads.
histórico.
consultas repetidas.
publicidade no admin.

Regra editorial
O free deve mostrar valor; o premium deve ampliar uso; nenhum plano deve prometer uso ilimitado sem revisão de custo.

17. Padrão visual e tom
Tom
prático.
limpo.
confiável.
agrícola.
simples.
útil.

Aparência
contraste forte.
espaçamento confortável.
hierarquia clara.
poucos elementos por bloco.
legibilidade em exterior.
foco no uso real no terreno.

Temas
A app deve suportar:
sistema.
claro.
escuro.
alto contraste.

18. Regras para prompts no Google AI Studio
Sempre que a IA gerar ecrãs ou módulos, o prompt deve incluir:
objetivo da tela.
dispositivo prioritário.
tipo de utilizador.
nível de risco.
dados necessários.
comportamento do teclado.
tom da microcopy.
regras de help i.
tipo de visibilidade.
se o conteúdo é público, premium ou interno.

Regra final
Nunca pedir apenas “faz um layout bonito” ou “melhora a experiência”. Sempre especificar contexto, tarefa, dispositivo, ação principal e comportamento esperado.

19. Regras de fecho
Este guia é uma camada editorial vinculativa para a DATERRA Smart 2.0. Sempre que houver conflito entre criatividade e consistência, prevalece a consistência do produto, a clareza para o utilizador agrícola e a segurança operacional.

Se faltar informação crítica, a IA deve assinalar a lacuna em vez de inventar. Se uma ferramenta for de consulta, não deve ser forçada a virar calculadora. Se uma fórmula ainda estiver em validação, deve ser acompanhada por chat até ficar fechada.

