import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { autoRedirectGuard } from './auto-redirect.guard';

describe('autoRedirectGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => autoRedirectGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
