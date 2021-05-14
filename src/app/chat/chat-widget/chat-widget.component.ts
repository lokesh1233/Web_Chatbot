import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core'
import { Subject } from 'rxjs'
import { fadeIn, fadeInOut } from '../animations'
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { element } from 'protractor';
import { Moment } from 'moment';
import { ChatService } from '../../chat.service'
import { Router, ActivatedRoute, Params } from '@angular/router';
import {
  PerfectScrollbarConfigInterface,
  PerfectScrollbarComponent, PerfectScrollbarDirective
} from 'ngx-perfect-scrollbar';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
// import { parse, format } from 'date-fns';
import { type } from 'os';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChatInputComponent } from '../chat-input/chat-input.component';
import { ChatNotificationComponent } from './chat-notification/chat-notification.component';
import { ToastrService } from 'ngx-toastr';

export interface DialogData {
  notify: string;
  name: string;
}

var SelectionDates = []

@Component({
  selector: 'chat-widget',
  templateUrl: './chat-widget.component.html',
  styleUrls: ['./chat-widget.component.css'],
  animations: [fadeInOut, fadeIn],
  providers: []
})

export class ChatWidgetComponent implements OnInit {
  listView:boolean = false;
  linkShow:false
  hideHimessage:boolean = true;
  boatView:boolean = false;
  wrap: any
  scroll: any;
  horizontal: any
  weather = {
    location: "",
    degree: "",
    description: ""
  }
  public config: PerfectScrollbarConfigInterface = {};
  // Yes : any

  @ViewChild('bottom', { static: false }) bottom: ElementRef
  // theme: 'red_blue' | 'orange_grey' | 'brown_blue' | 'blue_blue' = 'blue_blue'
  
  theme='blue_blue';
  toggleTheme= [];
  userId: string;
  token: string;
  slideArr:any=[
    {
      title:'title1'
    },
    {
      title:'title2'
    },
    {
      title:'title3'
    }
  ]
  public _visible = false
  public get visible() {
    return this._visible
  }
 
  public selected: { start: Moment, end: Moment };
  public authenticationErrorMsg = "You are not authenticated to use this application.";
  public isAuthenticated = false;
  public lockStartDate = false;
  public showSwatches = false;
  public defaultMsg = {};
  public todoListArr = [];
  public _defaultMsg = {
    "text": 'It seems there is some problem, I will be back shortly !',
    "buttons": []
  }

  @Input() public set visible(visible) {
    this._visible = visible
    if (this._visible) {
      setTimeout(() => {
        this.scrollToBottom()
        this.focusMessage()
      }, 0)
    }
  }


  constructor(private http: HttpClient, private activatedRoute: ActivatedRoute, public dialog: MatDialog,
    private dom: DomSanitizer, private service: ChatService, private toastrService: ToastrService) { }

  // public http = HttpClient
  public focus = new Subject()

  public operator = {
    name: 'Zeebo',
    status: 'online',
    avatar: 'assets/images/Zeebot.svg',
    shortName:""
  }
  public client = {
    name: 'GU',
    status: 'online',
    shortName:"",
    avatar: ``,
    // avatar: `assets/images/sent.png`,
  }
  public messages = [];
  public isLoader = true;
  public isWeatherLoaded = false;
  public acc_token = "";
  public isMain = true;
  public isEmployee = false;
  public isProfile = false;
  public employeeData = [];
  public isVoiceSearch = false;
  public empProfileData = {
    businessPhone: " 66444079",
    cellPhone: "9820169636",
    colleagueDetailsList: [],
    country: "India",
    defaultFullName: "Shekhar S Salian",
    department: "Corporate Administration (DEP71)",
    division: "Corporate Group (DIV03)",
    email: "dummy@crisil.com",
    firstName: "Shekhar",
    hr: { defaultFullName: "" },
    jobCode: "Mail Processing Clerk (CPSOPS01)",
    lastName: "Salian",
    location: "Mumbai Crisil House (LOC64)",
    manager: { defaultFullName: "" },
    title: "Associate",
    userId: "1000005",
    username: "1000005",
    shortName: "AS"
  };

  // EmpLocations = ["Mumbai","Kolkata",
  // "Ahmedabad","Chennai",
  // "Gurgaon","Hyderabad",
  // "BIRS","Singapore",
  // "China","Pune"]

  EmpLocations = []

  onEmpSelectedItems = []
  locationSearch = [];

