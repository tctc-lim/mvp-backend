import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentService {
  constructor(private readonly prisma: PrismaService) {}

  // ✅ Create a new department (Ensuring name uniqueness)
  async create(createDepartmentDto: CreateDepartmentDto) {
    const existingDepartment = await this.prisma.department.findFirst({ where: { name: createDepartmentDto.name } });

    if (existingDepartment) {
      throw new ConflictException('A department with this name already exists.');
    }

    return this.prisma.department.create({ data: createDepartmentDto });
  }

  // ✅ Get all departments
  async findAll() {
    return this.prisma.department.findMany();
  }

  // ✅ Get a single department by ID
  async findOne(id: string) {
    const department = await this.prisma.department.findUnique({ where: { id } });
    if (!department) throw new NotFoundException('Department not found');
    return department;
  }

  // ✅ Update a department (Ensuring the department exists)
  async update(id: string, updateDepartmentDto: UpdateDepartmentDto) {
    const department = await this.prisma.department.findUnique({ where: { id } });
    if (!department) throw new NotFoundException('Department not found');

    return this.prisma.department.update({
      where: { id },
      data: updateDepartmentDto,
    });
  }

  // ✅ Delete a department (Ensuring the department exists)
  async remove(id: string) {
    const department = await this.prisma.department.findUnique({ where: { id } });
    if (!department) throw new NotFoundException('Department not found');

    return this.prisma.department.delete({ where: { id } });
  }
}
