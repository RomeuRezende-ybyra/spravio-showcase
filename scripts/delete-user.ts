#!/usr/bin/env tsx
/**
 * Delete a user from the database
 * Usage: tsx scripts/delete-user.ts <email>
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteUser(email: string) {
  console.log(`🔍 Looking for user: ${email}`)

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      organizations: true,
      accounts: true,
      sessions: true,
      assignments: true,
    },
  })

  if (!user) {
    console.log(`❌ User not found: ${email}`)
    process.exit(1)
  }

  console.log(`\n📊 User details:`)
  console.log(`   ID: ${user.id}`)
  console.log(`   Name: ${user.name}`)
  console.log(`   Email: ${user.email}`)
  console.log(`   Organizations: ${user.organizations.length}`)
  console.log(`   Accounts: ${user.accounts.length}`)
  console.log(`   Sessions: ${user.sessions.length}`)
  console.log(`   Assignments: ${user.assignments.length}`)

  console.log(`\n🗑️  Deleting user...`)

  // Delete user (cascade will handle related records)
  await prisma.user.delete({
    where: { email },
  })

  console.log(`✅ User deleted successfully!`)
  console.log(`   Cascade deleted:`)
  console.log(`   - ${user.organizations.length} organization membership(s)`)
  console.log(`   - ${user.accounts.length} account(s)`)
  console.log(`   - ${user.sessions.length} session(s)`)
  console.log(`   - ${user.assignments.length} assignment(s)`)
}

const email = process.argv[2]

if (!email) {
  console.log('Usage: tsx scripts/delete-user.ts <email>')
  process.exit(1)
}

deleteUser(email)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error deleting user:', error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
