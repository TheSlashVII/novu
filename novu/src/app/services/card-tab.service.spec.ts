import { TestBed } from '@angular/core/testing';

import { CardTabService } from './card-tab.service';

describe('CardTabService', () => {
  let service: CardTabService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardTabService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
