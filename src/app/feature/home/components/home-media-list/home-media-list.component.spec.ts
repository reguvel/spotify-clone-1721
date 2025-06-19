import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeMediaListComponent } from './home-media-list.component';

describe('HomeMediaListComponent', () => {
  let component: HomeMediaListComponent;
  let fixture: ComponentFixture<HomeMediaListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeMediaListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeMediaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
