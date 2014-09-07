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

var NAVIGATION = (function navigation() {
    var moduleName = "NAVIGATION";
    var homePage;
    var cameraPage;

    /**
     * Checks if the page is active
     * 
     * @param {HTMLElement} page
     * @return {boolean}
     */
    function isPageActive(page) {
        return page.classList.contains('ui-page-active');
    }

    function openCameraPage() {
        console.log('openCameraPage');
        if (homePage) {
            homePage.classList.remove('ui-page-active');
        }

        if (cameraPage) {
            cameraPage.classList.add('ui-page-active');
        }
    }

    function openHomePage() {
        console.log('openHomePage');
        if (cameraPage) {
            cameraPage.classList.remove('ui-page-active');
        }

        if (homePage) {
            homePage.classList.add('ui-page-active');
        }
    }

    function init() {
        homePage = document.getElementById('home');
        cameraPage = document.getElementById('main');
    }

    init();
    console.log("Loaded module: " + moduleName);

    return {
        openCameraPage : openCameraPage,
        openHomePage : openHomePage,
        isPageActive : isPageActive
    }
}());