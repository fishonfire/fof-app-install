declare class AppInstall {
    scheme: string;
    appID: string;
    packageName: string;
    operatingSystem: string;
    queryParams: {
      key: string
      value: string
    }[];
    constructor(scheme?: string, appID?: string, packageName?: string, timeout?: number, debugDiv?: HTMLDivElement | null, showLaunchAppModal?: boolean);
    setAppID(appID: string): void;
    setPackageName(packageName: string): void;
    getOperatingSystem(): string;
    launchApp(): string;
    launchAppAndroid(): string;
    launchAppiOS(): string;
    setQueryParams(queryParams: { key: string, value: string }[]): void;
    copyUrlToClipboard(): Promise<void>;
    setShowLaunchAppModal(showLaunchAppModal: boolean): void;
}
export default AppInstall;
