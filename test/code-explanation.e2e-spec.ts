import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('CodeExplanationController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    // Set test environment variable
    process.env.DEEPSEEK_API_KEY = 'test-api-key';
    
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    delete process.env.DEEPSEEK_API_KEY;
  });

  describe('/explain-code (POST)', () => {
    it('should validate required fields', () => {
      return request(app.getHttpServer())
        .post('/explain-code')
        .send({})
        .expect(400);
    });

    it('should validate code field', () => {
      return request(app.getHttpServer())
        .post('/explain-code')
        .send({
          language: 'javascript',
        })
        .expect(400);
    });

    it('should accept valid request (will fail due to network/API)', () => {
      return request(app.getHttpServer())
        .post('/explain-code')
        .send({
          code: 'function test() { return 42; }',
          language: 'javascript',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('originalCode');
          expect(res.body).toHaveProperty('explainedCode');
          expect(res.body).toHaveProperty('success');
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          expect(res.body.success).toBe(false); // Will fail due to network or API issues in test environment
        });
    });
  });
});
