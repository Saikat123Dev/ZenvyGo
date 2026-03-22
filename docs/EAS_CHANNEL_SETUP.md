# EAS Build and Update Setup for ZenvyGo

This Expo app is configured for three EAS channels:

- `development`
- `preview`
- `production`

The repository setup lives in:

- `zenvyGo/eas.json`
- `zenvyGo/app.config.js`
- `zenvyGo/app.json`
- `zenvyGo/package.json`

## What is configured

### Build profiles

`zenvyGo/eas.json` defines:

- `development`
  - development client
  - internal distribution
  - `development` channel
- `preview`
  - internal distribution
  - `preview` channel
- `production`
  - store-ready profile
  - `production` channel

Each profile also sets:

- `environment`
- `APP_ENV`
- `EXPO_PUBLIC_APP_ENV`

## Update configuration

`zenvyGo/app.config.js` adds:

- `runtimeVersion` with the `appVersion` policy
- `updates.fallbackToCacheTimeout = 0`
- `updates.url` when `EXPO_PUBLIC_EAS_PROJECT_ID` is available
- `extra.eas.projectId` when `EXPO_PUBLIC_EAS_PROJECT_ID` is available

This keeps local development working even before the project is linked to EAS.

## Current project link

This app is already linked to an EAS project through:

```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "b793d572-74b7-4f29-9a86-3fa3f0cc60bf"
      }
    }
  }
}
```

If you need to verify or relink later:

```bash
cd /home/saikat/workspce/internship/vehical-assistant/zenvyGo
eas project:info
```

`EXPO_PUBLIC_EAS_PROJECT_ID` is now optional and acts only as an override.

## Suggested EAS environments

Create three EAS environments in Expo dashboard:

- `development`
- `preview`
- `production`

At minimum, add this only if you want an explicit override:

```bash
EXPO_PUBLIC_EAS_PROJECT_ID=your-project-id
```

Optionally also move per-environment API URLs there if needed.

## Common commands

### Development build

```bash
cd /home/saikat/workspce/internship/vehical-assistant/zenvyGo
npm run eas:build:development
```

### Preview build

```bash
cd /home/saikat/workspce/internship/vehical-assistant/zenvyGo
npm run eas:build:preview
```

### Production build

```bash
cd /home/saikat/workspce/internship/vehical-assistant/zenvyGo
npm run eas:build:production
```

### Publish updates

```bash
cd /home/saikat/workspce/internship/vehical-assistant/zenvyGo
npm run eas:update:development
npm run eas:update:preview
npm run eas:update:production
```

## Important Firebase note

This project currently uses one Firebase Android app with package name:

```text
com.zenvygo.app
```

The EAS setup above keeps one package ID across all channels so the existing
`google-services.json` remains valid.
