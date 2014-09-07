/*
 * Copyright (C) 2014 Samsung Electronics. All Rights Reserved.
 * Source code is licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 *
 * IMPORTANT LICENSE NOTE:
 * The IMAGES AND RESOURCES are licensed under the Creative Commons BY-NC-SA 3.0
 * License (http://creativecommons.org/licenses/by-nc-sa/3.0/).
 * The source code is allows commercial re-use, but IMAGES and RESOURCES forbids it.
 */

var MAIN = (function main() {
    var moduleName = "MAIN";
    var STRINGS = [ "Hello World!", "Hi World!", "Hey World!" ];

    var stringSelection = 0;

    var receivedMessageText = document.getElementById('text-message');
    var stepCountText = document.getElementById("step-count");
    var heartRateText = document.getElementById("heartbeat-count");
    var capturedImage = document.getElementById("captured-image");

    function stepCountListener(stepCount) {
        setStepCountText(stepCount);
        NETWORK.sendStepCount(stepCount);
    }

    function heartRateListener(heartRate) {
        setHeartRateText(heartRate);
        NETWORK.sendHeartRate(heartRate);
    }

    function networkMessageListener(object) {
        var type = object.type;
        if (type == null) {
            console.log("Object type is null");
            return;
        }

        switch (type) {
        case NETWORK.MESSAGE_TYPE.TEXT:
            console.log("onReceiveData: TEXT");
            var text = object.text;
            setReceivedMessageText(text);
            break;
        case NETWORK.MESSAGE_TYPE.ERROR:
            var errorMsg = object.error;
            console.log("onReceiveData: ERROR, errorMsg=" + errorMsg);
            alert("Please install linked app");
            break;
        case NETWORK.MESSAGE_TYPE.RESET:
            console.log("onReceiveData: RESET, resetting heartrate/step count");

            HEART_RATE.stop();
            setHeartRateText(HEART_RATE.getHeartRate());
            HEART_RATE.start();

            PEDOMETER.stop();
            setStepCountText(PEDOMETER.getTotalStepCount());
            PEDOMETER.start();
            break;
        default:
            console.log("Received unhandled message type: " + type);
            break;
        }
    }

    // Button events

    function onConnectClick() {
        NETWORK.connect();
    }

    function onDisconnectClick() {
        NETWORK.disconnect(true);
    }

    function onSendMessageClick() {
        console.log("onSendMessageClick");

        var string = STRINGS[stringSelection++ % STRINGS.length];
        NETWORK.sendMessage(string);
    }

    function onNextBeat() {
    	alert('here');
        //var string = STRINGS[stringSelection++ % STRINGS.length];
        //NETWORK.sendMessage("nextBeat");
        alert('complete');
    }

    function onSendImageClick() {
        console.log("onSendImageClick");

        var onResolveSuccess = function(file) {
            var filePath = file.toURI();
            console.log("onResolveSuccess: fileURI=" + filePath);

            NETWORK.sendImage(filePath);
        };

        var onResolveError = function(error) {
            console.log(UTILITY.createErrorString("onResolveError", error));
        };

        tizen.filesystem.resolve(capturedImage.src, onResolveSuccess,
                onResolveError, 'r');
    }

    function onStartHeartRateClick() {
        console.log("onStartHeartRateClick");
        HEART_RATE.start();
    }

    function onStopHeartRateClick() {
        console.log("onStopHeartRateClick");
        HEART_RATE.stop();
    }

    function onCapturedImageClick() {
        console.log("onCapturedImageClick");
        NAVIGATION.openCameraPage();
        CAMERA.init();
    }

    // UI
    function setReceivedMessageText(data) {
        receivedMessageText.innerHTML = data;
    }

    function setStepCountText(count) {
        stepCountText.innerHTML = count;
    }

    function setHeartRateText(heartRate) {
        if (heartRate === 0) {
            heartRate = 'N/A';
        }
        heartRateText.innerHTML = heartRate;
    }

    // Helper

    /**
     * Notification data will contain key-value pairs
     */
    function parseNotificationData() {
        var notificationData = NOTIFICATION.getNotificationData();

        if (!notificationData) {
            console.log("notificationData not available");
            return;
        }

        for ( var i = 0; i < notificationData.length; i++) {
            var item = notificationData[i];
            var key = item.key;
            var value = item.value;
            console.log("notificationData[" + i + "].key=" + key + ": value="
                    + value);
            switch (item.key) {
            case "NOTIFICATION_ID":
                document.getElementById("recv-id").innerHTML = value;
                break;
            case "NOTIFICATION_ITEM_IDENTIFIER":
                document.getElementById("recv-item-identifier").innerHTML = value;
                break;
            case "NOTIFICATION_TIME":
                document.getElementById("recv-time").innerHTML = value;
                break;
            case "NOTIFICATION_MAIN_TEXT":
                document.getElementById("recv-main-text").innerHTML = value;
                break;
            case "NOTIFICATION_TEXT_MESSAGE":
                document.getElementById("recv-text-message").innerHTML = value;
                break;
            case "NOTIFICATION_CUSTOM_FIELD1":
                document.getElementById("recv-custom-field-one").innerHTML = value;
                break;
            case "NOTIFICATION_CUSTOM_FIELD2":
                document.getElementById("recv-custom-field-two").innerHTML = value;
                break;
            default:
                break;
            }
        }
    }

    function onLoad() {
        console.log("onLoad");
        
        init();
        onConnectClick();
    }

    function onUnload() {
        console.log("onUnload");
    }

    function onHardwareKeysTap(ev) {
        var keyName = ev.keyName;
        var page = document.getElementsByClassName('ui-page-active')[0];
        var pageId = (page && page.id) || '';

        if (keyName === "back") {
            console.log("onHardwareKeysTap: " + keyName);

            if (pageId === 'home') {
                console.log('on home page, app exit');
                tizen.application.getCurrentApplication().exit();
            } else {
                console.log('on camera page, go back');
                NAVIGATION.openHomePage();
            }
        }
    }

    function onBlur() {
        console.log("onBlur");
    }

    function onFocus() {
        console.log("onFocus");
    }

    function onVisibilityChange() {
        if (document[hidden]) {
            console.log("Page hidden");
            destroy();
            CAMERA.onVisibilityChange(false);
        } else {
            console.log("Page shown");
            init();
            CAMERA.onVisibilityChange(true);
        }
    }

    if (typeof document.hidden !== "undefined") {
        hidden = "hidden";
        visibilityChange = "visibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
        hidden = "webkitHidden";
        visibilityChange = "webkitvisibilitychange";
    }

    function bindEvents() {
        window.addEventListener('load', onLoad);
        window.addEventListener('unload', onUnload);
        window.addEventListener('blur', onBlur);
        window.addEventListener('focus', onFocus);
        document.addEventListener('tizenhwkey', onHardwareKeysTap);
        document.addEventListener(visibilityChange, onVisibilityChange);

        document.getElementById("connect").addEventListener("click",
                onConnectClick);
        document.getElementById("beat").addEventListener("click",
        		onSendMessageClick);
        document.getElementById("disconnect").addEventListener("click",
                onDisconnectClick);
        document.getElementById("sendMessage").addEventListener("click",
                onSendMessageClick);
        document.getElementById("sendImage").addEventListener("click",
                onSendImageClick);
        document.getElementById("startHeartRate").addEventListener("click",
                onStartHeartRateClick);
        document.getElementById("stopHeartRate").addEventListener("click",
                onStopHeartRateClick);
        document.getElementById("captured-image").addEventListener("click",
                onCapturedImageClick);
        
    }

    function init() {
        console.log("init");

        page = document.getElementById('home');

        parseNotificationData();

        NETWORK.init(networkMessageListener);
        HEART_RATE.init(heartRateListener);

        PEDOMETER.init(stepCountListener);
        PEDOMETER.start();
        setStepCountText(PEDOMETER.getTotalStepCount());
    }

    function destroy() {
        console.log("destroy");

        NETWORK.destroy();
        HEART_RATE.destroy();
        PEDOMETER.destroy();
    }

    console.log("Loaded module: " + moduleName);
    bindEvents();
}());