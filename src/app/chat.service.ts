import {environment} from "../environments/environment"
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class ChatService {
  constructor(private http : HttpClient) { }

  // main_url = "https://hrbot-api-qa.speridian.com"
  main_url = environment.apiURL
  webhookurl = "/webhooks/rest/webhook"
  httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': 'Authorization' 
  })
};

 parseJwtToken (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
};

parseAuthorizationKey(token){
	if(localStorage.getItem('Authorization') == undefined){
		localStorage.setItem('Authorization', token)
	}
    return this.getAuthorizaionDetails()
}

getAuthorizaionDetails(){
	let authToken = localStorage.getItem('Authorization');
	let employeeCode = undefined;
	let city = undefined;
	let given_name = undefined
	if(authToken != undefined){
		let parseJWToken = this.parseJwtToken(authToken)
		employeeCode = parseJWToken['EmployeeCode']
		city = parseJWToken['OfficeName']
		given_name = parseJWToken['given_name']
	}
	return [{employeeCode:employeeCode, token:authToken, city:city, given_name:given_name}]
	// return [employeeCode, authToken, city, name]
}

  /**
   * 
   * @param callback 
   * @param _self 
   */
  weatherDataSet(callback, _self) {
    this.get_RasaService("/webhooks/rest/webhook", {
      "message": '/weather',
      "metadata": {  }
    }, false).subscribe(data => {
        try{
          let custom_json = data[0]['custom']["json"]
          if(custom_json["weatherData"] instanceof Object){
            callback.call(_self, custom_json["weatherData"]); // Call success function
          }
        }catch(err){
          // errorFn.call(_self);
        }
    },err=>{
      // errorFn.call(_self); // Call error function 
    }
    )
}

get_RasaService(url, postData, isToken) {
    // if (isToken == true) {
      // this.httpOptions.headers = this.httpOptions.headers.set('Access-Control-Allow-Origin', '*');
      this.httpOptions.headers.set('Access-Control-Allow-Origin', '*');
      // this.httpOptions.headers.set(("Access-Control-Allow-Methods", "DELETE, POST, GET, OPTIONS")
      // this.httpOptions.headers.set(("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
    // }
    const {employeeCode, token} = this.getAuthorizaionDetails()[0]
    // postData['sender'] = employeeCode == undefined ? 'default' : postData['sender'] == undefined ? employeeCode:postData['sender']
    // postData['sender'] = postData['sender'] == undefined ? employeeCode:postData['sender']
    // postData['sender'] = "1001618"
    try{
    postData['metadata']['environment'] = 'WEB'
		postData['metadata']['token'] = token
    }catch{
		postData['metadata'] = {'token':token}
    }
    //  postData['sender'] = employeeCode
   // postData['sender'] = "1001618"
    
    const queryString =  window.location.search;
    const UserId=new URLSearchParams(queryString).get('userId');
    console.log(UserId);
    // postData['sender']=postData['sender'] == undefined?'default':UserId;
    postData['sender']=UserId;
    return this.http.post(this.main_url + this.webhookurl, postData, this.httpOptions)
  }


// socket_handling(){
//   var socket = io.connect('http://localhost:5005')
//   const srch = window.location.search;
//   const UserId = new URLSearchParams(srch).get("UserId");


//   socket.on('connect', () => {
//   // console.log("----------------------| local_id : " + local_id);
//   socket.emit('session_request', ({ 'session_id': UserId }));
//   });
//   socket.on('disconnect', () => {
//   // console.log("----------------------| local_id : " + local_id);
//   // socket.emit('session_cancel', ({ 'session_id': UserId }));
//   });

//   // When session_confirm is received from the server:
//   socket.on('session_confirm', (remote_id) => {
//   console.log('session id ' + remote_id);
//   });

//   $('form').submit(function(){
//     // socket.emit('chat message', $('#m').val());
//     let userText = $('#m').val();
//     socket.emit("user_uttered", { "message": userText, "customData": {"language": "en"}, "language": "en",
// session_id: UserId})
// $('#messages').append($('<li>').text(userText));
//     $('#m').val('');
//     return false;
//   });
//   socket.on('bot_uttered', function(msg){
//     $('#messages').append($('<li>').text(msg.text));
//     window.scrollTo(0, document.body.scrollHeight);
//   });
// });
// }

}
