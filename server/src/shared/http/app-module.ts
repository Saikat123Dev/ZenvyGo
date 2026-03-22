import type { Router } from 'express';

export interface AppModule {
  readonly name: string;
  readonly mountPath?: string;
  readonly router: Router;
  initialize?(): Promise<void>;
}
