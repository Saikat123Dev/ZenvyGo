# Android Firebase Setup for ZenvyGo

This project uses Expo managed workflow with `@react-native-firebase/app` and `@react-native-firebase/auth`.

That means Android Firebase should be configured through Expo config, not by manually editing a generated `android/` folder unless you intentionally keep native folders in the repo.

## Verified Project Values

- Firebase project ID: `zenvygov`
- Android package name: `com.zenvygo.app`
- Android client config file: `zenvyGo/google-services.json`
- Expo config entry: `expo.android.googleServicesFile = "./google-services.json"`

The checked `google-services.json` matches the current Android package:

```json
{
  "project_info": {
    "project_id": "zenvygov"
  },
  "client": [
    {
      "client_info": {
        "android_client_info": {
          "package_name": "com.zenvygo.app"
        }
      }
    }
  ]
}
```

## Correct File Locations

### Android client config

Place the Firebase Android config here:

```text
/home/saikat/workspce/internship/vehical-assistant/zenvyGo/google-services.json
```

Do not place it in `server/`.
Do not rely on `zenvyGo/android/app/google-services.json` unless you are working in a generated native project.

### iOS client config

If you later enable Firebase on iOS, place:

```text
/home/saikat/workspce/internship/vehical-assistant/zenvyGo/GoogleService-Info.plist
```

### Server Admin credentials

The backend must use a Firebase Admin service account JSON, not the mobile app's `google-services.json`.

Recommended server path:

```text
/home/saikat/workspce/internship/vehical-assistant/server/firebase-service-account.json
```

## Expo Configuration

The mobile app now points to the correct Android config file in [app.json](/home/saikat/workspce/internship/vehical-assistant/zenvyGo/app.json).

Relevant shape:

```json
{
  "expo": {
    "android": {
      "package": "com.zenvygo.app",
      "googleServicesFile": "./google-services.json"
    },
    "plugins": [
      "@react-native-firebase/app"
    ]
  }
}
```

Expo copies `google-services.json` into the generated Android project during prebuild/EAS build.

## Android Verification Steps

Run these from the repo root.

### 1. Check the file exists in the Expo app

```bash
ls -la /home/saikat/workspce/internship/vehical-assistant/zenvyGo/google-services.json
```

### 2. Verify the package name inside the file

```bash
python3 - <<'PY'
import json
from pathlib import Path

path = Path('/home/saikat/workspce/internship/vehical-assistant/zenvyGo/google-services.json')
data = json.loads(path.read_text())
client = data['client'][0]
print('project_id =', data['project_info']['project_id'])
print('package_name =', client['client_info']['android_client_info']['package_name'])
PY
```

Expected values:

```text
project_id = zenvygov
package_name = com.zenvygo.app
```

### 3. Generate Android native files from Expo config

```bash
cd /home/saikat/workspce/internship/vehical-assistant/zenvyGo
npx expo prebuild --platform android --no-install
```

If this succeeds, Expo has enough information to wire Firebase into Android.

### 4. Confirm the generated Android project received the file

```bash
ls -la /home/saikat/workspce/internship/vehical-assistant/zenvyGo/android/app/google-services.json
```

### 5. Run the app

```bash
cd /home/saikat/workspce/internship/vehical-assistant/zenvyGo
npm run android
```

## Server Verification

The backend verifies Firebase ID tokens in [firebase-admin.ts](/home/saikat/workspce/internship/vehical-assistant/server/src/shared/config/firebase-admin.ts).

Important points:

- `server/FirebaseConfig.ts` is not used by the backend startup path.
- `google-services.json` is a client config file and is not valid for `firebase-admin`.
- The backend only initializes Firebase Admin when `OTP_DRIVER=firebase`.

Your current local [server/.env](/home/saikat/workspce/internship/vehical-assistant/server/.env) is still set to:

```dotenv
OTP_DRIVER=mock
```

So the backend is not currently using Firebase Admin at runtime.

To enable backend Firebase token verification, set:

```dotenv
OTP_DRIVER=firebase
FIREBASE_PROJECT_ID=zenvygov
FIREBASE_CREDENTIALS_PATH=./firebase-service-account.json
```

Then place the Admin SDK service account JSON at:

```text
/home/saikat/workspce/internship/vehical-assistant/server/firebase-service-account.json
```

## Common Problems

### `processDebugGoogleServices` fails

Usually means one of these is wrong:

- `zenvyGo/google-services.json` is missing
- `expo.android.googleServicesFile` is missing or wrong
- the file's package name does not match `com.zenvygo.app`

### Firebase works on client but backend rejects the ID token

Usually means one of these is wrong:

- `OTP_DRIVER` is still `mock`
- `FIREBASE_PROJECT_ID` does not match `zenvygov`
- the backend is using the wrong JSON file type
- the backend service account belongs to a different Firebase project

### Confusion between Firebase files

Use the right file for the right layer:

- `google-services.json`: Android client app
- `GoogleService-Info.plist`: iOS client app
- `firebase-service-account.json`: backend `firebase-admin`
