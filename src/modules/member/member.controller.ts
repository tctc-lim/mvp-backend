import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { MemberService } from './member.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('members')
@UseGuards(JwtAuthGuard, RolesGuard) // Ensure JWT and Role Checks
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Post("register")
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async createMember(@Body() createMemberDto: CreateMemberDto) {
    return this.memberService.create(createMemberDto);
  }

  @Get("all")
  async getAllMembers() {
    return this.memberService.findAll();
  }

  @Get('all/:id')
  async getMemberById(@Param('id') id: string) {
    return this.memberService.findOne(id);
  }

  @Put('edit/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FOLLOW_UP_TEAM)
  async updateMember(@Param('id') id: string, @Body() updateMemberDto: UpdateMemberDto) {
    return this.memberService.update(id, updateMemberDto);
  }

  @Delete('delete/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async deleteMember(@Param('id') id: string) {
    return this.memberService.remove(id);
  }
}
