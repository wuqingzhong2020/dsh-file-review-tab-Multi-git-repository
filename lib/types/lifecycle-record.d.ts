/** Versioned, bounded facts carried by the official durable tool log. */
import { z } from 'zod';
export declare const LIFECYCLE_KEY = "dshFileReviewMultiRepository";
export declare const MARKER_MAX_BYTES: number;
export declare const CAPTURE_MAX_BYTES: number;
export declare const SESSION_MAX_RECORDS = 4000;
export declare const SESSION_MAX_BYTES: number;
export declare const lifecycleImageSchema: z.ZodObject<{
    text: z.ZodString;
    mode: z.ZodNumber;
    dev: z.ZodNumber;
    ino: z.ZodNumber;
}, z.core.$strict>;
export declare const lifecycleRecordSchema: z.ZodObject<{
    schemaVersion: z.ZodLiteral<1>;
    sessionId: z.ZodString;
    recordId: z.ZodString;
    rootCallId: z.ZodString;
    subCallId: z.ZodString;
    name: z.ZodString;
    path: z.ZodString;
    filename: z.ZodString;
    before: z.ZodNullable<z.ZodObject<{
        text: z.ZodString;
        mode: z.ZodNumber;
        dev: z.ZodNumber;
        ino: z.ZodNumber;
    }, z.core.$strict>>;
    after: z.ZodNullable<z.ZodObject<{
        text: z.ZodString;
        mode: z.ZodNumber;
        dev: z.ZodNumber;
        ino: z.ZodNumber;
    }, z.core.$strict>>;
    complete: z.ZodBoolean;
    reason: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type LifecycleImage = z.infer<typeof lifecycleImageSchema>;
export type LifecycleRecord = z.infer<typeof lifecycleRecordSchema>;
export declare function lifecycleRecordBytes(record: LifecycleRecord): number;
export declare function incompleteLifecycle(record: LifecycleRecord, reason: string): LifecycleRecord;
export declare function boundedLifecycle(record: LifecycleRecord): LifecycleRecord;
export declare function lifecycleFromContent(content: readonly unknown[]): LifecycleRecord[];
export declare function lifecycleBlock(record: LifecycleRecord): {
    type: "text";
    text: string;
    dshFileReviewMultiRepository: {
        schemaVersion: 1;
        sessionId: string;
        recordId: string;
        rootCallId: string;
        subCallId: string;
        name: string;
        path: string;
        filename: string;
        before: {
            text: string;
            mode: number;
            dev: number;
            ino: number;
        } | null;
        after: {
            text: string;
            mode: number;
            dev: number;
            ino: number;
        } | null;
        complete: boolean;
        reason?: string | undefined;
    };
};
//# sourceMappingURL=lifecycle-record.d.ts.map