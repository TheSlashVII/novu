import { TestBed } from '@angular/core/testing';

import { StudiesApiServiceService } from './studies-api-service.service';

describe('StudiesApiServiceService', () => {
  let service: StudiesApiServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudiesApiServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
