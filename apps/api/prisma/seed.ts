import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Helper: random int in range [min, max]
function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Helper: date offset from now
function daysAgo(n: number) {
  return new Date(Date.now() - n * 86_400_000)
}
function daysFromNow(n: number) {
  return new Date(Date.now() + n * 86_400_000)
}

async function main() {
  console.log('Starting seed...')

  const dbUrl = process.env.DATABASE_URL ?? ''
  const isLocal = /localhost|127\.0\.0\.1/.test(dbUrl)

  if ((process.env.NODE_ENV === 'production' || !isLocal) && process.env.FORCE_SEED !== 'true') {
    console.log('Seed blocked - only runs against localhost databases')
    console.log(`   DATABASE_URL host: ${dbUrl.replace(/\/\/.*@/, '//***@')}`)
    console.log('   To bypass, set FORCE_SEED=true')
    return
  }

  // Clear existing data (child tables first to respect FK constraints)
  console.log('Clearing existing data...')
  await prisma.deliveryForecast.deleteMany()
  await prisma.burndownPoint.deleteMany()
  await prisma.sprintHours.deleteMany()
  await prisma.developerRate.deleteMany()
  await prisma.issue.deleteMany()
  await prisma.epic.deleteMany()
  await prisma.sprint.deleteMany()
  await prisma.projectBudget.deleteMany()
  await prisma.projectDeveloper.deleteMany()
  await prisma.developer.deleteMany()
  await prisma.projectAssignment.deleteMany()
  await prisma.project.deleteMany()
  await prisma.client.deleteMany()
  await prisma.organizationUser.deleteMany()
  await prisma.organizationSettings.deleteMany()
  await prisma.user.deleteMany()
  await prisma.organization.deleteMany()

  // ─── Organization ──────────────────────────────────────────────
  console.log('Creating organization...')
  const org = await prisma.organization.create({
    data: {
      name: 'Demo Agency',
      slug: 'demo-agency',
      subscriptionStatus: 'ACTIVE',
    },
  })

  // ─── Users ─────────────────────────────────────────────────────
  console.log('Creating users...')
  const passwordHash = await bcrypt.hash('password123', 10)
  const demoPasswordHash = await bcrypt.hash('spravio123456!', 10)

  const demoOwner = await prisma.user.create({
    data: { email: 'demo@spravio.io', name: 'Demo Admin', passwordHash: demoPasswordHash },
  })
  const owner = await prisma.user.create({
    data: { email: 'owner@demo.com', name: 'John Owner', passwordHash },
  })
  const pm1 = await prisma.user.create({
    data: { email: 'pm1@demo.com', name: 'Alice PM', passwordHash },
  })
  const pm2 = await prisma.user.create({
    data: { email: 'pm2@demo.com', name: 'Bob PM', passwordHash },
  })
  const viewer = await prisma.user.create({
    data: { email: 'viewer@demo.com', name: 'Charlie Viewer', passwordHash },
  })

  await prisma.organizationUser.createMany({
    data: [
      { userId: demoOwner.id, organizationId: org.id, role: 'OWNER' },
      { userId: owner.id, organizationId: org.id, role: 'OWNER' },
      { userId: pm1.id, organizationId: org.id, role: 'PROJECT_MANAGER' },
      { userId: pm2.id, organizationId: org.id, role: 'PROJECT_MANAGER' },
      { userId: viewer.id, organizationId: org.id, role: 'VIEWER' },
    ],
  })

  await prisma.organizationSettings.create({
    data: {
      organizationId: org.id,
      jiraBaseUrl: 'https://demo.atlassian.net',
      githubOrg: 'demo-agency',
    },
  })

  // ─── Clients ───────────────────────────────────────────────────
  console.log('Creating clients...')
  const clientTech = await prisma.client.create({
    data: { name: 'TechCorp', email: 'contact@techcorp.io', organizationId: org.id },
  })
  const clientRetail = await prisma.client.create({
    data: { name: 'RetailMax', email: 'projects@retailmax.com', organizationId: org.id },
  })
  const clientHealth = await prisma.client.create({
    data: { name: 'HealthPlus', email: 'dev@healthplus.org', organizationId: org.id },
  })

  // ─── Projects ──────────────────────────────────────────────────
  console.log('Creating projects...')
  const projEcom = await prisma.project.create({
    data: {
      id: 'proj-demo-1',
      name: 'E-commerce Platform',
      key: 'ECOM',
      organizationId: org.id,
      clientId: clientTech.id,
      source: 'jira',
      jiraProjectKey: 'ECOM',
      githubRepo: 'demo-agency/ecommerce',
      isActive: true,
      contractType: 'fixed',
      contractValue: 150000,
      startDate: daysAgo(90),
      deadline: daysFromNow(90),
      lastSyncAt: daysAgo(0),
    },
  })

  const projMobile = await prisma.project.create({
    data: {
      id: 'proj-demo-2',
      name: 'Mobile App',
      key: 'MOB',
      organizationId: org.id,
      clientId: clientRetail.id,
      source: 'jira',
      jiraProjectKey: 'MOBILE',
      githubRepo: 'demo-agency/mobile-app',
      isActive: true,
      contractType: 'tm',
      contractValue: 120000,
      startDate: daysAgo(60),
      deadline: daysFromNow(120),
      lastSyncAt: daysAgo(0),
    },
  })

  const projApi = await prisma.project.create({
    data: {
      id: 'proj-demo-3',
      name: 'API Gateway',
      key: 'APIGW',
      organizationId: org.id,
      clientId: clientHealth.id,
      source: 'azure',
      azureProjectId: 'api-gateway',
      githubRepo: 'demo-agency/api-gateway',
      isActive: true,
      contractType: 'retainer',
      contractValue: 200000,
      startDate: daysAgo(120),
      deadline: daysFromNow(60),
      lastSyncAt: daysAgo(1),
    },
  })

  const projects = [projEcom, projMobile, projApi]

  // ─── Project Assignments ───────────────────────────────────────
  await prisma.projectAssignment.createMany({
    data: [
      { projectId: projEcom.id, userId: pm1.id },
      { projectId: projMobile.id, userId: pm2.id },
      { projectId: projApi.id, userId: pm1.id },
    ],
  })

  // ─── Developers ────────────────────────────────────────────────
  console.log('Creating developers...')
  const devAna = await prisma.developer.create({
    data: { name: 'Ana Silva', email: 'ana@demo.com', githubLogin: 'anasilva', avatarUrl: null },
  })
  const devCarlos = await prisma.developer.create({
    data: { name: 'Carlos Souza', email: 'carlos@demo.com', githubLogin: 'carlossouza', avatarUrl: null },
  })
  const devMarina = await prisma.developer.create({
    data: { name: 'Marina Costa', email: 'marina@demo.com', githubLogin: 'marinacosta', avatarUrl: null },
  })
  const devPedro = await prisma.developer.create({
    data: { name: 'Pedro Oliveira', email: 'pedro@demo.com', githubLogin: 'pedrooliveira', avatarUrl: null },
  })
  const devLucia = await prisma.developer.create({
    data: { name: 'Lucia Fernandes', email: 'lucia@demo.com', githubLogin: 'luciafernandes', avatarUrl: null },
  })

  const allDevs = [devAna, devCarlos, devMarina, devPedro, devLucia]

  // Link developers to projects
  await prisma.projectDeveloper.createMany({
    data: [
      // E-commerce: Ana, Carlos, Pedro
      { projectId: projEcom.id, developerId: devAna.id, rating: 4.5, deliveryRate: 92, returnRate: 5, backendPoints: 34, frontendPoints: 28 },
      { projectId: projEcom.id, developerId: devCarlos.id, rating: 4.2, deliveryRate: 88, returnRate: 8, backendPoints: 42, frontendPoints: 12 },
      { projectId: projEcom.id, developerId: devPedro.id, rating: 4.0, deliveryRate: 85, returnRate: 10, backendPoints: 18, frontendPoints: 30 },
      // Mobile App: Marina, Lucia, Ana
      { projectId: projMobile.id, developerId: devMarina.id, rating: 4.8, deliveryRate: 95, returnRate: 3, backendPoints: 20, frontendPoints: 45 },
      { projectId: projMobile.id, developerId: devLucia.id, rating: 4.3, deliveryRate: 90, returnRate: 6, backendPoints: 15, frontendPoints: 35 },
      { projectId: projMobile.id, developerId: devAna.id, rating: 4.5, deliveryRate: 91, returnRate: 4, backendPoints: 22, frontendPoints: 18 },
      // API Gateway: Carlos, Pedro, Marina
      { projectId: projApi.id, developerId: devCarlos.id, rating: 4.6, deliveryRate: 93, returnRate: 4, backendPoints: 55, frontendPoints: 5 },
      { projectId: projApi.id, developerId: devPedro.id, rating: 4.1, deliveryRate: 87, returnRate: 7, backendPoints: 40, frontendPoints: 8 },
      { projectId: projApi.id, developerId: devMarina.id, rating: 4.4, deliveryRate: 89, returnRate: 5, backendPoints: 30, frontendPoints: 10 },
    ],
  })

  // ─── Developer Rates ───────────────────────────────────────────
  console.log('Creating developer rates...')
  const rateData: { developerId: string; projectId: string; hourlyRate: number }[] = [
    // E-commerce
    { developerId: devAna.id, projectId: projEcom.id, hourlyRate: 95 },
    { developerId: devCarlos.id, projectId: projEcom.id, hourlyRate: 110 },
    { developerId: devPedro.id, projectId: projEcom.id, hourlyRate: 85 },
    // Mobile App
    { developerId: devMarina.id, projectId: projMobile.id, hourlyRate: 105 },
    { developerId: devLucia.id, projectId: projMobile.id, hourlyRate: 90 },
    { developerId: devAna.id, projectId: projMobile.id, hourlyRate: 95 },
    // API Gateway
    { developerId: devCarlos.id, projectId: projApi.id, hourlyRate: 110 },
    { developerId: devPedro.id, projectId: projApi.id, hourlyRate: 85 },
    { developerId: devMarina.id, projectId: projApi.id, hourlyRate: 105 },
  ]

  for (const r of rateData) {
    await prisma.developerRate.create({
      data: { developerId: r.developerId, projectId: r.projectId, hourlyRate: r.hourlyRate, currency: 'USD' },
    })
  }

  // ─── Budgets ───────────────────────────────────────────────────
  console.log('Creating budgets...')
  await prisma.projectBudget.create({
    data: { projectId: projEcom.id, totalBudget: 150000, currency: 'USD', startDate: daysAgo(90), endDate: daysFromNow(90) },
  })
  await prisma.projectBudget.create({
    data: { projectId: projMobile.id, totalBudget: 120000, currency: 'USD', startDate: daysAgo(60), endDate: daysFromNow(120) },
  })
  await prisma.projectBudget.create({
    data: { projectId: projApi.id, totalBudget: 200000, currency: 'USD', startDate: daysAgo(120), endDate: daysFromNow(60) },
  })

  // ─── Epics ─────────────────────────────────────────────────────
  console.log('Creating epics...')
  // E-commerce epics
  const epicAuth = await prisma.epic.create({ data: { name: 'User Authentication', projectId: projEcom.id, color: '#4A90D9' } })
  const epicCart = await prisma.epic.create({ data: { name: 'Shopping Cart & Checkout', projectId: projEcom.id, color: '#7B68EE' } })
  const epicSearch = await prisma.epic.create({ data: { name: 'Product Search & Catalog', projectId: projEcom.id, color: '#2ECC71' } })

  // Mobile epics
  const epicOnboard = await prisma.epic.create({ data: { name: 'Onboarding Flow', projectId: projMobile.id, color: '#E67E22' } })
  const epicDash = await prisma.epic.create({ data: { name: 'Dashboard & Analytics', projectId: projMobile.id, color: '#9B59B6' } })
  const epicNotif = await prisma.epic.create({ data: { name: 'Push Notifications', projectId: projMobile.id, color: '#1ABC9C' } })

  // API Gateway epics
  const epicRateLimit = await prisma.epic.create({ data: { name: 'Rate Limiting & Throttling', projectId: projApi.id, color: '#E74C3C' } })
  const epicRouting = await prisma.epic.create({ data: { name: 'Dynamic Routing', projectId: projApi.id, color: '#3498DB' } })
  const epicMonitor = await prisma.epic.create({ data: { name: 'Monitoring & Observability', projectId: projApi.id, color: '#F39C12' } })

  // ─── Sprints ───────────────────────────────────────────────────
  console.log('Creating sprints...')

  // --- E-commerce Sprints ---
  const ecomSprint1 = await prisma.sprint.create({
    data: {
      projectId: projEcom.id, name: 'Sprint 1', state: 'CLOSED',
      startDate: daysAgo(84), endDate: daysAgo(70), completeDate: daysAgo(70),
      totalPoints: 42, completedPoints: 38,
    },
  })
  const ecomSprint2 = await prisma.sprint.create({
    data: {
      projectId: projEcom.id, name: 'Sprint 2', state: 'CLOSED',
      startDate: daysAgo(70), endDate: daysAgo(56), completeDate: daysAgo(56),
      totalPoints: 48, completedPoints: 45,
    },
  })
  const ecomSprint3 = await prisma.sprint.create({
    data: {
      projectId: projEcom.id, name: 'Sprint 3', state: 'CLOSED',
      startDate: daysAgo(56), endDate: daysAgo(42), completeDate: daysAgo(42),
      totalPoints: 50, completedPoints: 44,
    },
  })
  const ecomSprint4 = await prisma.sprint.create({
    data: {
      projectId: projEcom.id, name: 'Sprint 4', state: 'ACTIVE',
      startDate: daysAgo(7), endDate: daysFromNow(7),
      totalPoints: 46, completedPoints: 22,
    },
  })
  const ecomSprint5 = await prisma.sprint.create({
    data: {
      projectId: projEcom.id, name: 'Sprint 5', state: 'FUTURE',
      startDate: daysFromNow(7), endDate: daysFromNow(21),
      totalPoints: 0, completedPoints: 0,
    },
  })

  // --- Mobile Sprints ---
  const mobSprint1 = await prisma.sprint.create({
    data: {
      projectId: projMobile.id, name: 'Sprint 1', state: 'CLOSED',
      startDate: daysAgo(56), endDate: daysAgo(42), completeDate: daysAgo(42),
      totalPoints: 35, completedPoints: 32,
    },
  })
  const mobSprint2 = await prisma.sprint.create({
    data: {
      projectId: projMobile.id, name: 'Sprint 2', state: 'CLOSED',
      startDate: daysAgo(42), endDate: daysAgo(28), completeDate: daysAgo(28),
      totalPoints: 40, completedPoints: 36,
    },
  })
  const mobSprint3 = await prisma.sprint.create({
    data: {
      projectId: projMobile.id, name: 'Sprint 3', state: 'CLOSED',
      startDate: daysAgo(28), endDate: daysAgo(14), completeDate: daysAgo(14),
      totalPoints: 38, completedPoints: 38,
    },
  })
  const mobSprint4 = await prisma.sprint.create({
    data: {
      projectId: projMobile.id, name: 'Sprint 4', state: 'ACTIVE',
      startDate: daysAgo(5), endDate: daysFromNow(9),
      totalPoints: 42, completedPoints: 18,
    },
  })

  // --- API Gateway Sprints ---
  const apiSprint1 = await prisma.sprint.create({
    data: {
      projectId: projApi.id, name: 'Sprint 1', state: 'CLOSED',
      startDate: daysAgo(112), endDate: daysAgo(98), completeDate: daysAgo(98),
      totalPoints: 30, completedPoints: 28,
    },
  })
  const apiSprint2 = await prisma.sprint.create({
    data: {
      projectId: projApi.id, name: 'Sprint 2', state: 'CLOSED',
      startDate: daysAgo(98), endDate: daysAgo(84), completeDate: daysAgo(84),
      totalPoints: 34, completedPoints: 30,
    },
  })
  const apiSprint3 = await prisma.sprint.create({
    data: {
      projectId: projApi.id, name: 'Sprint 3', state: 'CLOSED',
      startDate: daysAgo(84), endDate: daysAgo(70), completeDate: daysAgo(70),
      totalPoints: 38, completedPoints: 35,
    },
  })
  const apiSprint4 = await prisma.sprint.create({
    data: {
      projectId: projApi.id, name: 'Sprint 4', state: 'ACTIVE',
      startDate: daysAgo(10), endDate: daysFromNow(4),
      totalPoints: 40, completedPoints: 30,
    },
  })
  const apiSprint5 = await prisma.sprint.create({
    data: {
      projectId: projApi.id, name: 'Sprint 5', state: 'FUTURE',
      startDate: daysFromNow(4), endDate: daysFromNow(18),
      totalPoints: 0, completedPoints: 0,
    },
  })

  // ─── Issues ────────────────────────────────────────────────────
  console.log('Creating issues...')

  const issueTypes: Array<'BACKEND' | 'FRONTEND' | 'DESIGN' | 'DEVOPS'> = ['BACKEND', 'FRONTEND', 'DESIGN', 'DEVOPS']
  const closedStatuses: Array<'DONE' | 'CANCELLED'> = ['DONE', 'CANCELLED']
  const activeStatuses: Array<'TODO' | 'IN_PROGRESS' | 'TEST' | 'UAT' | 'DONE'> = ['TODO', 'IN_PROGRESS', 'TEST', 'UAT', 'DONE']

  // Helper to create issues for closed sprints
  async function createClosedSprintIssues(
    sprintId: string,
    projectId: string,
    epicIds: string[],
    devIds: string[],
    prefix: string,
    count: number,
    totalPts: number,
  ) {
    const issues = []
    let ptsRemaining = totalPts
    for (let i = 0; i < count; i++) {
      const pts = i === count - 1 ? ptsRemaining : Math.min(rand(2, 8), ptsRemaining)
      ptsRemaining -= pts
      if (ptsRemaining < 0) ptsRemaining = 0
      const isDone = Math.random() > 0.1 // 90% done
      issues.push({
        title: `${prefix}-${i + 1}: ${['Implement feature', 'Fix bug in', 'Refactor', 'Add tests for', 'Update'][rand(0, 4)]} ${['authentication', 'payment flow', 'search', 'dashboard', 'API layer', 'UI component', 'database', 'caching', 'logging', 'routing'][rand(0, 9)]}`,
        jiraIssueKey: `${prefix}-${i + 1}`,
        points: pts,
        issueType: issueTypes[rand(0, 3)]!,
        status: isDone ? 'DONE' as const : closedStatuses[rand(0, 1)]!,
        wasReturned: Math.random() > 0.85,
        sprintId,
        developerId: devIds[rand(0, devIds.length - 1)]!,
        epicId: epicIds[rand(0, epicIds.length - 1)]!,
        resolvedAt: daysAgo(rand(14, 84)),
      })
    }
    await prisma.issue.createMany({ data: issues })
  }

  // Helper to create issues for active sprints
  async function createActiveSprintIssues(
    sprintId: string,
    projectId: string,
    epicIds: string[],
    devIds: string[],
    prefix: string,
    count: number,
    totalPts: number,
    completedPts: number,
  ) {
    const issues = []
    let ptsAccumDone = 0
    for (let i = 0; i < count; i++) {
      const pts = rand(2, 8)
      let status: 'TODO' | 'IN_PROGRESS' | 'TEST' | 'UAT' | 'DONE'
      if (ptsAccumDone < completedPts) {
        status = 'DONE'
        ptsAccumDone += pts
      } else {
        status = activeStatuses[rand(0, 3)]! // TODO, IN_PROGRESS, TEST, UAT
      }
      issues.push({
        title: `${prefix}-${i + 1}: ${['Build', 'Fix', 'Refactor', 'Test', 'Design'][rand(0, 4)]} ${['login page', 'checkout flow', 'search bar', 'user profile', 'notification system', 'data export', 'admin panel', 'onboarding', 'settings page', 'analytics widget'][rand(0, 9)]}`,
        jiraIssueKey: `${prefix}-${i + 1}`,
        points: pts,
        issueType: issueTypes[rand(0, 3)]!,
        status,
        wasReturned: Math.random() > 0.9,
        sprintId,
        developerId: devIds[rand(0, devIds.length - 1)]!,
        epicId: epicIds[rand(0, epicIds.length - 1)]!,
        resolvedAt: status === 'DONE' ? daysAgo(rand(0, 7)) : null,
      })
    }
    await prisma.issue.createMany({ data: issues })
  }

  // E-commerce issues
  const ecomDevIds = [devAna.id, devCarlos.id, devPedro.id]
  const ecomEpicIds = [epicAuth.id, epicCart.id, epicSearch.id]
  await createClosedSprintIssues(ecomSprint1.id, projEcom.id, ecomEpicIds, ecomDevIds, 'ECOM', 8, 42)
  await createClosedSprintIssues(ecomSprint2.id, projEcom.id, ecomEpicIds, ecomDevIds, 'ECOM', 10, 48)
  await createClosedSprintIssues(ecomSprint3.id, projEcom.id, ecomEpicIds, ecomDevIds, 'ECOM', 10, 50)
  await createActiveSprintIssues(ecomSprint4.id, projEcom.id, ecomEpicIds, ecomDevIds, 'ECOM', 9, 46, 22)

  // Mobile issues
  const mobDevIds = [devMarina.id, devLucia.id, devAna.id]
  const mobEpicIds = [epicOnboard.id, epicDash.id, epicNotif.id]
  await createClosedSprintIssues(mobSprint1.id, projMobile.id, mobEpicIds, mobDevIds, 'MOB', 7, 35)
  await createClosedSprintIssues(mobSprint2.id, projMobile.id, mobEpicIds, mobDevIds, 'MOB', 8, 40)
  await createClosedSprintIssues(mobSprint3.id, projMobile.id, mobEpicIds, mobDevIds, 'MOB', 8, 38)
  await createActiveSprintIssues(mobSprint4.id, projMobile.id, mobEpicIds, mobDevIds, 'MOB', 8, 42, 18)

  // API Gateway issues
  const apiDevIds = [devCarlos.id, devPedro.id, devMarina.id]
  const apiEpicIds = [epicRateLimit.id, epicRouting.id, epicMonitor.id]
  await createClosedSprintIssues(apiSprint1.id, projApi.id, apiEpicIds, apiDevIds, 'APIGW', 6, 30)
  await createClosedSprintIssues(apiSprint2.id, projApi.id, apiEpicIds, apiDevIds, 'APIGW', 7, 34)
  await createClosedSprintIssues(apiSprint3.id, projApi.id, apiEpicIds, apiDevIds, 'APIGW', 8, 38)
  await createActiveSprintIssues(apiSprint4.id, projApi.id, apiEpicIds, apiDevIds, 'APIGW', 8, 40, 30)

  // ─── Sprint Hours ──────────────────────────────────────────────
  console.log('Creating sprint hours...')

  // For each closed sprint, log hours for each dev on that project
  const sprintDevMap: Array<{ sprintId: string; devIds: string[]; projectId: string }> = [
    { sprintId: ecomSprint1.id, devIds: ecomDevIds, projectId: projEcom.id },
    { sprintId: ecomSprint2.id, devIds: ecomDevIds, projectId: projEcom.id },
    { sprintId: ecomSprint3.id, devIds: ecomDevIds, projectId: projEcom.id },
    { sprintId: ecomSprint4.id, devIds: ecomDevIds, projectId: projEcom.id },
    { sprintId: mobSprint1.id, devIds: mobDevIds, projectId: projMobile.id },
    { sprintId: mobSprint2.id, devIds: mobDevIds, projectId: projMobile.id },
    { sprintId: mobSprint3.id, devIds: mobDevIds, projectId: projMobile.id },
    { sprintId: mobSprint4.id, devIds: mobDevIds, projectId: projMobile.id },
    { sprintId: apiSprint1.id, devIds: apiDevIds, projectId: projApi.id },
    { sprintId: apiSprint2.id, devIds: apiDevIds, projectId: projApi.id },
    { sprintId: apiSprint3.id, devIds: apiDevIds, projectId: projApi.id },
    { sprintId: apiSprint4.id, devIds: apiDevIds, projectId: projApi.id },
  ]

  for (const entry of sprintDevMap) {
    for (const devId of entry.devIds) {
      await prisma.sprintHours.create({
        data: {
          sprintId: entry.sprintId,
          developerId: devId,
          hoursLogged: rand(30, 75),
          source: 'manual',
        },
      })
    }
  }

  // ─── Burndown Points ───────────────────────────────────────────
  console.log('Creating burndown points...')

  async function createBurndown(sprintId: string, totalPoints: number, startDate: Date, numDays: number) {
    const points = []
    let remaining = totalPoints
    for (let d = 0; d <= numDays; d++) {
      const date = new Date(startDate.getTime() + d * 86_400_000)
      const ideal = Math.round(totalPoints * (1 - d / numDays))
      // Simulate actual burndown with some variation
      if (d > 0) {
        const burned = rand(0, Math.ceil(totalPoints / numDays) + 2)
        remaining = Math.max(0, remaining - burned)
      }
      const completed = totalPoints - remaining
      points.push({
        sprintId,
        date,
        baselinePoints: ideal,
        actualPoints: remaining,
        completedPoints: completed,
      })
    }
    await prisma.burndownPoint.createMany({ data: points })
  }

  // Active sprint burndowns
  await createBurndown(ecomSprint4.id, 46, daysAgo(7), 14)
  await createBurndown(mobSprint4.id, 42, daysAgo(5), 14)
  await createBurndown(apiSprint4.id, 40, daysAgo(10), 14)

  // ─── Delivery Forecasts ────────────────────────────────────────
  console.log('Creating delivery forecasts...')

  await prisma.deliveryForecast.create({
    data: {
      projectId: projEcom.id,
      onTimeProbability: 72,
      predictedEndDate: daysFromNow(85),
      confidence: 'medium',
      reasoning: 'Based on current velocity of ~44 pts/sprint and 3 completed sprints. Team is performing well with a slight decline in Sprint 3. Budget consumption is healthy at 45%. Recommend maintaining current sprint cadence. Risk factors include upcoming holiday season reducing capacity.',
      inputSnapshot: {
        velocity: 42.3,
        velocityTrend: 'stable',
        reworkRate: 0.08,
        teamSize: 3,
        totalRemainingPoints: 92,
        completedSprints: 3,
        daysRemaining: 90,
        budgetHealth: 'green',
        sprintLengthDays: 14,
      },
    },
  })

  await prisma.deliveryForecast.create({
    data: {
      projectId: projMobile.id,
      onTimeProbability: 85,
      predictedEndDate: daysFromNow(95),
      confidence: 'high',
      reasoning: 'Strong team velocity trend with 100% completion in Sprint 3. Team of 3 developers is well-coordinated. Mobile App project is tracking well ahead of deadline. Budget utilization is efficient. Low rework rate indicates high code quality.',
      inputSnapshot: {
        velocity: 35.3,
        velocityTrend: 'increasing',
        reworkRate: 0.04,
        teamSize: 3,
        totalRemainingPoints: 68,
        completedSprints: 3,
        daysRemaining: 120,
        budgetHealth: 'green',
        sprintLengthDays: 14,
      },
    },
  })

  await prisma.deliveryForecast.create({
    data: {
      projectId: projApi.id,
      onTimeProbability: 55,
      predictedEndDate: daysFromNow(75),
      confidence: 'low',
      reasoning: 'API Gateway project is approaching deadline with significant remaining scope. Budget is 65% consumed with only 33% timeline remaining. Velocity has been improving but may not be sufficient to complete all planned features. Recommend scope negotiation with HealthPlus client and possible deadline extension.',
      inputSnapshot: {
        velocity: 31.0,
        velocityTrend: 'increasing',
        reworkRate: 0.06,
        teamSize: 3,
        totalRemainingPoints: 85,
        completedSprints: 3,
        daysRemaining: 60,
        budgetHealth: 'yellow',
        sprintLengthDays: 14,
      },
    },
  })

  console.log('Seed completed successfully!')
  console.log('')
  console.log('Demo Users:')
  console.log('  Demo:    demo@spravio.io / spravio123456!')
  console.log('  Owner:   owner@demo.com / password123')
  console.log('  PM 1:    pm1@demo.com / password123')
  console.log('  PM 2:    pm2@demo.com / password123')
  console.log('  Viewer:  viewer@demo.com / password123')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
