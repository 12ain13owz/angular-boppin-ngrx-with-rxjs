import { Component } from '@angular/core';
import { StoreService } from 'src/store/store.service';

@Component({
  selector: 'app-pokemon',
  templateUrl: './pokemon.component.html',
  styleUrls: ['./pokemon.component.scss'],
})
export class PokemonComponent {
  constructor(public store: StoreService) {}
}
