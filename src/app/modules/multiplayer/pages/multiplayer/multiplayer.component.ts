import { Component, OnInit } from '@angular/core';
import * as Colyseus from 'colyseus.js';

@Component({
  selector: 'app-multiplayer',
  templateUrl: './multiplayer.component.html',
  styleUrls: ['./multiplayer.component.scss']
})
export class MultiplayerComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    const client = new Colyseus.Client('ws://localhost:2568');

    client.create('battle', {/* options */}).then(room => {
      console.log('joined successfully', room);
    }).catch(e => {
      console.error('join error', e);
    });
  }

}
