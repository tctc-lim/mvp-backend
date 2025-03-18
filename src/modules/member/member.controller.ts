import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { MemberService } from './member.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

@Controller('members')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Post()
  async createMember(@Body() createMemberDto: CreateMemberDto) {
    return this.memberService.create(createMemberDto);
  }

  @Get()
  async getAllMembers() {
    return this.memberService.findAll();
  }

  @Get(':id')
  async getMemberById(@Param('id') id: string) {
    return this.memberService.findOne(id);
  }

  @Put(':id')
  async updateMember(@Param('id') id: string, @Body() updateMemberDto: UpdateMemberDto) {
    return this.memberService.update(id, updateMemberDto);
  }

  @Delete(':id')
  async deleteMember(@Param('id') id: string) {
    return this.memberService.remove(id);
  }
}
