import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Block execution outside local development
  const dbUrl = process.env.DATABASE_URL ?? ''
  const isLocal = /localhost|127\.0\.0\.1/.test(dbUrl)

  if (process.env.NODE_ENV === 'production' || !isLocal) {
    console.log('⚠️  Seed blocked — only runs against localhost databases')
    console.log(`   DATABASE_URL host: ${dbUrl.replace(/\/\/.*@/, '//***@')}`)
    return
  }

  // Clear existing data
  console.log('🗑️  Clearing existing data...')
  await prisma.pullRequest.deleteMany()
  await prisma.sprint.deleteMany()
  await prisma.projectDeveloper.deleteMany()
  await prisma.projectAssignment.deleteMany()
  await prisma.projectBudget.deleteMany()
  await prisma.project.deleteMany()
  await prisma.organizationUser.deleteMany()
  await prisma.organizationSettings.deleteMany()
  await prisma.user.deleteMany()
  await prisma.organization.deleteMany()

  // Create Organization
  console.log('🏢 Creating organization...')
  const org = await prisma.organization.create({
    data: {
      name: 'Demo Agency',
      slug: 'demo-agency',
      subscriptionStatus: 'ACTIVE',
    },
  })

  // Create Users
  console.log('👥 Creating users...')
  const passwordHash = await bcrypt.hash('password123', 10)
  
  const owner = await prisma.user.create({
    data: {
      email: 'owner@demo.com',
      name: 'John Owner',
      passwordHash,
    },
  })

  const pm1 = await prisma.user.create({
    data: {
      email: 'pm1@demo.com',
      name: 'Alice PM',
      passwordHash,
    },
  })

  const pm2 = await prisma.user.create({
    data: {
      email: 'pm2@demo.com',
      name: 'Bob PM',
      passwordHash,
    },
  })

  const viewer = await prisma.user.create({
    data: {
      email: 'viewer@demo.com',
      name: 'Charlie Viewer',
      passwordHash,
    },
  })

  // Link users to organization
  console.log('🔗 Linking users to organization...')
  await prisma.organizationUser.createMany({
    data: [
      { userId: owner.id, organizationId: org.id, role: 'OWNER' },
      { userId: pm1.id, organizationId: org.id, role: 'PROJECT_MANAGER' },
      { userId: pm2.id, organizationId: org.id, role: 'PROJECT_MANAGER' },
      { userId: viewer.id, organizationId: org.id, role: 'VIEWER' },
    ],
  })

  // Create Organization Settings
  console.log('⚙️  Creating organization settings...')
  await prisma.organizationSettings.create({
    data: {
      organizationId: org.id,
      jiraBaseUrl: 'https://demo.atlassian.net',
      githubOrg: 'demo-agency',
    },
  })

  // Create Projects
  console.log('📁 Creating projects...')
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        id: 'proj-demo-1',
        name: 'E-commerce Platform',
        organizationId: org.id,
        source: 'jira',
        jiraProjectKey: 'ECOM',
        githubRepo: 'demo-agency/ecommerce',
        isActive: true,
      },
    }),
    prisma.project.create({
      data: {
        id: 'proj-demo-2',
        name: 'Mobile App',
        organizationId: org.id,
        source: 'jira',
        jiraProjectKey: 'MOBILE',
        githubRepo: 'demo-agency/mobile-app',
        isActive: true,
      },
    }),
    prisma.project.create({
      data: {
        id: 'proj-demo-3',
        name: 'API Gateway',
        organizationId: org.id,
        source: 'azure',
        azureProjectId: 'api-gateway',
        githubRepo: 'demo-agency/api-gateway',
        isActive: true,
      },
    }),
  ])

  // Create Project Budgets
  console.log('💰 Creating project budgets...')
  await Promise.all(
    projects.map((project, index) =>
      prisma.projectBudget.create({
        data: {
          projectId: project.id,
          totalBudget: 100000 + index * 50000,
          consumedBudget: 60000 + index * 20000,
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
        },
      }),
    ),
  )

  // Assign PMs to projects
  console.log('👔 Assigning project managers...')
  await prisma.projectAssignment.createMany({
    data: [
      { projectId: projects[0].id, userId: pm1.id },
      { projectId: projects[1].id, userId: pm2.id },
      { projectId: projects[2].id, userId: pm1.id },
    ],
  })

  // Create Sprints
  console.log('🏃 Creating sprints...')
  const _sprint = await prisma.sprint.create({
    data: {
      projectId: projects[0].id,
      name: 'Sprint 1',
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      goal: 'Implement user authentication',
      status: 'ACTIVE',
      totalPoints: 50,
      completedPoints: 30,
    },
  })

  // Create Developers
  console.log('💻 Creating developers...')
  await prisma.projectDeveloper.createMany({
    data: [
      { projectId: projects[0].id, name: 'Dev 1', externalId: 'dev-1' },
      { projectId: projects[0].id, name: 'Dev 2', externalId: 'dev-2' },
      { projectId: projects[1].id, name: 'Dev 3', externalId: 'dev-3' },
    ],
  })

  // Create Pull Requests
  console.log('🔀 Creating pull requests...')
  await prisma.pullRequest.createMany({
    data: [
      {
        projectId: projects[0].id,
        externalId: 'pr-1',
        title: 'Add login page',
        state: 'open',
        createdAt: new Date(),
        author: 'Dev 1',
      },
      {
        projectId: projects[0].id,
        externalId: 'pr-2',
        title: 'Fix authentication bug',
        state: 'merged',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        mergedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        author: 'Dev 2',
      },
    ],
  })

  console.log('✅ Seed completed successfully!')
  console.log('')
  console.log('📋 Demo Users:')
  console.log('  Owner:   owner@demo.com / password123')
  console.log('  PM 1:    pm1@demo.com / password123')
  console.log('  PM 2:    pm2@demo.com / password123')
  console.log('  Viewer:  viewer@demo.com / password123')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
