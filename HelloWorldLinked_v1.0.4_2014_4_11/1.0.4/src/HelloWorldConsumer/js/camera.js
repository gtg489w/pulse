/*
 * Copyright (C) 2014 Samsung Electronics. All Rights Reserved. Source code is
 * licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 * 
 * IMPORTANT LICENSE NOTE: The IMAGES AND RESOURCES are licensed under the
 * Creative Commons BY-NC-SA 3.0 License
 * (http://creativecommons.org/licenses/by-nc-sa/3.0/). The source code is
 * allows commercial re-use, but IMAGES and RESOURCES forbids it.
 */

var CAMERA = (function camera() {
    var moduleName = 'CAMERA';
    var listener;

    // UI
    var cameraPage;
    var homePage;
    var cameraPreview;
    var focusContainer;
    var focusFrame;

    // Camera
    var AUTOFOCUS_DELAY = 500;
    var TAKE_PICTURE_DELAY = 100;
    var PICTURE_DESTINATION_DIRECTORY = '/opt/usr/media/Images';

    var cameraSettings;
    var cameraControl;
    var cameraStream;
    var busy;
    var previewTapAllowed = false;
    var picturePath = '';

    /**
     * Run when page is shown
     */
    function onPageShow() {
        previewTapAllowed = true;
        if (isReady()) {
            console.log("onPageShow, camera ready");
            cameraPreview.play();
        }
    }

    /**
     * Returns picture format
     * 
     * @return {array}
     */
    function getPictureFormat() {
        return cameraSettings.pictureFormat;
    }

    /**
     * Returns current picture size
     * 
     * @returns {object}
     */
    function getPictureSize() {
        return {
            width : cameraSettings.pictureSize.width,
            height : cameraSettings.pictureSize.height
        };
    }

    /**
     * Creates filename for new picture.
     * 
     * @return {string}
     */
    function createPictureFileName() {
        var pictureFormat = getPictureFormat();
        var title = "helloworldimage";
        var extension = pictureFormat === 'jpeg' ? 'jpg' : pictureFormat;
        var fileName = '';

        fileName = title + "_" + new Date().getTime() + '.' + extension;

        return fileName;
    }

    /**
     * Executes when picture is ready.
     */
    function onPictureDone() {
        console.log('onPictureDone');
        busy = false;
        hideAutoFocus();

        NAVIGATION.openHomePage();
        var capturedImage = document.getElementById('captured-image');
        console.log('Captured image path: ' + picturePath);
        capturedImage.src = picturePath;
    }

    /**
     * Executes when error occurs during taking picture.
     * 
     * @param {object} error
     */
    function onPictureError(error) {
        console.log('onPictureError');
        hideAutoFocus();
        busy = false;
    }

    function onImageSettingsApplied() {
        console.log('onImageSettingsApplied');
        cameraControl.image.takePicture(onPictureDone, onPictureError);
    }

    function onImageSettingsError() {
        console.log('onImageSettingsError');
        busy = false;
        hideAutoFocus();
    }

    function onShutter() {
        console.log('onShutter');
        hideAutoFocus();
    }

    function onCameraRelease() {
        unBindEvents();
        previewTapAllowed = false;
    }

    function onCameraReleased() {
        hideAutoFocus();
    }

    /**
     * Releases camera.
     */
    function release() {
        if (cameraControl) {
            console.log("release camera control");
            cameraControl.release();
            cameraControl = null;

            // camera.release event
            onCameraRelease();
        }
    }

    function startTakingPicture() {
        console.log('startTakingPicture');

        var settings = {};
        var fileName = createPictureFileName();
        picturePath = PICTURE_DESTINATION_DIRECTORY + '/' + fileName;

        settings.fileName = fileName;
        settings.pictureFormat = getPictureFormat();
        settings.pictureSize = getPictureSize();

        if (!cameraControl) {
            console.log('camera released');
            hideAutoFocus();
            return;
        }

        cameraControl.image.onshutter = onShutter;
        cameraControl.image.applySettings(settings, onImageSettingsApplied,
                onImageSettingsError);
    }

    function onAutoFocusSuccess() {
        console.log('onAutoFocusSuccess');
        cameraPreview.pause();
        focusFrame.classList.add('autofocus-success');
        window.setTimeout(startTakingPicture, TAKE_PICTURE_DELAY);
    }

    function onAutoFocusFailure() {
        console.log('onAutoFocusFailure');
        cameraPreview.pause();
        focusFrame.classList.add('autofocus-failure');
        window.setTimeout(startTakingPicture, TAKE_PICTURE_DELAY);
    }

    function showAutoFocus() {
        focusContainer.classList.remove('hidden');
        focusFrame.classList.add('autofocus-animation');
    }

    function hideAutoFocus() {
        var classList = focusFrame.classList;

        focusContainer.classList.add('hidden');
        classList.remove('autofocus-animation');
        classList.remove('autofocus-success');
        classList.remove('autofocus-failure');
    }

    function takePicture() {
        if (busy) {
            return false;
        }

        busy = true;

        showAutoFocus();
        if (cameraControl.autoFocus()) {
            window.setTimeout(onAutoFocusSuccess, AUTOFOCUS_DELAY);
        } else {
            window.setTimeout(onAutoFocusFailure, AUTOFOCUS_DELAY);
        }

        return true;
    }

    function takePhoto() {
        console.log('takePhoto');
        previewTapAllowed = false;
        cameraPreview.classList.remove('hidden');

        takePicture();
    }

    function onCameraPreviewClick() {
        console.log('onCameraPreviewClick');

        if (!previewTapAllowed) {
            return;
        }

        takePhoto();
    }

    /**
     * @returns CameraSize[] pictureSizes
     */
    function getPictureSizes() {
        return cameraControl.capabilities.pictureSizes;
    }

    /**
     * @returns DOMString[] pictureFormats
     */
    function getPictureFormats() {
        return cameraControl.capabilities.pictureFormats;
    }

    function isCameraVisibile() {
        return NAVIGATION.isPageActive(cameraPage);
    }

    /**
     * Returns true if camera is ready to work, false otherwise.
     * 
     * @return {boolean}
     */
    function isReady() {
        return cameraControl;
    }

    /**
     * Returns true if application is launched on emulator, false otherwise.
     * 
     * @return {boolean}
     */
    function isDeviceEmulated() {
        return !!(navigator.platform && navigator.platform.indexOf('emulated') !== -1);
    }

    function initCameraSettings() {
        console.log('initCameraSettings');
        var pictureFormats = getPictureFormats();
        var pictureSizes = getPictureSizes();
        cameraSettings = {};

        cameraSettings.pictureFormat = pictureFormats[0];
        cameraSettings.pictureSize = pictureSizes[1];

        console
                .log("Selected camera settings: pictureFormat="
                        + cameraSettings.pictureFormat + ", pictureSize width="
                        + getPictureSize().width + " height="
                        + getPictureSize().height);
    }

    /**
     * CameraControl object is created successfully
     * 
     * @param {CameraControl} control
     */
    function onCameraControlCreated(control) {
        console.log('onCameraControlCreated');
        cameraControl = control;
        initCameraSettings();

        console.log("camera is ready");
        if (isCameraVisibile()) {
            cameraPreview.play();
        }
    }

    /**
     * @param {CameraError} error
     */
    function onCameraControlError(error) {
        var message = '';
        var errorCode = error.code;
        console.log('onCameraControlError: error=' + errorCode);

        if (errorCode === 0) {
            message = 'Camera is not available.';
            if (isDeviceEmulated()) {
                message += ' Camera is supported on device target only.';
            }
        } else {
            message = 'Camera is not available.';
        }

        window.alert(message);
        NAVIGATION.openHomePage();
    }

    /**
     * Asynchronously create CameraControl object using input stream.
     * 
     * @param {MediaStream} stream - Stream object obtained from getUserMedia
     */
    function registerStream(stream) {
        console.log('registerStream');
        navigator.tizCamera.createCameraControl(stream, onCameraControlCreated,
                onCameraControlError);
    }

    function onPreviewStream(stream) {
        console.log('onPreviewStream');
        var streamUrl = window.webkitURL.createObjectURL(stream);

        cameraStream = stream;
        cameraPreview.src = streamUrl;
        registerStream(cameraStream);

        if (NAVIGATION.isPageActive(cameraPage)) {
            cameraPreview.play();
        }
    }

    function onPreviewStreamError(err) {
        console.log('onPreviewStreamError: error code=' + err.code);
        if (document.visibilityState === 'visible') {
            window.alert('Cannot access camera stream. '
                    + 'Please close all applications that use the camera and '
                    + 'open the application again.');
            console.error(error);
            NAVIGATION.openHomePage();
        }
    }

    function initCameraPreview() {
        console.log('initCameraPreview');
        navigator.webkitGetUserMedia({
            video : true,
            audio : false
        }, onPreviewStream, onPreviewStreamError);
    }

    function unBindEvents() {
        cameraPreview.removeEventListener('click', onCameraPreviewClick);
    }

    function initCamera() {
        previewTapAllowed = true;

        if (!cameraStream || cameraStream.ended) {
            initCameraPreview();
        } else if (!isReady()) {
            registerStream(cameraStream);
        }
    }

    function onVisibilityChange(visible) {
        console.log('onVisibilityChange: visible=' + visible);
        if (!visible) {
            if (isReady()) {
                release();

                if (cameraStream) {
                    cameraStream.stop();
                }
            }
        } else {
            if (!isCameraVisibile()) {
                console.log("Camera is not visible, not initializing");
                return;
            }
            initCamera();
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
        console.log('bindEvents');
        previewTapAllowed = true;
        cameraPreview.addEventListener('click', onCameraPreviewClick);
    }

    function init(cameraListener) {
        console.log('init');
        listener = cameraListener;

        homePage = document.getElementById('home');
        cameraPage = document.getElementById('main');
        cameraPreview = document.getElementById('camera-preview');
        focusContainer = document.getElementById('focus-container');
        focusFrame = document.getElementById('focus-frame');

        bindEvents();

        onPageShow();
        initCamera();
    }

    console.log('Loaded module: ' + moduleName);

    return {
        init : init,
        onVisibilityChange : onVisibilityChange
    };
}());