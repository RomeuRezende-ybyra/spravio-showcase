import { prisma } from '../../lib/prisma.js'
import type { SetBudgetInput, SetRateInput, LogHoursInput } from './types.js'

export const budgetRepository = {
  findBudget(projectId: string) {
    return prisma.projectBudget.findUnique({ where: { projectId } })
  },

  upsertBudget(projectId: string, data: SetBudgetInput) {
    return prisma.projectBudget.upsert({
      where: { projectId },
      create: {
        projectId,
        totalBudget: data.totalBudget,
        currency: data.currency,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      },
      update: {
        totalBudget: data.totalBudget,
        currency: data.currency,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      },
    })
  },

  findRate(developerId: string, projectId: string) {
    return prisma.developerRate.findUnique({
      where: { developerId_projectId: { developerId, projectId } },
    })
  },

  findRatesByProject(projectId: string) {
    return prisma.developerRate.findMany({
      where: { projectId },
      include: { developer: { select: { id: true, name: true, avatarUrl: true } } },
    })
  },

  upsertRate(developerId: string, projectId: string, data: SetRateInput) {
    return prisma.developerRate.upsert({
      where: { developerId_projectId: { developerId, projectId } },
      create: {
        developerId,
        projectId,
        hourlyRate: data.hourlyRate,
        currency: data.currency,
      },
      update: {
        hourlyRate: data.hourlyRate,
        currency: data.currency,
      },
    })
  },

  findSprintHours(sprintId: string) {
    return prisma.sprintHours.findMany({
      where: { sprintId },
      include: { developer: { select: { id: true, name: true } } },
    })
  },

  findAllSprintHours(projectId: string) {
    return prisma.sprintHours.findMany({
      where: { sprint: { projectId } },
      include: {
        developer: { select: { id: true, name: true, avatarUrl: true } },
        sprint: { select: { id: true, name: true } },
      },
    })
  },

  upsertHours(sprintId: string, data: LogHoursInput) {
    const source = data.source ?? 'manual'
    return prisma.sprintHours.upsert({
      where: {
        sprintId_developerId_source: { sprintId, developerId: data.developerId, source },
      },
      create: {
        sprintId,
        developerId: data.developerId,
        hoursLogged: data.hoursLogged,
        source,
      },
      update: {
        hoursLogged: data.hoursLogged,
      },
    })
  },
}
