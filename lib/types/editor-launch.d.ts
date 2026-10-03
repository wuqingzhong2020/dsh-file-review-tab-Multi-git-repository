/** Known VS Code-compatible executables only; no command templates or shell launchers. */
export declare function findVSCode(configured?: string): Promise<string | null>;
export declare function vscodeArguments(path: string, line: number): string[];
/** Resolves only after OS process admission; GUI focus is not an observable acknowledgement. */
export declare function launchVSCode(executable: string, args: readonly string[]): Promise<void>;
//# sourceMappingURL=editor-launch.d.ts.map