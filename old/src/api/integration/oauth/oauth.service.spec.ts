import { Test, TestingModule } from '@nestjs/testing';
import { OauthService } from './oauth.service';

describe('OauthService', () => {
  let service: OauthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OauthService],
    }).compile();

    service = module.get<OauthService>(OauthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have a function named create', () => {
    expect(service.create).toBeDefined();
  });

  test.todo(
    'should accept an integration instance as a param and return an oauthclient',
  );
});
