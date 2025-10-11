import { prisma } from '../client';
import { User } from '@prisma/client';

export class UserRepository {
  async create(data: {
    username: string;
    avatarUrl?: string;
  }): Promise<User> {
    return prisma.user.create({
      data,
    });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { username },
    });
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id },
    });
  }

  async findMany(limit: number = 50, offset: number = 0): Promise<User[]> {
    return prisma.user.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });
  }

  async searchByUsername(username: string, limit: number = 10): Promise<User[]> {
    return prisma.user.findMany({
      where: {
        username: {
          contains: username,
          mode: 'insensitive',
        },
      },
      take: limit,
      orderBy: { username: 'asc' },
    });
  }
}
