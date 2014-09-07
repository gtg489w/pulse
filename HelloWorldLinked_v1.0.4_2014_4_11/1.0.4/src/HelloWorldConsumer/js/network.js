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

var NETWORK = (function network() {
    var moduleName = "NETWORK";
    var SAAgent = null;
    var SASocket = null;
    var SAPeerAgent = null;
    var messageListener;

    var CHANNEL_ID = 104;
    var PROVIDER_APP_NAME = "HelloWorldProvider";

    var MESSAGE_TYPE = {
        "CONNECTION_STATUS" : 0,
        "HEARTBEAT_COUNT" : 1,
        "STEPS_COUNT" : 2,
        "TEXT" : 3,
        "FILE_PATH" : 4,
        "ERROR" : 5,
        "RESET" : 6
    };

    var requestServiceConnectionCallback = {
        onrequest : function(peerAgent) {
            console.log("Connection requested from peerAgent "
                    + peerAgent.appName);
        },
        onconnect : function(socket) {
            console.log("requestServiceConnectionCallback: onconnect");
            SASocket = socket;
            alert("Connection established with HelloWorld peer agent");
            try {
                SASocket.setDataReceiveListener(onReceiveData);
                SASocket.setSocketStatusListener(function(reason) {
                    console.log("Service connection lost, reason: [" + reason
                            + "]");
                    if (SASocket != null) {
                        disconnect(true);
                    }
                });
            } catch (err) {
                console.log(UTILITY.createErrorString(
                        "Internal Error: onconnect()", err));
                alert("Internal Error: onconnect()");
            }
        },
        onerror : function(errorCode) {
            console.log("requestServiceConnectionCallback: errorCode="
                    + errorCode);
            alert("requestServiceConnectionCallback error");
        }
    };

    var peerAgentFindCallback = {
        onpeeragentfound : function(peerAgent) {
            if (peerAgent.appName == PROVIDER_APP_NAME) {
                try {
                    SAPeerAgent = peerAgent;
                    SAAgent
                            .setServiceConnectionListener(requestServiceConnectionCallback);
                    console.log("Requesting service connection with "
                            + peerAgent.appName);
                    SAAgent.requestServiceConnection(peerAgent);
                } catch (err) {
                    console.log(UTILITY.createErrorString(
                            "Internal Error: requestServiceConnection()", err));
                    alert("Internal Error: requestServiceConnection()");
                }
            } else {
                console.log("Found unexpected peerAgent: " + peerAgent.appName);
                alert("Found unexpected peerAgent: " + peerAgent.appName);
            }
        },
        onerror : function(errorCode) {
            console.log("peerAgentFindCallback: errorCode=" + errorCode);
            alert("Error finding peer agent");
        }
    };

    function onRequestSAAgentSuccess(agents) {
        if (agents.length > 0) {
            console.log("onRequestSAAgentSuccess: local SAAgent found");
            SAAgent = agents[0];

            try {
                SAAgent.setPeerAgentFindListener(peerAgentFindCallback);
                console.log("onRequestSAAgentSuccess: Finding peer agents");
                SAAgent.findPeerAgents();
            } catch (err) {
                alert("Internal Error: findPeerAgents()");
                console.log(UTILITY.createErrorString(
                        "onRequestSAAgentSuccess", err));
            }
        } else {
            console.log("onRequestSAAgentSuccess: No local SAAgent found");
            alert("No local SAAgent found");
        }
    }

    function onRequestSAAgentError(err) {
        console.log(UTILITY.createErrorString("Error requesting local SAAgent",
                err));
        alert("Error requesting local SAAgent");
    }

    function onDeviceStatusChange(type, status) {
        if (status == "ATTACHED") {
            console.log("onDeviceStatusChange: Attached to host");
        } else if (status == "DETACHED") {
            console.log("onDeviceStatusChange: Detached from host");
            if (SAAgent !== null && SASocket === null) {
                // Can attempt to findProvider here
            }
        }
    }

    function init(networkMessageListener) {
        if (!networkMessageListener) {
            console.log("Invalid networkMessageListener");
            return;
        }

        messageListener = networkMessageListener;
        console.log("Network initialized");
    }

    function destroy() {
        console.log("destroy");
        disconnect(false);
        messageListener = null;
    }

    function connect() {
        console.log("connect");
        if (SASocket) {
            console.log("Already connected");
            alert("Already connected!");
            return false;
        }

        try {
            console.log("Requesting SAAgent");
            webapis.sa.requestSAAgent(onRequestSAAgentSuccess,
                    onRequestSAAgentError);
            webapis.sa.setDeviceStatusListener(onDeviceStatusChange);
        } catch (err) {
            console.log(UTILITY.createErrorString("Internal Error: connect()",
                    err));
            alert("Internal Error: connect()");
            return;
        }
    }

    function disconnect(enable) {
        if (SASocket != null) {
            console.log("Disconnecting");
            try {
                SASocket.close();
            } catch (err) {
                console.log(UTILITY.createErrorString(
                        "Error closing connection", err));
            } finally {
                SASocket = null;
                UTILITY.showAlert("Disconnected from peer", enable);
            }
        } else {
            console.log("Not disconnecting, already disconnected");
            UTILITY.showAlert("Already disconnected", enable);
        }
    }

    function onReceiveData(channelId, data) {
        console.log("Received data: " + data);
        var object = JSON.parse(data);

        if (object == null) {
            console.log("Parsed object is null");
            return;
        }

        if (!messageListener) {
            console.log("No messageListener");
            return;
        }

        messageListener(object);
    }

    function sendString(data, enable) {
        if (SASocket === null) {
            console.log("SASocket is null, cannot send string");
            UTILITY.showAlert("You need to press connect first", enable);
            return;
        }

        var jsonString = JSON.stringify(data);

        if (SAPeerAgent != null
                && jsonString.length > SAPeerAgent.maxAllowedDataSize) {
            console.log("jsonString (" + jsonString
                    + ") exceeds max allowed data size");
            UTILITY.showAlert("Cannot send data, string is too long", enable);
            return;
        }

        try {
            console.log("sendString: " + jsonString);
            SASocket.sendData(CHANNEL_ID, jsonString);
        } catch (err) {
            console.log(UTILITY.createErrorString("sendString", err));
            UTILITY.showAlert("Internal Error: sendString", enable);
        }
    }

    function sendMessage(text) {
        console.log("sendMessage");

        var protocolMsg = {
            "type" : MESSAGE_TYPE.TEXT,
            "text" : text
        };

        sendString(protocolMsg, true);
    }

    function sendHeartRate(heartRate) {
        console.log("Sending heartRate=" + heartRate);
        var protocolMsg = {
            "type" : MESSAGE_TYPE.HEARTBEAT_COUNT,
            "heartbeat" : heartRate,
        };

        sendString(protocolMsg, false);
    }

    function sendStepCount(stepCount) {
        var protocolMsg = {
            "type" : MESSAGE_TYPE.STEPS_COUNT,
            "steps" : stepCount
        };

        sendString(protocolMsg, false);
    }

    function sendImage(filePath) {
        console.log("sendImage");

        if (SAAgent == null) {
            alert("You need to press connect first");
            return;
        }

        var saFileTransfer;
        try {
            saFileTransfer = SAAgent.getSAFileTransfer();
            saFileTransfer.setFileSendListener(fileSendCallback);
        } catch (err) {
            console.log(UTILITY.createErrorString("", err));
            alert("Internal Error: Sending file");
            return;
        }

        if (SAPeerAgent == null) {
            console.log("Error sending file: no peer agent");
            alert("Error sending file: no peer agent");
            return;
        }

        try {
            var transferId = saFileTransfer.sendFile(SAPeerAgent, filePath);
            console.log("Sending file (filePath=" + filePath + "). transferId="
                    + transferId);
        } catch (e2) {
            console.log(UTILITY.createErrorString("sendFile", e2));
        }
    }

    var fileSendCallback = {
        onprogress : function(transferId, progress) {
            console.log("File Send Progress [transferId=" + transferId
                    + "] progress: " + progress);
        },
        oncomplete : function(transferId, localPath) {
            console.log("File Send Complete [transferId=" + transferId
                    + "] localPath: " + localPath);
        },
        onerrror : function(errorCode, transferId) {
            console.log("File Send Error [transferId=" + transferId
                    + "] errorCode: " + errorCode);
        }
    };

    console.log("Loaded module: " + moduleName);

    return {
        init : init,
        destroy : destroy,
        connect : connect,
        disconnect : disconnect,
        sendMessage : sendMessage,
        sendHeartRate : sendHeartRate,
        sendStepCount : sendStepCount,
        sendImage : sendImage,
        MESSAGE_TYPE : MESSAGE_TYPE
    };

}());