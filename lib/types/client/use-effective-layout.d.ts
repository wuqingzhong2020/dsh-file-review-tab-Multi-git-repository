import { type RefObject } from 'react';
import type { DiffLayout } from './diff-view-preferences.ts';
export declare function effectiveDiffLayout(preferred: DiffLayout, width: number, adaptive: boolean): DiffLayout;
/** Hidden containers keep their last measured width; observers die with the diff. */
export declare function useEffectiveLayout(container: RefObject<HTMLElement>, preferred: DiffLayout, adaptive: boolean): DiffLayout;
//# sourceMappingURL=use-effective-layout.d.ts.map