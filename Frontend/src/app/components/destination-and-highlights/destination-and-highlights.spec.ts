import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DestinationAndHighlights } from './destination-and-highlights';

describe('DestinationAndHighlights', () => {
  let component: DestinationAndHighlights;
  let fixture: ComponentFixture<DestinationAndHighlights>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DestinationAndHighlights]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DestinationAndHighlights);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
