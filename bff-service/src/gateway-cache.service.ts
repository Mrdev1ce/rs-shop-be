import { Injectable } from '@nestjs/common';
import Timeout = NodeJS.Timeout;

type StoreKeys = {
  url: string;
  method: string;
  body: unknown;
};

@Injectable()
export class GatewayCacheService<T> {
  private CACHE_EXPIRES = 120000; //value in ms
  private cache = new Map<string, T>();
  private cacheInvalidateTimers = new Map<string, Timeout>();

  public store(inputs: StoreKeys, res: T): void {
    const key = GatewayCacheService.getKey(inputs);
    this.cache.set(key, res);
    this.setupInvalidateTimer(key);
  }

  public get(inputs: StoreKeys): T {
    const key = GatewayCacheService.getKey(inputs);
    return this.cache.get(key);
  }

  private invalidateCache(key: string): void {
    this.cache.delete(key);
    console.log('CACHE INVALIDATED ', key);
  }

  private setupInvalidateTimer(key: string): void {
    const currentTimerId = this.cacheInvalidateTimers.get(key);
    clearTimeout(currentTimerId);

    const timerId = setTimeout(
      this.invalidateCache.bind(this, key),
      this.CACHE_EXPIRES,
    );
    this.cacheInvalidateTimers.set(key, timerId);
  }

  private static getKey(inputs: StoreKeys): string {
    return JSON.stringify(inputs);
  }
}
