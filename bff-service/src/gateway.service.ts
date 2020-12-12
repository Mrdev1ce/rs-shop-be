import { Injectable } from '@nestjs/common';
import axios, { AxiosResponse, Method } from 'axios';
import { GatewayCacheService } from './gateway-cache.service';

@Injectable()
export class GatewayService {
  constructor(
    private readonly _cacheService: GatewayCacheService<AxiosResponse>,
  ) {}
  route(
    url: string,
    method: string,
    body: unknown,
  ): Promise<AxiosResponse> | null {
    try {
      const [_, service, ...serviceReqUrlParts] = url.split('/');
      console.log('SERVICE URL: ', service);
      const serviceUrl = process.env[service];

      if (serviceUrl == null) {
        console.log('There is no service for route');
        return null;
      }

      const serviceReqUrl = serviceReqUrlParts.join('/');
      const requestedUrl = `${serviceUrl}/${serviceReqUrl}`;
      console.log('REQUESTED URL: ', requestedUrl);

      return this.getData(requestedUrl, method, body);
    } catch {
      throw new Error('Cannot process request');
    }
  }

  private async getData(
    requestedUrl: string,
    method: string,
    body: unknown,
  ): Promise<AxiosResponse> {
    const cacheInputs = { url: requestedUrl, method, body };
    const cached = this._cacheService.get(cacheInputs);
    if (cached != null) {
      console.log('RETURN RES FROM CACHE: ', requestedUrl);
      return Promise.resolve(cached);
    }
    const res = await GatewayService.makeRequest(requestedUrl, method, body);
    this._cacheService.store(cacheInputs, res);

    return res;
  }

  private static makeRequest(
    requestedUrl: string,
    method: string,
    body: unknown,
  ): Promise<AxiosResponse> {
    return axios({
      url: requestedUrl,
      method: method as Method,
      ...GatewayService.getBody(body),
    });
  }
  private static getBody(body: unknown): object {
    return Object.keys(body || {}) ? { body } : {};
  }
}
