import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';
import { GatewayCacheService } from './gateway-cache.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [GatewayController],
  providers: [GatewayCacheService, GatewayService],
})
export class GatewayModule {}
