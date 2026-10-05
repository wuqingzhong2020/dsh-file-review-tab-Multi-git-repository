import { type AggregateDiffFile } from './aggregate-diff.ts';
interface AggregateCopyButtonProps {
    load: (signal: AbortSignal) => Promise<readonly AggregateDiffFile[]>;
}
export declare function AggregateCopyButton({ load }: AggregateCopyButtonProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=AggregateCopyButton.d.ts.map