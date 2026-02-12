var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class AppInstall {
    constructor(scheme = 'example://', appID = '1234567890', packageName = 'com.example.app', timeout = 1000, debugDiv = null) {
        this.debugDiv = null;
        this.scheme = scheme;
        this.appID = appID;
        this.packageName = packageName;
        this.operatingSystem = 'unknown';
        this.operatingSystem = this.getOperatingSystem();
        this.queryParams = [];
        this.isPromptHidden = false;
        this.isAppOpened = false;
        this.timeout = timeout;
        this.debugDiv = debugDiv;
    }
    setAppID(appID) {
        this.appID = appID;
    }
    setScheme(scheme) {
        this.scheme = scheme;
    }
    setPackageName(packageName) {
        this.packageName = packageName;
    }
    setTimeout(timeout) {
        this.timeout = timeout;
    }
    setQueryParams(queryParams) {
        this.queryParams = queryParams;
    }
    getOperatingSystem() {
        if (this.operatingSystem !== 'unknown' && this.operatingSystem !== undefined && this.operatingSystem !== null) {
            return this.operatingSystem;
        }
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        if (/android/i.test(userAgent)) {
            return "Android";
        }
        if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
            return "iOS";
        }
        return "unknown";
    }
    launchApp() {
        this.addDebugMessage('[launchApp] Starting app launch process');
        this.copyUrlToClipboard().then(() => {
            this.addDebugMessage('[launchApp] URL copied to clipboard');
            const os = this.getOperatingSystem();
            this.addDebugMessage('[launchApp] Detected operating system: ' + os);
            if (os === "Android") {
                return this.launchAppAndroid();
            }
            else if (os === "iOS") {
                return this.launchAppiOS();
            }
            else {
                this.addDebugMessage('[launchApp] Stopped app launch process due to unknown operating system');
                return "unknown";
            }
        }).catch(() => {
            this.addDebugMessage('[launchApp] Error launching app');
            return "error";
        });
    }
    launchAppAndroid() {
        window.location.href = `intent://${this.scheme}${this.formatQueryParams()}/#Intent;scheme=${this.scheme};package=${this.packageName};end`;
        this.addDebugMessage('[launchAppAndroid] Attempting to launch app with URL: ' + `intent://${this.scheme}${this.formatQueryParams()}/#Intent;scheme=${this.scheme};package=${this.packageName};end`);
        return "android";
    }
    copyUrlToClipboard() {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `${this.scheme}${this.formatQueryParams()}`;
            this.addDebugMessage('[copyUrlToClipboard] Starting to copy URL to clipboard: ' + url);
            return yield this.copyTextToClipboard(url);
        });
    }
    fallbackCopyTextToClipboard(text) {
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
            this.addDebugMessage('[fallbackCopyTextToClipboard] Successfully copied URL using fallback method: ' + text);
            return Promise.resolve();
        }
        catch (err) {
            this.addDebugMessage('[fallbackCopyTextToClipboard] Error copying URL using fallback method: ' + text);
            return Promise.reject();
        }
        finally {
            document.body.removeChild(textArea);
        }
    }
    copyTextToClipboard(text) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!navigator.clipboard) {
                this.addDebugMessage('[copyTextToClipboard] Clipboard API not available, using fallback method');
                this.fallbackCopyTextToClipboard(text);
                return new Promise((r) => setTimeout(r, 250));
            }
            try {
                this.addDebugMessage('[copyTextToClipboard] Using Clipboard API to copy URL: ' + text);
                return yield navigator.clipboard.writeText(text);
            }
            catch (err) {
                this.addDebugMessage('[copyTextToClipboard] Error using Clipboard API, using fallback method');
                this.fallbackCopyTextToClipboard(text);
                return new Promise((r) => setTimeout(r, 250));
            }
        });
    }
    handleVisibilityChange() {
        if (document.hidden) {
            this.addDebugMessage('[handleVisibilityChange] Page is in the background or hidden');
            this.isAppOpened = true;
        }
    }
    launchAppiOS() {
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
                this.isAppOpened = true;
            }
        }, this.timeout);
        return "iOS";
    }
    formatQueryParams() {
        if (this.queryParams.length === 0) {
            return '';
        }
        let queryParamsString = '?';
        this.queryParams.forEach((param, index) => {
            queryParamsString += `${param.key}=${param.value}`;
            if (index < this.queryParams.length - 1) {
                queryParamsString += '&';
            }
        });
        return queryParamsString;
    }
    addDebugMessage(message) {
        const debugInfo = `${new Date().toISOString()} | ${message}`;
        if (this.debugDiv) {
            const p = document.createElement('p');
            p.textContent = debugInfo;
            this.debugDiv.appendChild(p);
        }
        else {
            console.log(debugInfo);
        }
    }
}
export default AppInstall;
