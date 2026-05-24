import { TestBed } from '@angular/core/testing';

import { DeleteAccountModalServiceService } from './delete-account-modal-service.service';

describe('DeleteAccountModalServiceService', () => {
  let service: DeleteAccountModalServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeleteAccountModalServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
