
function loadScript(url, callback){

    var script = document.createElement("script")
    script.type = "text/javascript";

    if (script.readyState){  //IE
        script.onreadystatechange = function(){
            if (script.readyState == "loaded" ||
                    script.readyState == "complete"){
                script.onreadystatechange = null;
                callback();
            }
        };
    } else {  //Others
        script.onload = function(){
            callback();
        };
    }

    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
}

loadScript("assets/js/recorder.js", function(){
    //initialization code
});

/* speech main function */
(function(window) {
    const speechMain = {

        main: function(options){
            
        // Default options
		this.options = {
            speechToTextCallback: options.speechToTextCallback,
            textToSpeechCallback: options.textToSpeechCallback,
            speechToTextURL: options.speechToTextURL,
            textToSpeechURL: options.textToSpeechURL,
            initializeSocket: options.initializeSocket ? true: false,
        };

        window.recoderSession = this;

        if(this.options.initializeSocket){
            this.socket_handling()
        }
    },
        // text to speech options
        textToSpeech : function(text) {
            this.sendMessageToBot(text, false)

            // var xhttp = new XMLHttpRequest();
            // xhttp.onreadystatechange = function() {
            //     if (this.readyState == 4 && this.status == 200) {
            //         // Typical action to be performed when the document is ready:
            //         txt = xhttp.responseText
            //         document.getElementById("SpeechText").textContent = txt
            //         console.log(txt)
            //     }
            // };
            // xhttp.open("POST", "TextToSpeech", true);
            // xhttp.send(JSON.stringify({ "message": text }));
        },
        startRecord : function() {
            const vm = this;
            window.AudioContext = window['AudioContext'] || window['webkitAudioContext'];
            this.audioContext = new window['AudioContext']({ sampleRate: 16000 });
            this.isRecording = true;
            // Ask for audio device
            // navigator.getUserMedia = navigator.getUserMedia
            //    || navigator.mozGetUserMedia
            //    || navigator.webkitGetUserMedia;
            // navigator.getUserMedia({ audio: true }, vm.startUserMedia, e => {
            //    console.log(`No live audio input in this browser: ${e}`);
            //});
            // FYI: by default works only over https
            // FYI: Chrome on android doesn't get access to getUserMedia if connection isn't encrypted
            // FYI: either use https or manually use Experiments: 'Insecure origins treated as secure' in Chrome
            navigator.getUserMedia = (
                navigator.getUserMedia ||
                navigator.webkitGetUserMedia ||
                navigator.mozGetUserMedia ||
                navigator.msGetUserMedia
            );
            // for old browser version - using deprecated navigator.getUserMedia
            if (typeof navigator.mediaDevices === 'undefined') {
                navigator.getUserMedia({
                    audio: true
                }, vm.startUserMedia.bind(vm), e => {
                    let message = `No live audio input in this browser: ${e}`
                    vm.stopRecording(false, message);
                    console.log(message);
                });
                // for new browser version - using new navigator.mediaDevices.getUserMedia
            } else {
                navigator.mediaDevices.getUserMedia({
                    audio: true
                }).then(vm.startUserMedia.bind(vm)).catch(e => {
                    let message = `No live audio input in this browser: ${e}`
                    vm.stopRecording(false, message);
                    console.log(message);
                });
            }
        },
        stopRecording : function(isSuccess, message="") {
            if(this.isRecording === false){
                return;
            }
            this.isRecording = false;
            isSuccess = isSuccess === true?isSuccess:false
            try{
                if(!isSuccess){
                    message = typeof(message) == "string" && message != ""?message:"could not understand audio"
                    this.options.speechToTextCallback(message, false)
                }
                this.audioContext.close().then(() => {
                    console.log('streaming close');
                });
                this.mediaRecorder.stop();

            }catch(err){

            }
            
        },
        startUserMedia : function(stream) {
            const vm = this;
            vm.analyser = vm.audioContext.createAnalyser();
            const source = vm.audioContext.createMediaStreamSource(stream).connect(vm.analyser);
            console.log(vm.analyser);
            vm.dataArray = new Uint8Array(vm.analyser.fftSize / 32);
            // vm.animate();
            const chunks = [];
            const audioOptions = {
                audioBitsPerSecond: 16000
            };
            /*         This two lines using Mediarecorder            */
            // vm.mediaRecorder = new MediaRecorder(stream, audioOptions);
            // vm.mediaRecorder.start();
            vm.mediaRecorder = new Recorder(source, { numChannels: 1 });
            vm.mediaRecorder.record();
            window.setTimeout(() => {
                if (vm.mediaRecorder.state === 'recording') {
                    vm.mediaRecorder.stop();
                    vm.stopRecording();
                    console.log('5 seconds, stop recording');
                }
            }, 5000);
            // Setup options
            const options = {
                source: source,
                voice_stop: function() {
                    if (vm.isRecording) {
                        vm.mediaRecorder.stop();
                        vm.mediaRecorder.exportWAV(vm.createFileLink);
                        vm.stopRecording(true);
                        console.log('voice_stop');
                    }
                },
                voice_start: function() {
                    if (vm.isRecording) {
                        console.log('voice_start');
                    }
                }
            };
            // Create VAD
            // eslint-disable-next-line no-undef
            const vad = new VAD(options);
        },
        createFileLink : function(blob) {
            const vm = window.recoderSession;
            console.log('recorder stopped');
            // vm.$store.commit('setResponseStatus', true);
            vm.waitForRespose = true;
            const audioURL = window.URL.createObjectURL(blob);
            const request = new XMLHttpRequest();
            request.open('GET', audioURL, true);
            request.responseType = 'blob';
            request.onload = function() {
                const reader = new FileReader();
                reader.readAsDataURL(request.response);
                reader.onload = function(el) {
                    // console.log('DataURL:', el.target.result);
                    console.log('SEND RESULT TO THE BOT');
                    // vm.sendMessageToBotSocket(el.target.result);
                    vm.sendMessageToBot(el.target.result);
                };
            };
            request.send();
        },
        playMedia : function(source) {
            var audio = document.createElement("audio");
            audio.autoplay = true;
            audio.load()
            audio.addEventListener("load", function() { 
                audio.play(); 
            }, true);
            audio.src = source;
            // const audio = document.querySelector('.sound-clips');
            // audio.setAttribute('controls', '');
            // audio.setAttribute('autoplay', '');
            // audio.src = audioPath;
        },

        sendMessageToBotSocket : function(text, isVoice = true) {
            this.socket.emit("uservoice_uttered", {
                "message": text,
                "isSpeech": isVoice,
                session_id: this.UserId
            })
            // let url = isVoice ? this.options.speechToTextURL : this.options.textToSpeechURL
            // let callback = isVoice ? this.options.speechToTextCallback : this.options.textToSpeechCallback
            // var xhttp = new XMLHttpRequest();
            // xhttp.onreadystatechange = function() {
            //     if (this.readyState == 4 && this.status == 200) {
            //         // Typical action to be performed when the document is ready:
            //         txt = xhttp.responseText
            //         // document.getElementById("SpeechText").textContent = txt
            //         console.log(txt)
            //         callback(txt);
            //     }
            // };
            // xhttp.open("POST", url, true);
            // xhttp.send(JSON.stringify({ "message": text }));

        },

        sendMessageToBot : function(text, isVoice = true) {
            let url = isVoice ? this.options.speechToTextURL : this.options.textToSpeechURL
            let callback = isVoice ? this.options.speechToTextCallback : this.options.textToSpeechCallback
            let message = isVoice ? JSON.stringify({ "blobData": text }) : JSON.stringify({ "message": text })  
            
            var xhttp = new XMLHttpRequest();
            var vm = this;
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    // Typical action to be performed when the document is ready:
                    if(!isVoice){
                        vm.playMedia(JSON.parse(xhttp.response)['link']);
                        return;
                    }
                    let txt = {"text":"could not find audio"}
                    try{
                        txt = JSON.parse(xhttp.response)
                    }catch(err){
                    }
                    // document.getElementById("SpeechText").textContent = txt
                    callback(txt)
                    console.log(txt)
                }
            };
            xhttp.open("POST", url, true);
            xhttp.setRequestHeader( 'Access-Control-Allow-Origin', '*');
            xhttp.send(message);

        },



        sendServer : function(text) {
            /* Send message to the bot if it isn't empty */
            if (text && text.length >= 1 && text.replace(/\s/g, '').length !== 0) {
                /* Append to array of messages (so that it gets rendered to the screen) */
                console.log('type:', typeof(text));
                // console.log('text:', text);
                this.$store.commit('emptyIncomingMessage');
                this.$store.commit('addOutgoingMessage', { text: this.currentInput });
                this.$socket.emit('user_uttered', { message: text, room: this.userId });
            } else if (typeof(text) === 'object') {
                console.log('type:', typeof(text));
                this.$store.commit('emptyIncomingMessage');
                // this.$store.commit('addOutgoingMessage', { text: this.currentInput });
                this.$socket.emit('user_uttered', { message: text, room: this.userId });
            }
        },

        socket_handling : function() {
            var socket = io.connect(window.location.host)
            const srch = window.location.search;
            const UserId = new URLSearchParams(srch).get("UserId");

            socket.on('connect', () => {
                // console.log("----------------------| local_id : " + local_id);
                socket.emit('session_request', ({ 'session_id': UserId }));
            });
            socket.on('disconnect', () => {
                // console.log("----------------------| local_id : " + local_id);
                // socket.emit('session_cancel', ({ 'session_id': UserId }));
            });

            // When session_confirm is received from the server:
            socket.on('session_confirm', (remote_id) => {
                console.log('session id ' + remote_id);
            });

            // socket.emit("uservoice_uttered", {
            //     "message": userText,
            //     "customData": { "language": "en" },
            //     "language": "en",
            //     session_id: UserId
            // })
            socket.on('botvoice_uttered', function(message) {
                if (typeof(message['link']) == "string") {
                    var audio = new Audio(message['link']);
                    audio.play();
                } else {
                    document.getElementById("SpeechText").textContent = message['text']
                }
                console.log("reached to bot uttered")
            });
            this.socket = socket
            this.UserId = UserId
        }
    };
    window.speechMain = speechMain;
        }(window))