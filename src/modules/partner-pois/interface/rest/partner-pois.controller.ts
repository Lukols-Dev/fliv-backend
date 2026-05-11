import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { routesV1 } from 'src/config/app.routes';
import { Roles } from 'src/modules/auth/interface/http/roles.decorator';
import { ROLE_DISPATCHER } from 'src/shared/constants/roles.constants';
import {
  CreatePartnerPoiDto,
  ListPartnerPoisQueryDto,
  UpdatePartnerPoiDto,
} from '../../application/dto/partner-poi.dto';
import { PartnerPoisService } from '../../application/services/partner-pois.service';

@ApiTags('Partner POI - Dispatcher')
@ApiBearerAuth()
@Controller(routesV1.partnerPois.dispatcher.root)
@Roles(ROLE_DISPATCHER)
export class PartnerPoisController {
  constructor(private readonly partnerPoisService: PartnerPoisService) {}

  @Get()
  @ApiOperation({ summary: 'List partner POI in map bounding box' })
  async list(@Query() query: ListPartnerPoisQueryDto) {
    const items = await this.partnerPoisService.list(query);
    return { items };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get partner POI details' })
  async getById(@Param('id') id: string) {
    return this.partnerPoisService.getById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create partner POI and geocode address' })
  async create(@Body() dto: CreatePartnerPoiDto) {
    return this.partnerPoisService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update partner POI' })
  async update(@Param('id') id: string, @Body() dto: UpdatePartnerPoiDto) {
    return this.partnerPoisService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete partner POI' })
  async delete(@Param('id') id: string) {
    await this.partnerPoisService.delete(id);
    return { success: true };
  }
}
