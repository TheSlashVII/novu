import { TestBed } from '@angular/core/testing';

import { PanelServiceService } from './panel-service.service';

describe('PanelServiceService', () => {
  let service: PanelServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PanelServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