  dropdownSettings = {
    "singleSelection": false,
    "idField": "item_id",
    "textField": "item_text",
    "selectAllText": "Select All",
    "unSelectAllText": "UnSelect All",
    "itemsShowLimit": 3,
    "allowSearchFilter": true,
    "limitSelection": 5,
    "closeDropDownOnSelection": false
  };

  public searchText = undefined;
  defaultFullName: String;
  email: String;
  isEmployeeSearch = false;
  isEmployeeLoading = false;
  employeeOldQuery = {}
  disabled = false;
  ChatInputComponentObj;


  string = "text"
  ac = "<a href='google.com'>Go</a>"
  public html = "<div>" + this.ac + "</div>";

  updateMessageStr(from, text, type, extra_lnk=undefined, isLoading=true){
    return {
      from,
      text,
      type,
      date: new Date().getTime(),
      btns: extra_lnk != undefined ? extra_lnk.btns :[],
      image: extra_lnk != undefined ? extra_lnk.image :"",
      table: extra_lnk != undefined ? extra_lnk.table :[],
      isLink: extra_lnk != undefined ? extra_lnk.isLink :false,
      loading: isLoading,
      tableDesign: extra_lnk != undefined ? extra_lnk.tableDesign :false,
      isDatepicker: extra_lnk != undefined ? extra_lnk.isDatepicker :false,
      urlLinkData: extra_lnk != undefined ? extra_lnk.urlLinkData :{},
      travelSummary: extra_lnk != undefined ? extra_lnk.travelSummary :[],
      corona: extra_lnk != undefined ? extra_lnk.corona :[],
      Learning: extra_lnk != undefined ? extra_lnk.Learning :false,
      checkbox:extra_lnk != undefined ? extra_lnk.checkbox :[],
      checkboxButton:extra_lnk != undefined ? extra_lnk.checkboxButton :[],
      arrowmark:extra_lnk != undefined ? extra_lnk.arrowmark :[],
      news:extra_lnk != undefined ? extra_lnk.news :[],
      questions: extra_lnk != undefined ? extra_lnk.questions :[]
    }
  }


