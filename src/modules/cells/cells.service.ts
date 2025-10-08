import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCellDto } from './dto/create-cell.dto';
import { UpdateCellDto } from './dto/update-cell.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class CellsService {
  constructor(private prisma: PrismaService) {}

  async create(createCellDto: CreateCellDto, userRole: UserRole) {
    const allowedRoles: UserRole[] = [
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN,
      UserRole.ZONAL_COORDINATOR,
    ];
    if (!allowedRoles.includes(userRole)) {
      throw new ForbiddenException('You do not have permission to create a cell.');
    }

    // Verify zone exists
    const zone = await this.prisma.zone.findUnique({
      where: { id: createCellDto.zoneId },
    });
    if (!zone) {
      throw new NotFoundException('Zone not found');
    }

    // Verify user exists and has appropriate role
    const user = await this.prisma.user.findUnique({
      where: { id: createCellDto.userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.role !== UserRole.CELL_LEADER) {
      throw new ForbiddenException('User must be a cell leader');
    }

    return this.prisma.cell.create({
      data: createCellDto,
      include: {
        leader: true,
        zone: true,
        members: true,
      },
    });
  }

  findAll() {
    return this.prisma.cell.findMany({
      include: {
        leader: true,
        zone: true,
        members: true,
      },
    });
  }

  async findOne(id: string) {
    const cell = await this.prisma.cell.findUnique({
      where: { id },
      include: {
        leader: true,
        zone: true,
        members: true,
      },
    });

    if (!cell) {
      throw new NotFoundException('Cell not found');
    }

    return cell;
  }

  async update(id: string, updateCellDto: UpdateCellDto, userRole: UserRole) {
    const allowedRoles: UserRole[] = [
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN,
      UserRole.ZONAL_COORDINATOR,
    ];
    if (!allowedRoles.includes(userRole)) {
      throw new ForbiddenException('You do not have permission to update a cell.');
    }

    const cell = await this.prisma.cell.findUnique({
      where: { id },
    });

    if (!cell) {
      throw new NotFoundException('Cell not found');
    }

    // If updating zone, verify it exists
    if (updateCellDto.zoneId) {
      const zone = await this.prisma.zone.findUnique({
        where: { id: updateCellDto.zoneId },
      });
      if (!zone) {
        throw new NotFoundException('Zone not found');
      }
    }

    // If updating leader, verify user exists and has appropriate role
    if (updateCellDto.userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: updateCellDto.userId },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      if (user.role !== UserRole.CELL_LEADER) {
        throw new ForbiddenException('User must be a cell leader');
      }
    }

    return this.prisma.cell.update({
      where: { id },
      data: updateCellDto,
      include: {
        leader: true,
        zone: true,
        members: true,
      },
    });
  }

  async remove(id: string, userRole: UserRole) {
    const allowedRoles: UserRole[] = [UserRole.SUPER_ADMIN, UserRole.ADMIN];
    if (!allowedRoles.includes(userRole)) {
      throw new ForbiddenException('You do not have permission to delete a cell.');
    }

    const cell = await this.prisma.cell.findUnique({
      where: { id },
    });

    if (!cell) {
      throw new NotFoundException('Cell not found');
    }

    return this.prisma.cell.delete({
      where: { id },
    });
  }

  async getCellMembers(id: string) {
    const cell = await this.prisma.cell.findUnique({
      where: { id },
      include: {
        members: true,
      },
    });

    if (!cell) {
      throw new NotFoundException('Cell not found');
    }

    return cell.members;
  }
}
