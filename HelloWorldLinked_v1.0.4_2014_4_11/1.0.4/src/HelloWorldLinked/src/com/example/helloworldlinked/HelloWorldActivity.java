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

package com.example.helloworldlinked;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Bundle;
import android.os.CountDownTimer;
import android.os.IBinder;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.RadioButton;
import android.widget.TextView;
import android.widget.Toast;

import com.example.helloworldlinked.backend.HelloWorldService;
import com.example.helloworldlinked.backend.HelloWorldService.LocalBinder;
import com.example.helloworldlinked.backend.HelloWorldService.MessageReceiver;
import com.example.helloworldlinked.models.NotificationModel;
import com.example.helloworldlinked.utils.Utility;
import com.samsung.smcl.helloworldlinked.R;

import java.io.File;

public class HelloWorldActivity extends Activity implements MessageReceiver, OnClickListener {
    private static final String TAG = HelloWorldActivity.class.getSimpleName();

    private static final int DEFAULT_COUNTDOWN_TIMER_LENGTH = 5000;

    private HelloWorldService mHelloWorldService;
    private AlertDialog dialog;

    private TextView connectionStatus;
    private TextView receivedMessage;
    private TextView stepsCount;
    private TextView heartbeatCountText;
    private TextView noImage;
    private ImageView image;
    private EditText providerMessage;
    private EditText notifId;
    private EditText notifItemIdentifier;
    private EditText notifMainText;
    private EditText notifMessage;
    private EditText notifCustomFieldOne;
    private EditText notifCustomFieldTwo;
    private RadioButton notifLaunchOnGear;

    private boolean mIsBound = false;
    private boolean mTimerHasStarted;
    private boolean mIsConnected = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Utility.logDebug(TAG, "onCreate");
        setContentView(R.layout.activity_hello_world_linked);

        connectionStatus = (TextView) findViewById(R.id.connection_status);
        receivedMessage = (TextView) findViewById(R.id.received_message_text);
        stepsCount = (TextView) findViewById(R.id.steps_count);
        heartbeatCountText = (TextView) findViewById(R.id.heartbeat_count);
        image = (ImageView) findViewById(R.id.image);
        noImage = (TextView) findViewById(R.id.text_no_image);
        providerMessage = (EditText) findViewById(R.id.send_message_text);
        notifId = (EditText) findViewById(R.id.notif_id);
        notifItemIdentifier = (EditText) findViewById(R.id.notif_item_identifier);
        notifMainText = (EditText) findViewById(R.id.notif_main_text);
        notifMessage = (EditText) findViewById(R.id.notif_message);
        notifCustomFieldOne = (EditText) findViewById(R.id.notif_custom_field_one);
        notifCustomFieldTwo = (EditText) findViewById(R.id.notif_custom_field_two);
        notifLaunchOnGear = (RadioButton) findViewById(R.id.notif_launch_on_gear);

        Button sendMessage = (Button) findViewById(R.id.send_message);
        sendMessage.setOnClickListener(this);
        Button sendAccessoryNotification = (Button) findViewById(R.id.send_accessory_notification);
        sendAccessoryNotification.setOnClickListener(this);
        Button sendSystemNotification = (Button) findViewById(R.id.send_system_notification);
        sendSystemNotification.setOnClickListener(this);
        Button reset = (Button) findViewById(R.id.reset);
        reset.setOnClickListener(this);

        dialog = new AlertDialog.Builder(this).create();

