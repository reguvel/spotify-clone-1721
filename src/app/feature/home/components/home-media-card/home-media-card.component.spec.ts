import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeMediaCardComponent } from './home-media-card.component';

describe('HomeMediaCardComponent', () => {
  let component: HomeMediaCardComponent;
  let fixture: ComponentFixture<HomeMediaCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeMediaCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeMediaCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
