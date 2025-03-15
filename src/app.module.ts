import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { FollowupModule } from './modules/followup/followup.module';
import { DepartmentModule } from './modules/department/department.module';
import { MilestoneModule } from './modules/milestone/milestone.module';
import configuration from './config/configuration';

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
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