  public extract_links(raw_message) {

    let btn = []
    let image = ""
    let carousel = []
    let tabs = []
    let travelSummary = []
    let text = ""
    let isLink = false
    let tableDesign = false
    let isDatepicker = false
    let isTravelDesk = false
    let urlLinkData = {}
    let isCorona = false
    let corona = []
    let Learning = false;
    let checkbox = [];
    let checkboxButton=[]
    let arrowmark = [];
    let news = [];
    let questions = [];
    // this.todoListArr = []

    // image and buttons standard logic
    if (typeof raw_message == 'object') {
      if (typeof raw_message['buttons'] == 'object') {
        btn = raw_message['buttons']
      }
      else if (typeof raw_message['image'] == 'string') {
        image = raw_message['image']
      } else if (typeof raw_message['custom'] == 'object') {
        let cstm = raw_message['custom']
        let jsn = cstm['json'] == undefined ? cstm[0]['json'] : cstm['json']
        raw_message['text'] = cstm['text'] == undefined ? "" : cstm['text']
        //  Authorization Token validation function
        if (jsn instanceof Array == false && jsn['token'] !== undefined && jsn['isTokenRefreshed'] !== undefined) {
          return this.updateAuthorizationorRedirectLogin(jsn)
        }
        if (jsn instanceof Array == false && jsn['isEmployee'] == true) {
          return this.employeeDetails(jsn)
        }
        if (jsn instanceof Array == false && jsn['isProfile'] == true) {
          return this.profileDetails(jsn)
        }
        if (jsn instanceof Array == false && jsn['isDatePickerLeaves'] == true) {
          // return this.datePickerDetails(jsn)
          this.datePickerDetails(jsn);
          btn = [];
          isDatepicker = true;
        }
        if(jsn[0] && jsn[0]["form_type"] == "feedback"){
          return this.updateFeedback();
        }else if(jsn[0] && jsn[0]["forms_type"] == "toast"){
          return this.displayToast(jsn);
        }else if(jsn[0] && jsn[0]["forms_type"] == "theme"){
          return this.themeSelection(jsn[0]['colour']);
        }else if(jsn[0] && jsn[0]["forms_type"] == "timestamp"){
          return this.updateTimestamp(jsn);
        }else if(jsn[0] && jsn[0]["forms_type"] == "todo"){
          return this.todoList(jsn);
        }else if(jsn[0] && jsn[0]["forms_type"] == "checkbox"){
          let _btn = jsn[0].buttons 
          checkboxButton = _btn == undefined ? [] : _btn;
          jsn.shift();
          // for(var c=0; c<jsn.length;c++){
          //   jsn[c]._checked = false;
          // }

          checkbox = jsn;

        }else if(jsn[0] && jsn[0]["forms_type"]  == "arrowmark"){
          if(jsn[0].buttons != undefined){
          questions = jsn[0].buttons;
          }
          jsn.shift();
          for(var l=0;l<jsn.length;l++){
            jsn[l]['title'] = this.linkCreationURL(jsn[l]['title']);
          }
          arrowmark = jsn;
        }else if(jsn[0] && jsn[0]["forms_type"]  == "news"){
          news = jsn;
        }else if(jsn[0] && jsn[0]["forms_type"] == "conversation"){
          return this.conversationDetails(jsn)
        }else{
        for (var i = 0; i < jsn.length; i++) {
          let buttons = []
          if (jsn[i]["forms_type"] == "travelSummary") {
            isTravelDesk = true
            travelSummary.push(jsn[i])
          } else if (jsn[i]["forms_type"] == "corona") {
            isCorona = true
            corona = jsn
          }else if (jsn[i]["keys_order"] instanceof Array) {
            let key_order = jsn[i]["keys_order"]
            tableDesign = true
            for (var j = 0; j < key_order.length; j++) {
              if (key_order[j] == 'buttons') {
                buttons = jsn[i][key_order[j]]
              } else {
                let ky_val = jsn[i][key_order[j]]
                let isCase = "last"
                if (ky_val instanceof Object) {
                  isCase = "dict"
                } else if (j == 0) {
                  isCase = "first"
                }
                tabs.push({ 'key': key_order[j], 'value': ky_val, "isCase": isCase })
              }
            }
          } else {
            for (var k in jsn[i]) {
              if (k == 'buttons') {
                buttons = jsn[i][k]
              } else {
                if (k == "forms_type" && jsn[i]["forms_type"] == "Learning") {
                  Learning = true;
                  continue;
                }
                tabs.push({ 'key': k, 'value': jsn[i][k], 'isCase': 'last' })
              }
            }
          }
          if (!isTravelDesk && !isCorona) {
            carousel.push({ carousel: tabs, buttons: buttons })
            tabs = []
          }
        }
      }
      }
      text = raw_message['text'] == undefined ? "" : raw_message['text']
    } else if (typeof raw_message == 'string') {
      text = raw_message
    }
    // table custom logic
    let tab_raw = text.split("\n")
    text = tab_raw.shift()

    tab_raw.forEach(element => {
      let tab_kv = element.split(":")
      if (tab_kv.length > 1) {
        tabs.push({ 'key': tab_kv[0], 'value': tab_kv[1], 'isCase': 'last' })
      }
    })
    if (tab_raw.length == 1 && typeof (tab_raw[0]) == "string") {
      text = text + "\n" + tab_raw
    }

    // link custom logic
    let link = text.split("](")
    if (link.length > 1 && tabs.length == 0) {

      // processing for multiple links
      // started
      // let preText, postText;
      // let anchors = "";
      // preText = link[0].split('[')[0]
      // postText = link[link.length -1].split(')')[1]
      // for(var l=0; l<link.length-1; l++){
      //   anchors += '<a _ngcontent-c0 href=' + link[l+1].split(')')[0] + ' rel="noopener noreferrer" target="_blank">' + link[l].split('[')[1] + '</a> ' + link[l+1].split(')')[1].split('[')[0]
      // }
      // text = preText + anchors + postText + tab_raw
      // end

      // new code start
      urlLinkData = this.linkCreationURL(link);
      isLink = true
    }
    if (tabs.length > 0) {
      carousel.push({ carousel: tabs, buttons: [] })
    }
    if (btn.length == 1 && btn[0] && btn[0]['title'] == 'isDatepicker' && btn[0]['payload'] == '/true') {
      btn = []
      isDatepicker = true
    }
    return {
      text: text,
      image: image,
      btns: btn,
      table: carousel,
      isLink: isLink,
      tableDesign: tableDesign,
      isDatepicker: isDatepicker,
      travelSummary: travelSummary,
      urlLinkData:urlLinkData,
      corona: corona,
      Learning: Learning,
      checkbox:checkbox,
      checkboxButton:checkboxButton,
      arrowmark:arrowmark,
      news:news,
      questions:questions
    }
  }


  todoList(jsn){
    this.listview()
    this.todoListArr =  jsn;
  }

  todoListApprove(dta, idx){
    this.sendMessage_custom(dta);
    this.todoListArr.splice(idx, 1);
  }


