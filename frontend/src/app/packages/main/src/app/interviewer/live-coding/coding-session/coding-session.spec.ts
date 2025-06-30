import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodingSession } from './coding-session';

describe('CodingSession', () => {
  let component: CodingSession;
  let fixture: ComponentFixture<CodingSession>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodingSession]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodingSession);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
