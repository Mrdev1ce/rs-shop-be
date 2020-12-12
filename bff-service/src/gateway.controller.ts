import { Controller, All, Req, Request, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { GatewayService } from './gateway.service';

@Controller()
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @All()
  async gateway(@Req() req: Request, @Res() res: Response) {
    const { url, method, body } = req;
    console.log('URL: ', url);
    console.log('METHOD: ', method);
    console.log('BODY: ', body);
    const serviceRes = this.gatewayService.route(url, method, body);
    if (serviceRes == null) {
      return res.status(HttpStatus.BAD_GATEWAY).json();
    }

    try {
      const result = await serviceRes;
      return res.status(result.status).json(result.data);
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        return res.status(status).json(data);
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: error.message });
    }
  }
}
