import { PartialType } from '@nestjs/swagger'; // Better import

import { CreateMemberDto } from './create-member.dto';

export class UpdateMemberDto extends PartialType(CreateMemberDto) {}