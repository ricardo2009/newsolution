'use client';

import React, { useState, useEffect } from 'react';
import { Question } from '@/types';
import MermaidRenderer from './MermaidRenderer';

interface MermaidArchitectureFlowchartProps {
  question: Question;
  userAnswers: string[];
  isCorrect: boolean;
  onComplete?: () => void;
}

const MermaidArchitectureFlowchart: React.FC<MermaidArchitectureFlowchartProps> = ({
  question,
  userAnswers,
  isCorrect,
  onComplete
}) => {
  const [mermaidCode, setMermaidCode] = useState<string>('');
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    generateArchitectureFlowchart();
  }, [question, userAnswers, isCorrect]);

  const generateArchitectureFlowchart = () => {
    let flowchart = '';
    
    // Definir cores baseadas na categoria
    const colors = getColorScheme(question.category);
    
    // Gerar fluxograma baseado na categoria da questão
    switch (question.category.toLowerCase()) {
      case 'workflows':
        flowchart = generateWorkflowFlowchart(colors);
        break;
      case 'actions':
        flowchart = generateActionsFlowchart(colors);
        break;
      case 'runners':
        flowchart = generateRunnersFlowchart(colors);
        break;
      case 'security':
        flowchart = generateSecurityFlowchart(colors);
        break;
      case 'github actions':
        flowchart = generateGitHubActionsFlowchart(colors);
        break;
      case 'azure':
        flowchart = generateAzureFlowchart(colors);
        break;
      default:
        flowchart = generateGenericFlowchart(colors);
    }
    
    setMermaidCode(flowchart);
  };

  const getColorScheme = (category: string) => {
    const schemes: { [key: string]: any } = {
      'workflows': {
        primary: '#2563eb',
        secondary: '#3b82f6',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        neutral: '#6b7280'
      },
      'actions': {
        primary: '#7c3aed',
        secondary: '#8b5cf6',
        success: '#059669',
        warning: '#d97706',
        error: '#dc2626',
        neutral: '#4b5563'
      },
      'runners': {
        primary: '#0891b2',
        secondary: '#06b6d4',
        success: '#0d9488',
        warning: '#ca8a04',
        error: '#dc2626',
        neutral: '#475569'
      },
      'security': {
        primary: '#dc2626',
        secondary: '#ef4444',
        success: '#16a34a',
        warning: '#ea580c',
        error: '#b91c1c',
        neutral: '#374151'
      },
      'github actions': {
        primary: '#1f2937',
        secondary: '#374151',
        success: '#22c55e',
        warning: '#f97316',
        error: '#e11d48',
        neutral: '#6b7280'
      },
      'azure': {
        primary: '#0078d4',
        secondary: '#106ebe',
        success: '#107c10',
        warning: '#ff8c00',
        error: '#d13438',
        neutral: '#605e5c'
      }
    };
    
    return schemes[category.toLowerCase()] || schemes['workflows'];
  };

  const generateWorkflowFlowchart = (colors: any) => {
    const correctAnswers = Array.isArray(question.correctAnswer) ? question.correctAnswer : [question.correctAnswer];
    const userCorrect = isCorrect ? 'Correto' : 'Incorreto';
    
    return `
flowchart TD
    %% Configuração inicial
    Start([🚀 Início do Workflow<br/>GitHub Actions]) --> Trigger{🔔 Evento Trigger}
    
    %% Tipos de triggers
    Trigger -->|"🔄 push"| Push[📤 Push Event<br/>Novo commit]
    Trigger -->|"🔀 pull_request"| PR[🔄 Pull Request<br/>Revisão de código]
    Trigger -->|"⏰ schedule"| Schedule[📅 Scheduled Event<br/>Execução programada]
    Trigger -->|"👤 workflow_dispatch"| Manual[🎮 Manual Trigger<br/>Execução manual]
    
    %% Seleção de runner
    Push --> RunnerPool{🏃 Pool de Runners}
    PR --> RunnerPool
    Schedule --> RunnerPool
    Manual --> RunnerPool
    
    RunnerPool -->|"☁️ GitHub-hosted"| GHRunner[🖥️ GitHub Runner<br/>Ubuntu/Windows/macOS]
    RunnerPool -->|"🏢 Self-hosted"| SHRunner[💻 Self-hosted Runner<br/>Infraestrutura própria]
    
    %% Jobs paralelos
    GHRunner --> JobMatrix{🔄 Matrix Strategy}
    SHRunner --> JobMatrix
    
    JobMatrix --> Job1[📋 Job: Build<br/>🔧 Compilação]
    JobMatrix --> Job2[📋 Job: Test<br/>🧪 Testes]
    JobMatrix --> Job3[📋 Job: Deploy<br/>🚀 Implantação]
    
    %% Steps do Job Build
    Job1 --> Step1[📦 actions/checkout@v4<br/>Baixar código]
    Job1 --> Step2[🔧 actions/setup-node@v4<br/>Configurar ambiente]
    Job1 --> Step3[⚙️ npm install & build<br/>Compilar aplicação]
    
    %% Steps do Job Test
    Job2 --> Test1[🧪 npm test<br/>Testes unitários]
    Job2 --> Test2[📊 Code Coverage<br/>Cobertura de código]
    Job2 --> Test3[🔍 Linting & Format<br/>Qualidade do código]
    
    %% Steps do Job Deploy
    Job3 --> Deploy1[🏗️ Build Docker<br/>Containerização]
    Job3 --> Deploy2[🚀 Deploy Staging<br/>Ambiente de teste]
    Job3 --> Deploy3[✅ Deploy Production<br/>Ambiente produção]
    
    %% Convergência dos resultados
    Step3 --> Artifacts[📁 Build Artifacts<br/>Artefatos gerados]
    Test3 --> TestResults[📊 Test Results<br/>Resultados dos testes]
    Deploy3 --> DeployResults[🎯 Deploy Status<br/>Status da implantação]
    
    %% Análise final
    Artifacts --> Final{📊 Análise Final}
    TestResults --> Final
    DeployResults --> Final
    
    %% Resultados
    Final -->|"✅ Todos OK"| Success[🎉 Workflow Completo<br/>Sucesso total]
    Final -->|"❌ Falha"| Failure[💥 Workflow Falhou<br/>Correção necessária]
    
    %% Notificações
    Success --> Notifications[📧 Notificações<br/>Slack/Email/Teams]
    Failure --> Notifications
    
    %% Finalização
    Notifications --> End([🏁 Fim do Workflow])
    
    %% Highlight da resposta do usuário
    ${generateUserAnswerHighlight(userAnswers, correctAnswers, isCorrect)}
    
    %% Estilos coloridos e modernos
    classDef startStyle fill:#4F46E5,stroke:#312E81,stroke-width:3px,color:#FFFFFF,font-weight:bold
    classDef triggerStyle fill:#7C3AED,stroke:#5B21B6,stroke-width:2px,color:#FFFFFF,font-weight:bold
    classDef eventStyle fill:#2563EB,stroke:#1D4ED8,stroke-width:2px,color:#FFFFFF
    classDef runnerStyle fill:#059669,stroke:#047857,stroke-width:2px,color:#FFFFFF
    classDef jobStyle fill:#DC2626,stroke:#B91C1C,stroke-width:2px,color:#FFFFFF
    classDef stepStyle fill:#EA580C,stroke:#C2410C,stroke-width:2px,color:#FFFFFF
    classDef artifactStyle fill:#7C2D12,stroke:#92400E,stroke-width:2px,color:#FFFFFF
    classDef finalStyle fill:#1F2937,stroke:#111827,stroke-width:3px,color:#FFFFFF,font-weight:bold
    classDef successStyle fill:#10B981,stroke:#059669,stroke-width:3px,color:#FFFFFF,font-weight:bold
    classDef failureStyle fill:#EF4444,stroke:#DC2626,stroke-width:3px,color:#FFFFFF,font-weight:bold
    classDef notificationStyle fill:#8B5CF6,stroke:#7C3AED,stroke-width:2px,color:#FFFFFF
    classDef endStyle fill:#374151,stroke:#1F2937,stroke-width:3px,color:#FFFFFF,font-weight:bold
    
    %% Aplicar estilos
    class Start startStyle
    class Trigger triggerStyle
    class Push,PR,Schedule,Manual eventStyle
    class RunnerPool,GHRunner,SHRunner runnerStyle
    class JobMatrix,Job1,Job2,Job3 jobStyle
    class Step1,Step2,Step3,Test1,Test2,Test3,Deploy1,Deploy2,Deploy3 stepStyle
    class Artifacts,TestResults,DeployResults artifactStyle
    class Final finalStyle
    class Success successStyle
    class Failure failureStyle
    class Notifications notificationStyle
    class End endStyle
`;
  };

  const generateActionsFlowchart = (colors: any) => {
    const correctAnswers = Array.isArray(question.correctAnswer) ? question.correctAnswer : [question.correctAnswer];
    
    return `
flowchart TD
    %% Início do processo
    Dev[👨‍💻 Developer<br/>Desenvolvedor] --> Code[📝 Write Code<br/>Escrever código]
    Code --> Commit[📤 Git Commit & Push<br/>Versionar código]
    Commit --> Webhook[🔗 GitHub Webhook<br/>Gatilho automático]
    
    %% Processamento do evento
    Webhook --> Event{🎯 GitHub Event<br/>Tipo de evento}
    Event -->|"push"| PushEvent[📤 Push Event<br/>Novo commit]
    Event -->|"pull_request"| PREvent[🔄 PR Event<br/>Revisão de código]
    Event -->|"release"| ReleaseEvent[🚀 Release Event<br/>Nova versão]
    
    %% Seleção de Actions
    PushEvent --> ActionStore[🛒 Actions Marketplace<br/>Repositório de actions]
    PREvent --> ActionStore
    ReleaseEvent --> ActionStore
    
    %% Actions principais
    ActionStore --> CheckoutAction[📋 actions/checkout@v4<br/>Baixar código-fonte]
    ActionStore --> SetupAction[🔧 actions/setup-node@v4<br/>Configurar ambiente]
    ActionStore --> CacheAction[💾 actions/cache@v3<br/>Cache de dependências]
    ActionStore --> CustomAction[⚙️ Custom Action<br/>Ação personalizada]
    
    %% Processamento
    CheckoutAction --> WorkingDir[📁 Working Directory<br/>Diretório de trabalho]
    SetupAction --> Environment[🌐 Runtime Environment<br/>Ambiente de execução]
    CacheAction --> Dependencies[📦 Dependencies<br/>Dependências]
    CustomAction --> Business[🏢 Business Logic<br/>Lógica de negócio]
    
    %% Pipeline de execução
    WorkingDir --> Pipeline{🔄 Execution Pipeline<br/>Pipeline de execução}
    Environment --> Pipeline
    Dependencies --> Pipeline
    Business --> Pipeline
    
    %% Fases do pipeline
    Pipeline --> Build[🏗️ Build Phase<br/>Fase de construção]
    Pipeline --> Test[🧪 Test Phase<br/>Fase de testes]
    Pipeline --> Security[🔒 Security Phase<br/>Análise de segurança]
    Pipeline --> Deploy[🚀 Deploy Phase<br/>Fase de implantação]
    
    %% Resultados
    Build --> BuildResult{📊 Build Result}
    Test --> TestResult{🧪 Test Result}
    Security --> SecurityResult{🔒 Security Result}
    Deploy --> DeployResult{🚀 Deploy Result}
    
    %% Consolidação
    BuildResult --> Final{📊 Final Analysis<br/>Análise final}
    TestResult --> Final
    SecurityResult --> Final
    DeployResult --> Final
    
    %% Outputs finais
    Final -->|"✅ Success"| Success[🎉 Action Completed<br/>Sucesso total]
    Final -->|"❌ Failure"| Failure[💥 Action Failed<br/>Falha detectada]
    
    %% Notificações
    Success --> Notifications[📧 Notifications<br/>Notificações]
    Failure --> Notifications
    
    %% Finalização
    Notifications --> End([🏁 End<br/>Fim do processo])
    
    %% Highlight da resposta do usuário
    ${generateUserAnswerHighlight(userAnswers, correctAnswers, isCorrect)}
    
    %% Estilos coloridos e modernos
    classDef devStyle fill:#7C3AED,stroke:#5B21B6,stroke-width:3px,color:#FFFFFF,font-weight:bold
    classDef codeStyle fill:#2563EB,stroke:#1D4ED8,stroke-width:2px,color:#FFFFFF
    classDef eventStyle fill:#DC2626,stroke:#B91C1C,stroke-width:2px,color:#FFFFFF
    classDef actionStyle fill:#059669,stroke:#047857,stroke-width:2px,color:#FFFFFF
    classDef processStyle fill:#EA580C,stroke:#C2410C,stroke-width:2px,color:#FFFFFF
    classDef pipelineStyle fill:#7C2D12,stroke:#92400E,stroke-width:2px,color:#FFFFFF
    classDef phaseStyle fill:#1F2937,stroke:#111827,stroke-width:2px,color:#FFFFFF
    classDef resultStyle fill:#8B5CF6,stroke:#7C3AED,stroke-width:2px,color:#FFFFFF
    classDef finalStyle fill:#374151,stroke:#1F2937,stroke-width:3px,color:#FFFFFF,font-weight:bold
    classDef successStyle fill:#10B981,stroke:#059669,stroke-width:3px,color:#FFFFFF,font-weight:bold
    classDef failureStyle fill:#EF4444,stroke:#DC2626,stroke-width:3px,color:#FFFFFF,font-weight:bold
    classDef notificationStyle fill:#8B5CF6,stroke:#7C3AED,stroke-width:2px,color:#FFFFFF
    classDef endStyle fill:#4F46E5,stroke:#312E81,stroke-width:3px,color:#FFFFFF,font-weight:bold
    
    %% Aplicar estilos
    class Dev devStyle
    class Code,Commit,Webhook codeStyle
    class Event,PushEvent,PREvent,ReleaseEvent eventStyle
    class ActionStore,CheckoutAction,SetupAction,CacheAction,CustomAction actionStyle
    class WorkingDir,Environment,Dependencies,Business processStyle
    class Pipeline pipelineStyle
    class Build,Test,Security,Deploy phaseStyle
    class BuildResult,TestResult,SecurityResult,DeployResult resultStyle
    class Final finalStyle
    class Success successStyle
    class Failure failureStyle
    class Notifications notificationStyle
    class End endStyle
`;
  };

  const generateRunnersFlowchart = (colors: any) => {
    return `
flowchart TD
    Workflow[🔄 Workflow Triggered] --> RunnerSelect{Selecionar Runner}
    
    RunnerSelect -->|GitHub-hosted| GHRunner[☁️ GitHub-hosted Runner]
    RunnerSelect -->|Self-hosted| SHRunner[🏢 Self-hosted Runner]
    RunnerSelect -->|Larger| LargerRunner[💪 Larger Runner]
    
    GHRunner --> Ubuntu[🐧 Ubuntu Latest]
    GHRunner --> Windows[🪟 Windows Latest]
    GHRunner --> MacOS[🍎 macOS Latest]
    
    SHRunner --> OnPrem[🏢 On-Premises]
    SHRunner --> Cloud[☁️ Cloud Instance]
    SHRunner --> Container[🐳 Container]
    
    LargerRunner --> CPU4[🚀 4-cores]
    LargerRunner --> CPU8[⚡ 8-cores]
    LargerRunner --> CPU16[🔥 16-cores]
    
    Ubuntu --> Job[📋 Execute Job]
    Windows --> Job
    MacOS --> Job
    OnPrem --> Job
    Cloud --> Job
    Container --> Job
    CPU4 --> Job
    CPU8 --> Job
    CPU16 --> Job
    
    Job --> Steps[📝 Run Steps]
    Steps --> Cleanup[🧹 Cleanup]
    Cleanup --> Complete[✅ Complete]
    
    %% Styling
    classDef workflowClass fill:${colors.primary},stroke:#fff,stroke-width:2px,color:#fff
    classDef runnerClass fill:${colors.secondary},stroke:#fff,stroke-width:2px,color:#fff
    classDef osClass fill:${colors.success},stroke:#fff,stroke-width:2px,color:#fff
    classDef hostClass fill:${colors.warning},stroke:#fff,stroke-width:2px,color:#fff
    classDef jobClass fill:${colors.error},stroke:#fff,stroke-width:2px,color:#fff
    
    class Workflow workflowClass
    class RunnerSelect runnerClass
    class GHRunner,SHRunner,LargerRunner runnerClass
    class Ubuntu,Windows,MacOS osClass
    class OnPrem,Cloud,Container,CPU4,CPU8,CPU16 hostClass
    class Job,Steps,Cleanup,Complete jobClass
`;
  };

  const generateSecurityFlowchart = (colors: any) => {
    return `
    flowchart TD
      Start[🔒 Security Assessment<br/>Avaliação de Segurança] --> CodeScan[� Code Analysis<br/>Análise de Código]
      
      CodeScan --> SecurityChecks{�️ Security Checks<br/>Verificações de Segurança}
      SecurityChecks --> SecretsCheck[🔐 Secrets Management<br/>Gestão de Segredos]
      SecurityChecks --> PermissionsCheck[👥 Permissions Audit<br/>Auditoria de Permissões]
      SecurityChecks --> VulnScan[🔍 Vulnerability Scan<br/>Escaneamento de Vulnerabilidades]
      SecurityChecks --> ComplianceCheck[📊 Compliance Check<br/>Verificação de Conformidade]
      
      %% Secrets Management Flow
      SecretsCheck --> RepoSecrets[� Repository Secrets<br/>Segredos do Repositório]
      SecretsCheck --> OrgSecrets[🏢 Organization Secrets<br/>Segredos da Organização]
      SecretsCheck --> EnvSecrets[🌐 Environment Secrets<br/>Segredos do Ambiente]
      SecretsCheck --> OIDCTokens[🆔 OIDC Tokens<br/>Tokens OIDC]
      
      %% Permissions Flow
      PermissionsCheck --> ReadPerm[👀 Read Permissions<br/>Permissões de Leitura]
      PermissionsCheck --> WritePerm[✍️ Write Permissions<br/>Permissões de Escrita]
      PermissionsCheck --> AdminPerm[👑 Admin Permissions<br/>Permissões de Administrador]
      PermissionsCheck --> TokenPerm[🔑 Token Permissions<br/>Permissões de Token]
      
      %% Vulnerability Scanning
      VulnScan --> DependencyCheck[📦 Dependency Check<br/>Verificação de Dependências]
      VulnScan --> CodeQLScan[🔍 CodeQL Analysis<br/>Análise CodeQL]
      VulnScan --> ContainerScan[🐳 Container Security<br/>Segurança de Contêineres]
      VulnScan --> LicenseCheck[📜 License Compliance<br/>Conformidade de Licenças]
      
      %% Compliance Flow
      ComplianceCheck --> PolicyCheck[� Policy Validation<br/>Validação de Políticas]
      ComplianceCheck --> AuditLog[📊 Audit Logging<br/>Log de Auditoria]
      ComplianceCheck --> AccessControl[� Access Control<br/>Controle de Acesso]
      
      %% Consolidation
      RepoSecrets --> SecurityReport[� Security Report<br/>Relatório de Segurança]
      OrgSecrets --> SecurityReport
      EnvSecrets --> SecurityReport
      OIDCTokens --> SecurityReport
      
      ReadPerm --> SecurityReport
      WritePerm --> SecurityReport
      AdminPerm --> SecurityReport
      TokenPerm --> SecurityReport
      
      DependencyCheck --> SecurityReport
      CodeQLScan --> SecurityReport
      ContainerScan --> SecurityReport
      LicenseCheck --> SecurityReport
      
      PolicyCheck --> SecurityReport
      AuditLog --> SecurityReport
      AccessControl --> SecurityReport
      
      %% Final Assessment
      SecurityReport --> FinalAssessment{🎯 Final Assessment<br/>Avaliação Final}
      FinalAssessment -->|"✅ Secure"| Approved[✅ Security Approved<br/>Segurança Aprovada]
      FinalAssessment -->|"⚠️ Issues Found"| Issues[⚠️ Security Issues<br/>Problemas de Segurança]
      FinalAssessment -->|"❌ Critical"| Critical[❌ Critical Security Issues<br/>Problemas Críticos]
      
      %% Notifications
      Approved --> Notification[📧 Security Notification<br/>Notificação de Segurança]
      Issues --> Notification
      Critical --> Notification
      
      Notification --> End([🏁 Security Process Complete<br/>Processo de Segurança Concluído])
      
      %% Highlight da resposta do usuário
      ${generateUserAnswerHighlight(userAnswers, Array.isArray(question.correctAnswer) ? question.correctAnswer : [question.correctAnswer], isCorrect)}
      
      %% Estilos coloridos para segurança
      classDef startStyle fill:#DC2626,stroke:#B91C1C,stroke-width:3px,color:#FFFFFF,font-weight:bold
      classDef scanStyle fill:#7C3AED,stroke:#5B21B6,stroke-width:2px,color:#FFFFFF
      classDef checksStyle fill:#2563EB,stroke:#1D4ED8,stroke-width:2px,color:#FFFFFF
      classDef secretsStyle fill:#059669,stroke:#047857,stroke-width:2px,color:#FFFFFF
      classDef permissionsStyle fill:#EA580C,stroke:#C2410C,stroke-width:2px,color:#FFFFFF
      classDef vulnStyle fill:#7C2D12,stroke:#92400E,stroke-width:2px,color:#FFFFFF
      classDef complianceStyle fill:#1F2937,stroke:#111827,stroke-width:2px,color:#FFFFFF
      classDef reportStyle fill:#8B5CF6,stroke:#7C3AED,stroke-width:2px,color:#FFFFFF
      classDef assessmentStyle fill:#374151,stroke:#1F2937,stroke-width:3px,color:#FFFFFF,font-weight:bold
      classDef approvedStyle fill:#10B981,stroke:#059669,stroke-width:3px,color:#FFFFFF,font-weight:bold
      classDef issuesStyle fill:#F59E0B,stroke:#D97706,stroke-width:3px,color:#FFFFFF,font-weight:bold
      classDef criticalStyle fill:#EF4444,stroke:#DC2626,stroke-width:3px,color:#FFFFFF,font-weight:bold
      classDef notificationStyle fill:#8B5CF6,stroke:#7C3AED,stroke-width:2px,color:#FFFFFF
      classDef endStyle fill:#6B7280,stroke:#4B5563,stroke-width:2px,color:#FFFFFF
      
      class Start startStyle
      class CodeScan scanStyle
      class SecurityChecks checksStyle
      class SecretsCheck,RepoSecrets,OrgSecrets,EnvSecrets,OIDCTokens secretsStyle
      class PermissionsCheck,ReadPerm,WritePerm,AdminPerm,TokenPerm permissionsStyle
      class VulnScan,DependencyCheck,CodeQLScan,ContainerScan,LicenseCheck vulnStyle
      class ComplianceCheck,PolicyCheck,AuditLog,AccessControl complianceStyle
      class SecurityReport reportStyle
      class FinalAssessment assessmentStyle
      class Approved approvedStyle
      class Issues issuesStyle
      class Critical criticalStyle
      class Notification notificationStyle
      class End endStyle
    `;
  };

  const generateGitHubActionsFlowchart = (colors: any) => {
    return `
flowchart TD
    Event[⚡ GitHub Event] --> Trigger{Workflow Trigger}
    
    Trigger -->|push| Push[📤 Push to Branch]
    Trigger -->|pull_request| PR[🔄 Pull Request]
    Trigger -->|schedule| Cron[⏰ Scheduled Run]
    Trigger -->|workflow_dispatch| Manual[👤 Manual Trigger]
    
    Push --> Matrix{Matrix Strategy}
    PR --> Matrix
    Cron --> Matrix
    Manual --> Matrix
    
    Matrix --> OS1[🐧 Ubuntu]
    Matrix --> OS2[🪟 Windows]
    Matrix --> OS3[🍎 macOS]
    
    OS1 --> Job1[📋 Job: CI/CD]
    OS2 --> Job2[📋 Job: Build]
    OS3 --> Job3[📋 Job: Test]
    
    Job1 --> Step1[📦 Checkout]
    Job1 --> Step2[🔧 Setup]
    Job1 --> Step3[⚙️ Build]
    Job1 --> Step4[🧪 Test]
    
    Job2 --> Step5[📦 Checkout]
    Job2 --> Step6[🏗️ Compile]
    Job2 --> Step7[📦 Package]
    
    Job3 --> Step8[📦 Checkout]
    Job3 --> Step9[🧪 Unit Tests]
    Job3 --> Step10[📊 Coverage]
    
    Step4 --> Artifacts[📁 Artifacts]
    Step7 --> Artifacts
    Step10 --> Artifacts
    
    Artifacts --> Deploy{Deploy?}
    Deploy -->|Yes| Production[🚀 Production]
    Deploy -->|No| Archive[📦 Archive]
    
    Production --> Success[✅ Success]
    Archive --> Success
    
    %% Styling
    classDef eventClass fill:${colors.primary},stroke:#fff,stroke-width:2px,color:#fff
    classDef triggerClass fill:${colors.secondary},stroke:#fff,stroke-width:2px,color:#fff
    classDef matrixClass fill:${colors.success},stroke:#fff,stroke-width:2px,color:#fff
    classDef jobClass fill:${colors.warning},stroke:#fff,stroke-width:2px,color:#fff
    classDef stepClass fill:${colors.error},stroke:#fff,stroke-width:2px,color:#fff
    classDef resultClass fill:${colors.neutral},stroke:#fff,stroke-width:2px,color:#fff
    
    class Event eventClass
    class Trigger,Push,PR,Cron,Manual triggerClass
    class Matrix,OS1,OS2,OS3 matrixClass
    class Job1,Job2,Job3 jobClass
    class Step1,Step2,Step3,Step4,Step5,Step6,Step7,Step8,Step9,Step10 stepClass
    class Artifacts,Deploy,Production,Archive,Success resultClass
`;
  };

  const generateAzureFlowchart = (colors: any) => {
    return `
flowchart TD
    GitHub[📱 GitHub Repository] --> Action[🎭 GitHub Action]
    Action --> Azure[☁️ Azure Login]
    
    Azure --> Auth{Authentication}
    Auth -->|Service Principal| SP[🔑 Service Principal]
    Auth -->|Managed Identity| MI[🆔 Managed Identity]
    Auth -->|OIDC| OIDC[🔐 OIDC Token]
    
    SP --> AzureCLI[⚡ Azure CLI]
    MI --> AzureCLI
    OIDC --> AzureCLI
    
    AzureCLI --> Resources{Azure Resources}
    Resources --> WebApp[🌐 Web App]
    Resources --> Functions[⚡ Functions]
    Resources --> Storage[💾 Storage]
    Resources --> Database[🗄️ Database]
    
    WebApp --> Deploy1[🚀 Deploy Web App]
    Functions --> Deploy2[⚡ Deploy Functions]
    Storage --> Deploy3[💾 Upload Files]
    Database --> Deploy4[🗄️ Run Scripts]
    
    Deploy1 --> Monitor[📊 Monitor]
    Deploy2 --> Monitor
    Deploy3 --> Monitor
    Deploy4 --> Monitor
    
    Monitor --> Success[✅ Deployment Success]
    Monitor --> Failure[❌ Deployment Failed]
    
    Success --> Notify[📧 Notifications]
    Failure --> Rollback[🔄 Rollback]
    
    %% Styling
    classDef githubClass fill:${colors.primary},stroke:#fff,stroke-width:2px,color:#fff
    classDef azureClass fill:${colors.secondary},stroke:#fff,stroke-width:2px,color:#fff
    classDef authClass fill:${colors.success},stroke:#fff,stroke-width:2px,color:#fff
    classDef resourceClass fill:${colors.warning},stroke:#fff,stroke-width:2px,color:#fff
    classDef deployClass fill:${colors.error},stroke:#fff,stroke-width:2px,color:#fff
    classDef resultClass fill:${colors.neutral},stroke:#fff,stroke-width:2px,color:#fff
    
    class GitHub,Action githubClass
    class Azure,AzureCLI azureClass
    class Auth,SP,MI,OIDC authClass
    class Resources,WebApp,Functions,Storage,Database resourceClass
    class Deploy1,Deploy2,Deploy3,Deploy4 deployClass
    class Monitor,Success,Failure,Notify,Rollback resultClass
`;
  };

  const generateGenericFlowchart = (colors: any) => {
    return `
flowchart TD
    Start([🎯 Questão]) --> Analysis[🔍 Análise]
    Analysis --> Options{Opções Disponíveis}
    
    Options --> A[📝 Opção A]
    Options --> B[📝 Opção B]
    Options --> C[📝 Opção C]
    Options --> D[📝 Opção D]
    
    A --> UserChoice{Escolha do Usuário}
    B --> UserChoice
    C --> UserChoice
    D --> UserChoice
    
    UserChoice --> Validation[✅ Validação]
    Validation --> Result{Resultado}
    
    Result -->|Correto| Success[🎉 Resposta Correta]
    Result -->|Incorreto| Failure[❌ Resposta Incorreta]
    
    Success --> Learning[📚 Aprendizado]
    Failure --> Learning
    
    Learning --> Next[➡️ Próxima Questão]
    
    %% Styling
    classDef startClass fill:${colors.primary},stroke:#fff,stroke-width:2px,color:#fff
    classDef optionClass fill:${colors.secondary},stroke:#fff,stroke-width:2px,color:#fff
    classDef processClass fill:${colors.success},stroke:#fff,stroke-width:2px,color:#fff
    classDef resultClass fill:${colors.warning},stroke:#fff,stroke-width:2px,color:#fff
    classDef endClass fill:${colors.error},stroke:#fff,stroke-width:2px,color:#fff
    
    class Start,Analysis startClass
    class Options,A,B,C,D optionClass
    class UserChoice,Validation processClass
    class Result,Success,Failure resultClass
    class Learning,Next endClass
`;
  };

  const generateUserAnswerHighlight = (userAnswers: string[], correctAnswers: string[], isCorrect: boolean) => {
    if (!userAnswers.length) return '';
    
    const status = isCorrect ? 'CORRETO ✅' : 'INCORRETO ❌';
    const statusColor = isCorrect ? '#10B981' : '#EF4444';
    
    return `
    %% Informações da Resposta do Usuário
    AnswerInfo[📝 Sua Resposta:<br/>${userAnswers.join(', ')}<br/><br/>🎯 Resposta Correta:<br/>${correctAnswers.join(', ')}<br/><br/>📊 Status: ${status}]
    
    %% Conectar ao resultado final
    Final -.->|"Análise"| AnswerInfo
    
    %% Estilo para informações da resposta
    classDef answerInfoStyle fill:${statusColor},stroke:#FFFFFF,stroke-width:3px,color:#FFFFFF,font-weight:bold
    class AnswerInfo answerInfoStyle
    `;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(mermaidCode);
    alert('Código Mermaid copiado para a área de transferência!');
  };

  const downloadAsPNG = () => {
    // Esta funcionalidade requer integração com Mermaid CLI ou similar
    alert('Funcionalidade de download em desenvolvimento!');
  };

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold">
                🏗️ Arquitetura de {question.category}
              </h3>
              <p className="text-sm text-white/80">
                Fluxograma arquitetural interativo e colorido
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={copyToClipboard}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              title="Copiar código Mermaid"
            >
              📋
            </button>
            <button
              onClick={downloadAsPNG}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              title="Baixar como PNG"
            >
              📥
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              title="Expandir/Recolher"
            >
              {isExpanded ? '�' : '🔼'}
            </button>
            <button
              onClick={() => setIsVisible(!isVisible)}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              title="Mostrar/Ocultar"
            >
              {isVisible ? '�️' : '👁️‍�️'}
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      {isVisible && (
        <div className="p-6 space-y-6">
          {/* Mermaid Flowchart Renderer */}
          <div className={`bg-white rounded-xl shadow-sm border-2 border-slate-200 overflow-hidden ${isExpanded ? 'min-h-[800px]' : 'min-h-[600px]'}`}>
            <div className="bg-gradient-to-r from-slate-100 to-slate-200 p-3 border-b border-slate-300">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-slate-700 flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                  <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                  <span className="ml-3">Fluxograma Arquitetural</span>
                </h4>
                <div className="text-sm text-slate-500">
                  {question.category} • {isCorrect ? '✅ Correto' : '❌ Incorreto'}
                </div>
              </div>
            </div>
            <div className="p-4">
              <MermaidRenderer 
                code={mermaidCode} 
                className={`w-full flex items-center justify-center ${isExpanded ? 'min-h-[720px]' : 'min-h-[520px]'}`}
              />
            </div>
          </div>

          {/* Análise da Resposta */}
          <div className={`rounded-xl p-6 border-2 ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <h4 className={`font-bold text-lg mb-4 flex items-center gap-2 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
              {isCorrect ? '✅ Análise da Resposta Correta' : '❌ Análise da Resposta Incorreta'}
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                <h5 className={`font-semibold mb-2 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                  � Suas Respostas
                </h5>
                <p className={`text-sm ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                  {userAnswers.length > 0 ? userAnswers.join(', ') : 'Nenhuma resposta selecionada'}
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                <h5 className={`font-semibold mb-2 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                  🎯 Resposta Correta
                </h5>
                <p className={`text-sm ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                  {Array.isArray(question.correctAnswer) ? question.correctAnswer.join(', ') : question.correctAnswer}
                </p>
              </div>
            </div>
            <div className={`mt-4 p-4 rounded-lg ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
              <h5 className={`font-semibold mb-2 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                💡 Explicação Detalhada
              </h5>
              <p className={`text-sm ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                {question.explanation}
              </p>
            </div>
          </div>

          {/* Instruções para Visualização Externa */}
          <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
            <h4 className="font-bold text-blue-800 mb-4 flex items-center gap-2">
              💡 Visualização Externa (Opcional)
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-semibold text-blue-700 mb-2">📋 Como usar:</h5>
                <ol className="list-decimal list-inside space-y-1 text-blue-600 text-sm">
                  <li>Clique em "📋" para copiar o código Mermaid</li>
                  <li>Acesse <a href="https://mermaid.live" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">mermaid.live</a></li>
                  <li>Cole o código no editor online</li>
                  <li>Visualize o fluxograma em alta resolução</li>
                </ol>
              </div>
              <div>
                <h5 className="font-semibold text-blue-700 mb-2">🎯 Recursos:</h5>
                <ul className="list-disc list-inside space-y-1 text-blue-600 text-sm">
                  <li>Zoom e pan interativo</li>
                  <li>Exportação em SVG/PNG</li>
                  <li>Cores vibrantes e emojis</li>
                  <li>Layout responsivo</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Código Mermaid (Expandível) */}
          <details className="bg-slate-50 rounded-xl border-2 border-slate-200 overflow-hidden">
            <summary className="cursor-pointer p-4 bg-slate-100 hover:bg-slate-200 transition-colors">
              <span className="font-semibold text-slate-700">📋 Código Mermaid Completo</span>
            </summary>
            <div className="p-4">
              <pre className="text-sm text-slate-700 whitespace-pre-wrap bg-white p-4 rounded-lg border overflow-x-auto">
                <code>{mermaidCode}</code>
              </pre>
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

export default MermaidArchitectureFlowchart;