  // link creation dataset
  linkCreationURL(link){
    let preText, postText, linkSub;
      let anchors = "";
      let linkArr = [];
      if(!Array.isArray(link) && link.split("](").length > 1){
        link = link.split("](")
      }else if(!Array.isArray(link) && link.split("](").length == 1){
        return {
          preText: link,
          linkArr: [],
          postText: ""
        }
      }
      preText = link[0].split('[')[0]
      postText = link[link.length -1].split(')')[1]
      for(var l=0; l<link.length-1; l++){
        linkSub = link[l+1].split(')')
        linkArr.push({
          "text":  link[l+2] != undefined?linkSub[1].split('[')[0]:"",
          "title": link[l].split('[')[1],
          "href": linkSub[0]
        })
      }
      return {
          preText: preText,
          linkArr: linkArr,
          postText: postText
        }
  }

  /**
    flight click event
  */

  transportType(travels) {
    if (travels.Transport == "fa fa-plane") {
      travels.Transport = "fa fa-train"
    } else if (travels.Transport == "fa fa-train") {
      travels.Transport = "fa fa-bus"
    } else {
      travels.Transport = "fa fa-plane"
    }
  }

  tripType(travels) {
    if (travels.TripType == "Yes") {
      travels.TripType = "No"
      if (travels._toDate == undefined) {
        travels._toDate = travels.toDate
      }
      travels.toDate = travels.fromDate
    } else {
      travels.TripType = "Yes"
      travels.toDate = travels._toDate
    }
  }

  updateFeedback(){
    this.messages[0].isDisLike = true;
  }

  public new_message() {
    // console.log("new message")
  }

  public addMessage(from, r_text, type: 'received' | 'sent', isDisplay = true, isUnshift=true) {
    // text = "<div>"+text+"<
    if (isDisplay == true) {
      let validatedText = this.extract_links(r_text)
      if (validatedText == undefined) {
        return;
      }
      let uimessage = this.handlinguimessages(validatedText, from, r_text, type, isDisplay, isUnshift)
      // this.scrollToBottom()
      if(isUnshift)this.scrollToBottom();
      return uimessage;
    }
    if(isUnshift)this.scrollToBottom();
    // this.scrollToBottom()
  }

  public handlinguimessages(extract_lnk, from, r_text, type: 'received' | 'sent', isDisplay = true, isUnshift=true) {
    // let extract_lnk = validatedText
    let text;
    let s_text = extract_lnk.text;
    if (s_text != "" && extract_lnk.isLink == true) {
      text = this.dom.bypassSecurityTrustHtml(s_text)
    } else {
      text = s_text
    }
    // console.log(text)
    this.removeLoadingMessage()
    if (type == "received" && this.isVoiceSearch) {
      this.speechSynthosis(text);
    }
    if(isUnshift == false){
      this.messages.push(this.updateMessageStr(from, text, type, extract_lnk, false))
      return;
    }


    this.messages.unshift(this.updateMessageStr(from, text, type, extract_lnk, false))
    // this.messages.unshift({
    //   from,
    //   text,
    //   type,
    //   date: new Date().getTime(),
    //   btns: extract_lnk.btns,
    //   image: extract_lnk.image,
    //   table: extract_lnk.table,
    //   isLink: extract_lnk.isLink,
    //   loading: false,
    //   tableDesign: extract_lnk.tableDesign,
    //   isDatepicker: extract_lnk.isDatepicker,
    //   urlLinkData:extract_lnk.urlLinkData,
    //   travelSummary: extract_lnk.travelSummary,
    //   corona: extract_lnk.corona,
    //   Learning: extract_lnk.Learning,
    //   checkbox: extract_lnk.checkbox,
    //   checkboxButton: extract_lnk.checkboxButton,
    //   arrowmark: extract_lnk.arrowmark,
    //   news:extract_lnk.news
    // })

    // add loading for sent messages
    if (type == "sent") {
      from = this.operator, text = "", type = "received";
      // this.messages.unshift({
      //   from,
      //   text,
      //   type,
      //   date: new Date().getTime(),
      //   btns: [],
      //   image: "",
      //   table: [],
      //   isLink: false,
      //   loading: true,
      //   tableDesign: false,
      //   isDatepicker: false,
      //   urlLinkData:{},
      //   travelSummary: [],
      //   corona: [],
      //   Learning: false,
      //   checkbox:[],
      //   checkboxButton:[],
      //   arrowmark:[],
      //   news:[]
      // })
      this.messages.unshift(this.updateMessageStr(from, text, type, undefined, true))
    }
    if(isUnshift)this.scrollToBottom();
  }

