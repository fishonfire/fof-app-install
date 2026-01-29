class AppInstall {
  scheme: string
  appID: string
  timeout: number
  packageName: string
  operatingSystem: string
  queryParams: {
      key: string
      value: string
    }[]
  isPromptHidden: boolean;
  isAppOpened: boolean;

  constructor(scheme = 'example://', appID = '1234567890', packageName = 'com.example.app', timeout = 1000) {
    this.scheme = scheme
    this.appID = appID
    this.packageName = packageName
    this.operatingSystem = 'unknown'
    this.operatingSystem = this.getOperatingSystem()
    this.queryParams = []
    this.isPromptHidden = false;
    this.isAppOpened = false;
    this.timeout = timeout
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

  setTimeout(timeout: number) {
    this.timeout = timeout
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
    this.copyUrlToClipboard().then(() => {
      const os = this.getOperatingSystem()
      if (os === "Android") {
        return this.launchAppAndroid()
      } else if (os === "iOS") {
        return this.launchAppiOS()
      } else {
        return "unknown"
      }
    })
  }


  launchAppAndroid() {
    window.location.href = `intent://${this.scheme}${this.formatQueryParams()}/#Intent;scheme=${this.scheme};package=${this.packageName};end`

    return "android"
  }

  async copyUrlToClipboard() {
    const url = `${this.scheme}${this.formatQueryParams()}`

    return await this.copyTextToClipboard(url)
  }

  fallbackCopyTextToClipboard(text: string) {
    var textArea = document.createElement('textarea');
    textArea.value = text;
    // Avoid scrolling to bottom
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
    } catch (err) {}
    document.body.removeChild(textArea);
  }

  async copyTextToClipboard(text: string) {
    if (!navigator.clipboard) {
      this.fallbackCopyTextToClipboard(text);
      return new Promise((r) => setTimeout(r, 250));
    }
    return navigator.clipboard.writeText(text);
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
      if (this.isPromptHidden && this.isAppOpened) {
        return;
      }

      this.isPromptHidden = true;

      setTimeout(() => {
        if (this.isPromptHidden && !this.isAppOpened) {
          window.location.href = storeUrl;
          this.isAppOpened = true;
        }
      }, this.timeout); // Worth checking if 1 second is enough time to open app on other devices
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
