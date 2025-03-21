import { Injectable, ForbiddenException } from '@nestjs/common';
import { CreateZoneDto } from './dto/create-zone-dto';
import { UpdateZoneDto } from './dto/update-zone.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class ZonesService {
  constructor(private prisma: PrismaService) {}

  async create(createZoneDto: CreateZoneDto, userRole: UserRole) {
    if (userRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only super admins can create zones');
    }
    return this.prisma.zone.create({
      data: createZoneDto,
    });
  }

  findAll() {
    return this.prisma.zone.findMany({
      include: {
        coordinator: true,
        cells: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.zone.findUnique({
      where: { id },
      include: {
        coordinator: true,
        cells: true,
      },
    });
  }

  async update(id: string, updateZoneDto: UpdateZoneDto, userRole: UserRole) {
    if (userRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only super admins can update zones');
    }
    return this.prisma.zone.update({
      where: { id },
      data: updateZoneDto,
    });
  }

  async remove(id: string, userRole: UserRole) {
    if (userRole !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only super admins can delete zones');
    }
    return this.prisma.zone.delete({
      where: { id },
    });
  }
}