  public scrollToBottom() {
    if (this.bottom !== undefined) {
      let that = this;
      setTimeout(function () {
        that.bottom.nativeElement.scrollIntoView()
      }, 100)
    }
  }

  public removeLoadingMessage() {
    if (this.messages[0] != undefined && this.messages[0].loading == true) {
      this.messages.shift()
    }
  }

  public focusMessage() {
    this.focus.next(true)
  }

  public randomMessage(message, isDisplay = true, exDetails = {}, userId = null) {
    this.get_RasaService("/webhooks/rest/webhook", {
      "message": message,
      "sender": userId == null ? this.userId:userId,
      "metadata": { token: this.token, details: exDetails, timestamp:this.conversationTimestamp}
    }, true).subscribe(data =>
      // this.addMessage(this.operator, data[0] == undefined ? "" :data[0]['text'], 'received')
      this.handleResponseMessages(data, isDisplay)
      , err => {
        // error part
      })
  }

  public handleResponseMessages(data, isDisplay = true) {

    try{
      if(data[0].custom[0]['json'][0].form_type == "feedback"){
        data = [];
      }
    }catch(error){
    }

    if (data[0] == undefined && isDisplay) {
      let textArr = {
        "text": "I'm sorry, I didn't understand you. I'm programmed to help you with the following options currently. Please choose an option.",
        "buttons": this.defaultMsg['buttons'],
      };
      this.sendMessage({ message: "/restart" }, false);
      this.addMessage(this.operator, textArr, 'received', isDisplay);
    }
    data.forEach(element => {
      this.addMessage(this.operator, element, 'received', isDisplay);
    })
  }

  updateWeather(data) {
    this.weather = {
      location: data['name'],
      degree: data['main']['temp'],
      description: data['weather'][0].description
    }
    this.isWeatherLoaded = true;
    // console.log(this.weather)
  }

  handleAuthenticationError(){
    this.addMessage(this.operator, this.authenticationErrorMsg, 'received')
  }

  handleTokenValidation(){
// authorization details from the local storage
const { employeeCode, token , given_name} = this.service.getAuthorizaionDetails()[0];
this.userId = employeeCode;
this.token = token;
// this.client.shortName = given_name.split(" ")[0][0] + given_name.split(" ")[1][0]
this.client.shortName = "PM"
this.sendMessage({ message: "/restart" }, false)
this.homeButtons()
// this.service.weatherDataSet(this.updateWeather, this)
  }

  ngOnInit() {
    // this.themeSelection("blue");
    this.messages.push(this.updateMessageStr(this.operator, "", "received", undefined, true))
    this.ChatInputComponentObj = new ChatInputComponent(this.toastrService);
    this.activatedRoute.queryParams.subscribe(params => {
      this.userId = params['userId'];
      this.token = params['token'];
      if (this.userId != undefined) {
        this.isAuthenticated = true;
        // localStorage.setItem("Authorization", this.token)
        this.handleTokenValidation();
      }else{
        // localStorage.removeItem("Authorization");
      }
    });
  setTimeout(() => {
    if(this.userId == "" || this.isAuthenticated == false){
      this.handleAuthenticationError()
    }
  }, 1000)  
  }

  public toggleChat() {
    this.visible = !this.visible
  }

  handleDefaultMessage() {
    this.defaultMsg = this.defaultMsg['text'] == undefined ? this._defaultMsg : this.defaultMsg
    this.addMessage(this.operator, this.defaultMsg, 'received')
  }

  homeButtons() {
    if (this.defaultMsg['text'] == undefined) {
      this.get_RasaService("/webhooks/rest/webhook", {
        "message": '/home',
        "sender": this.userId,
        "metadata": { token: this.token }
      }, true).subscribe(data => {
        if (data instanceof Array) {
          data.forEach(element => {
            if (element.buttons && element.buttons.length > 0) {
              this.defaultMsg = element
            } else {
              this.addMessage(this.operator, element, 'received')
            }
          });
          this.conversationEvents()
        }
        this.handleDefaultMessage()
      }, err => {
        this.handleDefaultMessage()
      }
      )
    }
  }

