class AppInstall {
  constructor(scheme = 'yourapp://', appID = '1234567890', packageName = 'com.example.yourapp') {
    this.scheme = scheme
    this.appID = appID
    this.packageName = packageName
    this.operatingSystem = 'unknown'
    this.operatingSystem = this.getOperatingSystem()
  }

  setScheme(scheme) {
    this.scheme = scheme
  }

  setAppID(appID) {
    this.appID = appID
  }

  setPackageName(packageName) {
    this.packageName = packageName
  }

  getOperatingSystem() {
    if (this.operatingSystem !== 'unknown' && this.operatingSystem !== undefined && this.operatingSystem !== null) {
      return this.operatingSystem
    }

    const userAgent = navigator.userAgent || navigator.vendor || window.opera

    if (/android/i.test(userAgent)) {
      return "Android"
    }
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      return "iOS"
    }

    return "unknown"
  }

  launchApp() {
    const os = this.getOperatingSystem()
    if (os === "Android") {
      return this.launchAppAndroid()
    } else if (os === "iOS") {
      return this.launchAppiOS()
    } else {
      return "unknown"
    }
  }

  launchAppAndroid() {
    window.location.href = `intent://${this.scheme}/#Intent;scheme=${this.scheme};package=${this.packageName};end`
    return "android"
  }

  launchAppiOS() {
    const appStoreUrl = `https://apps.apple.com/app/id${this.appID}`
    window.location = this.scheme

    setTimeout(() => {
      // If the user is still here, open the App Store
      window.location = appStoreUrl
    }, 2500)  // Adjust timeout as needed

    return "iOS"
  }
}

export default AppInstall
