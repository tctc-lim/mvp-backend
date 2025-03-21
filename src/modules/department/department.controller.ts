import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('departments')
@UseGuards(JwtAuthGuard, RolesGuard) // Ensure JWT and Role Checks
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post("register")
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async createMember(@Body() CreateDepartmentDto: CreateDepartmentDto) {
    return this.departmentService.create(CreateDepartmentDto);
  }

  @Get("all")
  async getAllDepartments() {
    return this.departmentService.findAll();
  }

  @Get('all/:id')
  async getDepartmentById(@Param('id') id: string) {
    return this.departmentService.findOne(id);
  }

  @Put('edit/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async updateDepartment(@Param('id') id: string, @Body() UpdateDepartmentDto: UpdateDepartmentDto) {
    return this.departmentService.update(id, UpdateDepartmentDto);
  }

  @Delete('delete/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async deleteDepartment(@Param('id') id: string) {
    return this.departmentService.remove(id);
  }
}
