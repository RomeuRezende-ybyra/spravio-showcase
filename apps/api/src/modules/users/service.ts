import { prisma } from '../../lib/prisma.js'
import { AppError } from '../../lib/errors.js'
import bcrypt from 'bcryptjs'

export interface UpdateProfileInput {
  name?: string | null
  email?: string
  currentPassword?: string
  newPassword?: string
  avatarUrl?: string | null
  language?: string | null
  timezone?: string | null
  dateFormat?: string | null
  theme?: string | null
}

export const userService = {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        language: true,
        timezone: true,
        dateFormat: true,
        theme: true,
        createdAt: true,
        organizations: {
          select: {
            role: true,
            organization: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    if (!user) {
      throw new AppError('USER_NOT_FOUND', 'User not found', 404)
    }

    return user
  },

  async updateProfile(userId: string, input: UpdateProfileInput) {
    // If changing password, verify current password
    if (input.newPassword && input.currentPassword) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { passwordHash: true },
      })

      if (!user || !user.passwordHash) {
        throw new AppError('USER_NOT_FOUND', 'User not found', 404)
      }

      const isValidPassword = await bcrypt.compare(input.currentPassword, user.passwordHash)
      if (!isValidPassword) {
        throw new AppError('INVALID_PASSWORD', 'Current password is incorrect', 400)
      }
    }

    // If changing email, check if new email is already in use
    if (input.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: input.email,
          id: { not: userId },
        },
      })

      if (existingUser) {
        throw new AppError('EMAIL_IN_USE', 'Email is already in use', 400)
      }
    }

    // Prepare update data
    const updateData: any = {}
    if (input.name !== undefined) updateData.name = input.name
    if (input.email !== undefined) updateData.email = input.email
    if (input.avatarUrl !== undefined) updateData.avatarUrl = input.avatarUrl
    if (input.language !== undefined) updateData.language = input.language
    if (input.timezone !== undefined) updateData.timezone = input.timezone
    if (input.dateFormat !== undefined) updateData.dateFormat = input.dateFormat
    if (input.theme !== undefined) updateData.theme = input.theme

    if (input.newPassword) {
      const hashedPassword = await bcrypt.hash(input.newPassword, 10)
      updateData.passwordHash = hashedPassword
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        language: true,
        timezone: true,
        dateFormat: true,
        theme: true,
      },
    })

    return updatedUser
  },
}
