import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      message: "Hello, world!",
      status: "success",
      timestamp: new Date().toISOString(),
      secretMessage: "This is a secret message!"
    };
  }
}
