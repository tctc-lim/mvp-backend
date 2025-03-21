// followup.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFollowUpDto } from './dto/create-followup.dto';
import { UpdateFollowUpDto } from './dto/update-followup.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class FollowUpService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateFollowUpDto, userRole: UserRole) {
    const allowedRoles: UserRole[] = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FOLLOW_UP_TEAM];

        if (!allowedRoles.includes(userRole as UserRole)) {
            throw new ForbiddenException('You do not have permission to create a zone.');
        }
  }

  async findAll() {
    return this.prisma.followUp.findMany();
  }

  async update(id: string, dto: UpdateFollowUpDto, userRole: UserRole) {
    const allowedRoles: UserRole[] = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FOLLOW_UP_TEAM];

    if (!allowedRoles.includes(userRole as UserRole)) {
        throw new ForbiddenException('You do not have permission to update a zone.');
    }

  }

  async delete(id: string, userRole: UserRole) {
    const allowedRoles: UserRole[] = [UserRole.SUPER_ADMIN, UserRole.ADMIN];

        if (!allowedRoles.includes(userRole as UserRole)) {
            throw new ForbiddenException('You do not have permission to delete a zone.');
        }
  }
}