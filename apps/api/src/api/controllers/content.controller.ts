import { Body, Controller, Get, Post } from '@nestjs/common';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { Public } from '@/modules/auth/jwt-auth.guard';

@Controller('content')
export class ContentController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get('sections')
  async getSections() {
    return this.prisma.section.findMany({ orderBy: { order: 'asc' } });
  }

  @Public()
  @Post('custom-games')
  async getCustomGames(@Body() body: { ids: string[] }) {
    const ids = Array.isArray(body?.ids) ? body.ids : [];
    if (ids.length === 0) return [];
    return this.prisma.customGame.findMany({
      where: { id: { in: ids } },
      include: { customConfig: { select: { parameters: true } } },
    });
  }

  @Public()
  @Get('sections-with-games')
  async getSectionsWithGames() {
    const sections = await this.prisma.section.findMany({ orderBy: { order: 'asc' } });
    if (sections.length === 0) return [];
    const allIds = Array.from(new Set(sections.flatMap(s => s.gameIds)));
    const games = await this.prisma.customGame.findMany({
      where: { id: { in: allIds } },
      include: { customConfig: { select: { parameters: true } } },
    });
    const byId = new Map(games.map(g => [g.id, g]));

    const toThumb = (params: any): string | null => {
      if (!params) return null;
      const icon = typeof params?.gameIcon === 'string' ? params.gameIcon : null;
      const bgStr = typeof params?.background === 'string' ? params.background : null;
      const bgObj = params?.background && typeof params.background === 'object' && typeof params.background.url === 'string' ? params.background.url : null;
      return icon || bgStr || bgObj;
    };

    return sections.map(sec => ({
      id: sec.id,
      title: sec.title,
      layout: sec.layout,
      order: sec.order,
      games: (sec.gameIds || []).map(id => byId.get(id)).filter(Boolean).map((g: any) => ({
        id: g.id,
        name: g.name,
        description: g.description,
        gameType: g.gameType,
        thumbnail: toThumb(g?.customConfig?.parameters),
        customConfig: g.customConfig,
      })),
    }));
  }
}
