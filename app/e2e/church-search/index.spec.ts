import { test, expect } from '@playwright/test';
import Church from '../../models/church';
import { mongoConnect } from '../../../utils/connectDb';

const testRunId = Date.now();
const churchNames = {
  nearbyOne: `E2E Radius Church Nearby One ${testRunId}`,
  nearbyTwo: `E2E Radius Church Nearby Two ${testRunId}`,
  farAway: `E2E Radius Church Far Away ${testRunId}`
};

const appApiHeaders = {
  'nj-api-key': '3054b88110ed6df272d3189b1db8af58:07a83a26131d54f028cac57e9a24ba2927ab94927f670d98d0d18edccc351080'
};

const buildChurch = ({ name, email, longitude, latitude }: { name: string; email: string; longitude: number; latitude: number }) => ({
  name,
  email,
  mobile: '07123456789',
  status: 'active',
  address: {
    addressLine1: '1 Test Street',
    county: 'Greater London',
    town: 'London',
    country: 'United Kingdom',
    country_code: 'GB',
    postcode: 'SW1A 1AA',
    completeAddress: '1 Test Street, London, SW1A 1AA',
    location: {
      type: 'Point',
      coordinates: [longitude, latitude]
    }
  }
});

test.describe.serial('Church search API', () => {
  test.beforeAll(async () => {
    await mongoConnect();
    await Church.collection.createIndex({ 'address.location': '2dsphere' });

    await Church.deleteMany({
      name: { $in: Object.values(churchNames) }
    });

    await Church.insertMany([
      buildChurch({
        name: churchNames.nearbyOne,
        email: `nearby-one-${testRunId}@example.com`,
        longitude: -0.1278,
        latitude: 51.5074
      }),
      buildChurch({
        name: churchNames.nearbyTwo,
        email: `nearby-two-${testRunId}@example.com`,
        longitude: -0.1425,
        latitude: 51.5154
      }),
      buildChurch({
        name: churchNames.farAway,
        email: `far-away-${testRunId}@example.com`,
        longitude: 2.3522,
        latitude: 48.8566
      })
    ]);
  });

  test.afterAll(async () => {
    await Church.deleteMany({
      name: { $in: Object.values(churchNames) }
    });
  });

  test('returns only churches within the requested radius', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/church/search', {
      headers: appApiHeaders,
      params: {
        action: 'radius',
        latitude: '51.5074',
        longitude: '-0.1278',
        radius: '5'
      }
    });

    expect(response.ok()).toBeTruthy();

    const body = await response.json();

    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);

    const names = body.data.map((church: { name: string }) => church.name);

    expect(names).toContain(churchNames.nearbyOne);
    expect(names).toContain(churchNames.nearbyTwo);
    expect(names).not.toContain(churchNames.farAway);
  });

  test('rejects invalid radius parameters', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/church/search', {
      headers: appApiHeaders,
      params: {
        action: 'radius',
        latitude: 'invalid',
        longitude: '-0.1278',
        radius: '5'
      }
    });

    expect(response.status()).toBe(400);

    const body = await response.json();

    expect(body.success).toBe(false);
    expect(body.error).toContain('latitude, longitude, and radius must be valid numbers');
  });
});