  public sendMessage_custom(message, tabs?: number, msgs?: number, isActionDisplay = true) {

    try{
      if(msgs != undefined && this.messages[msgs].checkboxButton.length > 0){
        let checkBox = this.messages[msgs].checkbox;
        if(checkBox.length>0){
          let checked = checkBox.filter(function(check) {
            return check._checked;
          });
          if(checked.length == 0){
            this.toastrService.error("Select options");
            return ;
          }
        }
        this.messages[msgs].checkboxButton = []
      }
    }catch(err){
    }


    // buttons
    let extDetails = undefined;
    if (msgs != undefined && tabs != undefined && this.messages[msgs].table[tabs] != undefined) {
      this.messages[msgs].table[tabs].buttons = []
    } else if (msgs != undefined && tabs != undefined && this.messages[msgs].travelSummary[tabs] != undefined) {
      extDetails = this.messages[msgs].travelSummary[tabs];
      this.messages[msgs].travelSummary[tabs].buttons = [];
    }
    this.sendMessage({ message: message }, true, extDetails, isActionDisplay)
  }


  public selectionGenerate(checkbox,  msgs?: number){
    if(checkbox.isSelectAll == true){
      let checked = !checkbox._checked
      let checkboxs = this.messages[msgs].checkbox
      for(var c=0; c<checkboxs.length; c++){
        checkboxs[c]._checked = checked
      }
    }
  }

  public tripRouteChange(tabs) {
    let origion = tabs.Destination
    let destination = tabs.Origion
    tabs.Destination = destination
    tabs.Origion = origion
  }

  public sendMessage({ message }, isDisplay = true, extDetails = {}, isActionDisplay = true) {

    if(this.isAuthenticated == false){
      this.handleAuthenticationError()
      return;
    }
    // remove buttons from the response
    if (this.messages.length > 0) {
      this.messages[0].btns = [];
      this.messages[0].disable = true;
      this.messages[0].isDatepicker = false;
      this.messages[0].isDisLike = false;
    }
    let message_t = message
    if (typeof message == 'object') {
      message_t = message.payload
      message = message.title
    }
    if (message.trim() === '') {
      return
    }

    isActionDisplay = isDisplay && isActionDisplay
    this.addMessage(this.client, message, 'sent', isActionDisplay)
    this.randomMessage(message_t, isDisplay, extDetails)
  }

  likeButton(bol){
    this.sendMessage_custom('/feedback{"confirm": "'+bol+'"}', undefined, undefined, false)
  }

  // date format in UI display
  choosedDate(evt) {
    let strDte = evt.startDate._d
    let endDte = evt.endDate._d
    let StrDte = this._months[strDte.getMonth()] + " " + strDte.getDate() + ", " + strDte.getFullYear()
    let EndDte = this._months[endDte.getMonth()] + " " + endDte.getDate() + ", " + strDte.getFullYear()
    let message = StrDte
    if (StrDte != EndDte) {
      message = "from " + StrDte + " to " + EndDte
    }
    this.sendMessage({ message: message })
  }

  public _months = {
    0: 'Jan',
    1: 'Feb',
    2: 'Mar',
    3: 'April',
    4: 'May',
    5: 'June',
    6: 'July',
    7: 'Aug',
    8: 'Sept',
    9: 'Oct',
    10: 'Nov',
    11: 'Dec'
  }

  public get_RasaService(url, postData, token) {
    return this.service.get_RasaService(url, postData, token)
  }

  public returnHome({ message }, isDisplay = false) {
    if(this.isAuthenticated == false){
      this.handleAuthenticationError()
      return;
    }
    this.sendMessage({ message: "/restart" }, false)
    this.addMessage(this.operator, this.defaultMsg, 'received')
  }

  updateAuthorizationorRedirectLogin(data, isLogin = false) {

    if (isLogin == true || data['isTokenRefreshed'] == false) {
      // this.headerComponent.onSignOut()
    } else {
      localStorage.setItem("Authorization", data["token"])
    }

  }

  employeeDetails(jsn) {
    this.profileChanges(false, true, false)
    this.isEmployeeLoading = false;
    this.employeeData = jsn['data'];
    this.employeeData.sort((a, b) => a.defaultFullName.localeCompare(b.defaultFullName))
    this.searchText = jsn['employee'];
    this.onEmpSelectedItems = []
    this.locationSearch = jsn['selectedLocations'] instanceof Array ?jsn['selectedLocations'] : [];
    let uniqueLocations = jsn['locations'];
    this.employeeOldQuery = {}
    this.isEmployeeSearch = (typeof(jsn['employee']) == "string" && jsn['employee'] != "") || this.locationSearch.length > 0
    this.employeeOldQuery = {
      "locations":this.locationSearch,
      "employee":this.searchText
    }
    this.EmpLocations = []
    let idx = 0;
    const map = new Map();
    for (const item of uniqueLocations) {
      if (!map.has(item)) {
        map.set(item, true);    // set any value to Map
        let itemObj = { item_id: idx++, item_text: item }
        this.EmpLocations.push(itemObj);
        if(this.locationSearch.includes(item))this.onEmpSelectedItems.push(itemObj);
      }
    }
    this.removeLoadingMessage();
  }

