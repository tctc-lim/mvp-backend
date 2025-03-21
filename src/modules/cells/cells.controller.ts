import { Controller, Get, Post, Body, Param, Patch, Delete, Req, UseGuards } from '@nestjs/common';
import { CellsService } from './cells.service';
import { CreateCellDto } from './dto/create-cell.dto';
import { UpdateCellDto } from './dto/update-cell.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('cells')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CellsController {
  constructor(private readonly cellsService: CellsService) {}

  @Post("/register")
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  create(@Req() req, @Body() dto: CreateCellDto) {
    return this.cellsService.create(req.user.role, dto);
  }

  @Get("/all")
  findAll() {
    return this.cellsService.findAll();
  }

  @Get('/all/:id')
  findOne(@Param('id') id: string) {
    return this.cellsService.findOne(id);
  }

  @Patch('/edit/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CELL_LEADER)
  update(@Req() req, @Param('id') id: string, @Body() dto: UpdateCellDto) {
    return this.cellsService.update(req.user.role, id, dto);
  }

  @Delete('/delete/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  remove(@Req() req, @Param('id') id: string) {
    return this.cellsService.remove(req.user.role, id);
  }
}
