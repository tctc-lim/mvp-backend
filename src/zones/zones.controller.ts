import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ZonesService } from './zones.service';
import { CreateZoneDto } from './dto/create-zone-dto';
import { UpdateZoneDto } from './dto/update-zone.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UserRole } from '@prisma/client'; // ✅ Use Prisma UserRole
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('zones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ZonesController {
  constructor(private readonly zonesService: ZonesService) {}

  @Post('/register')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ZONAL_COORDINATOR)
  create(@Body() createZoneDto: CreateZoneDto, @Req() req) {
    return this.zonesService.create(createZoneDto, req.user.role);
  }

  @Get('/all')
  findAll() {
    return this.zonesService.findAll();
  }

  @Get('/all/:id')
  findOne(@Param('id') id: string) {
    return this.zonesService.findOne(id);
  }

  @Patch('/edit/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ZONAL_COORDINATOR)
  update(@Param('id') id: string, @Body() updateZoneDto: UpdateZoneDto, @Req() req) {
    return this.zonesService.update(id, updateZoneDto, req.user.role);
  }

  @Delete('/delete/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  remove(@Param('id') id: string, @Req() req) {
    return this.zonesService.remove(id, req.user.role);
  }
}
