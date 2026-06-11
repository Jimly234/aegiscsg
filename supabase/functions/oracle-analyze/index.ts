/**
 * AEGIS Oracle Edge Function — AI Threat Analysis
 * Uses Gemini 2.5 Flash directly via Google AI Studio REST API to perform:
 *   - Situational threat assessment for an active alert
 *   - Response recommendations
 *   - Risk zone analysis
 *   - Multi-factor danger scoring
 *
 * Streaming SSE is passed through directly to the client.
 */

import { corsHeaders } from '../_shared/cors.ts';

const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse';

interface AnalysisRequest {
  type: 'alert' | 'risk_zone' | 'dispatch';
  alert?: {
    id: string;
    victimName: string;
    victimAge: number;
    victimGender: string;
    address: string;
    priority: string;
    batteryLevel: number;
    signalStrength: string;
    speed?: number;
    heading?: string;
    movementPattern?: string;
    aiVoicesDetected?: number;
    aiLanguage?: string;
    aiKeywords?: string[];
    aiStressLevel?: string;
    aiVehicleEngine?: boolean;
    aiThreatScore?: number;
    guardians_notified?: number;
    guardians_acknowledged?: number;
    audioStreaming?: boolean;
  };
  riskZone?: {
    name: string;
    riskScore: number;
    factors: string[];
  };
  availableUnits?: string[];
  userQuery?: string;
}

function buildPrompt(req: AnalysisRequest): string {
  const systemContext = `You are Oracle, the AI tactical analysis engine for AEGIS CSG (Civilian Safety Grid), 
a real-time safety monitoring system deployed in North Central Nigeria. 
Your role is to provide concise, actionable threat assessments for security officers.
Always respond in this exact JSON structure:
{
  "threatScore": <0.0-1.0>,
  "threatLevel": "<CRITICAL|HIGH|MEDIUM|LOW>",
  "summary": "<2 sentence situational summary>",
  "assessment": "<4-6 bullet points of key tactical observations>",
  "recommendation": "<immediate recommended action>",
  "dispatchPriority": "<unit type to dispatch>",
  "estimatedRiskWindow": "<time frame>",
  "confidence": <0.0-1.0>
}`;

  if (req.type === 'alert' && req.alert) {
    const a = req.alert;
    return `${systemContext}

ACTIVE ALERT ANALYSIS REQUEST:
- Alert ID: ${a.id}
- Victim: ${a.victimName}, ${a.victimAge ?? 'unknown'}yo ${a.victimGender === 'F' ? 'Female' : 'Male'}
- Location: ${a.address}
- Priority: ${a.priority.toUpperCase()}
- Device Battery: ${a.batteryLevel ?? 'unknown'}% | Signal: ${a.signalStrength ?? 'unknown'}
- Audio Streaming: ${a.audioStreaming ? 'YES — active audio feed' : 'No'}
${a.speed ? `- Movement: ${a.speed} km/h heading ${a.heading}` : '- Movement: Stationary'}
${a.movementPattern ? `- Pattern: ${a.movementPattern}` : ''}
${a.aiVoicesDetected ? `- AI Audio: ${a.aiVoicesDetected} voices detected, language: ${a.aiLanguage}, stress: ${a.aiStressLevel}` : ''}
${a.aiKeywords?.length ? `- Keywords: ${a.aiKeywords.join(', ')}` : ''}
${a.aiVehicleEngine ? '- Vehicle engine sound detected in audio' : ''}
${a.aiThreatScore ? `- Previous AI threat score: ${(a.aiThreatScore * 100).toFixed(0)}%` : ''}
- Guardians: ${a.guardians_notified ?? 0} notified, ${a.guardians_acknowledged ?? 0} acknowledged

${req.userQuery ? `Officer query: "${req.userQuery}"` : 'Provide full tactical assessment.'}`;
  }

  if (req.type === 'risk_zone' && req.riskZone) {
    const z = req.riskZone;
    return `${systemContext}

RISK ZONE ANALYSIS REQUEST:
- Zone: ${z.name}
- Current Risk Score: ${(z.riskScore * 100).toFixed(0)}%
- Risk Factors: ${(z.factors ?? []).join(', ')}
${req.availableUnits?.length ? `- Available units in area: ${req.availableUnits.join(', ')}` : ''}

${req.userQuery ? `Officer query: "${req.userQuery}"` : 'Assess patrol strategy for this zone.'}`;
  }

  return `${systemContext}\n\nGeneral AEGIS tactical query: ${req.userQuery ?? 'Provide system status overview.'}`;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Oracle offline — GEMINI_API_KEY secret not set' }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body: AnalysisRequest = await req.json();
    const prompt = buildPrompt(body);

    const geminiResponse = await fetch(`${GEMINI_ENDPOINT}&key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      return new Response(JSON.stringify({ error: 'Oracle upstream error', detail: errText }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Stream the SSE response directly to client
    return new Response(geminiResponse.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: 'Oracle analysis failed', detail: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
