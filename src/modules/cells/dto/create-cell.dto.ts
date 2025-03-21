import { IsString, IsUUID } from 'class-validator';

export class CreateCellDto {
  @IsString()
  name: string;

  @IsUUID()
  userId: string;

  @IsUUID()
  zoneId: string;
}
