import { Controller, Post, Get, Body, Param, Query, UseGuards } from '@nestjs/common';
import { BuilderService } from './builder.service';
import { JwtAuthGuard } from '@/modules/auth/jwt-auth.guard';
import { ManagerGuard } from '@/modules/auth/manager.guard';

@UseGuards(JwtAuthGuard, ManagerGuard)
@Controller('builder')
export class BuilderController {
  constructor(private readonly builderService: BuilderService) {}

  @Post('design')
  async createDesignJob(
    @Body() body: { casinoName: string; prompt: string; options?: any }
  ) {
    return this.builderService.createDesignJob(body.casinoName, body.prompt, body.options);
  }

  @Post('element')
  async createElementJob(
    @Body() body: { gameType: string; prompt: string; parameterId?: string; options?: any }
  ) {
    return this.builderService.createElementJob(body.gameType, body.prompt, body.parameterId, body.options);
  }

  @Get('jobs')
  async listJobs(
    @Query('type') type?: 'design' | 'element',
    @Query('limit') limit: string = '20',
    @Query('offset') offset: string = '0'
  ) {
    return this.builderService.listJobs(type, parseInt(limit, 10), parseInt(offset, 10));
  }

  @Get('job/:id')
  async getJob(@Param('id') id: string) {
    return this.builderService.getJob(id);
  }

  @Post('apply-design/:jobId')
  async applyDesign(@Param('jobId') jobId: string) {
    return this.builderService.applyDesign(jobId);
  }
}


