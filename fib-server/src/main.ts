import { NestFactory } from '@nestjs/core';
import {
  Module,
  Controller,
  Get,
  Param,
  BadRequestException,
} from '@nestjs/common';
import * as winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf((info) => {
      const timestamp = String(info.timestamp);
      const level = String(info.level).toUpperCase();
      const message = String(info.message);
      const serverId = process.env.SERVER_ID || 'unknown';
      return `[${timestamp}] [${serverId}] ${level}  ${message}`;
    }),
  ),
  transports: [new winston.transports.Console()],
});

@Controller()
class FibonacciController {
  // ============================================
  // HEALTH CHECK ENDPOINT
  // ============================================
  @Get('health')
  healthCheck(): { status: string; timestamp: number; server: string } {
    const serverId = process.env.SERVER_ID || 'unknown';
    logger.info(`Health check from Load Balancer`);
    return {
      status: 'ok',
      timestamp: Date.now(),
      server: serverId,
    };
  }

  // ============================================
  // FIB ENDPOINT (giống cũ)
  // ============================================
  @Get('fib/:n')
  getFibonacciCode(@Param('n') nParam: string): {
    code: string;
    call: string;
    executable: string;
    print_executable: string;
    server: string; // THÊM để biết server nào xử lý
  } {
    const serverId = process.env.SERVER_ID || 'unknown';
    logger.info(`incoming GET /fib/${nParam} - Processing on ${serverId}`);

    const n = parseInt(nParam, 10);

    if (
      isNaN(n) ||
      n < 0 ||
      n > 10000 ||
      !Number.isInteger(parseFloat(nParam))
    ) {
      logger.warn(`invalid parameter n=${nParam}`);
      throw new BadRequestException(
        'Parameter n must be an integer between 0 and 10000',
      );
    }

    logger.info(`validated n=${n}`);

    // Function
    const code = `function fibonacci(n) { if (n === 0) return 0; if (n === 1) return 1; let prev = 0; let curr = 1; for (let i = 2; i <= n; i++) { const next = prev + curr; prev = curr; curr = next; } return curr; }`;
    const call = `fibonacci(${n})`;
    const executable = `${code} ${call}`;
    const print_executable = `${code} console.log(${call})`;

    logger.info(`generated ${code.length}-byte TS function`);
    logger.info(`✅ Response sent from ${serverId}`);

    return { 
      code, 
      call, 
      executable, 
      print_executable,
      server: serverId  // Client sẽ thấy server nào xử lý
    };
  }
}

@Module({
  controllers: [FibonacciController],
})
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: false,
  });

  const corsOrigin = process.env.CORS_ORIGIN || '*';
  app.enableCors({
    origin: corsOrigin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const port = process.env.PORT || 3001;
  const serverId = process.env.SERVER_ID || 'unknown';
  
  await app.listen(port);
  logger.info(`🚀 NestJS Fibonacci Server (${serverId}) listening on port ${port}`);
  logger.info(`CORS enabled for origin: ${corsOrigin}`);
}

bootstrap().catch((e) => {
  logger.error(e);
});
