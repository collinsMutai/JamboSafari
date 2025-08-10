import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SafariCard } from './safari-card';

describe('SafariCard', () => {
  let component: SafariCard;
  let fixture: ComponentFixture<SafariCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SafariCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SafariCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
