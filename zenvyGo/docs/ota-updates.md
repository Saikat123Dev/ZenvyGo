# OTA Updates for ZenvyGo

ZenvyGo uses Expo EAS Update with `expo-updates`.

## Current setup

- Update channels are defined in `eas.json`: `development`, `preview`, `production`
- Update URL is resolved from the EAS project ID in `app.config.js`
- `runtimeVersion` uses the `appVersion` policy
- OTA checks happen automatically on app launch
- The app also checks again when it returns to the foreground after a longer pause

## Important rule

Because `runtimeVersion` is tied to `expo.version`, you must bump `expo.version` in `app.json` before any new native release.

Do this whenever the native runtime changes, for example:

- adding or removing an Expo/native module
- changing config plugins
- changing native permissions or native app config that requires a rebuild
- shipping a new App Store / Play Store binary that should not receive older OTA bundles

If you do not bump `expo.version`, different store binaries may keep sharing the same runtime version and can receive OTA updates that were built for a different native layer.

## One-time setup check

Run this once if the project was not already configured:

```bash
eas update:configure
```

ZenvyGo already contains the expected Expo update config, so you should not need to rerun this unless the project is re-created.

## Native release flow

1. Bump `expo.version` in `app.json`.
2. Build the new binary with the matching EAS profile.
3. Submit that build to testers or stores.

Examples:

```bash
npm run eas:build:preview
npm run eas:build:production
```

## OTA release flow

Only use OTA updates for JavaScript, styling, asset, and Expo-managed logic changes that do not require a native rebuild.

Examples:

```bash
npm run eas:update:preview
npm run eas:update:production
```

These commands publish to the channel configured in `eas.json`, so a `production` build only receives `production` updates.

## Testing OTA correctly

1. Install a real EAS build, not Expo Go.
2. Publish an update to the same channel as that build.
3. Fully close the app and reopen it.
4. Reopen once more if needed.

Expo's default launch behavior downloads the update on one launch and applies it on the next launch unless you manually call `Updates.reloadAsync()`.

## In-app verification

Open the About screen in the app and verify:

- environment
- OTA enabled/disabled state
- channel
- runtime version
- launch source
- update ID

If the channel or runtime version is not what you expect, the OTA publish will not target that build.

## Optional hardening

For production, consider enabling Expo update code signing so only signed manifests are accepted by the app.
