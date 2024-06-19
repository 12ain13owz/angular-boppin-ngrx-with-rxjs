import { Component } from '@angular/core';
import { StoreService } from 'src/store/store.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'boppin-ngrx';

  constructor(public store: StoreService) {}
}
