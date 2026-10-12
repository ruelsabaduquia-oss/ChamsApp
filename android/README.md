# StoreCount Android App

This Android project wraps the inventory web app as a standalone WebView app.

## Build in Android Studio

1. Install Android Studio with Android SDK 35 or newer.
2. Open the `android` folder as an existing project.
3. Let Android Studio sync Gradle.
4. Build APK with **Build > Build App Bundle(s) / APK(s) > Build APK(s)**.

The app loads the bundled files from `app/src/main/assets/www`, so it can run offline after installation.

Before building after web UI changes, run:

```powershell
.\sync-web-assets.ps1
```

## Notes

- Manual SKU upload, counting, saving, clearing, and CSV report export are bundled in the app.
- Camera permission is configured for barcode scanning.
- Barcode scanning depends on Android System WebView support for browser barcode APIs. Manual counting remains available on every Android device.
