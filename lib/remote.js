import { o as FILE_REVIEW_REMOTE_NAMESPACE, s as FILE_REVIEW_SERVICE_NAME } from "./user-guide.js";
import { n as PACKAGE_NAME, t as FILE_REVIEW_INVOCATIONS } from "./typert-descriptors.js";
//#region src/remote.ts
const TYPERT_REMOTE = {
	package: PACKAGE_NAME,
	descriptors: FILE_REVIEW_INVOCATIONS
};
//#endregion
export { FILE_REVIEW_REMOTE_NAMESPACE, FILE_REVIEW_SERVICE_NAME, TYPERT_REMOTE, TYPERT_REMOTE as default };
