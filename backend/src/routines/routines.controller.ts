// backend/src/routines/routines.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { RoutinesService } from './routines.service';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('routines')
export class RoutinesController {
  constructor(private readonly routinesService: RoutinesService) {}

  @Post()
  create(@Request() req, @Body() createRoutineDto: any) {
    return this.routinesService.create(req.user.sub, createRoutineDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.routinesService.findAll(req.user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.routinesService.findOne(id);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() updateRoutineDto: any) {
    return this.routinesService.update(id, req.user.sub, updateRoutineDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.routinesService.remove(id, req.user.sub);
  }
}