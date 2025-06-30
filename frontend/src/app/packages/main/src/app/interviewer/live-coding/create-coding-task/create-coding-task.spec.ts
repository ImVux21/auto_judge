import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCodingTask } from './create-coding-task';

describe('CreateCodingTask', () => {
  let component: CreateCodingTask;
  let fixture: ComponentFixture<CreateCodingTask>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateCodingTask]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateCodingTask);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
