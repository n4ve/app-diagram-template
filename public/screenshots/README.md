# Screenshot Guidelines

Place your page screenshots in this directory.

## Screenshot Types

### Phone Screenshots (`screenshotType: "phone"`)
- **Format**: PNG or JPG
- **Aspect Ratio**: 9:19.5 (mobile portrait)
- **Recommended Size**: 390x844 pixels (iPhone 14 size)
- **Alternative Sizes**: 
  - 375x812 (iPhone X/11/12/13 mini)
  - 414x896 (iPhone 11 Pro Max)
  - 428x926 (iPhone 14 Pro Max)

### Web Screenshots (`screenshotType: "web"`)
- **Format**: PNG or JPG
- **Aspect Ratio**: 16:9 or 16:10 (desktop/laptop)
- **Recommended Size**: 1920x1080 pixels (Full HD)
- **Alternative Sizes**:
  - 1366x768 (Common laptop)
  - 1440x900 (MacBook)
  - 2560x1440 (2K)

## Configuration in pages.json
```json
{
  "screenshot": "/screenshots/login.png",
  "screenshotType": "phone"  // or "web"
}
```

## Naming Convention:
- `login.png` - Login page screenshot
- `dashboard.png` - Dashboard page screenshot
- `orders.png` - Orders management page screenshot
- `products.png` - Products management page screenshot

## Tips:
- Phone screenshots should show mobile app interface
- Web screenshots should show desktop browser view
- Avoid including device status bars or browser UI
- Focus on the main content area
- Use consistent styling across all screenshots
- If no `screenshotType` is specified, defaults to "web"