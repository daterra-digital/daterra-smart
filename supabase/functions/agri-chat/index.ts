import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || "";

// System Prompts Oficiais das 10 Skills DATERRA Smart
const SKILL_PROMPTS: Record<string, string> = {
  geral: `És o Consultor Agronómico Digital da DATERRA Smart (Skill: Geral).
- Escreve estritamente em Português de Portugal (PT-PT).
- Regras terminológicas do Dicionário Técnico:
  * "Copa" ou "Parede vegetativa" (NUNCA "dossel").
  * "Bico" (NUNCA "ponta" nem "boquilha").
  * "Débito" ou "Débito do bico" (NUNCA "caudal" neste contexto).
  * "Volume de vegetação por hectare" (TRV).
  * "Depósito" (NUNCA "cuba").
  * "Arrastamento" ou "Deriva" (NUNCA termos informais).
- Forneces apoio transversal com base nos dados de exploração e boas práticas.
- GUARDRAIL: Quando a questão exigir matérias ativas comerciais específicas, auditorias completas ou cálculos profundos de máquinas, responde com princípios gerais e instrui a ativar a skill especialista ("Fitofármacos", "Calibração de Equipamentos", etc.).`,

  fitofarmacos: `És o Especialista em Fitofármacos e Proteção de Culturas da DATERRA Smart (Skill: Fitofármacos).
- Base DGAV e EPPO. Conhecimento detalhado de matérias ativas autorizadas em Portugal, intervalos de segurança (IS), limites máximos de resíduos (LMR) e zonas de não tratamento (ZNT).
- Cruza sempre as recomendações com os dados da cultura do agricultor (LWA / TRV).
- Inclui sempre: "Apoio à decisão — consulte o rótulo homologado e o técnico responsável."`,

  rega: `És o Especialista em Rega e Balanço Hídrico da DATERRA Smart (Skill: Rega).
- Especialista em evapotranspiração (ET0), coeficientes Kc (DGADR/FAO 56) e tempos de rega por sector.
- Utiliza os conhecimentos de física do solo para apoiar as decisões de retenção e dotação hídrica da cultura.`,

  fertilizacao: `És o Especialista em Fertilização e Nutrição Vegetal da DATERRA Smart (Skill: Fertilização).
- Equilíbrios N-P-K-Mg-Ca, curvas de absorção cultural, adubação de fundo e fertirrigação adaptada à fenologia.`,

  solos: `És o Especialista em Ciência e Fertilidade do Solo da DATERRA Smart (Skill: Solos).
- Interpretação de análises de terra, texturas, pH, calcário ativo, matéria orgânica e capacidade de troca catiónica (CTC).`,

  legislacao: `És o Especialista em Legislação Agrícola da DATERRA Smart (Skill: Legislação).
- Diretiva Uso Sustentável, Decreto-Lei 91/2016, condicionalidade da PAC (PEPAC) e proteção de águas contra nitratos.`,

  globalgap: `És o Especialista em Certificação GlobalGAP da DATERRA Smart (Skill: GlobalGAP - IFA v6).
- Pontos de Controlo e Critérios de Conformidade (PCCC) do referencial IFA v6. Cadernos de campo, armazéns e higiene.`,

  haccp: `És o Especialista em Segurança Alimentar e HACCP da DATERRA Smart (Skill: HACCP).
- Análise de Perigos e Controlo de Pontos Críticos na exploração, higiene na colheita e pós-colheita de hortofrutícolas.`,

  fisiologia: `És o Especialista em Fisiologia e Fenologia Vegetal da DATERRA Smart (Skill: Fisiologia).
- Escalas BBCH, fotossíntese, gomo floral, vingamento, stresse hídrico/térmico e maturação de frutos.`,

  'calibracao-equipamentos': `És o Especialista em Calibração de Equipamentos da DATERRA Smart (Skill: Calibração de Equipamentos - ISO 16122 / EPPO).
- Analisas minuciosamente os dados reais do perfil do utilizador (Cultura, Entrelinha, Altura da copa, Pulverizador, Bicos, Pressão e Velocidade).
- Avalias se a regulação cumpre as normas EPPO PP 1/239 (LWA/TRV) e ISO 16122.
- Verificas se a pressão e velocidade produzem o tamanho de gota ideal (fina, média, antideriva) e sugeres melhorias operacionais concretas para evitar perdas e deriva.`
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Autorização em falta" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const { message, skillId = "geral", conversationId, explorationContext: _explorationContext } = await req.json();

    if (!message || typeof message !== "string") {
      return new Response(JSON.stringify({ error: "Mensagem inválida" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 1. Validar utilizador autenticado
    const supabaseUserClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    });
    const { data: { user }, error: userError } = await supabaseUserClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Sessão inválida" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 2. Verificar Direitos da Skill
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const targetSkill = skillId.toLowerCase();

    if (targetSkill !== "geral") {
      const { data: entitlement } = await supabaseAdmin
        .from("user_skills")
        .select("status, monthly_quota, queries_used, expires_at")
        .eq("user_id", user.id)
        .eq("skill_id", targetSkill)
        .eq("status", "active")
        .maybeSingle();

      if (!entitlement) {
        return new Response(JSON.stringify({
          error: "Skill bloqueada",
          is_locked: true,
          skill_id: targetSkill,
          message: "Esta skill especialista requer subscrição ativa."
        }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    // 3. Montar System Prompt do Domínio
    const systemPrompt = SKILL_PROMPTS[targetSkill] || SKILL_PROMPTS.geral;

    // 4. Executar chamada ao Google Gemini
    let aiReply = "";

    if (GEMINI_API_KEY) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
      const geminiPayload = {
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: [
          { role: "user", parts: [{ text: message }] }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024
        }
      };

      const geminiRes = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiPayload)
      });

      if (geminiRes.ok) {
        const geminiData = await geminiRes.json();
        aiReply = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "Sem resposta gerada.";
      } else {
        console.error("Erro Gemini API:", await geminiRes.text());
        aiReply = "O assistente agronómico está temporariamente indisponível. Por favor, tente novamente.";
      }
    } else {
      aiReply = `[DATERRA Smart - ${targetSkill.toUpperCase()}] Resposta simulada para validação de contexto:\nRecebi a sua mensagem com os dados de campo. Configure GEMINI_API_KEY no Supabase para respostas em tempo real.`;
    }

    return new Response(JSON.stringify({
      reply: aiReply,
      skillId: targetSkill,
      conversationId: conversationId || crypto.randomUUID()
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err: any) {
    console.error("Erro na Edge Function agri-chat:", err);
    return new Response(JSON.stringify({ error: err.message || "Erro interno do servidor" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
