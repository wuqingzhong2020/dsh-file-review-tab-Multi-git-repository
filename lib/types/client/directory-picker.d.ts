interface DesktopDirectoryPicker {
    supportsDefaultPath?: boolean;
    pick(defaultPath: string): Promise<string | null>;
}
interface PickerContext {
    get(name: string): unknown;
}
/** Resolve only the picker we use: optional Cordis services require get(). */
export declare function pickRepositoryDirectory(ctx: PickerContext, unavailableMessage: string, defaultPath: string, desktop?: DesktopDirectoryPicker | undefined): Promise<string | null>;
export {};
//# sourceMappingURL=directory-picker.d.ts.map