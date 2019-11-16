import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleplayerComponent } from './singleplayer.component';

describe('SingleplayerComponent', () => {
  let component: SingleplayerComponent;
  let fixture: ComponentFixture<SingleplayerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SingleplayerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleplayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
