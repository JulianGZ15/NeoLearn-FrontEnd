import { TestBed } from '@angular/core/testing';

import { VideosClientService } from './videos-client.service';

describe('VideosClientService', () => {
  let service: VideosClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VideosClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
