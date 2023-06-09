import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateIntegrationRequestDto } from './integration.dto';
import { JwtAuthGuard } from '../user/auth/auth.guard';
import { IntegrationService } from './integration.service';

@Controller('/api/v1/integration')
export class IntegrationController {
  @Inject(IntegrationService)
  private readonly integrationService: IntegrationService;

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  private async createIntegration(@Body() body: CreateIntegrationRequestDto) {
    console.log(body);

    const result = await this.integrationService.create(body);

    if (result.isError()) {
      throw result.error;
    } else {
      return result.value;
    }
  }

  @Get(':id')
  getIntegration(@Param('id') id: string) {
    // return the same things as from the creation request
  }

  @Put(':id')
  updateIntegration(@Param('id') id: string, @Body() body) {
    // Take params to find specific integration ID
    // Take body for submission of integration ID.
    // Write to DB
    // If integrationID already exists, update.
  }

  @Delete(':id')
  removeIntegration(@Param('id') id: string) {
    // remove the integration via service
  }
}
