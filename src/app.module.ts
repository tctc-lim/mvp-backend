import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { FollowupModule } from './modules/followup/followup.module';
import { DepartmentModule } from './modules/department/department.module';
import { MilestoneModule } from './modules/milestone/milestone.module';
import { configuration } from './config/configuration';
import { HealthModule } from './modules/health/health.module';
import { MemberModule } from './modules/member/member.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    PrismaModule,
    AuthModule,
    FollowupModule,
    DepartmentModule,
    MilestoneModule,
    HealthModule,
    MemberModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
