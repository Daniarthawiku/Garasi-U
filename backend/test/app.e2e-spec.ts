import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';
import { createInMemoryPrismaMock } from './../src/prisma/prisma-mock.helper.js';
import { PrismaService } from './../src/prisma/prisma.service.js';

describe('GarasiU API Endpoints (e2e)', () => {
  let app: INestApplication<App>;
  let authToken: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(createInMemoryPrismaMock())
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    const signupRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        fullName: 'E2E Test Owner',
        email: 'e2e-owner@example.com',
        password: 'E2ePassword123!',
      })
      .expect(201);

    authToken = signupRes.body.accessToken as string;
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

  it('should enforce authentication on protected endpoints and validate login/me', async () => {
    await request(app.getHttpServer()).get('/vehicles').expect(401);
    await request(app.getHttpServer()).get('/service-logs').expect(401);
    await request(app.getHttpServer()).get('/fuel-logs').expect(401);
    await request(app.getHttpServer()).get('/auth/me').expect(401);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'e2e-owner@example.com',
        password: 'WrongPassword',
      })
      .expect(401);

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'e2e-owner@example.com',
        password: 'E2ePassword123!',
        rememberMe: true,
      })
      .expect(200);

    const token = loginRes.body.accessToken as string;
    expect(token).toBeDefined();

    const meRes = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Cookie', [`garasiu_session=${encodeURIComponent(token)}`])
      .expect(200);

    expect(meRes.body.email).toBe('e2e-owner@example.com');
  });

  it('should handle full CRUD lifecycle across /vehicles and /service-logs', async () => {
    // 1. POST /vehicles -> status awal NOT_SYNC & parts kosong
    const createVehicleRes = await request(app.getHttpServer())
      .post('/vehicles')
      .set('Authorization', `Bearer ${authToken}`)
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
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    expect(listVehiclesRes.body).toHaveLength(1);

    await request(app.getHttpServer())
      .get(`/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    // 3. PATCH /vehicles/:id
    const updateVehicleRes = await request(app.getHttpServer())
      .patch(`/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ nickname: 'Yaris Track' })
      .expect(200);
    expect(updateVehicleRes.body.nickname).toBe('Yaris Track');

    // 4. POST /service-logs -> otomatis memunculkan komponen & mengubah status menjadi HEALTHY
    const createLogRes = await request(app.getHttpServer())
      .post('/service-logs')
      .set('Authorization', `Bearer ${authToken}`)
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
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    expect(syncedVehicleRes.body.serviceStatus).toBe('HEALTHY');
    expect(syncedVehicleRes.body.currentOdometer).toBe(36500);
    expect(syncedVehicleRes.body.parts).toHaveLength(1);
    expect(syncedVehicleRes.body.parts[0].name).toBe('Engine Oil');

    // 5. GET /service-logs & GET /service-logs/:id
    const listLogsRes = await request(app.getHttpServer())
      .get(`/service-logs?vehicleId=${vehicleId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    expect(listLogsRes.body).toHaveLength(1);

    await request(app.getHttpServer())
      .get(`/service-logs/${logId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    // 6. PATCH /service-logs/:id
    const updateLogRes = await request(app.getHttpServer())
      .patch(`/service-logs/${logId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ cost: 800000, isWarrantyClaim: true })
      .expect(200);
    expect(updateLogRes.body.cost).toBe(800000);
    expect(updateLogRes.body.isWarrantyClaim).toBe(true);

    // 7. DELETE /service-logs/:id & DELETE /vehicles/:id
    await request(app.getHttpServer())
      .delete(`/service-logs/${logId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    await request(app.getHttpServer())
      .get(`/service-logs/${logId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404);

    await request(app.getHttpServer())
      .delete(`/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    await request(app.getHttpServer())
      .get(`/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404);
  });

  it('should enforce DTO validation rules on create and update for both resources', async () => {
    await request(app.getHttpServer())
      .post('/vehicles')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        brand: '   ',
        model: 'Yaris',
        type: 'SPACESHIP',
        initialOdometer: -10,
        extraUnknownField: 'nope',
      })
      .expect(400);

    const vehicleRes = await request(app.getHttpServer())
      .post('/vehicles')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        brand: 'Honda',
        model: 'Civic Type R',
        type: 'CAR',
        initialOdometer: 5000,
      })
      .expect(201);
    const vehicleId = vehicleRes.body.id as string;

    await request(app.getHttpServer())
      .patch(`/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ year: 1800, currentOdometer: -5 })
      .expect(400);

    await request(app.getHttpServer())
      .post('/service-logs')
      .set('Authorization', `Bearer ${authToken}`)
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

    const logRes = await request(app.getHttpServer())
      .post('/service-logs')
      .set('Authorization', `Bearer ${authToken}`)
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
      .set('Authorization', `Bearer ${authToken}`)
      .send({ cost: -100 })
      .expect(400);
  });

  it('should return proper NestJS HTTP exceptions (404, 409, 400) for domain error scenarios', async () => {
    const missingId = '00000000-0000-4000-8000-000000000000';

    await request(app.getHttpServer())
      .get(`/vehicles/${missingId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404);
    await request(app.getHttpServer())
      .get(`/service-logs/${missingId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404);
    await request(app.getHttpServer())
      .get(`/service-logs?vehicleId=${missingId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404);

    const firstVehicleRes = await request(app.getHttpServer())
      .post('/vehicles')
      .set('Authorization', `Bearer ${authToken}`)
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
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        brand: 'Mazda',
        model: 'RX-7',
        type: 'CAR',
        plate: 'b 888 mxv',
        initialOdometer: 50000,
      })
      .expect(409);

    await request(app.getHttpServer())
      .post('/service-logs')
      .set('Authorization', `Bearer ${authToken}`)
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

    await request(app.getHttpServer())
      .patch(`/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ isActive: false })
      .expect(200);

    await request(app.getHttpServer())
      .post('/service-logs')
      .set('Authorization', `Bearer ${authToken}`)
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

  it('should handle full CRUD, full-to-full efficiency calculation, and validation on /fuel-logs', async () => {
    const vehicleRes = await request(app.getHttpServer())
      .post('/vehicles')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        brand: 'Toyota',
        model: 'Yaris',
        type: 'CAR',
        tankCapacity: 42,
        initialOdometer: 50000,
      })
      .expect(201);
    const vehicleId = vehicleRes.body.id as string;

    // 1. Pengisian full-tank pertama -> fuelEfficiency = null, odometer kendaraan naik ke 50300
    const firstFuelRes = await request(app.getHttpServer())
      .post('/fuel-logs')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        vehicleId,
        fuelType: 'Pertamax',
        liters: 30,
        totalCost: 390000,
        odometerAtRefuel: 50300,
        isFullTank: true,
        refuelDate: '2026-11-10',
      })
      .expect(201);
    expect(firstFuelRes.body.id).toBe(1);
    expect(firstFuelRes.body.fuelEfficiency).toBeNull();

    // 2. Pengisian full-tank kedua -> fuelEfficiency = (50660 - 50300) / 30 = 12
    const secondFuelRes = await request(app.getHttpServer())
      .post('/fuel-logs')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        vehicleId,
        fuelType: 'Pertamax Turbo',
        liters: 30,
        totalCost: 420000,
        odometerAtRefuel: 50660,
        isFullTank: true,
        refuelDate: '2026-11-19',
      })
      .expect(201);
    expect(secondFuelRes.body.id).toBe(2);
    expect(secondFuelRes.body.fuelEfficiency).toBe(12);

    const updatedVehicleRes = await request(app.getHttpServer())
      .get(`/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    expect(updatedVehicleRes.body.currentOdometer).toBe(50660);

    // 3. Validasi DTO & bisnis: fuelType tidak valid, liters > tankCapacity, odometer mundur
    await request(app.getHttpServer())
      .post('/fuel-logs')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        vehicleId,
        fuelType: 'Avtur',
        liters: 20,
        totalCost: 500,
        odometerAtRefuel: 50700,
        isFullTank: true,
        refuelDate: '2026-11-19',
      })
      .expect(400);

    await request(app.getHttpServer())
      .post('/fuel-logs')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        vehicleId,
        fuelType: 'Pertamax',
        liters: 45,
        totalCost: 585000,
        odometerAtRefuel: 50700,
        isFullTank: true,
        refuelDate: '2026-11-19',
      })
      .expect(400);

    await request(app.getHttpServer())
      .post('/fuel-logs')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        vehicleId,
        fuelType: 'Pertamax',
        liters: 20,
        totalCost: 260000,
        odometerAtRefuel: 50100,
        isFullTank: true,
        refuelDate: '2026-11-19',
      })
      .expect(400);

    // 4. GET, PATCH, DELETE, dan 404 setelah dihapus
    const listRes = await request(app.getHttpServer())
      .get(`/fuel-logs?vehicleId=${vehicleId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    expect(listRes.body).toHaveLength(2);

    await request(app.getHttpServer())
      .get('/fuel-logs/2')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    const patchRes = await request(app.getHttpServer())
      .patch('/fuel-logs/2')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ totalCost: 435000 })
      .expect(200);
    expect(patchRes.body.totalCost).toBe(435000);

    await request(app.getHttpServer())
      .delete('/fuel-logs/2')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .get('/fuel-logs/2')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404);
  });
});
