# fof-app-install
FoF app install is a simple to use package to detect and deeplink to a app. App does not exist on device? Redirect to store page.

## Installation

Install fof-app-install with npm or yarn

```bash
  npm i https://github.com/fishonfire/fof-app-install.git
```
```
  yarn add https://github.com/fishonfire/fof-app-install.git
```

## Usage
Import the package and construct the class to use.

``` typescript
import AppInstall from "fof-app-install"
```

And then initialize it.

``` typescript
const app = new AppInstall()

// Optionally set custom properties if different from defaults
app.setScheme('custom_uri://')
app.setAppID('0000000000')
app.setPackageName('com.custom.package')
```

And lastly you can add a event listener or use a different method to trigger launching your app.

``` typescript
// Example using event listener on click.
document.getElementById('launchApp').addEventListener('click', () => {
    const result = app.launchApp()
})
```

To allow deeplinking you can add query params which will be added to the launch app url for both Android and iOS.

``` typescript
app.setQueryParams([{key: 'id', value: '123'}, {key: 'name', value: 'John Doe'}])
```

If you are going to use this package for deeplinking and want to allow deeplinking on first start up you can make use of the copyUrlToClipboard method.
This method allows copying the deeplink which is created via the queryParams array to the clipboard. The clipboard can be retrieved on first startup of the app and solve the deeplink.

``` typescript
const result = app.copyUrlToClipboard()

// Result returns the copied url. You can use this to verify if the input is correct.
console.log(result)
```
