import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
} from '@nestjs/common';
import { IntegrationService } from './integration.service';

@Injectable()
export class IntegrationGuard implements CanActivate {
  @Inject(IntegrationService)
  private readonly integrationService: IntegrationService;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const id = request.params.id;
    const integration = await this.integrationService.get(id);

    if (integration.user.id === user.id) {
      return true;
    } else {
      return false;
    }
  }
}
