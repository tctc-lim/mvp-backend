import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ZonesService } from './zones.service';
import { CreateZoneDto } from './dto/create-zone-dto';
import { UpdateZoneDto } from './dto/update-zone.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: { sub: string; email: string; role: UserRole };
}

@Controller('zones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ZonesController {
  constructor(private readonly zonesService: ZonesService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  create(@Body() createZoneDto: CreateZoneDto, @Req() req: RequestWithUser) {
    return this.zonesService.create(createZoneDto, req.user.role);
  }

  @Get()
  findAll() {
    return this.zonesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.zonesService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateZoneDto: UpdateZoneDto,
    @Req() req: RequestWithUser,
  ) {
    return this.zonesService.update(id, updateZoneDto, req.user.role);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.zonesService.remove(id, req.user.role);
  }
}
