import { Module } from '@nestjs/common';
import { CellsService } from './cells.service';
import { CellsController } from './cells.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [CellsController],
  providers: [CellsService, PrismaService],
  exports: [CellsService],
})
export class CellsModule {}
