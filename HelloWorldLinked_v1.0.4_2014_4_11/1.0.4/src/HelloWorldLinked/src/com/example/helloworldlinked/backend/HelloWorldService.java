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

package com.example.helloworldlinked.backend;

import android.app.Service;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.content.pm.PackageManager;
import android.os.Binder;
import android.os.Bundle;
import android.os.Handler;
import android.os.IBinder;
import android.os.Message;
import android.os.Messenger;
import android.os.RemoteException;

import com.example.helloworldlinked.models.NotificationModel;
import com.example.helloworldlinked.utils.Utility;

import org.json.JSONException;
import org.json.JSONObject;

import java.lang.ref.WeakReference;

public class HelloWorldService extends Service {
    private static final String TAG = HelloWorldService.class.getSimpleName();
    private static final String HELLO_WORLD_PROVIDER_PACKAGE_NAME = "com.samsung.smcl.helloworldprovider";
    private static final String HELLO_WORLD_PROVIDER_SERVICE_NAME = "com.samsung.smcl.example.helloworldprovider.backend.HelloWorldProviderService";
    private static final String BUNDLE_DATA = "bundle_data";
    private static final int MSG_REGISTER_CLIENT = 1;
    private static final int MSG_UNREGISTER_CLIENT = 2;
    private static final int MSG_TO_HELLOWORLDPROVIDERSERVICE = 3;
    private static final int MSG_TO_HELLOWORLDSERVICE = 4;
    private static final int MSG_NOTIFICATION = 5;

    private final Messenger mMessenger = new Messenger(new IncomingHandler(this));
    private Messenger mProviderMessenger = null;
    private boolean mBound = false;
    private MessageReceiver messageReceiver;

    public static final int TYPE_CONNECTION_STATUS = 0;
    public static final int TYPE_HEARTBEAT_COUNT = 1;
    public static final int TYPE_STEPS_COUNT = 2;
    public static final int TYPE_TEXT = 3;
    public static final int TYPE_FILE_PATH = 4;
    public static final int TYPE_ERROR = 5;
    public static final int TYPE_RESET = 6;

    private ServiceConnection mConnection = new ServiceConnection() {

        @Override
        public void onServiceDisconnected(ComponentName name) {
            Utility.logDebug(TAG, "onServiceDisconnected");
            mProviderMessenger = null;
            mBound = false;
        }

        @Override
        public void onServiceConnected(ComponentName name, IBinder service) {
            mProviderMessenger = new Messenger(service);

            Message msg = Message.obtain(null, MSG_REGISTER_CLIENT, 0, 0);
            msg.replyTo = mMessenger;
            try {
                Utility.logDebug(TAG, "Send the Message(MSG_REGISTER_CLIENT) to provider service");
                mProviderMessenger.send(msg);
            } catch (RemoteException e) {
                e.printStackTrace();
            }
            mBound = true;
            Utility.logDebug(TAG, "onServiceConnected: bound to provider service");
        }
    };

    static class IncomingHandler extends Handler {
        private final WeakReference<HelloWorldService> mService;

        IncomingHandler(HelloWorldService service) {
            mService = new WeakReference<HelloWorldService>(service);
        }

        @Override
        public void handleMessage(Message msg) {
            Utility.logDebug(TAG, "handleMessage: receive msg from provider service");
            HelloWorldService service = mService.get();
            if (service != null) {
                service.handleMessage(msg);
            } else {
                Utility.logError(TAG, "service is null, discard message");
            }
        }
    }

    private boolean isProviderInstalled() {
        PackageManager pm = getPackageManager();

        try {
            pm.getPackageInfo(HELLO_WORLD_PROVIDER_PACKAGE_NAME, PackageManager.GET_SERVICES);
            return true;
        } catch (PackageManager.NameNotFoundException e) {
            return false;
        }
    }

    private void bindToProviderService(Context context) {
        Utility.logDebug(TAG, "bindToProviderService");
        Intent intent = new Intent(HELLO_WORLD_PROVIDER_SERVICE_NAME);
        context.bindService(intent, mConnection, Context.BIND_AUTO_CREATE);
    }

    private void unbindFromProviderService(Context context) {
        context.unbindService(mConnection);
    }

