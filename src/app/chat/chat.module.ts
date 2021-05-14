import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ChatAvatarComponent } from './chat-avatar/chat-avatar.component'
import { ChatWidgetComponent } from './chat-widget/chat-widget.component'
import { ChatInputComponent } from './chat-input/chat-input.component'
import { MatDialogModule } from '@angular/material/dialog';
import { ChatNotificationComponent } from '../chat/chat-widget/chat-notification/chat-notification.component'
import { ChatConfigComponent } from './chat-config/chat-config.component'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import {ToastrModule} from 'ngx-toastr'
import { TablefilterPipe } from '../tablefilter.pipe'
import { MultiSelectfilterPipe } from '../multiSelectfilter.pipe'
import { TablesorterPipe } from '../tablesorter.pipe'
import { NgMultiSelectDropDownModule, MultiSelectComponent } from 'ng-multiselect-dropdown';


import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import { IvyCarouselModule } from 'angular-responsive-carousel'
const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

@NgModule({
  imports: [MatIconModule, MatButtonModule, MatButtonToggleModule, CommonModule, FormsModule, ReactiveFormsModule, NgxDaterangepickerMd.forRoot(), PerfectScrollbarModule,MatDialogModule, NgMultiSelectDropDownModule.forRoot(), ToastrModule.forRoot(),IvyCarouselModule],
  declarations: [ChatAvatarComponent, ChatWidgetComponent, ChatInputComponent, ChatConfigComponent,ChatNotificationComponent, TablefilterPipe, TablesorterPipe, MultiSelectfilterPipe],
  exports: [ChatWidgetComponent, ChatConfigComponent, MatIconModule, MatButtonModule, MatButtonToggleModule],
  entryComponents: [ChatWidgetComponent, ChatConfigComponent,ChatNotificationComponent],
  providers:[{
    provide: PERFECT_SCROLLBAR_CONFIG,
    useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
  }]
})
export class ChatModule {}