  profileDetails(jsn) {
    // this.openProfile()
  }

  onEMPSearchChange() {
    this.isEmployeeSearch = true;
    this.isEmployeeLoading = true;
    this.sendMessage_custom('/employee_query{"location": '+JSON.stringify(this.locationSearch)+', "person":"'+this.searchText+'"}', undefined, undefined, false)
  }

  closeEmployee() {
    this.profileChanges(true, false, false)
    this.addMessage(this.operator, this.defaultMsg, 'received')
  }

  onItemSelect(evt) {
    this.isEmployeeSearch = true;
    let selItems = this.onEmpSelectedItems;
    this.locationSearch = [];
    for (var i = 0; i < selItems.length; i++) {
      this.locationSearch.push(selItems[i].item_text);
    }
    // this.sendMessage_custom('/employee_query{"location": '+JSON.stringify(this.locationSearch)+', "person":"'+this.searchText+'"}', undefined, undefined, false)
  }

  onEmpDropDownClose(evt){
    if(this.employeeOldQuery['locations'] == this.locationSearch && this.employeeOldQuery['employee'] == this.searchText){
      return;
    }
    this.isEmployeeLoading = true;
    this.sendMessage_custom('/employee_query{"location": '+JSON.stringify(this.locationSearch)+', "person":"'+this.searchText+'"}', undefined, undefined, false)
  }

  datePickerDetails(jsn) {
    let now = new Date();
    let yr = now.getFullYear();
    let dates = jsn['data']
    SelectionDates = []
    for (var i = 0; i < dates.length; i++) {
      let startDte = new Date(dates[i]['Date'].split(",")[0] + ", " + yr)
      let endDte = new Date(dates[i]['To date'].split(",")[0] + ", " + yr)
      var daysOfYear = [];
      for (var d = startDte; d <= endDte; d.setDate(d.getDate() + 1)) {
        if (d.getDay() != 6 && d.getDay() != 0) {
          SelectionDates.push({
            "approved": dates[i].Status == "APPROVED" ? 1 : 0,
            "date": d.toString()
          })
        }
      }
    }
  }


  isCustomDate(date) {
    for (let i in SelectionDates) {
      if (SelectionDates[i].date == date._d && SelectionDates[i].approved == 1) {
        return (
          'approvedCustom'
        )
      }
      else if (SelectionDates[i].date == date._d && SelectionDates[i].approved == 0) {
        return (
          'pendingCustom'
        )
      }
    }
  }

  EmpLocationFilter() {

  }

  openProfile(empProfile, colleagueList = []) {

    let defaultFullName = empProfile.defaultFullName;
    let shortName = "";
    if (typeof (defaultFullName) == "string") {
      shortName = empProfile.defaultFullName.split(" ");
      shortName = shortName[0][0] + shortName[1][0];
    }
    empProfile.shortName = shortName;
    if (empProfile.colleagueDetailsList == undefined) {
      empProfile.colleagueDetailsList = colleagueList;
    }
    if(empProfile.manager != undefined){
      for(let i=0;i<empProfile.colleagueDetailsList.length;i++){
        empProfile.colleagueDetailsList[i]['manager'] = empProfile.manager;
      }
    }
    this.empProfileData = empProfile;
    this.profileChanges(false, false, true)
  }

  closeProfile() {
    this.profileChanges(false, true, false)
  }

  profileChanges(isMain, isEmployee, isProfile) {
    this.isMain = isMain;
    this.isEmployee = isEmployee;
    this.isProfile = isProfile;
  }

  public sendVoice(evt) {
    this.isVoiceSearch = evt['bol'];
  }

