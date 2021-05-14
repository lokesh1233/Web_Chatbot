import { Component, Input } from '@angular/core'

@Component({
  selector: 'chat-avatar',
  template: `
  <div *ngIf="image != ''" class="chat_avatar_image">
    <img [src]="image" class="avatar_img" />
  </div>  
  <span  class="avatar user-text" *ngIf="name != ''">{{name}}</span>
  `,
  styles: [`
    .avatar {
      height: 30px;
      width: 30px;
      border-radius: 50%;
      float: left;
      margin-right: 10px;
      margin-top: 5px;
    }
    .user-text{
      background: #f1f0f0;
    width: 30px;
    height: 30px;
    display: block;
    white-space: nowrap;
    text-align: center;
    line-height: 30px;
    color: #96c;
    border-radius: 50%;
    font-weight: 600;
    font-size: 12px;
    font-family: 'gothambook';
    }
  `]
})
export class ChatAvatarComponent {
  @Input() public image: string
  @Input() public name: string
}
