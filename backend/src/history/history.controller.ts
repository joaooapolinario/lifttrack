import { Controller, Get, Post, Body, Request, UseGuards } from '@nestjs/common';
import { HistoryService } from './history.service';
import { CreateHistoryDto } from './dto/create-history.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Post()
  create(@Request() req, @Body() createHistoryDto: CreateHistoryDto) {
    return this.historyService.create(req.user.sub, createHistoryDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.historyService.findAll(req.user.sub);
  }
}