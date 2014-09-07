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

package com.samsung.smcl.example.helloworldprovider.models;

import android.os.Bundle;

import com.samsung.smcl.example.helloworldprovider.utils.Utility;

public class NotificationModel {
    private static final String TAG = NotificationModel.class.getSimpleName();

    private static final int DEFAULT_ID = -1;
    private static final int DEFAULT_ITEM_IDENTIFIER = -1;

    public static final String KEY_ID = "NotificationModel.KEY_ID";
    public static final String KEY_ITEM_IDENTIFIER = "NotificationModel.KEY_ITEM_IDENTIFIER";
    public static final String KEY_MAIN_TEXT = "NotificationModel.KEY_MAIN_TEXT";
    public static final String KEY_TEXT_MESSAGE = "NotificationModel.KEY_TEXT_MESSAGE";
    public static final String KEY_CUSTOM_FIELD_ONE = "NotificationModel.KEY_CUSTOM_FIELD_ONE";
    public static final String KEY_CUSTOM_FIELD_TWO = "NotificationModel.KEY_CUSTOM_FIELD_TWO";
    public static final String KEY_LAUNCH_ON_ACCESSORY = "NotificationModel.KEY_LAUNCH_ON_ACCESSORY";

    private int id;
    private int itemIdentifier;
    private String mainText;
    private String textMessage;
    private String customFieldOne;
    private String customFieldTwo;
    private boolean launchOnAccessory;

    public NotificationModel(int id, int itemIdentifier, String mainText,
            String textMessage, String customFieldOne, String customFieldTwo,
            boolean launchOnAccessory) {
        this.id = id;
        this.itemIdentifier = itemIdentifier;
        this.mainText = mainText;
        this.textMessage = textMessage;
        this.customFieldOne = customFieldOne;
        this.customFieldTwo = customFieldTwo;
        this.launchOnAccessory = launchOnAccessory;
    }

    public NotificationModel(Bundle bundle) {
        if (bundle == null) {
            Utility.logWarning(TAG, "Cannot create notification from null bundle");
            return;
        }

        id = bundle.getInt(KEY_ID, DEFAULT_ID);
        itemIdentifier = bundle.getInt(KEY_ITEM_IDENTIFIER, DEFAULT_ITEM_IDENTIFIER);
        mainText = bundle.getString(KEY_MAIN_TEXT);
        textMessage = bundle.getString(KEY_TEXT_MESSAGE);
        customFieldOne = bundle.getString(KEY_CUSTOM_FIELD_ONE);
        customFieldTwo = bundle.getString(KEY_CUSTOM_FIELD_TWO);
        launchOnAccessory = bundle.getBoolean(KEY_LAUNCH_ON_ACCESSORY);
    }

    public String getMainText() {
        return mainText;
    }

    public String getTextMessage() {
        return textMessage;
    }

    public String getCustomFieldOne() {
        return customFieldOne;
    }

    public String getCustomFieldTwo() {
        return customFieldTwo;
    }

    public Integer getId() {
        return id;
    }

    public Integer getItemIdentifier() {
        return itemIdentifier;
    }

    public Boolean isLaunchOnAccessory() {
        return launchOnAccessory;
    }

    public Bundle createBundle() {
        Bundle bundle = new Bundle();
        bundle.putString(KEY_MAIN_TEXT, mainText);
        bundle.putString(KEY_TEXT_MESSAGE, textMessage);
        bundle.putString(KEY_CUSTOM_FIELD_ONE, customFieldOne);
        bundle.putString(KEY_CUSTOM_FIELD_TWO, customFieldTwo);
        bundle.putInt(KEY_ID, id);
        bundle.putInt(KEY_ITEM_IDENTIFIER, itemIdentifier);
        bundle.putBoolean(KEY_LAUNCH_ON_ACCESSORY, launchOnAccessory);

        return bundle;
    }

    @Override
    public String toString() {
        StringBuilder result = new StringBuilder();
        final String NEW_LINE = System.getProperty("line.separator");

        result.append(this.getClass().getName() + " Object {" + NEW_LINE);
        result.append(" Main Text: " + mainText + NEW_LINE);
        result.append(" Text Message: " + textMessage + NEW_LINE);
        result.append(" Custom Field One: " + customFieldOne + NEW_LINE);
        result.append(" Custom Field Two: " + customFieldTwo + NEW_LINE);
        result.append(" ID: " + id + NEW_LINE);
        result.append(" Item Identifier: " + itemIdentifier + NEW_LINE);
        result.append(" Launch On Accessory: " + launchOnAccessory + NEW_LINE);

        return result.toString();
    };
}
