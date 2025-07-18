import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('=== Teste de processamento PDF ===');
  
  try {
    const formData = await request.formData();
    const file = formData.get('pdf') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    console.log('Arquivo:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Apenas validar o arquivo sem processar
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    console.log('Buffer size:', buffer.length);
    
    // Verificar se parece com um PDF
    const header = buffer.slice(0, 4).toString();
    console.log('Header:', header);
    
    const isPDF = header === '%PDF';
    
    return NextResponse.json({
      message: 'Teste de upload realizado com sucesso!',
      file: {
        name: file.name,
        size: file.size,
        type: file.type,
        isPDF,
        header
      }
    });
    
  } catch (error) {
    console.error('Erro no teste:', error);
    return NextResponse.json(
      { error: 'Erro no teste: ' + (error instanceof Error ? error.message : 'Unknown') },
      { status: 500 }
    );
  }
}
