import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

// Models que DEVEM ter escopo de organizationId
const MULTI_TENANT_MODELS = [
  'project',
  'sprint',
  'issue',
  'developer',
  'projectAssignment',
  'burndownPoint',
  'organizationSettings',
  'teamsConfig',
  'tempoConfig',
  'clockifyConfig',
  'slackConfig',
  'pullRequest',
  'webhookEvent',
  'syncJob',
  'organizationUser',
  'dataDeletionRequest',
];

interface Finding {
  file: string;
  line: number;
  model: string;
  operation: string;
  code: string;
  risk: 'high' | 'medium' | 'low';
  reason: string;
}

function getAllTsFiles(dir: string, fileList: string[] = []): string[] {
  const files = readdirSync(dir);

  files.forEach((file) => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      // Pular node_modules, dist, etc
      if (!['node_modules', 'dist', 'build', '.git'].includes(file)) {
        getAllTsFiles(filePath, fileList);
      }
    } else if (file.endsWith('.ts') && !file.endsWith('.test.ts') && !file.endsWith('.spec.ts')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

function auditFile(file: string): Finding[] {
  const content = readFileSync(file, 'utf-8');
  const findings: Finding[] = [];
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    for (const model of MULTI_TENANT_MODELS) {
      // Regex captura chamadas como prisma.project.findMany(...)
      const operationPattern = new RegExp(
        `(?:prisma|tx|this\\.prisma)\\.${model}\\.(findMany|findFirst|findUnique|update|updateMany|delete|deleteMany|count|aggregate|groupBy)`,
        'i'
      );
      const match = line.match(operationPattern);

      if (match) {
        const operation = match[1]!;

        // Extrair bloco where (próximas 30 linhas para capturar objetos where complexos)
        const blockStart = idx;
        const blockEnd = Math.min(idx + 30, lines.length);
        const block = lines.slice(blockStart, blockEnd).join('\n');

        // Verificar se tem organizationId OU relação que leva a org
        const hasOrgScope =
          block.includes('organizationId') ||
          block.includes('organization:') ||
          block.includes('project: {') && block.includes('organizationId') ||
          block.includes('sprint: {') && block.includes('project:') ||
          // Exceções conhecidas: findUnique com where: { id } pode ser seguro se id vier de query scopada
          (operation === 'findUnique' && block.includes('where: { id:')) ||
          (operation === 'findUnique' && block.includes('where: { id }')) ||
          // Outro caso: upsert/create com data que inclui organizationId
          block.includes('data: {') && block.includes('organizationId');

        if (!hasOrgScope) {
          // Determinar risco
          let risk: 'high' | 'medium' | 'low';
          let reason: string;

          if (['findMany', 'updateMany', 'deleteMany', 'aggregate', 'groupBy', 'count'].includes(operation)) {
            risk = 'high';
            reason = `${operation} sem filtro organizationId pode retornar/afetar dados de TODAS as orgs`;
          } else if (['findFirst', 'findUnique'].includes(operation)) {
            risk = 'medium';
            reason = `${operation} sem filtro organizationId pode acessar dados de outra org se ID for conhecido`;
          } else {
            risk = 'low';
            reason = `${operation} precisa validação manual`;
          }

          findings.push({
            file: file.replace(/\\/g, '/'), // Normalizar paths no Windows
            line: idx + 1,
            model,
            operation,
            code: line.trim(),
            risk,
            reason,
          });
        }
      }
    }
  });

  return findings;
}

function main() {
  console.log('\n🔍 Spravio Tenant Isolation Audit\n');
  console.log('Scanning: src/\n');

  const srcDir = join(process.cwd(), 'src');
  const files = getAllTsFiles(srcDir);

  console.log(`Found ${files.length} TypeScript files\n`);

  const allFindings: Finding[] = [];

  for (const file of files) {
    const findings = auditFile(file);
    allFindings.push(...findings);
  }

  // Agrupa por risco
  const byRisk = {
    high: allFindings.filter((f) => f.risk === 'high'),
    medium: allFindings.filter((f) => f.risk === 'medium'),
    low: allFindings.filter((f) => f.risk === 'low'),
  };

  console.log('=== Tenant Isolation Audit Report ===\n');
  console.log(`🔴 HIGH:   ${byRisk.high.length} findings`);
  console.log(`🟠 MEDIUM: ${byRisk.medium.length} findings`);
  console.log(`🟡 LOW:    ${byRisk.low.length} findings`);
  console.log(`\n📊 TOTAL:  ${allFindings.length} findings\n`);

  if (allFindings.length === 0) {
    console.log('✅ No tenant isolation violations found!\n');
    process.exit(0);
  }

  console.log('=== HIGH RISK FINDINGS ===\n');
  byRisk.high.forEach((finding) => {
    console.log(`🔴 ${finding.file}:${finding.line}`);
    console.log(`   Model: ${finding.model}.${finding.operation}`);
    console.log(`   Code:  ${finding.code}`);
    console.log(`   Risk:  ${finding.reason}\n`);
  });

  console.log('=== MEDIUM RISK FINDINGS ===\n');
  byRisk.medium.forEach((finding) => {
    console.log(`🟠 ${finding.file}:${finding.line}`);
    console.log(`   Model: ${finding.model}.${finding.operation}`);
    console.log(`   Code:  ${finding.code}`);
    console.log(`   Risk:  ${finding.reason}\n`);
  });

  console.log('=== LOW RISK FINDINGS ===\n');
  byRisk.low.forEach((finding) => {
    console.log(`🟡 ${finding.file}:${finding.line}`);
    console.log(`   Model: ${finding.model}.${finding.operation}`);
    console.log(`   Code:  ${finding.code}\n`);
  });

  console.log('=== RECOMMENDATIONS ===\n');

  if (byRisk.high.length > 0) {
    console.log('⚠️  CRITICAL: Fix all HIGH risk findings before deploying to production');
    console.log('   - HIGH risk queries can leak data across organizations');
    console.log('   - Add { organizationId } to where clause or use relation scoping\n');
  }

  if (byRisk.medium.length > 0) {
    console.log('⚠️  IMPORTANT: Review all MEDIUM risk findings');
    console.log('   - MEDIUM risk queries may access wrong org data if ID is guessed');
    console.log('   - Validate that IDs come from scoped queries upstream\n');
  }

  console.log('📝 Next steps:');
  console.log('   1. Review each finding and add organizationId filter');
  console.log('   2. For admin/system queries, mark with comment: // ADMIN: cross-org allowed');
  console.log('   3. Re-run this audit after fixes');
  console.log('   4. Implement Prisma middleware (spec 025) to enforce at runtime\n');

  // Exit com código de erro se houver HIGH findings
  if (byRisk.high.length > 0) {
    process.exit(1);
  }

  process.exit(0);
}

main();