    @Override
    public void onCreate() {
        Utility.logDebug(TAG, "onCreate");
        super.onCreate();
        boolean isInstalled = isProviderInstalled();
        if (isInstalled) {
            Utility.logDebug(TAG, "provider is installed");
            bindToProviderService(getApplicationContext());
        }
        else {
            Utility.logDebug(TAG, "provider is not installed");
            // provider is not there, do nothing
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Utility.logDebug(TAG, "receive request(bind) from provider");
        if (mBound == false) {
            bindToProviderService(getApplicationContext());
        }
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        Utility.logDebug(TAG, "onDestroy");
        if (mBound) {
            unbindFromProviderService(getApplicationContext());
        }
        super.onDestroy();
    }

    public interface MessageReceiver {
        void onMessageReceived(String str);

        void onHeartbeatsReceived(int num);

        void onStepsReceived(int num);

        void setImage(String path);

        void onConnectionStatusReceived(boolean isConnected);
    }

    public void registerReceiver(MessageReceiver receiver) {
        this.messageReceiver = receiver;
    }

    private final IBinder mBinder = new LocalBinder();

    public class LocalBinder extends Binder {
        public HelloWorldService getService() {
            return HelloWorldService.this;
        }
    }

    @Override
    public IBinder onBind(Intent arg0) {
        Utility.logDebug(TAG, "onBind: return HelloWorldService.this");
        return mBinder;
    }

    public void handleMessage(Message msg) {
        switch (msg.what) {
            case MSG_TO_HELLOWORLDSERVICE:
                Utility.logDebug(TAG, "MSG_TO_HELLOWORLDSERVICE");
                if (messageReceiver != null) {
                    parseMessage(msg);
                }
                break;
            case MSG_REGISTER_CLIENT:
                Utility.logDebug(TAG, "MSG_REGISTER_CLIENT");
                mProviderMessenger = msg.replyTo;
                break;
            case MSG_UNREGISTER_CLIENT:
                Utility.logDebug(TAG, "MSG_UNREGISTER_CLIENT");
                mProviderMessenger = null;
                break;
            default:
                Utility.logError(TAG, "Unsupported message");
                break;
        }
    }

    public void parseMessage(Message message) {
        Utility.logDebug(TAG, "parsing Message");
        Bundle data = message.getData();
        String str = data.getString(BUNDLE_DATA);
        try {
            JSONObject jObj = new JSONObject(str);
            int type = jObj.getInt("type");
            if (type == TYPE_FILE_PATH) {
                String fileName = jObj.getString("filename");
                Utility.logDebug(TAG, "fileName = " + fileName);
                messageReceiver.setImage(fileName);
            }
            else if (type == TYPE_CONNECTION_STATUS) {
                boolean isConnected = jObj.getBoolean("connection");
                Utility.logDebug(TAG, "isConnected = " + isConnected);
                messageReceiver.onConnectionStatusReceived(isConnected);
            }
            else if (type == TYPE_HEARTBEAT_COUNT) {
                int count = jObj.getInt("heartbeat");
                Utility.logDebug(TAG, "heartbeat count = " + Integer.toString(count));
                messageReceiver.onHeartbeatsReceived(count);
            }
            else if (type == TYPE_STEPS_COUNT) {
                int count = jObj.getInt("steps");
                Utility.logDebug(TAG, "steps count = " + Integer.toString(count));
                messageReceiver.onStepsReceived(count);
            }
            else if (type == TYPE_TEXT) {
                String text = jObj.getString("text");
                Utility.logDebug(TAG, "text = " + text);
                messageReceiver.onMessageReceived(text);
            }
            else {
                Utility.logError(TAG, "unsupported type (" + type + ")");
            }

        } catch (JSONException e) {
            Utility.logError(TAG, "", e);
        }
    }

    private JSONObject createTextJSONObject(String str) {
        JSONObject jObj = new JSONObject();
        try {
            jObj.put("type", TYPE_TEXT);
            jObj.put("text", str);
        } catch (JSONException e) {
            Utility.logError(TAG, "", e);
        }
        return jObj;
    }

    private JSONObject createResetJSONObject() {
        JSONObject jObj = new JSONObject();
        try {
            jObj.put("type", TYPE_RESET);
        } catch (JSONException e) {
            Utility.logError(TAG, "", e);
        }
        return jObj;
    }

    public void sendMessage(String textMessage) {
        JSONObject jObj = createTextJSONObject(textMessage);
        Bundle providerData = new Bundle(1);
        providerData.putString(BUNDLE_DATA, jObj.toString());
        Message providerMsg = Message.obtain(null, MSG_TO_HELLOWORLDPROVIDERSERVICE, 0, 0);
        providerMsg.setData(providerData);

        sendToProviderService(providerMsg);
    }

    public void sendResetCountMessage() {
        JSONObject jObj = createResetJSONObject();
        Bundle providerData = new Bundle(1);
        providerData.putString(BUNDLE_DATA, jObj.toString());
        Message providerMsg = Message.obtain(null, MSG_TO_HELLOWORLDPROVIDERSERVICE, 0, 0);
        providerMsg.setData(providerData);

        sendToProviderService(providerMsg);
    }

    public void sendAccessoryNotificationMessage(NotificationModel notification) {
        if (notification == null) {
            Utility.logWarning(TAG, "Not sending null notification");
            return;
        }
        Message message = Message.obtain(null, MSG_NOTIFICATION);
        Bundle bundle = notification.createBundle();
        message.setData(bundle);
        sendToProviderService(message);
    }

    private boolean sendToProviderService(Message message) {
        if (mProviderMessenger == null) {
            Utility.logError(TAG, "mProviderMessenger is null, return false");
            return false;
        }

        try {
            Utility.logDebug(TAG, "send message to provider");
            mProviderMessenger.send(message);
        } catch (RemoteException e) {
            Utility.logError(TAG, e, "");
            return false;
        }

        return true;
    }
}
