import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

describe('GarasiU API Endpoints (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('should handle full CRUD lifecycle across /vehicles and /service-logs', async () => {
    // 1. POST /vehicles -> status awal NOT_SYNC & parts kosong
    const createVehicleRes = await request(app.getHttpServer())
      .post('/vehicles')
      .send({
        brand: 'Toyota',
        model: 'GR Yaris',
        nickname: 'Pocket Rocket',
        type: 'CAR',
        year: 2022,
        plate: 'F 1618 GRY',
        tankCapacity: 50.5,
        initialOdometer: 36000,
      })
      .expect(201);

    const vehicleId = createVehicleRes.body.id as string;
    expect(vehicleId).toBeDefined();
    expect(createVehicleRes.body.serviceStatus).toBe('NOT_SYNC');
    expect(createVehicleRes.body.parts).toEqual([]);

    // 2. GET /vehicles & GET /vehicles/:id
    const listVehiclesRes = await request(app.getHttpServer())
      .get('/vehicles')
      .expect(200);
    expect(listVehiclesRes.body).toHaveLength(1);

    await request(app.getHttpServer())
      .get(`/vehicles/${vehicleId}`)
      .expect(200);

    // 3. PATCH /vehicles/:id
    const updateVehicleRes = await request(app.getHttpServer())
      .patch(`/vehicles/${vehicleId}`)
      .send({ nickname: 'Yaris Track' })
      .expect(200);
    expect(updateVehicleRes.body.nickname).toBe('Yaris Track');

    // 4. POST /service-logs -> otomatis memunculkan komponen & mengubah status menjadi HEALTHY
    const createLogRes = await request(app.getHttpServer())
      .post('/service-logs')
      .send({
        vehicleId,
        serviceDate: '2026-11-15',
        odometerAtService: 36500,
        category: 'ROUTINE_MAINTENANCE',
        part: 'Engine Oil',
        workshop: 'Auto2000',
        cost: 750000,
        isWarrantyClaim: false,
      })
      .expect(201);

    const logId = createLogRes.body.id as string;
    expect(logId).toBeDefined();
    expect(createLogRes.body.vehiclePartId).toBeDefined();

    // Cek vehicle setelah servis dicatat
    const syncedVehicleRes = await request(app.getHttpServer())
      .get(`/vehicles/${vehicleId}`)
      .expect(200);
    expect(syncedVehicleRes.body.serviceStatus).toBe('HEALTHY');
    expect(syncedVehicleRes.body.currentOdometer).toBe(36500);
    expect(syncedVehicleRes.body.parts).toHaveLength(1);
    expect(syncedVehicleRes.body.parts[0].name).toBe('Engine Oil');

    // 5. GET /service-logs & GET /service-logs/:id
    const listLogsRes = await request(app.getHttpServer())
      .get(`/service-logs?vehicleId=${vehicleId}`)
      .expect(200);
    expect(listLogsRes.body).toHaveLength(1);

    await request(app.getHttpServer())
      .get(`/service-logs/${logId}`)
      .expect(200);

    // 6. PATCH /service-logs/:id
    const updateLogRes = await request(app.getHttpServer())
      .patch(`/service-logs/${logId}`)
      .send({ cost: 800000, isWarrantyClaim: true })
      .expect(200);
    expect(updateLogRes.body.cost).toBe(800000);
    expect(updateLogRes.body.isWarrantyClaim).toBe(true);

    // 7. DELETE /service-logs/:id & DELETE /vehicles/:id
    await request(app.getHttpServer())
      .delete(`/service-logs/${logId}`)
      .expect(200);
    await request(app.getHttpServer())
      .get(`/service-logs/${logId}`)
      .expect(404);

    await request(app.getHttpServer())
      .delete(`/vehicles/${vehicleId}`)
      .expect(200);
    await request(app.getHttpServer())
      .get(`/vehicles/${vehicleId}`)
      .expect(404);
  });

  it('should enforce DTO validation rules on create and update for both resources', async () => {
    // Reject whitespace-only brand, invalid enum, negative odometer, and non-whitelisted property
    await request(app.getHttpServer())
      .post('/vehicles')
      .send({
        brand: '   ',
        model: 'Yaris',
        type: 'SPACESHIP',
        initialOdometer: -10,
        extraUnknownField: 'nope',
      })
      .expect(400);

    // Create valid vehicle to test update & service-log DTO validation
    const vehicleRes = await request(app.getHttpServer())
      .post('/vehicles')
      .send({
        brand: 'Honda',
        model: 'Civic Type R',
        type: 'CAR',
        initialOdometer: 5000,
      })
      .expect(201);
    const vehicleId = vehicleRes.body.id as string;

    // Reject invalid update payload on /vehicles/:id
    await request(app.getHttpServer())
      .patch(`/vehicles/${vehicleId}`)
      .send({ year: 1800, currentOdometer: -5 })
      .expect(400);

    // Reject invalid create payload on /service-logs (invalid UUID, bad date, cost <= 0, unknown field)
    await request(app.getHttpServer())
      .post('/service-logs')
      .send({
        vehicleId: 'not-a-uuid',
        serviceDate: 'invalid-date',
        odometerAtService: -1,
        category: 'INVALID',
        part: '   ',
        workshop: '',
        cost: 0,
        unknownProp: 123,
      })
      .expect(400);

    // Create valid service log, then reject invalid update payload
    const logRes = await request(app.getHttpServer())
      .post('/service-logs')
      .send({
        vehicleId,
        serviceDate: '2026-11-15',
        odometerAtService: 5500,
        category: 'ROUTINE_MAINTENANCE',
        part: 'Engine Oil',
        workshop: 'Honda Resmi',
        cost: 600000,
      })
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/service-logs/${logRes.body.id as string}`)
      .send({ cost: -100 })
      .expect(400);
  });

  it('should return proper NestJS HTTP exceptions (404, 409, 400) for domain error scenarios', async () => {
    const missingId = '00000000-0000-4000-8000-000000000000';

    // 404 NotFoundException: vehicle & service-log ID tidak ditemukan
    await request(app.getHttpServer())
      .get(`/vehicles/${missingId}`)
      .expect(404);
    await request(app.getHttpServer())
      .get(`/service-logs/${missingId}`)
      .expect(404);
    await request(app.getHttpServer())
      .get(`/service-logs?vehicleId=${missingId}`)
      .expect(404);

    // 409 ConflictException: plat nomor duplikat
    const firstVehicleRes = await request(app.getHttpServer())
      .post('/vehicles')
      .send({
        brand: 'Mazda',
        model: 'MX-5',
        type: 'CAR',
        plate: 'B 888 MXV',
        initialOdometer: 12000,
      })
      .expect(201);
    const vehicleId = firstVehicleRes.body.id as string;

    await request(app.getHttpServer())
      .post('/vehicles')
      .send({
        brand: 'Mazda',
        model: 'RX-7',
        type: 'CAR',
        plate: 'b 888 mxv',
        initialOdometer: 50000,
      })
      .expect(409);

    // 400 BadRequestException: odometer servis lebih kecil dari initialOdometer kendaraan
    await request(app.getHttpServer())
      .post('/service-logs')
      .send({
        vehicleId,
        serviceDate: '2026-11-15',
        odometerAtService: 9000,
        category: 'ROUTINE_MAINTENANCE',
        part: 'Engine Oil',
        workshop: 'Mazda Service',
        cost: 650000,
      })
      .expect(400);

    // 400 BadRequestException: servis pada kendaraan non-aktif
    await request(app.getHttpServer())
      .patch(`/vehicles/${vehicleId}`)
      .send({ isActive: false })
      .expect(200);

    await request(app.getHttpServer())
      .post('/service-logs')
      .send({
        vehicleId,
        serviceDate: '2026-11-15',
        odometerAtService: 13000,
        category: 'ROUTINE_MAINTENANCE',
        part: 'Engine Oil',
        workshop: 'Mazda Service',
        cost: 650000,
      })
      .expect(400);
  });
});
