import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { NgModule } from '@angular/core'
import { HttpClientModule } from '@angular/common/http';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PerfectScrollbarModule, 
  PERFECT_SCROLLBAR_CONFIG,  PerfectScrollbarConfigInterface} from 'ngx-perfect-scrollbar';

import { ElementModule } from './element.module'
import { AppComponent } from './app.component'
import { ChatWidgetComponent } from './chat/chat-widget/chat-widget.component'
import { ChatService } from './chat.service'


 
const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  wheelPropagation: true
};

const routes: Routes = [
  { path: ':userId', component: ChatWidgetComponent }
];
@NgModule({
  imports: [
    // CarouselModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
  BrowserAnimationsModule, 
  ElementModule, 
  HttpClientModule,
  PerfectScrollbarModule,

  RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  schemas:[],
  providers:[ChatService, {
    provide: PERFECT_SCROLLBAR_CONFIG,
    useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
  }]
})
export class AppModule { }

    // RouterModule.forRoot(routes)],
  