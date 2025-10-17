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
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { MemberService } from './member.service';
import { MemberExportService } from './services/member-export.service';
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
  constructor(
    private readonly memberService: MemberService,
    private readonly exportService: MemberExportService,
  ) {}

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
  @ApiQuery({ name: 'gender', required: false, enum: ['male', 'female'] })
  @ApiQuery({ name: 'ageRange', required: false })
  @ApiQuery({ name: 'educationLevel', required: false })
  @ApiQuery({ name: 'interests', required: false })
  @ApiQuery({ name: 'birthMonth', required: false })
  @ApiQuery({ name: 'firstVisitStart', required: false })
  @ApiQuery({ name: 'firstVisitEnd', required: false })
  @ApiQuery({ name: 'lastVisitStart', required: false })
  @ApiQuery({ name: 'lastVisitEnd', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  findAll(@Query() query: MemberQueryDto) {
    return this.memberService.findAll(query);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search members by phone or email' })
  @ApiResponse({ status: 200, description: 'Return matching members' })
  @ApiQuery({ name: 'phone', required: false })
  @ApiQuery({ name: 'email', required: false })
  search(@Query('phone') phone?: string, @Query('email') email?: string) {
    return this.memberService.searchExistingMember(phone, email);
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

  @Get('export/excel')
  @ApiOperation({ summary: 'Export filtered members to Excel' })
  @ApiResponse({ status: 200, description: 'Excel file generated successfully' })
  @ApiQuery({ name: 'status', required: false, enum: MemberStatus })
  @ApiQuery({ name: 'conversionStatus', required: false, enum: ConversionStatus })
  @ApiQuery({ name: 'zoneId', required: false })
  @ApiQuery({ name: 'cellId', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'gender', required: false })
  @ApiQuery({ name: 'ageRange', required: false })
  @ApiQuery({ name: 'educationLevel', required: false })
  @ApiQuery({ name: 'interests', required: false })
  @ApiQuery({ name: 'birthMonth', required: false })
  @ApiQuery({ name: 'firstVisitStart', required: false })
  @ApiQuery({ name: 'firstVisitEnd', required: false })
  @ApiQuery({ name: 'lastVisitStart', required: false })
  @ApiQuery({ name: 'lastVisitEnd', required: false })
  async exportToExcel(@Query() query: MemberQueryDto, @Res() res: Response) {
    const result = await this.memberService.findAll({ ...query, limit: 10000, offset: 0 });
    const buffer = await this.exportService.exportToExcel(result.data);

    const filename = `members_export_${new Date().toISOString().split('T')[0]}.xlsx`;

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }

  @Get('export/pdf')
  @ApiOperation({ summary: 'Export filtered members to PDF' })
  @ApiResponse({ status: 200, description: 'PDF file generated successfully' })
  @ApiQuery({ name: 'status', required: false, enum: MemberStatus })
  @ApiQuery({ name: 'conversionStatus', required: false, enum: ConversionStatus })
  @ApiQuery({ name: 'zoneId', required: false })
  @ApiQuery({ name: 'cellId', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'gender', required: false })
  @ApiQuery({ name: 'ageRange', required: false })
  @ApiQuery({ name: 'educationLevel', required: false })
  @ApiQuery({ name: 'interests', required: false })
  @ApiQuery({ name: 'birthMonth', required: false })
  @ApiQuery({ name: 'firstVisitStart', required: false })
  @ApiQuery({ name: 'firstVisitEnd', required: false })
  @ApiQuery({ name: 'lastVisitStart', required: false })
  @ApiQuery({ name: 'lastVisitEnd', required: false })
  async exportToPDF(@Query() query: MemberQueryDto, @Res() res: Response) {
    const result = await this.memberService.findAll({ ...query, limit: 10000, offset: 0 });
    const buffer = await this.exportService.exportToPDF(result.data);

    const filename = `members_export_${new Date().toISOString().split('T')[0]}.pdf`;

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });

    res.send(buffer);
  }
}
