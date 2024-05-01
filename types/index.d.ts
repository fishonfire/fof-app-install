declare class AppInstall {
    scheme: string;
    appID: string;
    packageName: string;
    operatingSystem: string;
    queryParams: {
      key: string
      value: string
    }[];
    constructor(scheme?: string, appID?: string, packageName?: string);
    setAppID(appID: string): void;
    setPackageName(packageName: string): void;
    getOperatingSystem(): string;
    launchApp(): string;
    launchAppAndroid(): string;
    launchAppiOS(): string;
    setQueryParams(): void;
    copyUrlToClipboard(): string;
}
export default AppInstall;
