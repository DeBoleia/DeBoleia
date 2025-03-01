import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { pendingEvaluationGuard } from './pending-evaluation.guard';

describe('pendingEvaluationGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => pendingEvaluationGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
