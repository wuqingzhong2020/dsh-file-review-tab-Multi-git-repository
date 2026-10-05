import { type ReactNode } from 'react';
export declare function FileContentsButton({ expanded, label, onClick, controls }: {
    expanded: boolean;
    label: string;
    onClick: () => void;
    controls?: string;
}): import("react").JSX.Element;
export declare function ReviewRepositoryGroup({ name, path, count, children, collapsed, onCollapsedChange, contentsExpanded, onContentsExpandedChange, actions }: {
    name: string;
    path: string;
    count: number;
    children: ReactNode;
    collapsed: boolean;
    onCollapsedChange: (collapsed: boolean) => void;
    contentsExpanded: boolean;
    onContentsExpandedChange: (expanded: boolean) => void;
    actions?: ReactNode;
}): import("react").JSX.Element;
//# sourceMappingURL=ReviewRepositoryGroup.d.ts.map