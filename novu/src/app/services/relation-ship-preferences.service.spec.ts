import { TestBed } from '@angular/core/testing';

import { RelationShipPreferencesService } from './relation-ship-preferences.service';

describe('RelationShipPreferencesService', () => {
  let service: RelationShipPreferencesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RelationShipPreferencesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
