import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SafariSearch } from './safari-search';

describe('SafariSearch', () => {
  let component: SafariSearch;
  let fixture: ComponentFixture<SafariSearch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SafariSearch]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SafariSearch);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
