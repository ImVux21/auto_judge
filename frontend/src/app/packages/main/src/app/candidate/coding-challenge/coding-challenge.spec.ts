import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodingChallenge } from './coding-challenge';

describe('CodingChallenge', () => {
  let component: CodingChallenge;
  let fixture: ComponentFixture<CodingChallenge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodingChallenge]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CodingChallenge);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
