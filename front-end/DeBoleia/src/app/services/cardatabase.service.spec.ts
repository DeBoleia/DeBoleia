import { TestBed } from '@angular/core/testing';

import { CardatabaseService } from './cardatabase.service';

describe('CardatabaseService', () => {
  let service: CardatabaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardatabaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
