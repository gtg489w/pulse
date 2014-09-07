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

package com.samsung.smcl.example.helloworldprovider.utils;

import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Bitmap.CompressFormat;
import android.graphics.BitmapFactory;

import com.samsung.smcl.example.helloworldprovider.models.NotificationModel;
import com.samsung.smcl.helloworldprovider.R;

import java.io.ByteArrayOutputStream;

public class NotificationUtility {
    private static final String GEAR_WIDGET_ID = "VbsgE6bms3.HelloWorldConsumer";

    private static final String NOTIFICATION_ACTION = "com.samsung.accessory.intent.action.ALERT_NOTIFICATION_ITEM";
    private static final String NOTIFICATION_PACKAGE_NAME = "NOTIFICATION_PACKAGE_NAME";
    private static final String NOTIFICATION_MAIN_TEXT = "NOTIFICATION_MAIN_TEXT";
    private static final String NOTIFICATION_TEXT_MESSAGE = "NOTIFICATION_TEXT_MESSAGE";
    private static final String NOTIFICATION_CUSTOM_FIELD1 = "NOTIFICATION_CUSTOM_FIELD1";
    private static final String NOTIFICATION_CUSTOM_FIELD2 = "NOTIFICATION_CUSTOM_FIELD2";
    private static final String NOTIFICATION_ITEM_ID = "NOTIFICATION_ITEM_ID";
    private static final String NOTIFICATION_ITEM_IDENTIFIER = "NOTIFICATION_ITEM_IDENTIFIER";
    private static final String NOTIFICATION_LAUNCH_TOACC_INTENT = "NOTIFICATION_LAUNCH_TOACC_INTENT";
    private static final String NOTIFICATION_LAUNCH_INTENT = "NOTIFICATION_LAUNCH_INTENT";
    private static final String NOTIFICATION_APP_ICON = "NOTIFICATION_APP_ICON";

    /**
     * Send a notification to Gear. The data can retrieved by the Gear
     * application<br>
     * Requirements:
     * <ul>
     * <li>The application declares permission "com.samsung.wmanager.APP"</li>
     * <li>The application declares permission
     * "com.samsung.wmanager.ENABLE_NOTIFICATION"</li>
     * <li>The app is selected in Gear Manager -> Notification</li>
     * <li>The phone screen is off
     * </ul>
     * 
     * @param tag Used for logging
     * @param id Optional non-negative notification id
     * @param itemIdentifier Optional notification itemIdentifier
     * @param mainText Optional text to send (displayed on the notification)
     * @param textMessage Optional text to send
     * @param customDataOne Optional data
     * @param customDataTwo Optional data
     * @param launchWidgetOnClick If true, the widget will launch when the
     *            notification is clicked. Otherwise launch the system
     *            notification application.
     * @param phoneAppPackageName Only applicable when
     *            {@code launchWidgetOnClick} is false. Specifies the phone
     *            application to launch when the notification is clicked in the
     *            system notification application.
     */
    public static void sendNotificationToGear(String tag, Context context, int id,
            int itemIdentifier, String mainText, String textMessage, String customDataOne,
            String customDataTwo,
            boolean launchWidgetOnClick, String phoneAppPackageName) {

        Intent intent = new Intent(NOTIFICATION_ACTION);

        intent.putExtra(NOTIFICATION_PACKAGE_NAME, context.getPackageName());

        if (mainText != null) {
            intent.putExtra(NOTIFICATION_MAIN_TEXT, mainText);
        }

        if (textMessage != null) {
            intent.putExtra(NOTIFICATION_TEXT_MESSAGE, textMessage);
        }

        if (customDataOne != null) {
            intent.putExtra(NOTIFICATION_CUSTOM_FIELD1, customDataOne);
        }

        if (customDataTwo != null) {
            intent.putExtra(NOTIFICATION_CUSTOM_FIELD2, customDataTwo);
        }

        if (id >= 0) {
            intent.putExtra(NOTIFICATION_ITEM_ID, id);
        }

        intent.putExtra(NOTIFICATION_ITEM_IDENTIFIER, itemIdentifier);

        if (launchWidgetOnClick) {
            intent.putExtra(NOTIFICATION_LAUNCH_TOACC_INTENT, GEAR_WIDGET_ID);
        } else {
            if (phoneAppPackageName == null) {
                Utility.logWarning(tag,
                        "Not setting launch intent(%s requires non-null phoneAppPackageName).",
                        NOTIFICATION_LAUNCH_INTENT);
            } else {
                intent.putExtra(NOTIFICATION_LAUNCH_INTENT, phoneAppPackageName);
            }
        }

        byte[] bytes = getNotificationIcon(context);
        intent.putExtra(NOTIFICATION_APP_ICON, bytes);

        context.sendBroadcast(intent);
    }

    public static void sendNotificationToGear(String tag, Context context,
            NotificationModel notification, String phoneAppPackageName) {
        NotificationUtility.sendNotificationToGear(tag, context, notification.getId(),
                notification.getItemIdentifier(), notification.getMainText(),
                notification.getTextMessage(), notification.getCustomFieldOne(),
                notification.getCustomFieldTwo(), notification.isLaunchOnAccessory(),
                phoneAppPackageName);
    }

    private static byte[] getNotificationIcon(Context context) {
        Bitmap bitmap = BitmapFactory.decodeResource(context.getResources(),
                R.drawable.ic_launcher);
        ByteArrayOutputStream stream = new ByteArrayOutputStream();
        bitmap.compress(CompressFormat.PNG, 100, stream);
        byte[] bytes = stream.toByteArray();
        return bytes;
    }
}
