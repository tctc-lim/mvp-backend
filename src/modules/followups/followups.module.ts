// followup.module.ts
import { Module } from '@nestjs/common';
import { FollowUpService } from './followups.service';
import { FollowUpController } from './followups.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [FollowUpController],
  providers: [FollowUpService, PrismaService],
})
export class FollowUpModule {}
