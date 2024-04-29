class AppInstall {
  scheme
  appID
  packageName
  operatingSystem

  constructor(scheme = 'yourapp://', appID = '1234567890', packageName = 'com.example.yourapp') {
    this.scheme = scheme
    this.appID = appID
    this.packageName = packageName
    this.operatingSystem = 'unknown'
    this.operatingSystem = this.getOperatingSystem()
  }

  setAppID(appID) {
    this.appID = appID
  }

  setScheme(scheme) {
    this.scheme = scheme
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
    window.location.href = this.scheme
    
    setTimeout(() => {
      const appStoreUrl = `https://apps.apple.com/app/id${this.appID}`
      // If the user is still here, open the App Store
      window.location.href = appStoreUrl
    }, 250)

    return "iOS"
  }
}

export default AppInstall
