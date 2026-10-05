import { s as FILE_REVIEW_SERVICE_NAME } from "./user-guide.js";
import { n as PACKAGE_NAME, t as FILE_REVIEW_INVOCATIONS } from "./typert-descriptors.js";
//#region src/typert.host.ts
const TYPERT = {
	package: PACKAGE_NAME,
	face: "host",
	schemas: [],
	invocations: FILE_REVIEW_INVOCATIONS,
	model: {
		services: [{
			key: FILE_REVIEW_SERVICE_NAME,
			exportName: "FileReviewService",
			summary: "Safely inspect and toggle one turn of produced text changes.",
			tags: [],
			members: [],
			types: []
		}],
		events: [],
		objects: []
	}
};
//#endregion
export { TYPERT, TYPERT as default };
