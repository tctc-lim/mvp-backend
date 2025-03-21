import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { CreateCellDto } from './dto/create-cell.dto';
import { UpdateCellDto } from './dto/update-cell.dto';

@Injectable()
export class CellsService {
  constructor(private prisma: PrismaService) {}

  async create(userRole: UserRole, dto: CreateCellDto) {
    const allowedRoles: UserRole[] = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CELL_LEADER];

        if (!allowedRoles.includes(userRole as UserRole)) {
            throw new ForbiddenException('You do not have permission to create a cell.');
        }

    return this.prisma.cell.create({ data: dto });
  }

  async findAll() {
    return this.prisma.cell.findMany();
  }

  async findOne(id: string) {
    return this.prisma.cell.findUnique({ where: { id } });
  }

  async update(userRole: UserRole, id: string, dto: UpdateCellDto) {
    const allowedRoles: UserRole[] = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ZONAL_COORDINATOR];

        if (!allowedRoles.includes(userRole as UserRole)) {
            throw new ForbiddenException('You do not have permission to update a cell.');
        }

    return this.prisma.cell.update({ where: { id }, data: dto });
  }

  async remove(userRole: UserRole, id: string) {
    const allowedRoles: UserRole[] = [UserRole.SUPER_ADMIN, UserRole.ADMIN];

        if (!allowedRoles.includes(userRole as UserRole)) {
            throw new ForbiddenException('You do not have permission to delete a cell.');
        }
  }
}
