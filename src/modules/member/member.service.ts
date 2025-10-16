import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { MemberQueryDto } from './dto/member-query.dto';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { MemberStatus, ConversionStatus, Prisma } from '@prisma/client';

@Injectable()
export class MemberService {
  constructor(private prisma: PrismaService) {}

  // Helper function to convert DD-MM to Date
  private convertBirthDate(birthDate: string): Date | null {
    if (!birthDate) return null;
    const [day, month] = birthDate.split('-');
    const date = new Date();
    date.setMonth(parseInt(month) - 1); // Month is 0-based
    date.setDate(parseInt(day));
    return date;
  }

  // ✅ Create a new member (Ensuring email uniqueness)
  async create(createMemberDto: CreateMemberDto) {
    const {
      name,
      email,
      phone,
      address,
      gender,
      zoneId,
      cellId,
      status,
      conversionStatus,
      sundayAttendance,
      firstVisitDate,
      conversionDate,
      prayerRequest,
      interests,
      educationLevel,
      ageRange,
      birthDate,
      badComment,
    } = createMemberDto;

    // Check for existing member with the same email
    if (email) {
      const existingMember = await this.prisma.member.findUnique({
        where: { email },
      });

      if (existingMember) {
        throw new ConflictException('A member with this email already exists.');
      }
    }

    // Set first visit date if provided, otherwise use current date
    const firstVisit = firstVisitDate ? new Date(firstVisitDate) : new Date();
    const lastVisit = firstVisit;

    // Create member with required cell relationship
    const member = await this.prisma.member.create({
      data: {
        name,
        email,
        phone,
        address,
        gender,
        firstVisit,
        lastVisit,
        conversionDate: conversionDate ? new Date(conversionDate) : null,
        status: status || MemberStatus.FIRST_TIMER,
        conversionStatus: conversionStatus || ConversionStatus.NOT_CONVERTED,
        sundayAttendance: sundayAttendance || 0,
        zone: {
          connect: { id: zoneId },
        },
        cell: {
          connect: { id: cellId },
        },
        prayerRequest,
        interests: interests || [],
        educationLevel,
        ageRange,
        birthDate: birthDate ? this.convertBirthDate(birthDate) : null,
        badComment,
      },
      include: {
        zone: true,
        cell: true,
      },
    });

    // If member has historical data indicating they're not a first timer
    if (firstVisitDate) {
      const today = new Date();
      const daysSinceFirstVisit = Math.floor(
        (today.getTime() - firstVisit.getTime()) / (1000 * 60 * 60 * 24),
      );

      // If they've been coming for more than a week, they're likely not a first timer
      if (daysSinceFirstVisit > 7) {
        await this.prisma.member.update({
          where: { id: member.id },
          data: { status: MemberStatus.SECOND_TIMER },
        });
        member.status = MemberStatus.SECOND_TIMER;
      }
    }

    // If they have Sunday attendance, update status accordingly
    if (sundayAttendance && sundayAttendance >= 3) {
      await this.prisma.member.update({
        where: { id: member.id },
        data: { status: MemberStatus.FULL_MEMBER },
      });
      member.status = MemberStatus.FULL_MEMBER;
    }

    return member;
  }

