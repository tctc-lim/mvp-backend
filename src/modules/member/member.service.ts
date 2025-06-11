import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { MemberQueryDto } from './dto/member-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class MemberService {
  constructor(private readonly prisma: PrismaService) {}

  // ✅ Create a new member (Ensuring email uniqueness)
  async create(createMemberDto: CreateMemberDto) {
    const existingMember = await this.prisma.member.findUnique({
      where: { email: createMemberDto.email },
    });

    if (existingMember) {
      throw new ConflictException('A member with this email already exists.');
    }

    return this.prisma.member.create({ data: createMemberDto });
  }

  // ✅ Get all members with filters
  async findAll(query: MemberQueryDto) {
    const where: Prisma.MemberWhereInput = {};

    // Apply status filter
    if (query.status) {
      where.status = query.status;
    }

    // Apply conversion status filter
    if (query.conversionStatus) {
      where.conversionStatus = query.conversionStatus;
    }

    // Apply zone filter
    if (query.zoneId) {
      where.zoneId = query.zoneId;
    }

    // Apply cell filter
    if (query.cellId) {
      where.cellId = query.cellId;
    }

    // Apply date range filters
    if (query.firstVisitStart || query.firstVisitEnd) {
      where.firstVisit = {
        ...(query.firstVisitStart && { gte: new Date(query.firstVisitStart) }),
        ...(query.firstVisitEnd && { lte: new Date(query.firstVisitEnd) }),
      };
    }

    if (query.lastVisitStart || query.lastVisitEnd) {
      where.lastVisit = {
        ...(query.lastVisitStart && { gte: new Date(query.lastVisitStart) }),
        ...(query.lastVisitEnd && { lte: new Date(query.lastVisitEnd) }),
      };
    }

    // Apply search filter
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    // Get total count for pagination
    const total = await this.prisma.member.count({ where });

    // Get paginated results
    const members = await this.prisma.member.findMany({
      where,
      include: {
        zone: true,
        cell: true,
      },
      skip: query.offset,
      take: query.limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      data: members,
      meta: {
        total,
        limit: query.limit,
        offset: query.offset,
      },
    };
  }

  // ✅ Get a single member by ID
  async findOne(id: string) {
    const member = await this.prisma.member.findUnique({
      where: { id },
      include: {
        zone: true,
        cell: true,
      },
    });
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
      include: {
        zone: true,
        cell: true,
      },
    });
  }

  // ✅ Delete a member (Ensuring the member exists)
  async remove(id: string) {
    const member = await this.prisma.member.findUnique({ where: { id } });
    if (!member) throw new NotFoundException('Member not found');

    return this.prisma.member.delete({ where: { id } });
  }
}
