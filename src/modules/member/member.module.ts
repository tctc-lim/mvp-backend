import { Module } from '@nestjs/common';
import { MemberService } from './member.service';
import { MemberController } from './member.controller';
import { MemberExportService } from './services/member-export.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [MemberController],
  providers: [MemberService, MemberExportService, PrismaService],
})
export class MemberModule {}
