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

var PEDOMETER = (function pedometerFunc() {
    var moduleName = "PEDOMETER";
    var TYPE_PEDOMETER = "PEDOMETER";
    var pedometer;
    var totalStepCount = 0;
    var listener;
    var started = false;

    function init(pedometerListener) {
        if (!pedometerListener) {
            console.log("Invalid listener");
            return;
        }

        if (window.webapis && window.webapis.motion !== undefined) {
            reset();
            pedometer = window.webapis.motion;
            listener = pedometerListener;
            console.log("Pedometer initialized");
        } else {
            console.log("Error initializing pedometer");
        }
    }

    function destroy() {
        console.log("destroy");
        stop();
        listener = null;
    }

    function start() {
        if (!pedometer) {
            console.log("Pedometer not initialized");
            return;
        } else if (started) {
            console.log("Pedometer already started");
            return;
        }

        try {
            pedometer.start(TYPE_PEDOMETER, function onSuccess(pedometerInfo) {
                totalStepCount = pedometerInfo.cumulativeTotalStepCount;

                if (!listener) {
                    console.log("No listener");
                    return;
                }

                listener(totalStepCount);
            });
        } catch (err) {
            console.log(UTILITY.createErrorString("start", err));
        }

        started = true;
    }

    function stop() {
        if (pedometer == null) {
            console.log("Pedometer not initialized");
            return;
        } else if (!started) {
            console.log("Pedometer already stopped");
            return;
        }

        console.log("Stopping pedometer");
        try {
            pedometer.stop(TYPE_PEDOMETER);
        } catch (err) {
            console.log(UTILITY.createErrorString("stop", err));
        }

        started = false;
        reset();
    }

    function getTotalStepCount() {
        return totalStepCount;
    }

    function getPedometerData() {
        var onSuccess = function(info) {
            var stepCount = info.cumulativeTotalStepCount;
            console.log("Step count=" + stepCount);
        };

        var onError = function(err) {
            console.log(UTILITY.createErrorString("onError", err));
        };

        try {
            pedometer.getMotionInfo(TYPE_PEDOMETER, onSuccess, onError);
        } catch (err) {
            console.log(UTILITY.createErrorString("getMotionInfo", err));
        }
    }

    function reset() {
        totalStepCount = 0;
    }

    console.log("Loaded module: " + moduleName);

    return {
        init : init,
        destroy : destroy,
        start : start,
        stop : stop,
        getTotalStepCount : getTotalStepCount
    };
}());