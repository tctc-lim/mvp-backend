import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class DepartmentService {
  constructor(private prisma: PrismaService) {}

  async create(createDepartmentDto: CreateDepartmentDto, userRole: UserRole) {
    const allowedRoles: UserRole[] = [UserRole.SUPER_ADMIN, UserRole.ADMIN];
    if (!allowedRoles.includes(userRole)) {
      throw new ForbiddenException('You do not have permission to create a department.');
    }

    return this.prisma.department.create({
      data: createDepartmentDto,
      include: {
        members: {
          include: {
            member: true,
          },
        },
      },
    });
  }

  findAll() {
    return this.prisma.department.findMany({
      include: {
        members: {
          include: {
            member: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            member: true,
          },
        },
      },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return department;
  }

  async update(id: string, updateDepartmentDto: UpdateDepartmentDto, userRole: UserRole) {
    const allowedRoles: UserRole[] = [UserRole.SUPER_ADMIN, UserRole.ADMIN];
    if (!allowedRoles.includes(userRole)) {
      throw new ForbiddenException('You do not have permission to update a department.');
    }

    const department = await this.prisma.department.findUnique({
      where: { id },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return this.prisma.department.update({
      where: { id },
      data: updateDepartmentDto,
      include: {
        members: {
          include: {
            member: true,
          },
        },
      },
    });
  }

  async remove(id: string, userRole: UserRole) {
    const allowedRoles: UserRole[] = [UserRole.SUPER_ADMIN, UserRole.ADMIN];
    if (!allowedRoles.includes(userRole)) {
      throw new ForbiddenException('You do not have permission to delete a department.');
    }

    const department = await this.prisma.department.findUnique({
      where: { id },
      include: {
        members: true,
      },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    // Check if department has members
    if (department.members.length > 0) {
      throw new ForbiddenException(
        'Cannot delete department with active members. Please remove all members first.',
      );
    }

    return this.prisma.department.delete({
      where: { id },
    });
  }
}
