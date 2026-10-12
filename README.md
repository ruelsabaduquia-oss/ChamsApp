# StoreCount Inventory

Mobile-first inventory counting app for convenience store SKU counts.

## Workflow

1. Upload a CSV with `SKU Code` and `Description`, plus optional `Qty`, or add SKU manually.
2. Search and select a SKU.
3. Enter quantity manually, use stepper buttons, or scan item barcodes to increment the count.
4. Save the count or clear the quantity back to zero.
5. Export the report as CSV with `SKU Code`, `Description`, and `Quantity`.

## Run

Open `index.html` in a browser, or serve this folder locally for camera scanner and install support.

```powershell
node server.js
```

Then open `http://localhost:4173`.

## Android Install Notes

This app now includes an Android Studio wrapper project in `android/`, so it can be built as a standalone APK.

Recommended Android paths:

1. APK install: open the `android/` folder in Android Studio and build the APK.
2. PWA install: host the folder on HTTPS, open the URL in Chrome, then use **Add to Home screen** or **Install app**.

The camera barcode scanner requires browser camera permission and Android Chrome support for `BarcodeDetector`. If the target device does not support it, the manual quantity input and stepper controls still work.
