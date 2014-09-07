var playing = false;

window.onload = function () {
    document.addEventListener('tizenhwkey', function(e) {
        if(e.keyName == "back")
            tizen.application.getCurrentApplication().exit();
    });

    // Sample code
    var textbox = document.querySelector('.contents');
    textbox.addEventListener("click", function(){
    	alert('click');
    	if(playing) {
    		//$.ajax('http://23.21.243.158/message?tempo=8&intensity=0');
    		playing = false;
    	} else {
    		//$.ajax('http://23.21.243.158/message?tempo=2&intensity=.6');
    		playing = true;
    	}
    });
    
};