        doBindToHelloWorldService();
    }

    @Override
    protected void onResume() {
        super.onResume();
    }

    @Override
    protected void onPause() {
        super.onPause();
    }

    @Override
    protected void onDestroy() {
        Utility.logDebug(TAG, "onDestroy");
        doUnbindFromHelloWorldService();
        stopService(new Intent(this, HelloWorldService.class));
        super.onDestroy();
    }

    private ServiceConnection mConnection = new ServiceConnection() {

        @Override
        public void onServiceConnected(ComponentName className, IBinder service) {
            LocalBinder binder = (LocalBinder) service;
            mHelloWorldService = binder.getService();
            mHelloWorldService.registerReceiver(HelloWorldActivity.this);
            mIsBound = true;
            Utility.logInfo(TAG, "Service attached to %s ", className.getClassName());
        }

        @Override
        public void onServiceDisconnected(ComponentName className) {
            mHelloWorldService = null;
            mIsBound = false;
        }
    };

    void doBindToHelloWorldService() {
        Utility.logInfo(TAG, "doBindToHelloWorldService");
        bindService(new Intent(this, HelloWorldService.class), mConnection,
                Context.BIND_AUTO_CREATE);
    }

    void doUnbindFromHelloWorldService() {
        Utility.logInfo(TAG, "doUnbindFromHelloWorldService");
        if (mIsBound) {
            unbindService(mConnection);
            mIsBound = false;
        }
    }

    @Override
    public void onConnectionStatusReceived(final boolean isConnected) {
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                mIsConnected = isConnected;
                if (mIsConnected) {
                    connectionStatus.setText(R.string.connected);
                    connectionStatus
                            .setBackgroundColor(getResources().getColor(R.color.green));
                }
                else {
                    connectionStatus.setText(R.string.disconnected);
                    connectionStatus
                            .setBackgroundColor(getResources().getColor(R.color.red));
                }
            }
        });
    }

    @Override
    public void onMessageReceived(final String consumerMessage) {
        Utility.logDebug(TAG, consumerMessage);
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                receivedMessage.setText(consumerMessage);
            }
        });

    }

    @Override
    public void onHeartbeatsReceived(final int count) {
        Utility.logDebug(TAG, "onHeartbeatCountReceived: %s", Integer.toString(count));
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                heartbeatCountText.setText(Integer.toString(count));
            }
        });
    }

    @Override
    public void onStepsReceived(final int count) {
        Utility.logDebug(TAG, "onStepCountReceived: %s", Integer.toString(count));
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                stepsCount.setText(Integer.toString(count));
            }
        });
    }

    @Override
    public void setImage(final String path) {
        Utility.logDebug(TAG, "setImage, path=%s", path);
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                File file = new File(path);
                if (file.exists()) {
                    Bitmap bitmap = BitmapFactory.decodeFile(file.getAbsolutePath());
                    image.setImageBitmap(bitmap);
                    noImage.setVisibility(View.GONE);
                }

            }
        });
    }

    @Override
    public void onClick(View v) {
        switch (v.getId()) {
            case R.id.send_message:
                String text = providerMessage.getText().toString();
                Utility.logDebug(TAG, "Send message clicked. Text is \"%s\"", text);
                mHelloWorldService.sendMessage(text);
                break;
            case R.id.reset:
                if (mIsConnected) {
                    mHelloWorldService.sendResetCountMessage();
                    onHeartbeatsReceived(0);
                    onStepsReceived(0);
                    break;
                }
                Toast.makeText(this, R.string.reset_count_failure, Toast.LENGTH_LONG).show();
                break;
            case R.id.send_accessory_notification:
                startNotificationTimer(NOTIFICATION_TYPE.ACCESSORY);
                break;
            case R.id.send_system_notification:
                startNotificationTimer(NOTIFICATION_TYPE.SYSTEM);
                break;
            default:
                break;
        }
    }

    private enum NOTIFICATION_TYPE {
        SYSTEM,
        ACCESSORY,
    }

    private void startNotificationTimer(NOTIFICATION_TYPE type) {
        if (mTimerHasStarted) {
            dialog.show();
            return;
        }

        dialog.setTitle("Notification Countdown");
        dialog.setMessage("");
        dialog.show();
        notificationTimer.setNotificationType(type);
        notificationTimer.start();
        mTimerHasStarted = true;
    }

    private NotificationCountDownTimer notificationTimer = new NotificationCountDownTimer(
            DEFAULT_COUNTDOWN_TIMER_LENGTH, 500);

    private class NotificationCountDownTimer extends CountDownTimer {
        private NOTIFICATION_TYPE type = NOTIFICATION_TYPE.ACCESSORY;

        public NotificationCountDownTimer(long millisInTheFuture, long countDownInterval) {
            super(millisInTheFuture, countDownInterval);
        }

        @Override
        public void onTick(long millisUntilFinished) {
            if (dialog == null) {
                return;
            }

            long timeRemaining = Math.round((double) millisUntilFinished / 1000);
            String format = getString((type == NOTIFICATION_TYPE.ACCESSORY) ? R.string.notif_accessory_text
                    : R.string.notif_system_text);
            dialog.setMessage(String.format(format, timeRemaining, getString(R.string.app_name)));
        }

        @Override
        public void onFinish() {
            Utility.logDebug(TAG, "Countdown complete: Sending notification broadcast");

            if (type == NOTIFICATION_TYPE.ACCESSORY) {
                String mainText = notifMainText.getText().toString();
                String message = notifMessage.getText().toString();
                String customFieldOne = notifCustomFieldOne.getText().toString();
                String customFieldTwo = notifCustomFieldTwo.getText().toString();

                String idText = notifId.getText().toString();
                int id = idText.equals("") ? -1 : Integer.parseInt(idText);

                String itemIdentifierText = notifItemIdentifier.getText().toString();
                int itemIdentifier = itemIdentifierText.equals("") ? -1 : Integer
                        .parseInt(itemIdentifierText);

                boolean launchOnAccessory = notifLaunchOnGear.isChecked();

                NotificationModel notification = new NotificationModel(id, itemIdentifier,
                        mainText, message, customFieldOne, customFieldTwo, launchOnAccessory);
                mHelloWorldService.sendAccessoryNotificationMessage(notification);
            } else {
                createSystemNotification();
            }
            mTimerHasStarted = false;

            dismissDialog();
        }

        public void setNotificationType(NOTIFICATION_TYPE type) {
            this.type = type;
        }

        private void dismissDialog() {
            if (dialog != null && dialog.isShowing()) {
                dialog.dismiss();
            }
        }
    };

    /**
     * Create an <b>Android system notification</b>. This will be sent to the
     * Gear if the following conditions are met:
     * <ul>
     * <li>The application does NOT declare uses-permission
     * "com.samsung.wmanager.APP"</li>
     * <li>The application does NOT declare uses-permission
     * "com.samsung.wmanager.ENABLE_NOTIFICATION"</li>
     * <li>The app is selected in Gear Manager -> Notification</li>
     * <li>The phone screen is off
     * </ul>
     */
    private void createSystemNotification() {
        Utility.logDebug(TAG, "createSystemNotification");
        NotificationManager notificationManager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        Intent intent = new Intent(this, HelloWorldActivity.class);
        PendingIntent pIntent = PendingIntent.getActivity(this, 0, intent, 0);

        Notification n = new Notification.Builder(this).setContentTitle("Title")
                .setContentText("Text")
                .setTicker("Ticker")
                .setSmallIcon(R.drawable.ic_launcher)
                .setLargeIcon(BitmapFactory.decodeResource(getResources(), R.drawable.ic_launcher))
                .setContentIntent(pIntent)
                .setAutoCancel(true)
                .build();

        notificationManager.notify(0, n);
    }
}
