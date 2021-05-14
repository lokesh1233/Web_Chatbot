import { Component } from '@angular/core'
// <chat-config [(theme)]="theme"></chat-config>
@Component({
	selector: 'app-root',
	template: `
		<chat-widget></chat-widget>
  	`,
})
// <chat-widget [theme]="theme"></chat-widget>
export class AppComponent {
	// public theme = 'grey'
}
