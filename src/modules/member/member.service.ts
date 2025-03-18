import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

@Injectable()
export class MemberService {
  constructor(private readonly prisma: PrismaService) {}

  // ✅ Create a new member (Ensuring email uniqueness)
  async create(createMemberDto: CreateMemberDto) {
    const existingMember = await this.prisma.member.findUnique({ where: { email: createMemberDto.email } });

    if (existingMember) {
      throw new ConflictException('A member with this email already exists.');
    }

    return this.prisma.member.create({ data: createMemberDto });
  }

  // ✅ Get all members
  async findAll() {
    return this.prisma.member.findMany();
  }

  // ✅ Get a single member by ID
  async findOne(id: string) {
    const member = await this.prisma.member.findUnique({ where: { id } });
    if (!member) throw new NotFoundException('Member not found');
    return member;
  }

  // ✅ Update a member (Ensuring the member exists)
  async update(id: string, updateMemberDto: UpdateMemberDto) {
    const member = await this.prisma.member.findUnique({ where: { id } });
    if (!member) throw new NotFoundException('Member not found');

    return this.prisma.member.update({
      where: { id },
      data: updateMemberDto,
    });
  }

  // ✅ Delete a member (Ensuring the member exists)
  async remove(id: string) {
    const member = await this.prisma.member.findUnique({ where: { id } });
    if (!member) throw new NotFoundException('Member not found');

    return this.prisma.member.delete({ where: { id } });
  }
}
