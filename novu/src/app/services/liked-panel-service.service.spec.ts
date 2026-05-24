import { TestBed } from '@angular/core/testing';

import { LikedPanelServiceService } from './liked-panel-service.service';

describe('LikedPanelServiceService', () => {
  let service: LikedPanelServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LikedPanelServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
