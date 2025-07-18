import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Teste básico de importação do pdf-parse
    const pdfParse = (await import('pdf-parse')).default;
    
    const status = {
      timestamp: new Date().toISOString(),
      apiStatus: 'OK',
      pdfParseStatus: 'OK',
      nodeVersion: process.version,
      platform: process.platform,
      issues: [
        {
          type: 'PDF_PROTECTED',
          message: 'Os arquivos PDF fornecidos (GH-200-Full-File.pdf e gh-200limpo.pdf) estão protegidos e não podem ser lidos pelo pdf-parse.',
          solution: 'Use um PDF não protegido ou converta o PDF para remover a proteção.'
        },
        {
          type: 'PDF_CONTENT',
          message: 'O conteúdo extraído indica que o PDF está protegido por Microsoft Office.',
          details: 'Texto extraído: "Este arquivo PDF é protegido. Você precisará de outro leitor para exibir esse conteúdo"'
        }
      ],
      recommendations: [
        'Teste com as questões de exemplo incluídas no simulador',
        'Converta o PDF para um formato não protegido',
        'Use um PDF diferente que não esteja protegido',
        'Considere usar ferramentas como qpdf ou pdftk para remover proteções'
      ]
    };
    
    return NextResponse.json(status, { status: 200 });
  } catch (error) {
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      apiStatus: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error',
      pdfParseStatus: 'ERROR'
    }, { status: 500 });
  }
}
