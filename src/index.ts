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
  showLaunchAppModal: boolean;
  modalElement: HTMLDivElement | null = null;

  constructor(scheme = 'example://', appID = '1234567890', packageName = 'com.example.app', timeout = 1000, debugDiv = null, showLaunchAppModal = false) {
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
    this.showLaunchAppModal = showLaunchAppModal;
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

  setShowLaunchAppModal(showLaunchAppModal: boolean) {
    this.showLaunchAppModal = showLaunchAppModal
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
    
    if (this.showLaunchAppModal) {
      this.createModal();
      this.showModal('Momentje, we gaan aan de slag...');
    }
    
    this.copyUrlToClipboard().then(() => {
      this.addDebugMessage('[launchApp] URL copied to clipboard');
      const os = this.getOperatingSystem()
      this.addDebugMessage('[launchApp] Detected operating system: ' + os);
      
      if (this.showLaunchAppModal) {
        this.updateModal(`Ah, je gebruikt ${os}!`);
      }
      
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
    if (this.showLaunchAppModal) {
      this.updateModal('App wordt geopend...');
    }
    
    window.location.href = `intent://${this.scheme}${this.formatQueryParams()}/#Intent;scheme=${this.scheme};package=${this.packageName};end`

    this.addDebugMessage('[launchAppAndroid] Attempting to launch app with URL: ' + `intent://${this.scheme}${this.formatQueryParams()}/#Intent;scheme=${this.scheme};package=${this.packageName};end`);

    if (this.showLaunchAppModal) {
      setTimeout(() => this.hideModal(), 2000);
    }

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

    if (this.showLaunchAppModal) {
      this.updateModal('App wordt geopend...');
    }

    this.addDebugMessage('[launchAppiOS] Adding event listener for visibility change');
    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    const appUrl = `${this.scheme}${this.formatQueryParams()}`;
    const storeUrl = `https://apps.apple.com/app/id${this.appID}`;

    window.location.href = appUrl;

    setTimeout(() => {
      if (!this.isAppOpened) {
        this.addDebugMessage('[launchAppiOS] App not opened, redirecting to App Store');
        if (this.showLaunchAppModal) {
          this.updateModal('Naar de App Store...');
        }
        window.location.href = storeUrl;
        this.addDebugMessage(`[launchAppiOS] Redirected to App Store with URL: ${storeUrl}`);
        this.isAppOpened = true;
      }
      
      if (this.showLaunchAppModal) {
        setTimeout(() => this.hideModal(), 1000);
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

  createModal() {
    if (this.modalElement) {
      return; // Modal already exists
    }

    // Create modal container
    const modal = document.createElement('div');
    modal.id = 'app-install-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;

    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background-color: white;
      padding: 30px;
      border-radius: 12px;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      text-align: center;
    `;

    // Create spinner
    const spinner = document.createElement('div');
    spinner.id = 'modal-spinner';
    spinner.style.cssText = `
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    `;

    // Add keyframes animation for spinner
    if (!document.getElementById('app-install-modal-styles')) {
      const style = document.createElement('style');
      style.id = 'app-install-modal-styles';
      style.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }

    // Create status text
    const statusText = document.createElement('div');
    statusText.id = 'modal-status-text';
    statusText.style.cssText = `
      font-size: 16px;
      color: #333;
      margin-bottom: 10px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    `;

    // Create platform text
    const platformText = document.createElement('div');
    platformText.id = 'modal-platform-text';
    platformText.style.cssText = `
      font-size: 14px;
      color: #666;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    `;

    // Assemble modal
    modalContent.appendChild(spinner);
    modalContent.appendChild(statusText);
    modalContent.appendChild(platformText);
    modal.appendChild(modalContent);

    this.modalElement = modal;
    document.body.appendChild(modal);

    // Trigger reflow to enable transition
    modal.offsetHeight;
  }

  showModal(message: string) {
    if (!this.modalElement) {
      this.createModal();
    }

    const statusText = this.modalElement?.querySelector('#modal-status-text') as HTMLDivElement;
    if (statusText) {
      statusText.textContent = message;
    }

    if (this.modalElement) {
      this.modalElement.style.opacity = '1';
    }

    this.addDebugMessage(`[showModal] Showing modal with message: ${message}`);
  }

  updateModal(message: string) {
    if (!this.modalElement) {
      return;
    }

    const os = this.getOperatingSystem();
    
    // Check if message contains platform info
    if (message.startsWith('Ah, je gebruikt')) {
      const platformText = this.modalElement.querySelector('#modal-platform-text') as HTMLDivElement;
      if (platformText) {
        platformText.textContent = message;
      }
      
      // Update status to show we're trying to open the app
      const statusText = this.modalElement.querySelector('#modal-status-text') as HTMLDivElement;
      if (statusText) {
        statusText.textContent = 'Alles klaar maken...';
      }
    } else if (message === 'App wordt geopend...') {
      const statusText = this.modalElement.querySelector('#modal-status-text') as HTMLDivElement;
      if (statusText) {
        statusText.textContent = message;
      }
      
      // Add timeout message for iOS
      if (os === 'iOS') {
        const platformText = this.modalElement.querySelector('#modal-platform-text') as HTMLDivElement;
        if (platformText) {
          platformText.textContent = `${platformText.textContent} - Nog geen app? Geen zorgen, dan gaan we naar de App Store!`;
        }
      }
    } else {
      const statusText = this.modalElement.querySelector('#modal-status-text') as HTMLDivElement;
      if (statusText) {
        statusText.textContent = message;
      }
    }

    this.addDebugMessage(`[updateModal] Updated modal with message: ${message}`);
  }

  hideModal() {
    if (!this.modalElement) {
      return;
    }

    this.modalElement.style.opacity = '0';

    setTimeout(() => {
      if (this.modalElement && this.modalElement.parentNode) {
        this.modalElement.parentNode.removeChild(this.modalElement);
        this.modalElement = null;
      }
    }, 300); // Wait for fade out transition

    this.addDebugMessage('[hideModal] Hiding modal');
  }
}

export default AppInstall
