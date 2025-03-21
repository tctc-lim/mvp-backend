import { Controller, Post, Get, Patch, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { FollowUpService } from './followups.service';
import { CreateFollowUpDto } from './dto/create-followup.dto';
import { UpdateFollowUpDto } from './dto/update-followup.dto';
import { Request } from 'express';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRole } from '@prisma/client';

@Controller('followups')
@UseGuards(RolesGuard)
export class FollowUpController {
  constructor(private followUpService: FollowUpService) {}

  @Post('/register')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FOLLOW_UP_TEAM)
  create(@Body() CreateFollowUpDto: CreateFollowUpDto, @Req() req) {
    return this.followUpService.create(CreateFollowUpDto, req.user.role);
  }

  @Get('/all')
  findAll() {
    return this.followUpService.findAll();
  }

  @Patch('/all/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FOLLOW_UP_TEAM)
  update(@Param('id') id: string, @Body() UpdateFollowUpDto: UpdateFollowUpDto, @Req() req) {
      return this.followUpService.update(id, UpdateFollowUpDto, req.user.role);
    }

  @Delete('/delte/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  remove(@Param('id') id: string, @Req() req) {
    return this.followUpService.delete(id, req.user.role);
  }
}