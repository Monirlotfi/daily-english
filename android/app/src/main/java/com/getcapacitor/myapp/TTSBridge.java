package com.getcapacitor.myapp;

import android.content.Context;
import android.speech.tts.TextToSpeech;
import android.webkit.JavascriptInterface;
import java.util.Locale;

public class TTSBridge {
    private TextToSpeech tts;
    private boolean ready = false;

    public TTSBridge(Context context) {
        tts = new TextToSpeech(context, status -> {
            ready = status == TextToSpeech.SUCCESS;
        });
    }

    @JavascriptInterface
    public void speak(String text, String lang) {
        if (!ready) return;
        Locale locale = lang.startsWith("fr") ? Locale.FRENCH : Locale.ENGLISH;
        tts.setLanguage(locale);
        tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "tts");
    }

    @JavascriptInterface
    public void stop() {
        if (tts != null) tts.stop();
    }
}