  public speechSynthosis(text){
    this.isVoiceSearch = false;
    this.ChatInputComponentObj.speechSynthosis(text);
  }

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === '/') {
      this.focusMessage()
    }
    if (event.key === '?' && !this._visible) {
      this.toggleChat()
    }
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(ChatNotificationComponent, {
      width: '250px',
      data: { name: "test", notify: "test" },
      position: { right: '10%' }
    });

    dialogRef.afterClosed().subscribe(result => {
    });

  }

  isTooltipDate = (m) => {
    for (let i in SelectionDates) {
      if (SelectionDates[i].date == m._d && SelectionDates[i].approved == 1) {
        return (
          "Approved Leave"
        )
      }
      else if (SelectionDates[i].date == m._d && SelectionDates[i].approved == 0) {
        return (
          "Pending for approval"
        )
      }
    }
  }

  isConversation=true;
  conversationTimestamp = undefined;
  conversationEvents(){

    // this.isConversation = false;
    // if(this.conversationTimestamp == undefined){
    //   return;
    // }
    // this.messages.push(this.updateMessageStr(this.operator, "", "received", undefined, true))
    // this.randomMessage('/previous_conversations', true, {}, 'default')
    // // this.randomMessage('/Events', true, {})
  }

  updateTimestamp(jsn){
    if(this.conversationTimestamp == undefined){
      this.conversationTimestamp = jsn[0]['timestamp'];
    }
  }

  conversationDetails(jsn){
    let type;
    this.isConversation = true;
    this.messages.pop()
    
    if(jsn.length == 1){
      let keys = []
    for (var k in jsn) keys.push(k);
    if(keys.length <= 2){
      this.conversationTimestamp = jsn[0]['timestamp'];
      return;
    }
    }
    for(var j=0;j<jsn.length;j++){
      type = jsn[j]['type_name']
      if(type == 'bot'){
        this.addMessage(this.operator, jsn[j], 'received', true, false)
      }else if(type == 'user'){
        this.addMessage(this.client, jsn[j]['text'], 'sent', true, false)
      }
    }
    let cnvTime = jsn[jsn.length-1]['timestamp']
    if(cnvTime != this.conversationTimestamp){
      this.conversationTimestamp = jsn[jsn.length-1]['timestamp'];
    }else{
      this.conversationTimestamp = undefined;
    }
  }

  themeSwatcherToggle(){
    this.showSwatches = !this.showSwatches;
  }
  @HostListener('scroll', ['$event'])
  onScroll(event){
    console.log(event,'checking');
    if(event.type=='scroll'){
      this.hideHimessage = false;
    }
    if(event.target.scrollTop < 15 && this.isConversation){
      this.conversationEvents()
    }
  }

  displayToast(msg){
    let toastType = {'info':'info', 'success':'success','error':'error', 'warning':'warning'}; 
    let type = 'info';
    if(toastType[msg[0]['type']] != undefined){
      type = msg[0]['type']
    }
    try {
    this.toastrService[type](msg[0]['text']) 
    } catch (error) {
      this.toastrService.info(msg[0]['text'])
    }
  }

  themeSelection(val){
    let themeVal = [{type:'blue_blue', colour:"blue", disabled:false, selectedClass : "blue_blue_button tgl_btn", themeID : "Blue-Blue"},
    {type:'red_blue', colour:"red", disabled:false,  selectedClass : "red_blue_button tgl_btn", themeID : "Red-Blue"},
    {type:'blue_pink', colour:"pink", disabled:false, selectedClass : "blue_pink_button tgl_btn", themeID : "Blue-Pink"}]
    let themeType = "blue_blue"
    for(let t=0; t<themeVal.length; t++){
      if(val == themeVal[t].colour){
        themeVal[t].disabled = true;
        themeVal[t].selectedClass += " tgl_active_theme"
        themeType = themeVal[t].type
      }
      // themeVal[t].selectedClass = ""
    }
    this.toggleTheme = themeVal;
    this.theme = themeType;
  }

  themeSelectionEvent(val){
    // alert(val);
    this.themeSelection(val.colour);
    this.randomMessage('/themeColor{"color": "'+val.colour+'"}', true, {})

  }
  chatBoat(){
    this.boatView = !this.boatView;
  }
  closebot(){
    this.boatView = false;
  }

  todoListHomeReview(){
    this.randomMessage('/todolist', true, {})
  }

  listview(){
    this.listView = true;

    
  }

  closeTodo(){
    this.listView = false;
  }

}

// commented code 


// const randomMessages = [
//   ':)',
// ]
// const rand = max => Math.floor(Math.random() * max)
// const getRandomMessage = () => randomMessages[rand(randomMessages.length)]


  // public authorizationCheck(url_s) {

  //   this.get_RasaService(url_s, {
  //     "username": user,
  //     "password": pswd
  //   }, false).subscribe(data => this.acc_token = data['access_token']);
  // }


// const pswd = "Lt7Qr3oUBLEy"
// const user = "me"

// const main_url = "http://172.17.39.193:5005"
// const auth_url = "api/auth"
