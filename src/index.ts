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
  debugDiv: HTMLDivElement | null = null;

  constructor(scheme = 'example://', appID = '1234567890', packageName = 'com.example.app', timeout = 1000, debugDiv = null) {
    this.scheme = scheme
    this.appID = appID
    this.packageName = packageName
    this.operatingSystem = 'unknown'
    this.operatingSystem = this.getOperatingSystem()
    this.queryParams = []
    this.isPromptHidden = false;
    this.isAppOpened = false;
    this.timeout = timeout;
    this.debugDiv = debugDiv;
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
    this.addDebugMessage('[launchApp] Starting app launch process');
    this.copyUrlToClipboard().then(() => {
      this.addDebugMessage('[launchApp] URL copied to clipboard');
      const os = this.getOperatingSystem()
      this.addDebugMessage('[launchApp] Detected operating system: ' + os);
      if (os === "Android") {
        return this.launchAppAndroid()
      } else if (os === "iOS") {
        return this.launchAppiOS()
      } else {
        this.addDebugMessage('[launchApp] Stopped app launch process due to unknown operating system');
        return "unknown"
      }
    }).catch(() => {
      this.addDebugMessage('[launchApp] Error launching app');
      return "error";
    })
  }


  launchAppAndroid() {
    window.location.href = `intent://${this.scheme}${this.formatQueryParams()}/#Intent;scheme=${this.scheme};package=${this.packageName};end`

    this.addDebugMessage('[launchAppAndroid] Attempting to launch app with URL: ' + `intent://${this.scheme}${this.formatQueryParams()}/#Intent;scheme=${this.scheme};package=${this.packageName};end`);

    return "android"
  }

  async copyUrlToClipboard() {
    const url = `${this.scheme}${this.formatQueryParams()}`

    this.addDebugMessage('[copyUrlToClipboard] Starting to copy URL to clipboard: ' + url);

    return await this.copyTextToClipboard(url)
  }

  fallbackCopyTextToClipboard(text: string) {
    return new Promise<void>((resolve, reject) => {
      const textArea = document.createElement('textarea');
      textArea.value = text;

      textArea.style.position = 'fixed';
      textArea.style.top = '0';
      textArea.style.left = '0';
      textArea.style.opacity = '0';
      textArea.setAttribute('readonly', '');

      document.body.appendChild(textArea);

      textArea.focus();
      textArea.select();
      textArea.setSelectionRange(0, text.length);

      try {
        const ok = document.execCommand('copy');
        if (ok) {
          this.addDebugMessage(`[fallbackCopyTextToClipboard] Copied using fallback: ${text}`);
          resolve();
        } else {
          this.addDebugMessage(`[fallbackCopyTextToClipboard] execCommand returned false (copy likely blocked): ${text}`);
          reject(new Error('execCommand(copy) returned false'));
        }
      } catch (err) {
        this.addDebugMessage(`[fallbackCopyTextToClipboard] Exception during copy: ${String(err)}`);
        reject(err instanceof Error ? err : new Error(String(err)));
      } finally {
        document.body.removeChild(textArea);
      }
    });
  }

  async copyTextToClipboard(text: string) {
    if (!navigator.clipboard) {
      this.addDebugMessage('[copyTextToClipboard] Clipboard API not available, using fallback method');
      return await this.fallbackCopyTextToClipboard(text);
    }

    try {
      this.addDebugMessage('[copyTextToClipboard] Using Clipboard API to copy URL: ' + text);
      return await navigator.clipboard.writeText(text);
    } catch (err) {
      this.addDebugMessage('[copyTextToClipboard] Error using Clipboard API, using fallback method');
      return await this.fallbackCopyTextToClipboard(text);
    }
  }


  handleVisibilityChange(): void {
    if (document.hidden) {
      this.addDebugMessage('[handleVisibilityChange] Page is in the background or hidden');
      this.isAppOpened = true;
    }
  }

  launchAppiOS(): string {
    this.addDebugMessage('[launchAppiOS] Attempting to launch app with URL: ' + `${this.scheme}${this.formatQueryParams()}`);
    this.isAppOpened = false;


    this.addDebugMessage('[launchAppiOS] Adding event listener for visibility change');
    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    const appUrl = `${this.scheme}${this.formatQueryParams()}`;
    const storeUrl = `https://apps.apple.com/app/id${this.appID}`;

    window.location.href = appUrl;

    setTimeout(() => {
      if (!this.isAppOpened) {
        this.addDebugMessage('[launchAppiOS] App not opened, redirecting to App Store');
        window.location.href = storeUrl;
        this.addDebugMessage(`[launchAppiOS] Redirected to App Store with URL: ${storeUrl}`);
        this.isAppOpened = true;
      }
    }, this.timeout);

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

  addDebugMessage(message: string) {
    const debugInfo = `${new Date().toISOString()} | ${message}`;
    if (this.debugDiv) {
      const p = document.createElement('p');
      p.textContent = debugInfo;
      this.debugDiv.appendChild(p);
    } else {
      console.log(debugInfo);
    }
  }
}

export default AppInstall
