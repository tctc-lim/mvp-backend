import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { MemberService } from './member.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { MemberQueryDto } from './dto/member-query.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('members')
@Controller('members')
@UseGuards(JwtAuthGuard, RolesGuard) // Ensure JWT and Role Checks
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Post('register')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Register a new member' })
  @ApiResponse({ status: 201, description: 'Member successfully registered' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async createMember(@Body() createMemberDto: CreateMemberDto) {
    return this.memberService.create(createMemberDto);
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all members with filters' })
  @ApiResponse({ status: 200, description: 'Return filtered list of members' })
  async getAllMembers(@Query() query: MemberQueryDto) {
    return this.memberService.findAll(query);
  }

  @Get('all/:id')
  @ApiOperation({ summary: 'Get a specific member by ID' })
  @ApiResponse({ status: 200, description: 'Return the member details' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  async getMemberById(@Param('id') id: string) {
    return this.memberService.findOne(id);
  }

  @Put('edit/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FOLLOW_UP_TEAM)
  @ApiOperation({ summary: 'Update a member' })
  @ApiResponse({ status: 200, description: 'Member successfully updated' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  async updateMember(@Param('id') id: string, @Body() updateMemberDto: UpdateMemberDto) {
    return this.memberService.update(id, updateMemberDto);
  }

  @Delete('delete/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete a member' })
  @ApiResponse({ status: 200, description: 'Member successfully deleted' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  async deleteMember(@Param('id') id: string) {
    return this.memberService.remove(id);
  }
}
