import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaCardListComponent } from './media-card-list.component';

describe('MediaCardListComponent', () => {
  let component: MediaCardListComponent;
  let fixture: ComponentFixture<MediaCardListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MediaCardListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MediaCardListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
