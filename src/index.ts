class AppInstall {
  scheme: string
  appID: string
  packageName: string
  operatingSystem: string
  queryParams: {
      key: string
      value: string
    }[]
  isPromptHidden: boolean;
  isAppOpened: boolean;

  constructor(scheme = 'example://', appID = '1234567890', packageName = 'com.example.app') {
    this.scheme = scheme
    this.appID = appID
    this.packageName = packageName
    this.operatingSystem = 'unknown'
    this.operatingSystem = this.getOperatingSystem()
    this.queryParams = []
    this.isPromptHidden = false;
    this.isAppOpened = false;
  }

  setAppID(appID: string) {
    this.appID = appID
  }

  setScheme(scheme: string) {
    this.scheme = scheme
  }

  setPackageName(packageName: string) {
    this.packageName = packageName
  }

  setQueryParams(queryParams: { key: string, value: string }[]) {
    this.queryParams = queryParams
  }

  getOperatingSystem() {
    if (this.operatingSystem !== 'unknown' && this.operatingSystem !== undefined && this.operatingSystem !== null) {
      return this.operatingSystem
    }

    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera

    if (/android/i.test(userAgent)) {
      return "Android"
    }
    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
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
    window.location.href = `intent://${this.scheme}${this.formatQueryParams()}/#Intent;scheme=${this.scheme};package=${this.packageName};end`

    return "android"
  }

  copyUrlToClipboard() {
    const os = this.getOperatingSystem()
    let url
    if (os === "Android") {
      console.log('Copy to clibpoard android')
      const queryParamsString = this.formatQueryParams()
      url = `intent://open${queryParamsString}#Intent;scheme=${this.scheme};package=${this.packageName};end`
    } else if (os === "iOS") {
      url = `${this.scheme}${this.formatQueryParams()}`
    } else {
      url = 'URL not available for this OS'
    }

    var dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.value = url;

    if (os === 'iOS') {
      dummy.contentEditable = 'true';
      dummy.readOnly = true;
      var range = document.createRange();
      range.selectNodeContents(dummy);
      var selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      dummy.setSelectionRange(0, 999999);
    }
    else {
      dummy.select();
    }

    document.execCommand("copy");
    document.body.removeChild(dummy);
  }

  handleVisibilityChange(): void {
    if (document.hidden) {
      console.log('[handleVisibilityChange] Page is in the background or hidden');
      this.isAppOpened = true;
    }
  }

  launchAppiOS(): string {
    this.isPromptHidden = false;
    this.isAppOpened = false;

    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    const appUrl = `${this.scheme}${this.formatQueryParams()}`;
    const storeUrl = `https://apps.apple.com/app/id${this.appID}`;

    window.location.href = appUrl;

    window.addEventListener('focus', () => {
      console.log('[focus]');

      if (this.isPromptHidden && this.isAppOpened) {
        console.log('[focus] App was already previously opened - exit');
        return;
      }

      this.isPromptHidden = true;

      setTimeout(() => {
        if (this.isPromptHidden && !this.isAppOpened) {
          console.log('[focus][timeout] Redirecting to store');
          window.location.href = storeUrl;
          this.isAppOpened = true;
        }
      }, 1000); // Worth checking if 1 second is enough time to open app on other devices
    });

    return "iOS";
  }

  formatQueryParams() {
    if (this.queryParams.length === 0) {
      return ''
    }

    let queryParamsString = '?'
    this.queryParams.forEach((param, index) => {
      queryParamsString += `${param.key}=${param.value}`
      if (index < this.queryParams.length - 1) {
        queryParamsString += '&'
      }
    })

    return queryParamsString
  }
}

export default AppInstall
