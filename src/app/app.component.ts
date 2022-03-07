import { Component } from '@angular/core';
import { io } from 'socket.io-client';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'TranslateApp';
  message: string = "";
  messages: Array<any> = [];
  language: string = "";
  socket: any;
  languageObj: any;
  translated: any;

  constructor() {
    this.socket = io();
  }
  ngOnInit() {
    this.messages = new Array();
    this.listen2Events();
  }
  listen2Events() {
    this.socket.on("result", (data: any) => {
      this.messages.push(data);
      console.log(data);
    });

    this.socket.on("lcodesMsg", (data: any) => {
      this.languageObj = data;
    });
  }

  sendMessage() {
    console.log("language " + this.language);
    this.socket.emit("translateRequest", { message: this.message, language: this.language });
    this.message = "";
    this.language = "";
  }
}
