import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt é obrigatório' },
        { status: 400 }
      );
    }

    // Tentar usar Azure OpenAI primeiro
    const azureResponse = await generateWithAzureOpenAI(prompt);
    if (azureResponse) {
      return NextResponse.json(azureResponse);
    }

    // Fallback para OpenAI direto
    const openaiResponse = await generateWithOpenAI(prompt);
    if (openaiResponse) {
      return NextResponse.json(openaiResponse);
    }

    // Se ambos falharem, retornar erro
    return NextResponse.json(
      { error: 'Não foi possível gerar o fluxograma' },
      { status: 500 }
    );

  } catch (error) {
    console.error('Erro na API de geração de fluxograma:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

async function generateWithAzureOpenAI(prompt: string) {
  const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const azureKey = process.env.AZURE_OPENAI_API_KEY;
  const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4';

  if (!azureEndpoint || !azureKey) {
    console.log('Azure OpenAI não configurado');
    return null;
  }

  try {
    const response = await fetch(
      `${azureEndpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=2024-02-01`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': azureKey,
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'Você é um especialista em GitHub Actions e criação de diagramas Mermaid educacionais. Responda APENAS com código Mermaid válido, sem explicações adicionais.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1500,
          temperature: 0.3,
        }),
      }
    );

    if (!response.ok) {
      console.error('Erro na resposta do Azure OpenAI:', response.status);
      return null;
    }

    const data = await response.json();
    const mermaidCode = data.choices[0]?.message?.content?.trim();

    if (!mermaidCode) {
      console.error('Resposta vazia do Azure OpenAI');
      return null;
    }

    return {
      mermaidCode: cleanMermaidCode(mermaidCode),
      explanation: 'Fluxograma gerado com Azure OpenAI',
      provider: 'azure'
    };

  } catch (error) {
    console.error('Erro ao chamar Azure OpenAI:', error);
    return null;
  }
}

async function generateWithOpenAI(prompt: string) {
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!openaiKey) {
    console.log('OpenAI não configurado');
    return null;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em GitHub Actions e criação de diagramas Mermaid educacionais. Responda APENAS com código Mermaid válido, sem explicações adicionais.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.error('Erro na resposta do OpenAI:', response.status);
      return null;
    }

    const data = await response.json();
    const mermaidCode = data.choices[0]?.message?.content?.trim();

    if (!mermaidCode) {
      console.error('Resposta vazia do OpenAI');
      return null;
    }

    return {
      mermaidCode: cleanMermaidCode(mermaidCode),
      explanation: 'Fluxograma gerado com OpenAI',
      provider: 'openai'
    };

  } catch (error) {
    console.error('Erro ao chamar OpenAI:', error);
    return null;
  }
}

function cleanMermaidCode(code: string): string {
  // Remove markdown code blocks se presentes
  let cleaned = code.replace(/```mermaid\n?/g, '').replace(/```\n?/g, '');
  
  // Remove linhas vazias excessivas
  cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  // Garantir que começa com flowchart
  if (!cleaned.trim().startsWith('flowchart') && !cleaned.trim().startsWith('graph')) {
    cleaned = `flowchart TD\n${cleaned}`;
  }
  
  return cleaned.trim();
}

export const runtime = 'nodejs';
