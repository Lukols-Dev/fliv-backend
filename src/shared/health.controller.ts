import { Controller, Get, Head, HttpCode } from '@nestjs/common';
import { Public } from '@thallesp/nestjs-better-auth';

@Public()
@Controller('health')
export class HealthController {
  @Get()
  getHealth() {
    return { status: 'ok' };
  }

  @Head()
  @HttpCode(204)
  headHealth(): void {}
}
