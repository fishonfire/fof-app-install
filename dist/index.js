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
    constructor(scheme = 'example://', appID = '1234567890', packageName = 'com.example.app', timeout = 1000) {
        this.scheme = scheme;
        this.appID = appID;
        this.packageName = packageName;
        this.operatingSystem = 'unknown';
        this.operatingSystem = this.getOperatingSystem();
        this.queryParams = [];
        this.isPromptHidden = false;
        this.isAppOpened = false;
        this.timeout = timeout;
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
        this.copyUrlToClipboard().then(() => {
            const os = this.getOperatingSystem();
            if (os === "Android") {
                return this.launchAppAndroid();
            }
            else if (os === "iOS") {
                return this.launchAppiOS();
            }
            else {
                return "unknown";
            }
        });
    }
    launchAppAndroid() {
        window.location.href = `intent://${this.scheme}${this.formatQueryParams()}/#Intent;scheme=${this.scheme};package=${this.packageName};end`;
        return "android";
    }
    copyUrlToClipboard() {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `${this.scheme}${this.formatQueryParams()}`;
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
        }
        catch (err) { }
        document.body.removeChild(textArea);
    }
    copyTextToClipboard(text) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!navigator.clipboard) {
                this.fallbackCopyTextToClipboard(text);
                return new Promise((r) => setTimeout(r, 250));
            }
            return navigator.clipboard.writeText(text);
        });
    }
    handleVisibilityChange() {
        if (document.hidden) {
            console.log('[handleVisibilityChange] Page is in the background or hidden');
            this.isAppOpened = true;
        }
    }
    launchAppiOS() {
        this.isPromptHidden = false;
        this.isAppOpened = false;
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
        const appUrl = `${this.scheme}${this.formatQueryParams()}`;
        const storeUrl = `https://apps.apple.com/app/id${this.appID}`;
        window.location.href = appUrl;
        // window.addEventListener('focus', () => {
        //   if (this.isPromptHidden && this.isAppOpened) {
        //     return;
        //   }
        //   this.isPromptHidden = true;
        setTimeout(() => {
            if (this.isPromptHidden && !this.isAppOpened) {
                window.location.href = storeUrl;
                this.isAppOpened = true;
            }
        }, this.timeout); // Worth checking if 1 second is enough time to open app on other devices
        // });
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
}
export default AppInstall;
