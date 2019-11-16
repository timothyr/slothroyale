import { Component, OnInit } from '@angular/core';
import * as Colyseus from 'colyseus.js';
import { GenerateMap } from 'gamecommon/game/map/map-generation/MapGenerator';

@Component({
  selector: 'app-multiplayer',
  templateUrl: './multiplayer.component.html',
  styleUrls: ['./multiplayer.component.scss']
})
export class MultiplayerComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    // Connect to server
    const client = new Colyseus.Client('ws://localhost:2568');

    // Generate the map
    GenerateMap().then((map) => {

      console.log('Generated map. Creating room ...');

      // Make a room with map
      client.create('battle', { map }).then(room => {
        console.log('Created room successfully', room);
      }).catch(e => {
        console.error('Create room error', e);
      });
    });
  }
}
