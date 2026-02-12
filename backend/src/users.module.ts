import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from './prisma.module'; // import Prisma service

@Module({
  imports: [PrismaModule],   // use Prisma inside this module
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
