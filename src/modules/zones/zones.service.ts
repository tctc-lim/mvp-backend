import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateZoneDto } from './dto/create-zone-dto';
import { UpdateZoneDto } from './dto/update-zone.dto';
import { UserRole } from '@prisma/client'; // ✅ Use Prisma UserRole

@Injectable()
export class ZonesService {
    findOne: any;
    constructor(private readonly prisma: PrismaService) { }

    async create(createZoneDto: CreateZoneDto, userRole: UserRole) {
        const allowedRoles: UserRole[] = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ZONAL_COORDINATOR];

        if (!allowedRoles.includes(userRole as UserRole)) {
            throw new ForbiddenException('You do not have permission to create a zone.');
        }

        return this.prisma.zone.create({ data: createZoneDto });
    }

    async findAll() {
        return this.prisma.zone.findMany(); // ✅ Ensure this function exists
      }
    

    async update(id: string, updateZoneDto: UpdateZoneDto, userRole: UserRole) {
        const allowedRoles: UserRole[] = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ZONAL_COORDINATOR];

        if (!allowedRoles.includes(userRole as UserRole)) {
            throw new ForbiddenException('You do not have permission to update a zone.');
        }

        return this.prisma.zone.update({ where: { id }, data: updateZoneDto });
    }

    async remove(id: string, userRole: UserRole) {
        const allowedRoles: UserRole[] = [UserRole.SUPER_ADMIN, UserRole.ADMIN];

        if (!allowedRoles.includes(userRole as UserRole)) {
            throw new ForbiddenException('You do not have permission to delete a zone.');
        }

        return this.prisma.zone.delete({ where: { id } });
    }
}
