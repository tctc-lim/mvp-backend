import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Query,
  Patch,
} from '@nestjs/common';
import { MemberService } from './member.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { MemberQueryDto } from './dto/member-query.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole, MemberStatus, ConversionStatus } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('members')
@Controller('members')
@UseGuards(JwtAuthGuard, RolesGuard) // Ensure JWT and Role Checks
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new member' })
  @ApiResponse({ status: 201, description: 'Member created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createMemberDto: CreateMemberDto) {
    return this.memberService.create(createMemberDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all members with filters' })
  @ApiResponse({ status: 200, description: 'Return filtered list of members' })
  @ApiQuery({ name: 'status', required: false, enum: MemberStatus })
  @ApiQuery({ name: 'conversionStatus', required: false, enum: ConversionStatus })
  @ApiQuery({ name: 'zoneId', required: false })
  @ApiQuery({ name: 'cellId', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'firstVisitStart', required: false })
  @ApiQuery({ name: 'firstVisitEnd', required: false })
  @ApiQuery({ name: 'lastVisitStart', required: false })
  @ApiQuery({ name: 'lastVisitEnd', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  findAll(@Query() query: MemberQueryDto) {
    return this.memberService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a member by id' })
  @ApiResponse({ status: 200, description: 'Return the member' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  findOne(@Param('id') id: string) {
    return this.memberService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a member' })
  @ApiResponse({ status: 200, description: 'Member updated successfully' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  update(@Param('id') id: string, @Body() updateMemberDto: UpdateMemberDto) {
    return this.memberService.update(id, updateMemberDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a member' })
  @ApiResponse({ status: 200, description: 'Member deleted successfully' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  remove(@Param('id') id: string) {
    return this.memberService.remove(id);
  }

  @Post(':id/attendance')
  @Roles(UserRole.ADMIN, UserRole.ZONAL_COORDINATOR, UserRole.CELL_LEADER, UserRole.FOLLOW_UP_TEAM)
  @ApiOperation({ summary: 'Mark attendance for a member' })
  @ApiResponse({ status: 200, description: 'Attendance successfully marked' })
  @ApiResponse({ status: 400, description: 'Attendance already marked for this date' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  markAttendance(@Param('id') id: string, @Body() markAttendanceDto: MarkAttendanceDto) {
    return this.memberService.markAttendance(id, markAttendanceDto);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search members by phone or email' })
  @ApiResponse({ status: 200, description: 'Return matching members' })
  @ApiQuery({ name: 'phone', required: false })
  @ApiQuery({ name: 'email', required: false })
  search(@Query('phone') phone?: string, @Query('email') email?: string) {
    return this.memberService.searchExistingMember(phone, email);
  }
}