  // ✅ Get all members with filters
  async findAll(query: MemberQueryDto) {
    const {
      status,
      conversionStatus,
      zoneId,
      cellId,
      search,
      gender,
      ageRange,
      educationLevel,
      interests,
      birthMonth,
      firstVisitStart,
      firstVisitEnd,
      lastVisitStart,
      lastVisitEnd,
      limit = 10,
      offset = 0,
    } = query;

    const where: Prisma.MemberWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (conversionStatus) {
      where.conversionStatus = conversionStatus;
    }

    if (zoneId) {
      where.zoneId = zoneId;
    }

    if (cellId) {
      where.cellId = cellId;
    }

    if (gender) {
      where.gender = gender;
    }

    if (ageRange) {
      where.ageRange = ageRange;
    }

    if (educationLevel) {
      where.educationLevel = educationLevel;
    }

    if (interests) {
      where.interests = {
        has: interests,
      };
    }

    // Birth month filtering will be done post-query due to Prisma Date field limitations

    if (firstVisitStart || firstVisitEnd) {
      where.firstVisit = {};
      if (firstVisitStart) {
        const startDate = new Date(firstVisitStart);
        where.firstVisit.gte = startDate;

        // If only start is provided (no end), treat it as a specific date
        if (!firstVisitEnd) {
          const endOfDay = new Date(startDate);
          endOfDay.setHours(23, 59, 59, 999);
          where.firstVisit.lte = endOfDay;
        }
      }
      if (firstVisitEnd) {
        const endDate = new Date(firstVisitEnd);
        endDate.setHours(23, 59, 59, 999);
        where.firstVisit.lte = endDate;
      }
    }

    if (lastVisitStart || lastVisitEnd) {
      where.lastVisit = {};
      if (lastVisitStart) {
        const startDate = new Date(lastVisitStart);
        where.lastVisit.gte = startDate;

        // If only start is provided (no end), treat it as a specific date
        if (!lastVisitEnd) {
          const endOfDay = new Date(startDate);
          endOfDay.setHours(23, 59, 59, 999);
          where.lastVisit.lte = endOfDay;
        }
      }
      if (lastVisitEnd) {
        const endDate = new Date(lastVisitEnd);
        endDate.setHours(23, 59, 59, 999);
        where.lastVisit.lte = endDate;
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, allMembers] = await Promise.all([
      this.prisma.member.count({ where }),
      this.prisma.member.findMany({
        where,
        include: {
          zone: true,
          cell: true,
        },
        take: limit,
        skip: offset,
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    // Post-query filtering for birth month (Prisma limitation with Date fields)
    let members = allMembers;
    if (birthMonth) {
      const monthNum = parseInt(birthMonth);
      members = allMembers.filter((member) => {
        if (!member.birthDate) return false;
        return member.birthDate.getMonth() + 1 === monthNum;
      });
    }

    return {
      data: members,
      meta: {
        total: birthMonth ? members.length : total,
        limit,
        offset,
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
        followUps: true,
        milestones: true,
        departments: {
          include: {
            department: true,
          },
        },
      },
    });

    if (!member) {
      throw new NotFoundException(`Member with ID ${id} not found`);
    }

    return member;
  }

  // ✅ Update a member (Ensuring the member exists)
  async update(id: string, updateMemberDto: UpdateMemberDto) {
    const {
      name,
      email,
      phone,
      address,
      gender,
      zoneId,
      cellId,
      status,
      conversionStatus,
      sundayAttendance,
      firstVisitDate,
      conversionDate,
      prayerRequest,
      interests,
      educationLevel,
      ageRange,
      birthDate,
      badComment,
    } = updateMemberDto;

    const member = await this.findOne(id);

    const data: Prisma.MemberUpdateInput = {
      name,
      email,
      phone,
      address,
      gender,
      zone: zoneId ? { connect: { id: zoneId } } : undefined,
      cell: cellId ? { connect: { id: cellId } } : undefined,
      status,
      conversionStatus,
      sundayAttendance,
      firstVisit: firstVisitDate ? new Date(firstVisitDate) : undefined,
      conversionDate: conversionDate ? new Date(conversionDate) : undefined,
      prayerRequest,
      interests,
      educationLevel,
      ageRange,
      birthDate: birthDate ? this.convertBirthDate(birthDate) : undefined,
      badComment,
    };

    // Handle attendance update
    if (sundayAttendance !== undefined) {
      // Update lastVisit to current date when marking attendance
      data.lastVisit = new Date();

      // If this is a new attendance record, increment the counter
      if (sundayAttendance > member.sundayAttendance) {
        data.sundayAttendance = sundayAttendance;

        // Update status based on attendance
        if (sundayAttendance >= 3) {
          data.status = MemberStatus.FULL_MEMBER;
        } else if (sundayAttendance === 2) {
          data.status = MemberStatus.SECOND_TIMER;
        }
      }
    }

    return this.prisma.member.update({
      where: { id },
      data,
      include: {
        zone: true,
        cell: true,
      },
    });
  }

  // ✅ Delete a member (Ensuring the member exists)
  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.member.delete({
      where: { id },
    });
  }

  async markAttendance(id: string, markAttendanceDto: MarkAttendanceDto) {
    const member = await this.findOne(id);
    const attendanceDate = markAttendanceDto.attendanceDate
      ? new Date(markAttendanceDto.attendanceDate)
      : new Date();

    // Check if attendance was already marked for this date
    const startOfDay = new Date(attendanceDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(attendanceDate);
    endOfDay.setHours(23, 59, 59, 999);

    // If lastVisit is on the same day, attendance was already marked
    if (member.lastVisit >= startOfDay && member.lastVisit <= endOfDay) {
      throw new BadRequestException('Attendance already marked for this date');
    }

    // Increment attendance counter
    const newAttendanceCount = member.sundayAttendance + 1;

    // Determine new status based on attendance count
    let newStatus = member.status;
    if (newAttendanceCount >= 3) {
      newStatus = MemberStatus.FULL_MEMBER;
    } else if (newAttendanceCount === 2) {
      newStatus = MemberStatus.SECOND_TIMER;
    }

    // Update member with new attendance data
    return this.prisma.member.update({
      where: { id },
      data: {
        sundayAttendance: newAttendanceCount,
        lastVisit: attendanceDate,
        status: newStatus,
      },
      include: {
        zone: true,
        cell: true,
      },
    });
  }

  async searchExistingMember(phone?: string, email?: string) {
    if (!phone && !email) {
      throw new BadRequestException('Either phone or email must be provided');
    }

    const where: Prisma.MemberWhereInput = {
      OR: [...(phone ? [{ phone }] : []), ...(email ? [{ email }] : [])],
    };

    // Find ALL matching members (not just first)
    const members = await this.prisma.member.findMany({
      where,
      include: {
        zone: true,
        cell: true,
      },
      orderBy: {
        createdAt: 'desc', // Most recent first
      },
    });

    if (!members || members.length === 0) {
      return null;
    }

    // Analyze the matches
    const analysis = this.analyzeMemberMatches(members, phone, email);

    return {
      exists: true,
      matchCount: members.length,
      members,
      analysis,
      suggestedActions: members.map((member) => this.getSuggestedAction(member)),
    };
  }

  private analyzeMemberMatches(
    members: {
      createdAt: Date;
      name: string;
      cellId: string;
      zoneId: string;
      phone: string;
      email: string | null;
    }[],
    phone?: string,
    email?: string,
  ) {
    const analysis = {
      isSharedContact: false,
      isPotentialDuplicate: false,
      riskLevel: 'LOW' as 'LOW' | 'MEDIUM' | 'HIGH',
      recommendations: [] as string[],
    };

    // Check for shared contact patterns
    if (members.length > 1) {
      analysis.isSharedContact = true;

      // Check if same name (potential duplicate)
      const names = members.map((m) => m.name.toLowerCase().trim());
      const uniqueNames = new Set(names);

      if (uniqueNames.size < members.length) {
        analysis.isPotentialDuplicate = true;
        analysis.riskLevel = 'HIGH';
        analysis.recommendations.push('Multiple members with same name found - likely duplicate');
      } else {
        analysis.riskLevel = 'MEDIUM';
        analysis.recommendations.push(
          'Shared contact info detected - verify if this is intentional',
        );
      }

      // Additional analysis based on search criteria
      if (phone && members.some((m) => m.phone === phone)) {
        analysis.recommendations.push(
          'Phone number match found - verify if this is a family member',
        );
      }
      if (email && members.some((m) => m.email === email)) {
        analysis.recommendations.push(
          'Email address match found - verify if this is a family member',
        );
      }

      // Check for same family patterns
      const sameCell = members.every((m) => m.cellId === members[0].cellId);
      const sameZone = members.every((m) => m.zoneId === members[0].zoneId);

      if (sameCell || sameZone) {
        analysis.recommendations.push('Members are in same cell/zone - likely family members');
      }
    }

    // Check for recent registrations (potential spam/duplicate)
    const recentMembers = members.filter((m) => {
      const daysSinceCreation =
        (Date.now() - new Date(m.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceCreation < 7; // Within last week
    });

    if (recentMembers.length > 0) {
      analysis.riskLevel = 'HIGH';
      analysis.recommendations.push('Recent registration found - verify if this is a duplicate');
    }

    return analysis;
  }

  private getSuggestedAction(member: {
    status: MemberStatus;
    sundayAttendance: number;
    conversionStatus: ConversionStatus;
  }) {
    const actions = [];

    // Check if member needs status update
    if (member.status === MemberStatus.FIRST_TIMER && member.sundayAttendance >= 1) {
      actions.push('UPDATE_TO_SECOND_TIMER');
    }

    // Always allow manual promotion to full member (for sneaky users or manual overrides)
    if (member.status !== MemberStatus.FULL_MEMBER) {
      actions.push('UPDATE_TO_FULL_MEMBER');
    }

    // Check if member needs conversion status update
    if (member.conversionStatus === ConversionStatus.NOT_CONVERTED) {
      actions.push('UPDATE_CONVERSION_STATUS');
    }

    // If no actions needed
    if (actions.length === 0) {
      actions.push('NO_ACTION_NEEDED');
    }

    return actions;
  }
}
