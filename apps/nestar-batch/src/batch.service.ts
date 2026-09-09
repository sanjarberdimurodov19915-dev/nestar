import { Injectable } from '@nestjs/common';

@Injectable()
export class BatchService {


  public async batchRollback(): Promise<void> {
    console.log('Executing batch rollback');
  }

  public async batchTopProperties(): Promise<void> {
    console.log('Executing batch top properties');
  }

  public async batchTopAgents(): Promise<void> {
    console.log('Executing batch top agents');
  }

  public getHello(): string {
    return 'Welcome to the Nestar Batch Server!';
  }
}
