import { Injectable } from '@nestjs/common';
import { ThrottlerStorage } from '@nestjs/throttler';

interface StorageRecord {
  totalHits: number;
  expiresAt: number;
}

@Injectable()
export class CustomThrottlerStorage implements ThrottlerStorage {
  private storage: Map<string, StorageRecord> = new Map();

  async increment(key: string, ttl: number): Promise<{ totalHits: number; timeToExpire: number }> {
    const now = Date.now();
    const record = this.storage.get(key);

    if (!record || record.expiresAt <= now) {
      const newRecord: StorageRecord = {
        totalHits: 1,
        expiresAt: now + ttl
      };
      this.storage.set(key, newRecord);

      return { totalHits: 1, timeToExpire: ttl };
    }

    record.totalHits += 1;
    const timeToExpire = record.expiresAt - now;

    return { totalHits: record.totalHits, timeToExpire };
  }

  async decrement(key: string): Promise<{ totalHits: number; timeToExpire: number }> {
    const now = Date.now();
    const record = this.storage.get(key);

    if (!record || record.expiresAt <= now) {
      return { totalHits: 0, timeToExpire: 0 };
    }

    record.totalHits = Math.max(0, record.totalHits - 1);
    const timeToExpire = record.expiresAt - now;

    return { totalHits: record.totalHits, timeToExpire };
  }
}
