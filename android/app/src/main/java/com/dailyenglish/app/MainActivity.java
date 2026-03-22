package com.getcapacitor.myapp;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onStart() {
        super.onStart();
        TTSBridge ttsBridge = new TTSBridge(this);
        this.bridge.getWebView().addJavascriptInterface(ttsBridge, "AndroidTTS");
    }
}