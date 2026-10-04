type Disposer = () => void;
/** Roll back partial registrations and release everything even if one disposer fails. */
export declare function registrationLifetime(report: (error: unknown) => void): {
    register: (acquire: () => Disposer) => Disposer;
    release: () => void;
};
export {};
//# sourceMappingURL=registration-lifetime.d.ts.map