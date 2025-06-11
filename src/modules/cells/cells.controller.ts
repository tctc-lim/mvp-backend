import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { CellsService } from './cells.service';
import { CreateCellDto } from './dto/create-cell.dto';
import { UpdateCellDto } from './dto/update-cell.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

interface RequestWithUser extends Request {
  user: { sub: string; email: string; role: UserRole };
}

@ApiTags('cells')
@Controller('cells')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CellsController {
  constructor(private readonly cellsService: CellsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ZONAL_COORDINATOR)
  @ApiOperation({ summary: 'Create a new cell' })
  @ApiResponse({ status: 201, description: 'Cell created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(@Body() createCellDto: CreateCellDto, @Req() req: RequestWithUser) {
    return this.cellsService.create(createCellDto, req.user.role);
  }

  @Get()
  @ApiOperation({ summary: 'Get all cells' })
  @ApiResponse({ status: 200, description: 'Return all cells' })
  findAll() {
    return this.cellsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a cell by id' })
  @ApiResponse({ status: 200, description: 'Return the cell' })
  @ApiResponse({ status: 404, description: 'Cell not found' })
  findOne(@Param('id') id: string) {
    return this.cellsService.findOne(id);
  }

  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ZONAL_COORDINATOR)
  @ApiOperation({ summary: 'Update a cell' })
  @ApiResponse({ status: 200, description: 'Cell updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Cell not found' })
  update(
    @Param('id') id: string,
    @Body() updateCellDto: UpdateCellDto,
    @Req() req: RequestWithUser,
  ) {
    return this.cellsService.update(id, updateCellDto, req.user.role);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a cell' })
  @ApiResponse({ status: 200, description: 'Cell deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Cell not found' })
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.cellsService.remove(id, req.user.role);
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'Get all members in a cell' })
  @ApiResponse({ status: 200, description: 'Return all members in the cell' })
  @ApiResponse({ status: 404, description: 'Cell not found' })
  getCellMembers(@Param('id') id: string) {
    return this.cellsService.getCellMembers(id);
  }
}
