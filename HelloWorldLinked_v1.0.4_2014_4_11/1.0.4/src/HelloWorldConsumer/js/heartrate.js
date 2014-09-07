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

var HEART_RATE = (function heartRate() {
    var moduleName = "HEART_RATE";
    var TYPE_HEARTRATE = "HRM";
    var HRM_WATCH_OFF = -3;
    var HRM_WATCH_SHAKE = -2;

    var hrm;
    var heartRateCount = 0;
    var listener;
    var started = false;

    function init(heartRateListener) {
        if (!heartRateListener) {
            console.log("Invalid listener");
            return;
        }

        if (window.webapis && window.webapis.motion !== undefined) {
            hrm = window.webapis.motion;
            listener = heartRateListener;
            reset();
            console.log("HRM initialized");
        } else {
            console.log("Error initializing HRM");
        }
    }

    function destroy() {
        console.log("destroy");
        stop();
        listener = null;
    }

    function start() {
        if (hrm == null) {
            console.log("hrm not initialized");
            return;
        } else if (started) {
            console.log("hrm already started");
            return;
        }

        try {
            hrm.start(TYPE_HEARTRATE, function onSuccess(hrmInfo) {
                var heartRate = hrmInfo.heartRate;
                if (heartRate === HRM_WATCH_OFF
                        || heartRate === HRM_WATCH_SHAKE) {
                    return;
                }

                heartRateCount = heartRate;

                if (!listener) {
                    console.log("No listener");
                    return;
                }

                listener(heartRateCount);
            });
        } catch (err) {
            console.log(UTILITY.createErrorString("start", err));
        }

        started = true;
    }

    function stop() {
        if (hrm == null) {
            console.log("Hrm not initialized");
            return;
        } else if (!started) {
            console.log("Hrm already stopped");
            return;
        }

        try {
            hrm.stop(TYPE_HEARTRATE);
        } catch (err) {
            console.log(UTILITY.createErrorString("stop", err));
        }

        started = false;
        reset();
    }

    function reset() {
        heartRateCount = 0;
    }

    function getHeartRate() {
        return heartRateCount;
    }

    console.log("Loaded module: " + moduleName);

    return {
        init : init,
        destroy : destroy,
        start : start,
        stop : stop,
        getHeartRate : getHeartRate
    };
}());