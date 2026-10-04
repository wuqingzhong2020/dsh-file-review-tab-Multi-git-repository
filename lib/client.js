window.__ModuleLoader__.load({
	id: "dsh-file-review-tab-multi-git-repository",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/core.js
		var _a$1;
		function $constructor(name, initializer, params) {
			function init(inst, def) {
				if (!inst._zod) Object.defineProperty(inst, "_zod", {
					value: {
						def,
						constr: _,
						traits: /* @__PURE__ */ new Set()
					},
					enumerable: false
				});
				if (inst._zod.traits.has(name)) return;
				inst._zod.traits.add(name);
				initializer(inst, def);
				const proto = _.prototype;
				const keys = Object.keys(proto);
				for (let i = 0; i < keys.length; i++) {
					const k = keys[i];
					if (!(k in inst)) inst[k] = proto[k].bind(inst);
				}
			}
			const Parent = params?.Parent ?? Object;
			class Definition extends Parent {}
			Object.defineProperty(Definition, "name", { value: name });
			function _(def) {
				var _a;
				const inst = params?.Parent ? new Definition() : this;
				init(inst, def);
				(_a = inst._zod).deferred ?? (_a.deferred = []);
				for (const fn of inst._zod.deferred) fn();
				return inst;
			}
			Object.defineProperty(_, "init", { value: init });
			Object.defineProperty(_, Symbol.hasInstance, { value: (inst) => {
				if (params?.Parent && inst instanceof params.Parent) return true;
				return inst?._zod?.traits?.has(name);
			} });
			Object.defineProperty(_, "name", { value: name });
			return _;
		}
		var $ZodAsyncError = class extends Error {
			constructor() {
				super(`Encountered Promise during synchronous parse. Use .parseAsync() instead.`);
			}
		};
		var $ZodEncodeError = class extends Error {
			constructor(name) {
				super(`Encountered unidirectional transform during encode: ${name}`);
				this.name = "ZodEncodeError";
			}
		};
		(_a$1 = globalThis).__zod_globalConfig ?? (_a$1.__zod_globalConfig = {});
		const globalConfig = globalThis.__zod_globalConfig;
		function config(newConfig) {
			if (newConfig) Object.assign(globalConfig, newConfig);
			return globalConfig;
		}
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/util.js
		function getEnumValues(entries) {
			const numericValues = Object.values(entries).filter((v) => typeof v === "number");
			return Object.entries(entries).filter(([k, _]) => numericValues.indexOf(+k) === -1).map(([_, v]) => v);
		}
		function jsonStringifyReplacer(_, value) {
			if (typeof value === "bigint") return value.toString();
			return value;
		}
		function cached(getter) {
			return { get value() {
				{
					const value = getter();
					Object.defineProperty(this, "value", { value });
					return value;
				}
			} };
		}
		function nullish(input) {
			return input === null || input === void 0;
		}
		function cleanRegex(source) {
			const start = source.startsWith("^") ? 1 : 0;
			const end = source.endsWith("$") ? source.length - 1 : source.length;
			return source.slice(start, end);
		}
		function floatSafeRemainder(val, step) {
			const ratio = val / step;
			const roundedRatio = Math.round(ratio);
			const tolerance = Number.EPSILON * Math.max(Math.abs(ratio), 1);
			if (Math.abs(ratio - roundedRatio) < tolerance) return 0;
			return ratio - roundedRatio;
		}
		const EVALUATING = /* @__PURE__*/ Symbol("evaluating");
		function defineLazy(object, key, getter) {
			let value = void 0;
			Object.defineProperty(object, key, {
				get() {
					if (value === EVALUATING) return;
					if (value === void 0) {
						value = EVALUATING;
						value = getter();
					}
					return value;
				},
				set(v) {
					Object.defineProperty(object, key, { value: v });
				},
				configurable: true
			});
		}
		function assignProp(target, prop, value) {
			Object.defineProperty(target, prop, {
				value,
				writable: true,
				enumerable: true,
				configurable: true
			});
		}
		function mergeDefs(...defs) {
			const mergedDescriptors = {};
			for (const def of defs) {
				const descriptors = Object.getOwnPropertyDescriptors(def);
				Object.assign(mergedDescriptors, descriptors);
			}
			return Object.defineProperties({}, mergedDescriptors);
		}
		function esc(str) {
			return JSON.stringify(str);
		}
		function slugify(input) {
			return input.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
		}
		const captureStackTrace = "captureStackTrace" in Error ? Error.captureStackTrace : (..._args) => {};
		function isObject(data) {
			return typeof data === "object" && data !== null && !Array.isArray(data);
		}
		const allowsEval = /* @__PURE__*/ cached(() => {
			if (globalConfig.jitless) return false;
			if (typeof navigator !== "undefined" && navigator?.userAgent?.includes("Cloudflare")) return false;
			try {
				new Function("");
				return true;
			} catch (_) {
				return false;
			}
		});
		function isPlainObject(o) {
			if (isObject(o) === false) return false;
			const ctor = o.constructor;
			if (ctor === void 0) return true;
			if (typeof ctor !== "function") return true;
			const prot = ctor.prototype;
			if (isObject(prot) === false) return false;
			if (Object.prototype.hasOwnProperty.call(prot, "isPrototypeOf") === false) return false;
			return true;
		}
		function shallowClone(o) {
			if (isPlainObject(o)) return { ...o };
			if (Array.isArray(o)) return [...o];
			if (o instanceof Map) return new Map(o);
			if (o instanceof Set) return new Set(o);
			return o;
		}
		const propertyKeyTypes = /* @__PURE__*/ new Set([
			"string",
			"number",
			"symbol"
		]);
		function escapeRegex(str) {
			return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		}
		function clone(inst, def, params) {
			const cl = new inst._zod.constr(def ?? inst._zod.def);
			if (!def || params?.parent) cl._zod.parent = inst;
			return cl;
		}
		function normalizeParams(_params) {
			const params = _params;
			if (!params) return {};
			if (typeof params === "string") return { error: () => params };
			if (params?.message !== void 0) {
				if (params?.error !== void 0) throw new Error("Cannot specify both `message` and `error` params");
				params.error = params.message;
			}
			delete params.message;
			if (typeof params.error === "string") return {
				...params,
				error: () => params.error
			};
			return params;
		}
		function optionalKeys(shape) {
			return Object.keys(shape).filter((k) => {
				return shape[k]._zod.optin === "optional" && shape[k]._zod.optout === "optional";
			});
		}
		const NUMBER_FORMAT_RANGES = {
			safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
			int32: [-2147483648, 2147483647],
			uint32: [0, 4294967295],
			float32: [-34028234663852886e22, 34028234663852886e22],
			float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
		};
		function pick(schema, mask) {
			const currDef = schema._zod.def;
			const checks = currDef.checks;
			if (checks && checks.length > 0) throw new Error(".pick() cannot be used on object schemas containing refinements");
			return clone(schema, mergeDefs(schema._zod.def, {
				get shape() {
					const newShape = {};
					for (const key in mask) {
						if (!(key in currDef.shape)) throw new Error(`Unrecognized key: "${key}"`);
						if (!mask[key]) continue;
						newShape[key] = currDef.shape[key];
					}
					assignProp(this, "shape", newShape);
					return newShape;
				},
				checks: []
			}));
		}
		function omit(schema, mask) {
			const currDef = schema._zod.def;
			const checks = currDef.checks;
			if (checks && checks.length > 0) throw new Error(".omit() cannot be used on object schemas containing refinements");
			return clone(schema, mergeDefs(schema._zod.def, {
				get shape() {
					const newShape = { ...schema._zod.def.shape };
					for (const key in mask) {
						if (!(key in currDef.shape)) throw new Error(`Unrecognized key: "${key}"`);
						if (!mask[key]) continue;
						delete newShape[key];
					}
					assignProp(this, "shape", newShape);
					return newShape;
				},
				checks: []
			}));
		}
		function extend(schema, shape) {
			if (!isPlainObject(shape)) throw new Error("Invalid input to extend: expected a plain object");
			const checks = schema._zod.def.checks;
			if (checks && checks.length > 0) {
				const existingShape = schema._zod.def.shape;
				for (const key in shape) if (Object.getOwnPropertyDescriptor(existingShape, key) !== void 0) throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
			}
			return clone(schema, mergeDefs(schema._zod.def, { get shape() {
				const _shape = {
					...schema._zod.def.shape,
					...shape
				};
				assignProp(this, "shape", _shape);
				return _shape;
			} }));
		}
		function safeExtend(schema, shape) {
			if (!isPlainObject(shape)) throw new Error("Invalid input to safeExtend: expected a plain object");
			return clone(schema, mergeDefs(schema._zod.def, { get shape() {
				const _shape = {
					...schema._zod.def.shape,
					...shape
				};
				assignProp(this, "shape", _shape);
				return _shape;
			} }));
		}
		function merge(a, b) {
			if (a._zod.def.checks?.length) throw new Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
			return clone(a, mergeDefs(a._zod.def, {
				get shape() {
					const _shape = {
						...a._zod.def.shape,
						...b._zod.def.shape
					};
					assignProp(this, "shape", _shape);
					return _shape;
				},
				get catchall() {
					return b._zod.def.catchall;
				},
				checks: b._zod.def.checks ?? []
			}));
		}
		function partial(Class, schema, mask) {
			const checks = schema._zod.def.checks;
			if (checks && checks.length > 0) throw new Error(".partial() cannot be used on object schemas containing refinements");
			return clone(schema, mergeDefs(schema._zod.def, {
				get shape() {
					const oldShape = schema._zod.def.shape;
					const shape = { ...oldShape };
					if (mask) for (const key in mask) {
						if (!(key in oldShape)) throw new Error(`Unrecognized key: "${key}"`);
						if (!mask[key]) continue;
						shape[key] = Class ? new Class({
							type: "optional",
							innerType: oldShape[key]
						}) : oldShape[key];
					}
					else for (const key in oldShape) shape[key] = Class ? new Class({
						type: "optional",
						innerType: oldShape[key]
					}) : oldShape[key];
					assignProp(this, "shape", shape);
					return shape;
				},
				checks: []
			}));
		}
		function required(Class, schema, mask) {
			return clone(schema, mergeDefs(schema._zod.def, { get shape() {
				const oldShape = schema._zod.def.shape;
				const shape = { ...oldShape };
				if (mask) for (const key in mask) {
					if (!(key in shape)) throw new Error(`Unrecognized key: "${key}"`);
					if (!mask[key]) continue;
					shape[key] = new Class({
						type: "nonoptional",
						innerType: oldShape[key]
					});
				}
				else for (const key in oldShape) shape[key] = new Class({
					type: "nonoptional",
					innerType: oldShape[key]
				});
				assignProp(this, "shape", shape);
				return shape;
			} }));
		}
		function aborted(x, startIndex = 0) {
			if (x.aborted === true) return true;
			for (let i = startIndex; i < x.issues.length; i++) if (x.issues[i]?.continue !== true) return true;
			return false;
		}
		function explicitlyAborted(x, startIndex = 0) {
			if (x.aborted === true) return true;
			for (let i = startIndex; i < x.issues.length; i++) if (x.issues[i]?.continue === false) return true;
			return false;
		}
		function prefixIssues(path, issues) {
			return issues.map((iss) => {
				var _a;
				(_a = iss).path ?? (_a.path = []);
				iss.path.unshift(path);
				return iss;
			});
		}
		function unwrapMessage(message) {
			return typeof message === "string" ? message : message?.message;
		}
		function finalizeIssue(iss, ctx, config) {
			const message = iss.message ? iss.message : unwrapMessage(iss.inst?._zod.def?.error?.(iss)) ?? unwrapMessage(ctx?.error?.(iss)) ?? unwrapMessage(config.customError?.(iss)) ?? unwrapMessage(config.localeError?.(iss)) ?? "Invalid input";
			const { inst: _inst, continue: _continue, input: _input, ...rest } = iss;
			rest.path ?? (rest.path = []);
			rest.message = message;
			if (ctx?.reportInput) rest.input = _input;
			return rest;
		}
		function getLengthableOrigin(input) {
			if (Array.isArray(input)) return "array";
			if (typeof input === "string") return "string";
			return "unknown";
		}
		function issue(...args) {
			const [iss, input, inst] = args;
			if (typeof iss === "string") return {
				message: iss,
				code: "custom",
				input,
				inst
			};
			return { ...iss };
		}
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/errors.js
		const initializer$1 = (inst, def) => {
			inst.name = "$ZodError";
			Object.defineProperty(inst, "_zod", {
				value: inst._zod,
				enumerable: false
			});
			Object.defineProperty(inst, "issues", {
				value: def,
				enumerable: false
			});
			inst.message = JSON.stringify(def, jsonStringifyReplacer, 2);
			Object.defineProperty(inst, "toString", {
				value: () => inst.message,
				enumerable: false
			});
		};
		const $ZodError = $constructor("$ZodError", initializer$1);
		const $ZodRealError = $constructor("$ZodError", initializer$1, { Parent: Error });
		function flattenError(error, mapper = (issue) => issue.message) {
			const fieldErrors = {};
			const formErrors = [];
			for (const sub of error.issues) if (sub.path.length > 0) {
				fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
				fieldErrors[sub.path[0]].push(mapper(sub));
			} else formErrors.push(mapper(sub));
			return {
				formErrors,
				fieldErrors
			};
		}
		function formatError(error, mapper = (issue) => issue.message) {
			const fieldErrors = { _errors: [] };
			const processError = (error, path = []) => {
				for (const issue of error.issues) if (issue.code === "invalid_union" && issue.errors.length) issue.errors.map((issues) => processError({ issues }, [...path, ...issue.path]));
				else if (issue.code === "invalid_key") processError({ issues: issue.issues }, [...path, ...issue.path]);
				else if (issue.code === "invalid_element") processError({ issues: issue.issues }, [...path, ...issue.path]);
				else {
					const fullpath = [...path, ...issue.path];
					if (fullpath.length === 0) fieldErrors._errors.push(mapper(issue));
					else {
						let curr = fieldErrors;
						let i = 0;
						while (i < fullpath.length) {
							const el = fullpath[i];
							if (!(i === fullpath.length - 1)) curr[el] = curr[el] || { _errors: [] };
							else {
								curr[el] = curr[el] || { _errors: [] };
								curr[el]._errors.push(mapper(issue));
							}
							curr = curr[el];
							i++;
						}
					}
				}
			};
			processError(error);
			return fieldErrors;
		}
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/parse.js
		const _parse = (_Err) => (schema, value, _ctx, _params) => {
			const ctx = _ctx ? {
				..._ctx,
				async: false
			} : { async: false };
			const result = schema._zod.run({
				value,
				issues: []
			}, ctx);
			if (result instanceof Promise) throw new $ZodAsyncError();
			if (result.issues.length) {
				const e = new ((_params?.Err) ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
				captureStackTrace(e, _params?.callee);
				throw e;
			}
			return result.value;
		};
		const _parseAsync = (_Err) => async (schema, value, _ctx, params) => {
			const ctx = _ctx ? {
				..._ctx,
				async: true
			} : { async: true };
			let result = schema._zod.run({
				value,
				issues: []
			}, ctx);
			if (result instanceof Promise) result = await result;
			if (result.issues.length) {
				const e = new ((params?.Err) ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
				captureStackTrace(e, params?.callee);
				throw e;
			}
			return result.value;
		};
		const _safeParse = (_Err) => (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				async: false
			} : { async: false };
			const result = schema._zod.run({
				value,
				issues: []
			}, ctx);
			if (result instanceof Promise) throw new $ZodAsyncError();
			return result.issues.length ? {
				success: false,
				error: new (_Err ?? $ZodError)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
			} : {
				success: true,
				data: result.value
			};
		};
		const safeParse$1 = /* @__PURE__*/ _safeParse($ZodRealError);
		const _safeParseAsync = (_Err) => async (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				async: true
			} : { async: true };
			let result = schema._zod.run({
				value,
				issues: []
			}, ctx);
			if (result instanceof Promise) result = await result;
			return result.issues.length ? {
				success: false,
				error: new _Err(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
			} : {
				success: true,
				data: result.value
			};
		};
		const safeParseAsync$1 = /* @__PURE__*/ _safeParseAsync($ZodRealError);
		const _encode = (_Err) => (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				direction: "backward"
			} : { direction: "backward" };
			return _parse(_Err)(schema, value, ctx);
		};
		const _decode = (_Err) => (schema, value, _ctx) => {
			return _parse(_Err)(schema, value, _ctx);
		};
		const _encodeAsync = (_Err) => async (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				direction: "backward"
			} : { direction: "backward" };
			return _parseAsync(_Err)(schema, value, ctx);
		};
		const _decodeAsync = (_Err) => async (schema, value, _ctx) => {
			return _parseAsync(_Err)(schema, value, _ctx);
		};
		const _safeEncode = (_Err) => (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				direction: "backward"
			} : { direction: "backward" };
			return _safeParse(_Err)(schema, value, ctx);
		};
		const _safeDecode = (_Err) => (schema, value, _ctx) => {
			return _safeParse(_Err)(schema, value, _ctx);
		};
		const _safeEncodeAsync = (_Err) => async (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				direction: "backward"
			} : { direction: "backward" };
			return _safeParseAsync(_Err)(schema, value, ctx);
		};
		const _safeDecodeAsync = (_Err) => async (schema, value, _ctx) => {
			return _safeParseAsync(_Err)(schema, value, _ctx);
		};
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/regexes.js
		/**
		* @deprecated CUID v1 is deprecated by its authors due to information leakage
		* (timestamps embedded in the id). Use {@link cuid2} instead.
		* See https://github.com/paralleldrive/cuid.
		*/
		const cuid = /^[cC][0-9a-z]{6,}$/;
		const cuid2 = /^[0-9a-z]+$/;
		const ulid = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/;
		const xid = /^[0-9a-vA-V]{20}$/;
		const ksuid = /^[A-Za-z0-9]{27}$/;
		const nanoid = /^[a-zA-Z0-9_-]{21}$/;
		/** ISO 8601-1 duration regex. Does not support the 8601-2 extensions like negative durations or fractional/negative components. */
		const duration$1 = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/;
		/** A regex for any UUID-like identifier: 8-4-4-4-12 hex pattern */
		const guid = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;
		/** Returns a regex for validating an RFC 9562/4122 UUID.
		*
		* @param version Optionally specify a version 1-8. If no version is specified, all versions are supported. */
		const uuid = (version) => {
			if (!version) return /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/;
			return new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${version}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`);
		};
		/** Practical email validation */
		const email = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;
		const _emoji$1 = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
		function emoji() {
			return new RegExp(_emoji$1, "u");
		}
		const ipv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
		const ipv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;
		const cidrv4 = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/;
		const cidrv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
		const base64 = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/;
		const base64url = /^[A-Za-z0-9_-]*$/;
		const httpProtocol = /^https?$/;
		const e164 = /^\+[1-9]\d{6,14}$/;
		const dateSource = `(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))`;
		const date$1 = /*@__PURE__*/ new RegExp(`^${dateSource}$`);
		function timeSource(args) {
			const hhmm = `(?:[01]\\d|2[0-3]):[0-5]\\d`;
			return typeof args.precision === "number" ? args.precision === -1 ? `${hhmm}` : args.precision === 0 ? `${hhmm}:[0-5]\\d` : `${hhmm}:[0-5]\\d\\.\\d{${args.precision}}` : `${hhmm}(?::[0-5]\\d(?:\\.\\d+)?)?`;
		}
		function time$1(args) {
			return new RegExp(`^${timeSource(args)}$`);
		}
		function datetime$1(args) {
			const time = timeSource({ precision: args.precision });
			const opts = ["Z"];
			if (args.local) opts.push("");
			if (args.offset) opts.push(`([+-](?:[01]\\d|2[0-3]):[0-5]\\d)`);
			const timeRegex = `${time}(?:${opts.join("|")})`;
			return new RegExp(`^${dateSource}T(?:${timeRegex})$`);
		}
		const string$1 = (params) => {
			const regex = params ? `[\\s\\S]{${params?.minimum ?? 0},${params?.maximum ?? ""}}` : `[\\s\\S]*`;
			return new RegExp(`^${regex}$`);
		};
		const integer = /^-?\d+$/;
		const number$1 = /^-?\d+(?:\.\d+)?$/;
		const boolean$1 = /^(?:true|false)$/i;
		const lowercase = /^[^A-Z]*$/;
		const uppercase = /^[^a-z]*$/;
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/checks.js
		const $ZodCheck = /*@__PURE__*/ $constructor("$ZodCheck", (inst, def) => {
			var _a;
			inst._zod ?? (inst._zod = {});
			inst._zod.def = def;
			(_a = inst._zod).onattach ?? (_a.onattach = []);
		});
		const numericOriginMap = {
			number: "number",
			bigint: "bigint",
			object: "date"
		};
		const $ZodCheckLessThan = /*@__PURE__*/ $constructor("$ZodCheckLessThan", (inst, def) => {
			$ZodCheck.init(inst, def);
			const origin = numericOriginMap[typeof def.value];
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				const curr = (def.inclusive ? bag.maximum : bag.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
				if (def.value < curr) {
					if (def.inclusive) bag.maximum = def.value;
					else bag.exclusiveMaximum = def.value;
				}
			});
			inst._zod.check = (payload) => {
				if (def.inclusive ? payload.value <= def.value : payload.value < def.value) return;
				payload.issues.push({
					origin,
					code: "too_big",
					maximum: typeof def.value === "object" ? def.value.getTime() : def.value,
					input: payload.value,
					inclusive: def.inclusive,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckGreaterThan = /*@__PURE__*/ $constructor("$ZodCheckGreaterThan", (inst, def) => {
			$ZodCheck.init(inst, def);
			const origin = numericOriginMap[typeof def.value];
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				const curr = (def.inclusive ? bag.minimum : bag.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
				if (def.value > curr) {
					if (def.inclusive) bag.minimum = def.value;
					else bag.exclusiveMinimum = def.value;
				}
			});
			inst._zod.check = (payload) => {
				if (def.inclusive ? payload.value >= def.value : payload.value > def.value) return;
				payload.issues.push({
					origin,
					code: "too_small",
					minimum: typeof def.value === "object" ? def.value.getTime() : def.value,
					input: payload.value,
					inclusive: def.inclusive,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckMultipleOf = /*@__PURE__*/ $constructor("$ZodCheckMultipleOf", (inst, def) => {
			$ZodCheck.init(inst, def);
			inst._zod.onattach.push((inst) => {
				var _a;
				(_a = inst._zod.bag).multipleOf ?? (_a.multipleOf = def.value);
			});
			inst._zod.check = (payload) => {
				if (typeof payload.value !== typeof def.value) throw new Error("Cannot mix number and bigint in multiple_of check.");
				if (typeof payload.value === "bigint" ? payload.value % def.value === BigInt(0) : floatSafeRemainder(payload.value, def.value) === 0) return;
				payload.issues.push({
					origin: typeof payload.value,
					code: "not_multiple_of",
					divisor: def.value,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckNumberFormat = /*@__PURE__*/ $constructor("$ZodCheckNumberFormat", (inst, def) => {
			$ZodCheck.init(inst, def);
			def.format = def.format || "float64";
			const isInt = def.format?.includes("int");
			const origin = isInt ? "int" : "number";
			const [minimum, maximum] = NUMBER_FORMAT_RANGES[def.format];
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.format = def.format;
				bag.minimum = minimum;
				bag.maximum = maximum;
				if (isInt) bag.pattern = integer;
			});
			inst._zod.check = (payload) => {
				const input = payload.value;
				if (isInt) {
					if (!Number.isInteger(input)) {
						payload.issues.push({
							expected: origin,
							format: def.format,
							code: "invalid_type",
							continue: false,
							input,
							inst
						});
						return;
					}
					if (!Number.isSafeInteger(input)) {
						if (input > 0) payload.issues.push({
							input,
							code: "too_big",
							maximum: Number.MAX_SAFE_INTEGER,
							note: "Integers must be within the safe integer range.",
							inst,
							origin,
							inclusive: true,
							continue: !def.abort
						});
						else payload.issues.push({
							input,
							code: "too_small",
							minimum: Number.MIN_SAFE_INTEGER,
							note: "Integers must be within the safe integer range.",
							inst,
							origin,
							inclusive: true,
							continue: !def.abort
						});
						return;
					}
				}
				if (input < minimum) payload.issues.push({
					origin: "number",
					input,
					code: "too_small",
					minimum,
					inclusive: true,
					inst,
					continue: !def.abort
				});
				if (input > maximum) payload.issues.push({
					origin: "number",
					input,
					code: "too_big",
					maximum,
					inclusive: true,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckMaxLength = /*@__PURE__*/ $constructor("$ZodCheckMaxLength", (inst, def) => {
			var _a;
			$ZodCheck.init(inst, def);
			(_a = inst._zod.def).when ?? (_a.when = (payload) => {
				const val = payload.value;
				return !nullish(val) && val.length !== void 0;
			});
			inst._zod.onattach.push((inst) => {
				const curr = inst._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
				if (def.maximum < curr) inst._zod.bag.maximum = def.maximum;
			});
			inst._zod.check = (payload) => {
				const input = payload.value;
				if (input.length <= def.maximum) return;
				const origin = getLengthableOrigin(input);
				payload.issues.push({
					origin,
					code: "too_big",
					maximum: def.maximum,
					inclusive: true,
					input,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckMinLength = /*@__PURE__*/ $constructor("$ZodCheckMinLength", (inst, def) => {
			var _a;
			$ZodCheck.init(inst, def);
			(_a = inst._zod.def).when ?? (_a.when = (payload) => {
				const val = payload.value;
				return !nullish(val) && val.length !== void 0;
			});
			inst._zod.onattach.push((inst) => {
				const curr = inst._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
				if (def.minimum > curr) inst._zod.bag.minimum = def.minimum;
			});
			inst._zod.check = (payload) => {
				const input = payload.value;
				if (input.length >= def.minimum) return;
				const origin = getLengthableOrigin(input);
				payload.issues.push({
					origin,
					code: "too_small",
					minimum: def.minimum,
					inclusive: true,
					input,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckLengthEquals = /*@__PURE__*/ $constructor("$ZodCheckLengthEquals", (inst, def) => {
			var _a;
			$ZodCheck.init(inst, def);
			(_a = inst._zod.def).when ?? (_a.when = (payload) => {
				const val = payload.value;
				return !nullish(val) && val.length !== void 0;
			});
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.minimum = def.length;
				bag.maximum = def.length;
				bag.length = def.length;
			});
			inst._zod.check = (payload) => {
				const input = payload.value;
				const length = input.length;
				if (length === def.length) return;
				const origin = getLengthableOrigin(input);
				const tooBig = length > def.length;
				payload.issues.push({
					origin,
					...tooBig ? {
						code: "too_big",
						maximum: def.length
					} : {
						code: "too_small",
						minimum: def.length
					},
					inclusive: true,
					exact: true,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckStringFormat = /*@__PURE__*/ $constructor("$ZodCheckStringFormat", (inst, def) => {
			var _a, _b;
			$ZodCheck.init(inst, def);
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.format = def.format;
				if (def.pattern) {
					bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
					bag.patterns.add(def.pattern);
				}
			});
			if (def.pattern) (_a = inst._zod).check ?? (_a.check = (payload) => {
				def.pattern.lastIndex = 0;
				if (def.pattern.test(payload.value)) return;
				payload.issues.push({
					origin: "string",
					code: "invalid_format",
					format: def.format,
					input: payload.value,
					...def.pattern ? { pattern: def.pattern.toString() } : {},
					inst,
					continue: !def.abort
				});
			});
			else (_b = inst._zod).check ?? (_b.check = () => {});
		});
		const $ZodCheckRegex = /*@__PURE__*/ $constructor("$ZodCheckRegex", (inst, def) => {
			$ZodCheckStringFormat.init(inst, def);
			inst._zod.check = (payload) => {
				def.pattern.lastIndex = 0;
				if (def.pattern.test(payload.value)) return;
				payload.issues.push({
					origin: "string",
					code: "invalid_format",
					format: "regex",
					input: payload.value,
					pattern: def.pattern.toString(),
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckLowerCase = /*@__PURE__*/ $constructor("$ZodCheckLowerCase", (inst, def) => {
			def.pattern ?? (def.pattern = lowercase);
			$ZodCheckStringFormat.init(inst, def);
		});
		const $ZodCheckUpperCase = /*@__PURE__*/ $constructor("$ZodCheckUpperCase", (inst, def) => {
			def.pattern ?? (def.pattern = uppercase);
			$ZodCheckStringFormat.init(inst, def);
		});
		const $ZodCheckIncludes = /*@__PURE__*/ $constructor("$ZodCheckIncludes", (inst, def) => {
			$ZodCheck.init(inst, def);
			const escapedRegex = escapeRegex(def.includes);
			const pattern = new RegExp(typeof def.position === "number" ? `^.{${def.position}}${escapedRegex}` : escapedRegex);
			def.pattern = pattern;
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
				bag.patterns.add(pattern);
			});
			inst._zod.check = (payload) => {
				if (payload.value.includes(def.includes, def.position)) return;
				payload.issues.push({
					origin: "string",
					code: "invalid_format",
					format: "includes",
					includes: def.includes,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckStartsWith = /*@__PURE__*/ $constructor("$ZodCheckStartsWith", (inst, def) => {
			$ZodCheck.init(inst, def);
			const pattern = new RegExp(`^${escapeRegex(def.prefix)}.*`);
			def.pattern ?? (def.pattern = pattern);
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
				bag.patterns.add(pattern);
			});
			inst._zod.check = (payload) => {
				if (payload.value.startsWith(def.prefix)) return;
				payload.issues.push({
					origin: "string",
					code: "invalid_format",
					format: "starts_with",
					prefix: def.prefix,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckEndsWith = /*@__PURE__*/ $constructor("$ZodCheckEndsWith", (inst, def) => {
			$ZodCheck.init(inst, def);
			const pattern = new RegExp(`.*${escapeRegex(def.suffix)}$`);
			def.pattern ?? (def.pattern = pattern);
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
				bag.patterns.add(pattern);
			});
			inst._zod.check = (payload) => {
				if (payload.value.endsWith(def.suffix)) return;
				payload.issues.push({
					origin: "string",
					code: "invalid_format",
					format: "ends_with",
					suffix: def.suffix,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckOverwrite = /*@__PURE__*/ $constructor("$ZodCheckOverwrite", (inst, def) => {
			$ZodCheck.init(inst, def);
			inst._zod.check = (payload) => {
				payload.value = def.tx(payload.value);
			};
		});
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/doc.js
		var Doc = class {
			constructor(args = []) {
				this.content = [];
				this.indent = 0;
				if (this) this.args = args;
			}
			indented(fn) {
				this.indent += 1;
				fn(this);
				this.indent -= 1;
			}
			write(arg) {
				if (typeof arg === "function") {
					arg(this, { execution: "sync" });
					arg(this, { execution: "async" });
					return;
				}
				const lines = arg.split("\n").filter((x) => x);
				const minIndent = Math.min(...lines.map((x) => x.length - x.trimStart().length));
				const dedented = lines.map((x) => x.slice(minIndent)).map((x) => " ".repeat(this.indent * 2) + x);
				for (const line of dedented) this.content.push(line);
			}
			compile() {
				const F = Function;
				const args = this?.args;
				const lines = [...(this?.content ?? [``]).map((x) => `  ${x}`)];
				return new F(...args, lines.join("\n"));
			}
		};
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/versions.js
		const version = {
			major: 4,
			minor: 4,
			patch: 3
		};
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/schemas.js
		const $ZodType = /*@__PURE__*/ $constructor("$ZodType", (inst, def) => {
			var _a;
			inst ?? (inst = {});
			inst._zod.def = def;
			inst._zod.bag = inst._zod.bag || {};
			inst._zod.version = version;
			const checks = [...inst._zod.def.checks ?? []];
			if (inst._zod.traits.has("$ZodCheck")) checks.unshift(inst);
			for (const ch of checks) for (const fn of ch._zod.onattach) fn(inst);
			if (checks.length === 0) {
				(_a = inst._zod).deferred ?? (_a.deferred = []);
				inst._zod.deferred?.push(() => {
					inst._zod.run = inst._zod.parse;
				});
			} else {
				const runChecks = (payload, checks, ctx) => {
					let isAborted = aborted(payload);
					let asyncResult;
					for (const ch of checks) {
						if (ch._zod.def.when) {
							if (explicitlyAborted(payload)) continue;
							if (!ch._zod.def.when(payload)) continue;
						} else if (isAborted) continue;
						const currLen = payload.issues.length;
						const _ = ch._zod.check(payload);
						if (_ instanceof Promise && ctx?.async === false) throw new $ZodAsyncError();
						if (asyncResult || _ instanceof Promise) asyncResult = (asyncResult ?? Promise.resolve()).then(async () => {
							await _;
							if (payload.issues.length === currLen) return;
							if (!isAborted) isAborted = aborted(payload, currLen);
						});
						else {
							if (payload.issues.length === currLen) continue;
							if (!isAborted) isAborted = aborted(payload, currLen);
						}
					}
					if (asyncResult) return asyncResult.then(() => {
						return payload;
					});
					return payload;
				};
				const handleCanaryResult = (canary, payload, ctx) => {
					if (aborted(canary)) {
						canary.aborted = true;
						return canary;
					}
					const checkResult = runChecks(payload, checks, ctx);
					if (checkResult instanceof Promise) {
						if (ctx.async === false) throw new $ZodAsyncError();
						return checkResult.then((checkResult) => inst._zod.parse(checkResult, ctx));
					}
					return inst._zod.parse(checkResult, ctx);
				};
				inst._zod.run = (payload, ctx) => {
					if (ctx.skipChecks) return inst._zod.parse(payload, ctx);
					if (ctx.direction === "backward") {
						const canary = inst._zod.parse({
							value: payload.value,
							issues: []
						}, {
							...ctx,
							skipChecks: true
						});
						if (canary instanceof Promise) return canary.then((canary) => {
							return handleCanaryResult(canary, payload, ctx);
						});
						return handleCanaryResult(canary, payload, ctx);
					}
					const result = inst._zod.parse(payload, ctx);
					if (result instanceof Promise) {
						if (ctx.async === false) throw new $ZodAsyncError();
						return result.then((result) => runChecks(result, checks, ctx));
					}
					return runChecks(result, checks, ctx);
				};
			}
			defineLazy(inst, "~standard", () => ({
				validate: (value) => {
					try {
						const r = safeParse$1(inst, value);
						return r.success ? { value: r.data } : { issues: r.error?.issues };
					} catch (_) {
						return safeParseAsync$1(inst, value).then((r) => r.success ? { value: r.data } : { issues: r.error?.issues });
					}
				},
				vendor: "zod",
				version: 1
			}));
		});
		const $ZodString = /*@__PURE__*/ $constructor("$ZodString", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.pattern = [...inst?._zod.bag?.patterns ?? []].pop() ?? string$1(inst._zod.bag);
			inst._zod.parse = (payload, _) => {
				if (def.coerce) try {
					payload.value = String(payload.value);
				} catch (_) {}
				if (typeof payload.value === "string") return payload;
				payload.issues.push({
					expected: "string",
					code: "invalid_type",
					input: payload.value,
					inst
				});
				return payload;
			};
		});
		const $ZodStringFormat = /*@__PURE__*/ $constructor("$ZodStringFormat", (inst, def) => {
			$ZodCheckStringFormat.init(inst, def);
			$ZodString.init(inst, def);
		});
		const $ZodGUID = /*@__PURE__*/ $constructor("$ZodGUID", (inst, def) => {
			def.pattern ?? (def.pattern = guid);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodUUID = /*@__PURE__*/ $constructor("$ZodUUID", (inst, def) => {
			if (def.version) {
				const v = {
					v1: 1,
					v2: 2,
					v3: 3,
					v4: 4,
					v5: 5,
					v6: 6,
					v7: 7,
					v8: 8
				}[def.version];
				if (v === void 0) throw new Error(`Invalid UUID version: "${def.version}"`);
				def.pattern ?? (def.pattern = uuid(v));
			} else def.pattern ?? (def.pattern = uuid());
			$ZodStringFormat.init(inst, def);
		});
		const $ZodEmail = /*@__PURE__*/ $constructor("$ZodEmail", (inst, def) => {
			def.pattern ?? (def.pattern = email);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodURL = /*@__PURE__*/ $constructor("$ZodURL", (inst, def) => {
			$ZodStringFormat.init(inst, def);
			inst._zod.check = (payload) => {
				try {
					const trimmed = payload.value.trim();
					if (!def.normalize && def.protocol?.source === httpProtocol.source) {
						if (!/^https?:\/\//i.test(trimmed)) {
							payload.issues.push({
								code: "invalid_format",
								format: "url",
								note: "Invalid URL format",
								input: payload.value,
								inst,
								continue: !def.abort
							});
							return;
						}
					}
					const url = new URL(trimmed);
					if (def.hostname) {
						def.hostname.lastIndex = 0;
						if (!def.hostname.test(url.hostname)) payload.issues.push({
							code: "invalid_format",
							format: "url",
							note: "Invalid hostname",
							pattern: def.hostname.source,
							input: payload.value,
							inst,
							continue: !def.abort
						});
					}
					if (def.protocol) {
						def.protocol.lastIndex = 0;
						if (!def.protocol.test(url.protocol.endsWith(":") ? url.protocol.slice(0, -1) : url.protocol)) payload.issues.push({
							code: "invalid_format",
							format: "url",
							note: "Invalid protocol",
							pattern: def.protocol.source,
							input: payload.value,
							inst,
							continue: !def.abort
						});
					}
					if (def.normalize) payload.value = url.href;
					else payload.value = trimmed;
					return;
				} catch (_) {
					payload.issues.push({
						code: "invalid_format",
						format: "url",
						input: payload.value,
						inst,
						continue: !def.abort
					});
				}
			};
		});
		const $ZodEmoji = /*@__PURE__*/ $constructor("$ZodEmoji", (inst, def) => {
			def.pattern ?? (def.pattern = emoji());
			$ZodStringFormat.init(inst, def);
		});
		const $ZodNanoID = /*@__PURE__*/ $constructor("$ZodNanoID", (inst, def) => {
			def.pattern ?? (def.pattern = nanoid);
			$ZodStringFormat.init(inst, def);
		});
		/**
		* @deprecated CUID v1 is deprecated by its authors due to information leakage
		* (timestamps embedded in the id). Use {@link $ZodCUID2} instead.
		* See https://github.com/paralleldrive/cuid.
		*/
		const $ZodCUID = /*@__PURE__*/ $constructor("$ZodCUID", (inst, def) => {
			def.pattern ?? (def.pattern = cuid);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodCUID2 = /*@__PURE__*/ $constructor("$ZodCUID2", (inst, def) => {
			def.pattern ?? (def.pattern = cuid2);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodULID = /*@__PURE__*/ $constructor("$ZodULID", (inst, def) => {
			def.pattern ?? (def.pattern = ulid);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodXID = /*@__PURE__*/ $constructor("$ZodXID", (inst, def) => {
			def.pattern ?? (def.pattern = xid);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodKSUID = /*@__PURE__*/ $constructor("$ZodKSUID", (inst, def) => {
			def.pattern ?? (def.pattern = ksuid);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodISODateTime = /*@__PURE__*/ $constructor("$ZodISODateTime", (inst, def) => {
			def.pattern ?? (def.pattern = datetime$1(def));
			$ZodStringFormat.init(inst, def);
		});
		const $ZodISODate = /*@__PURE__*/ $constructor("$ZodISODate", (inst, def) => {
			def.pattern ?? (def.pattern = date$1);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodISOTime = /*@__PURE__*/ $constructor("$ZodISOTime", (inst, def) => {
			def.pattern ?? (def.pattern = time$1(def));
			$ZodStringFormat.init(inst, def);
		});
		const $ZodISODuration = /*@__PURE__*/ $constructor("$ZodISODuration", (inst, def) => {
			def.pattern ?? (def.pattern = duration$1);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodIPv4 = /*@__PURE__*/ $constructor("$ZodIPv4", (inst, def) => {
			def.pattern ?? (def.pattern = ipv4);
			$ZodStringFormat.init(inst, def);
			inst._zod.bag.format = `ipv4`;
		});
		const $ZodIPv6 = /*@__PURE__*/ $constructor("$ZodIPv6", (inst, def) => {
			def.pattern ?? (def.pattern = ipv6);
			$ZodStringFormat.init(inst, def);
			inst._zod.bag.format = `ipv6`;
			inst._zod.check = (payload) => {
				try {
					new URL(`http://[${payload.value}]`);
				} catch {
					payload.issues.push({
						code: "invalid_format",
						format: "ipv6",
						input: payload.value,
						inst,
						continue: !def.abort
					});
				}
			};
		});
		const $ZodCIDRv4 = /*@__PURE__*/ $constructor("$ZodCIDRv4", (inst, def) => {
			def.pattern ?? (def.pattern = cidrv4);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodCIDRv6 = /*@__PURE__*/ $constructor("$ZodCIDRv6", (inst, def) => {
			def.pattern ?? (def.pattern = cidrv6);
			$ZodStringFormat.init(inst, def);
			inst._zod.check = (payload) => {
				const parts = payload.value.split("/");
				try {
					if (parts.length !== 2) throw new Error();
					const [address, prefix] = parts;
					if (!prefix) throw new Error();
					const prefixNum = Number(prefix);
					if (`${prefixNum}` !== prefix) throw new Error();
					if (prefixNum < 0 || prefixNum > 128) throw new Error();
					new URL(`http://[${address}]`);
				} catch {
					payload.issues.push({
						code: "invalid_format",
						format: "cidrv6",
						input: payload.value,
						inst,
						continue: !def.abort
					});
				}
			};
		});
		function isValidBase64(data) {
			if (data === "") return true;
			if (/\s/.test(data)) return false;
			if (data.length % 4 !== 0) return false;
			try {
				atob(data);
				return true;
			} catch {
				return false;
			}
		}
		const $ZodBase64 = /*@__PURE__*/ $constructor("$ZodBase64", (inst, def) => {
			def.pattern ?? (def.pattern = base64);
			$ZodStringFormat.init(inst, def);
			inst._zod.bag.contentEncoding = "base64";
			inst._zod.check = (payload) => {
				if (isValidBase64(payload.value)) return;
				payload.issues.push({
					code: "invalid_format",
					format: "base64",
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		function isValidBase64URL(data) {
			if (!base64url.test(data)) return false;
			const base64 = data.replace(/[-_]/g, (c) => c === "-" ? "+" : "/");
			return isValidBase64(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
		}
		const $ZodBase64URL = /*@__PURE__*/ $constructor("$ZodBase64URL", (inst, def) => {
			def.pattern ?? (def.pattern = base64url);
			$ZodStringFormat.init(inst, def);
			inst._zod.bag.contentEncoding = "base64url";
			inst._zod.check = (payload) => {
				if (isValidBase64URL(payload.value)) return;
				payload.issues.push({
					code: "invalid_format",
					format: "base64url",
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodE164 = /*@__PURE__*/ $constructor("$ZodE164", (inst, def) => {
			def.pattern ?? (def.pattern = e164);
			$ZodStringFormat.init(inst, def);
		});
		function isValidJWT(token, algorithm = null) {
			try {
				const tokensParts = token.split(".");
				if (tokensParts.length !== 3) return false;
				const [header] = tokensParts;
				if (!header) return false;
				const parsedHeader = JSON.parse(atob(header));
				if ("typ" in parsedHeader && parsedHeader?.typ !== "JWT") return false;
				if (!parsedHeader.alg) return false;
				if (algorithm && (!("alg" in parsedHeader) || parsedHeader.alg !== algorithm)) return false;
				return true;
			} catch {
				return false;
			}
		}
		const $ZodJWT = /*@__PURE__*/ $constructor("$ZodJWT", (inst, def) => {
			$ZodStringFormat.init(inst, def);
			inst._zod.check = (payload) => {
				if (isValidJWT(payload.value, def.alg)) return;
				payload.issues.push({
					code: "invalid_format",
					format: "jwt",
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodNumber = /*@__PURE__*/ $constructor("$ZodNumber", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.pattern = inst._zod.bag.pattern ?? number$1;
			inst._zod.parse = (payload, _ctx) => {
				if (def.coerce) try {
					payload.value = Number(payload.value);
				} catch (_) {}
				const input = payload.value;
				if (typeof input === "number" && !Number.isNaN(input) && Number.isFinite(input)) return payload;
				const received = typeof input === "number" ? Number.isNaN(input) ? "NaN" : !Number.isFinite(input) ? "Infinity" : void 0 : void 0;
				payload.issues.push({
					expected: "number",
					code: "invalid_type",
					input,
					inst,
					...received ? { received } : {}
				});
				return payload;
			};
		});
		const $ZodNumberFormat = /*@__PURE__*/ $constructor("$ZodNumberFormat", (inst, def) => {
			$ZodCheckNumberFormat.init(inst, def);
			$ZodNumber.init(inst, def);
		});
		const $ZodBoolean = /*@__PURE__*/ $constructor("$ZodBoolean", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.pattern = boolean$1;
			inst._zod.parse = (payload, _ctx) => {
				if (def.coerce) try {
					payload.value = Boolean(payload.value);
				} catch (_) {}
				const input = payload.value;
				if (typeof input === "boolean") return payload;
				payload.issues.push({
					expected: "boolean",
					code: "invalid_type",
					input,
					inst
				});
				return payload;
			};
		});
		const $ZodUnknown = /*@__PURE__*/ $constructor("$ZodUnknown", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload) => payload;
		});
		const $ZodNever = /*@__PURE__*/ $constructor("$ZodNever", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload, _ctx) => {
				payload.issues.push({
					expected: "never",
					code: "invalid_type",
					input: payload.value,
					inst
				});
				return payload;
			};
		});
		function handleArrayResult(result, final, index) {
			if (result.issues.length) final.issues.push(...prefixIssues(index, result.issues));
			final.value[index] = result.value;
		}
		const $ZodArray = /*@__PURE__*/ $constructor("$ZodArray", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload, ctx) => {
				const input = payload.value;
				if (!Array.isArray(input)) {
					payload.issues.push({
						expected: "array",
						code: "invalid_type",
						input,
						inst
					});
					return payload;
				}
				payload.value = Array(input.length);
				const proms = [];
				for (let i = 0; i < input.length; i++) {
					const item = input[i];
					const result = def.element._zod.run({
						value: item,
						issues: []
					}, ctx);
					if (result instanceof Promise) proms.push(result.then((result) => handleArrayResult(result, payload, i)));
					else handleArrayResult(result, payload, i);
				}
				if (proms.length) return Promise.all(proms).then(() => payload);
				return payload;
			};
		});
		function handlePropertyResult(result, final, key, input, isOptionalIn, isOptionalOut) {
			const isPresent = key in input;
			if (result.issues.length) {
				if (isOptionalIn && isOptionalOut && !isPresent) return;
				final.issues.push(...prefixIssues(key, result.issues));
			}
			if (!isPresent && !isOptionalIn) {
				if (!result.issues.length) final.issues.push({
					code: "invalid_type",
					expected: "nonoptional",
					input: void 0,
					path: [key]
				});
				return;
			}
			if (result.value === void 0) {
				if (isPresent) final.value[key] = void 0;
			} else final.value[key] = result.value;
		}
		function normalizeDef(def) {
			const keys = Object.keys(def.shape);
			for (const k of keys) if (!def.shape?.[k]?._zod?.traits?.has("$ZodType")) throw new Error(`Invalid element at key "${k}": expected a Zod schema`);
			const okeys = optionalKeys(def.shape);
			return {
				...def,
				keys,
				keySet: new Set(keys),
				numKeys: keys.length,
				optionalKeys: new Set(okeys)
			};
		}
		function handleCatchall(proms, input, payload, ctx, def, inst) {
			const unrecognized = [];
			const keySet = def.keySet;
			const _catchall = def.catchall._zod;
			const t = _catchall.def.type;
			const isOptionalIn = _catchall.optin === "optional";
			const isOptionalOut = _catchall.optout === "optional";
			for (const key in input) {
				if (key === "__proto__") continue;
				if (keySet.has(key)) continue;
				if (t === "never") {
					unrecognized.push(key);
					continue;
				}
				const r = _catchall.run({
					value: input[key],
					issues: []
				}, ctx);
				if (r instanceof Promise) proms.push(r.then((r) => handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut)));
				else handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut);
			}
			if (unrecognized.length) payload.issues.push({
				code: "unrecognized_keys",
				keys: unrecognized,
				input,
				inst
			});
			if (!proms.length) return payload;
			return Promise.all(proms).then(() => {
				return payload;
			});
		}
		const $ZodObject = /*@__PURE__*/ $constructor("$ZodObject", (inst, def) => {
			$ZodType.init(inst, def);
			if (!Object.getOwnPropertyDescriptor(def, "shape")?.get) {
				const sh = def.shape;
				Object.defineProperty(def, "shape", { get: () => {
					const newSh = { ...sh };
					Object.defineProperty(def, "shape", { value: newSh });
					return newSh;
				} });
			}
			const _normalized = cached(() => normalizeDef(def));
			defineLazy(inst._zod, "propValues", () => {
				const shape = def.shape;
				const propValues = {};
				for (const key in shape) {
					const field = shape[key]._zod;
					if (field.values) {
						propValues[key] ?? (propValues[key] = /* @__PURE__ */ new Set());
						for (const v of field.values) propValues[key].add(v);
					}
				}
				return propValues;
			});
			const isObject$1 = isObject;
			const catchall = def.catchall;
			let value;
			inst._zod.parse = (payload, ctx) => {
				value ?? (value = _normalized.value);
				const input = payload.value;
				if (!isObject$1(input)) {
					payload.issues.push({
						expected: "object",
						code: "invalid_type",
						input,
						inst
					});
					return payload;
				}
				payload.value = {};
				const proms = [];
				const shape = value.shape;
				for (const key of value.keys) {
					const el = shape[key];
					const isOptionalIn = el._zod.optin === "optional";
					const isOptionalOut = el._zod.optout === "optional";
					const r = el._zod.run({
						value: input[key],
						issues: []
					}, ctx);
					if (r instanceof Promise) proms.push(r.then((r) => handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut)));
					else handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut);
				}
				if (!catchall) return proms.length ? Promise.all(proms).then(() => payload) : payload;
				return handleCatchall(proms, input, payload, ctx, _normalized.value, inst);
			};
		});
		const $ZodObjectJIT = /*@__PURE__*/ $constructor("$ZodObjectJIT", (inst, def) => {
			$ZodObject.init(inst, def);
			const superParse = inst._zod.parse;
			const _normalized = cached(() => normalizeDef(def));
			const generateFastpass = (shape) => {
				const doc = new Doc([
					"shape",
					"payload",
					"ctx"
				]);
				const normalized = _normalized.value;
				const parseStr = (key) => {
					const k = esc(key);
					return `shape[${k}]._zod.run({ value: input[${k}], issues: [] }, ctx)`;
				};
				doc.write(`const input = payload.value;`);
				const ids = Object.create(null);
				let counter = 0;
				for (const key of normalized.keys) ids[key] = `key_${counter++}`;
				doc.write(`const newResult = {};`);
				for (const key of normalized.keys) {
					const id = ids[key];
					const k = esc(key);
					const schema = shape[key];
					const isOptionalIn = schema?._zod?.optin === "optional";
					const isOptionalOut = schema?._zod?.optout === "optional";
					doc.write(`const ${id} = ${parseStr(key)};`);
					if (isOptionalIn && isOptionalOut) doc.write(`
        if (${id}.issues.length) {
          if (${k} in input) {
            payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
              ...iss,
              path: iss.path ? [${k}, ...iss.path] : [${k}]
            })));
          }
        }
        
        if (${id}.value === undefined) {
          if (${k} in input) {
            newResult[${k}] = undefined;
          }
        } else {
          newResult[${k}] = ${id}.value;
        }
        
      `);
					else if (!isOptionalIn) doc.write(`
        const ${id}_present = ${k} in input;
        if (${id}.issues.length) {
          payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${k}, ...iss.path] : [${k}]
          })));
        }
        if (!${id}_present && !${id}.issues.length) {
          payload.issues.push({
            code: "invalid_type",
            expected: "nonoptional",
            input: undefined,
            path: [${k}]
          });
        }

        if (${id}_present) {
          if (${id}.value === undefined) {
            newResult[${k}] = undefined;
          } else {
            newResult[${k}] = ${id}.value;
          }
        }

      `);
					else doc.write(`
        if (${id}.issues.length) {
          payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${k}, ...iss.path] : [${k}]
          })));
        }
        
        if (${id}.value === undefined) {
          if (${k} in input) {
            newResult[${k}] = undefined;
          }
        } else {
          newResult[${k}] = ${id}.value;
        }
        
      `);
				}
				doc.write(`payload.value = newResult;`);
				doc.write(`return payload;`);
				const fn = doc.compile();
				return (payload, ctx) => fn(shape, payload, ctx);
			};
			let fastpass;
			const isObject$2 = isObject;
			const jit = !globalConfig.jitless;
			const fastEnabled = jit && allowsEval.value;
			const catchall = def.catchall;
			let value;
			inst._zod.parse = (payload, ctx) => {
				value ?? (value = _normalized.value);
				const input = payload.value;
				if (!isObject$2(input)) {
					payload.issues.push({
						expected: "object",
						code: "invalid_type",
						input,
						inst
					});
					return payload;
				}
				if (jit && fastEnabled && ctx?.async === false && ctx.jitless !== true) {
					if (!fastpass) fastpass = generateFastpass(def.shape);
					payload = fastpass(payload, ctx);
					if (!catchall) return payload;
					return handleCatchall([], input, payload, ctx, value, inst);
				}
				return superParse(payload, ctx);
			};
		});
		function handleUnionResults(results, final, inst, ctx) {
			for (const result of results) if (result.issues.length === 0) {
				final.value = result.value;
				return final;
			}
			const nonaborted = results.filter((r) => !aborted(r));
			if (nonaborted.length === 1) {
				final.value = nonaborted[0].value;
				return nonaborted[0];
			}
			final.issues.push({
				code: "invalid_union",
				input: final.value,
				inst,
				errors: results.map((result) => result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
			});
			return final;
		}
		const $ZodUnion = /*@__PURE__*/ $constructor("$ZodUnion", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazy(inst._zod, "optin", () => def.options.some((o) => o._zod.optin === "optional") ? "optional" : void 0);
			defineLazy(inst._zod, "optout", () => def.options.some((o) => o._zod.optout === "optional") ? "optional" : void 0);
			defineLazy(inst._zod, "values", () => {
				if (def.options.every((o) => o._zod.values)) return new Set(def.options.flatMap((option) => Array.from(option._zod.values)));
			});
			defineLazy(inst._zod, "pattern", () => {
				if (def.options.every((o) => o._zod.pattern)) {
					const patterns = def.options.map((o) => o._zod.pattern);
					return new RegExp(`^(${patterns.map((p) => cleanRegex(p.source)).join("|")})$`);
				}
			});
			const first = def.options.length === 1 ? def.options[0]._zod.run : null;
			inst._zod.parse = (payload, ctx) => {
				if (first) return first(payload, ctx);
				let async = false;
				const results = [];
				for (const option of def.options) {
					const result = option._zod.run({
						value: payload.value,
						issues: []
					}, ctx);
					if (result instanceof Promise) {
						results.push(result);
						async = true;
					} else {
						if (result.issues.length === 0) return result;
						results.push(result);
					}
				}
				if (!async) return handleUnionResults(results, payload, inst, ctx);
				return Promise.all(results).then((results) => {
					return handleUnionResults(results, payload, inst, ctx);
				});
			};
		});
		const $ZodIntersection = /*@__PURE__*/ $constructor("$ZodIntersection", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload, ctx) => {
				const input = payload.value;
				const left = def.left._zod.run({
					value: input,
					issues: []
				}, ctx);
				const right = def.right._zod.run({
					value: input,
					issues: []
				}, ctx);
				if (left instanceof Promise || right instanceof Promise) return Promise.all([left, right]).then(([left, right]) => {
					return handleIntersectionResults(payload, left, right);
				});
				return handleIntersectionResults(payload, left, right);
			};
		});
		function mergeValues(a, b) {
			if (a === b) return {
				valid: true,
				data: a
			};
			if (a instanceof Date && b instanceof Date && +a === +b) return {
				valid: true,
				data: a
			};
			if (isPlainObject(a) && isPlainObject(b)) {
				const bKeys = Object.keys(b);
				const sharedKeys = Object.keys(a).filter((key) => bKeys.indexOf(key) !== -1);
				const newObj = {
					...a,
					...b
				};
				for (const key of sharedKeys) {
					const sharedValue = mergeValues(a[key], b[key]);
					if (!sharedValue.valid) return {
						valid: false,
						mergeErrorPath: [key, ...sharedValue.mergeErrorPath]
					};
					newObj[key] = sharedValue.data;
				}
				return {
					valid: true,
					data: newObj
				};
			}
			if (Array.isArray(a) && Array.isArray(b)) {
				if (a.length !== b.length) return {
					valid: false,
					mergeErrorPath: []
				};
				const newArray = [];
				for (let index = 0; index < a.length; index++) {
					const itemA = a[index];
					const itemB = b[index];
					const sharedValue = mergeValues(itemA, itemB);
					if (!sharedValue.valid) return {
						valid: false,
						mergeErrorPath: [index, ...sharedValue.mergeErrorPath]
					};
					newArray.push(sharedValue.data);
				}
				return {
					valid: true,
					data: newArray
				};
			}
			return {
				valid: false,
				mergeErrorPath: []
			};
		}
		function handleIntersectionResults(result, left, right) {
			const unrecKeys = /* @__PURE__ */ new Map();
			let unrecIssue;
			for (const iss of left.issues) if (iss.code === "unrecognized_keys") {
				unrecIssue ?? (unrecIssue = iss);
				for (const k of iss.keys) {
					if (!unrecKeys.has(k)) unrecKeys.set(k, {});
					unrecKeys.get(k).l = true;
				}
			} else result.issues.push(iss);
			for (const iss of right.issues) if (iss.code === "unrecognized_keys") for (const k of iss.keys) {
				if (!unrecKeys.has(k)) unrecKeys.set(k, {});
				unrecKeys.get(k).r = true;
			}
			else result.issues.push(iss);
			const bothKeys = [...unrecKeys].filter(([, f]) => f.l && f.r).map(([k]) => k);
			if (bothKeys.length && unrecIssue) result.issues.push({
				...unrecIssue,
				keys: bothKeys
			});
			if (aborted(result)) return result;
			const merged = mergeValues(left.value, right.value);
			if (!merged.valid) throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(merged.mergeErrorPath)}`);
			result.value = merged.data;
			return result;
		}
		const $ZodRecord = /*@__PURE__*/ $constructor("$ZodRecord", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload, ctx) => {
				const input = payload.value;
				if (!isPlainObject(input)) {
					payload.issues.push({
						expected: "record",
						code: "invalid_type",
						input,
						inst
					});
					return payload;
				}
				const proms = [];
				const values = def.keyType._zod.values;
				if (values) {
					payload.value = {};
					const recordKeys = /* @__PURE__ */ new Set();
					for (const key of values) if (typeof key === "string" || typeof key === "number" || typeof key === "symbol") {
						recordKeys.add(typeof key === "number" ? key.toString() : key);
						const keyResult = def.keyType._zod.run({
							value: key,
							issues: []
						}, ctx);
						if (keyResult instanceof Promise) throw new Error("Async schemas not supported in object keys currently");
						if (keyResult.issues.length) {
							payload.issues.push({
								code: "invalid_key",
								origin: "record",
								issues: keyResult.issues.map((iss) => finalizeIssue(iss, ctx, config())),
								input: key,
								path: [key],
								inst
							});
							continue;
						}
						const outKey = keyResult.value;
						const result = def.valueType._zod.run({
							value: input[key],
							issues: []
						}, ctx);
						if (result instanceof Promise) proms.push(result.then((result) => {
							if (result.issues.length) payload.issues.push(...prefixIssues(key, result.issues));
							payload.value[outKey] = result.value;
						}));
						else {
							if (result.issues.length) payload.issues.push(...prefixIssues(key, result.issues));
							payload.value[outKey] = result.value;
						}
					}
					let unrecognized;
					for (const key in input) if (!recordKeys.has(key)) {
						unrecognized = unrecognized ?? [];
						unrecognized.push(key);
					}
					if (unrecognized && unrecognized.length > 0) payload.issues.push({
						code: "unrecognized_keys",
						input,
						inst,
						keys: unrecognized
					});
				} else {
					payload.value = {};
					for (const key of Reflect.ownKeys(input)) {
						if (key === "__proto__") continue;
						if (!Object.prototype.propertyIsEnumerable.call(input, key)) continue;
						let keyResult = def.keyType._zod.run({
							value: key,
							issues: []
						}, ctx);
						if (keyResult instanceof Promise) throw new Error("Async schemas not supported in object keys currently");
						if (typeof key === "string" && number$1.test(key) && keyResult.issues.length) {
							const retryResult = def.keyType._zod.run({
								value: Number(key),
								issues: []
							}, ctx);
							if (retryResult instanceof Promise) throw new Error("Async schemas not supported in object keys currently");
							if (retryResult.issues.length === 0) keyResult = retryResult;
						}
						if (keyResult.issues.length) {
							if (def.mode === "loose") payload.value[key] = input[key];
							else payload.issues.push({
								code: "invalid_key",
								origin: "record",
								issues: keyResult.issues.map((iss) => finalizeIssue(iss, ctx, config())),
								input: key,
								path: [key],
								inst
							});
							continue;
						}
						const result = def.valueType._zod.run({
							value: input[key],
							issues: []
						}, ctx);
						if (result instanceof Promise) proms.push(result.then((result) => {
							if (result.issues.length) payload.issues.push(...prefixIssues(key, result.issues));
							payload.value[keyResult.value] = result.value;
						}));
						else {
							if (result.issues.length) payload.issues.push(...prefixIssues(key, result.issues));
							payload.value[keyResult.value] = result.value;
						}
					}
				}
				if (proms.length) return Promise.all(proms).then(() => payload);
				return payload;
			};
		});
		const $ZodEnum = /*@__PURE__*/ $constructor("$ZodEnum", (inst, def) => {
			$ZodType.init(inst, def);
			const values = getEnumValues(def.entries);
			const valuesSet = new Set(values);
			inst._zod.values = valuesSet;
			inst._zod.pattern = new RegExp(`^(${values.filter((k) => propertyKeyTypes.has(typeof k)).map((o) => typeof o === "string" ? escapeRegex(o) : o.toString()).join("|")})$`);
			inst._zod.parse = (payload, _ctx) => {
				const input = payload.value;
				if (valuesSet.has(input)) return payload;
				payload.issues.push({
					code: "invalid_value",
					values,
					input,
					inst
				});
				return payload;
			};
		});
		const $ZodTransform = /*@__PURE__*/ $constructor("$ZodTransform", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.optin = "optional";
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") throw new $ZodEncodeError(inst.constructor.name);
				const _out = def.transform(payload.value, payload);
				if (ctx.async) return (_out instanceof Promise ? _out : Promise.resolve(_out)).then((output) => {
					payload.value = output;
					payload.fallback = true;
					return payload;
				});
				if (_out instanceof Promise) throw new $ZodAsyncError();
				payload.value = _out;
				payload.fallback = true;
				return payload;
			};
		});
		function handleOptionalResult(result, input) {
			if (input === void 0 && (result.issues.length || result.fallback)) return {
				issues: [],
				value: void 0
			};
			return result;
		}
		const $ZodOptional = /*@__PURE__*/ $constructor("$ZodOptional", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.optin = "optional";
			inst._zod.optout = "optional";
			defineLazy(inst._zod, "values", () => {
				return def.innerType._zod.values ? /* @__PURE__ */ new Set([...def.innerType._zod.values, void 0]) : void 0;
			});
			defineLazy(inst._zod, "pattern", () => {
				const pattern = def.innerType._zod.pattern;
				return pattern ? new RegExp(`^(${cleanRegex(pattern.source)})?$`) : void 0;
			});
			inst._zod.parse = (payload, ctx) => {
				if (def.innerType._zod.optin === "optional") {
					const input = payload.value;
					const result = def.innerType._zod.run(payload, ctx);
					if (result instanceof Promise) return result.then((r) => handleOptionalResult(r, input));
					return handleOptionalResult(result, input);
				}
				if (payload.value === void 0) return payload;
				return def.innerType._zod.run(payload, ctx);
			};
		});
		const $ZodExactOptional = /*@__PURE__*/ $constructor("$ZodExactOptional", (inst, def) => {
			$ZodOptional.init(inst, def);
			defineLazy(inst._zod, "values", () => def.innerType._zod.values);
			defineLazy(inst._zod, "pattern", () => def.innerType._zod.pattern);
			inst._zod.parse = (payload, ctx) => {
				return def.innerType._zod.run(payload, ctx);
			};
		});
		const $ZodNullable = /*@__PURE__*/ $constructor("$ZodNullable", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazy(inst._zod, "optin", () => def.innerType._zod.optin);
			defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
			defineLazy(inst._zod, "pattern", () => {
				const pattern = def.innerType._zod.pattern;
				return pattern ? new RegExp(`^(${cleanRegex(pattern.source)}|null)$`) : void 0;
			});
			defineLazy(inst._zod, "values", () => {
				return def.innerType._zod.values ? /* @__PURE__ */ new Set([...def.innerType._zod.values, null]) : void 0;
			});
			inst._zod.parse = (payload, ctx) => {
				if (payload.value === null) return payload;
				return def.innerType._zod.run(payload, ctx);
			};
		});
		const $ZodDefault = /*@__PURE__*/ $constructor("$ZodDefault", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.optin = "optional";
			defineLazy(inst._zod, "values", () => def.innerType._zod.values);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
				if (payload.value === void 0) {
					payload.value = def.defaultValue;
					/**
					* $ZodDefault returns the default value immediately in forward direction.
					* It doesn't pass the default value into the validator ("prefault"). There's no reason to pass the default value through validation. The validity of the default is enforced by TypeScript statically. Otherwise, it's the responsibility of the user to ensure the default is valid. In the case of pipes with divergent in/out types, you can specify the default on the `in` schema of your ZodPipe to set a "prefault" for the pipe.   */
					return payload;
				}
				const result = def.innerType._zod.run(payload, ctx);
				if (result instanceof Promise) return result.then((result) => handleDefaultResult(result, def));
				return handleDefaultResult(result, def);
			};
		});
		function handleDefaultResult(payload, def) {
			if (payload.value === void 0) payload.value = def.defaultValue;
			return payload;
		}
		const $ZodPrefault = /*@__PURE__*/ $constructor("$ZodPrefault", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.optin = "optional";
			defineLazy(inst._zod, "values", () => def.innerType._zod.values);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
				if (payload.value === void 0) payload.value = def.defaultValue;
				return def.innerType._zod.run(payload, ctx);
			};
		});
		const $ZodNonOptional = /*@__PURE__*/ $constructor("$ZodNonOptional", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazy(inst._zod, "values", () => {
				const v = def.innerType._zod.values;
				return v ? new Set([...v].filter((x) => x !== void 0)) : void 0;
			});
			inst._zod.parse = (payload, ctx) => {
				const result = def.innerType._zod.run(payload, ctx);
				if (result instanceof Promise) return result.then((result) => handleNonOptionalResult(result, inst));
				return handleNonOptionalResult(result, inst);
			};
		});
		function handleNonOptionalResult(payload, inst) {
			if (!payload.issues.length && payload.value === void 0) payload.issues.push({
				code: "invalid_type",
				expected: "nonoptional",
				input: payload.value,
				inst
			});
			return payload;
		}
		const $ZodCatch = /*@__PURE__*/ $constructor("$ZodCatch", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.optin = "optional";
			defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
			defineLazy(inst._zod, "values", () => def.innerType._zod.values);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
				const result = def.innerType._zod.run(payload, ctx);
				if (result instanceof Promise) return result.then((result) => {
					payload.value = result.value;
					if (result.issues.length) {
						payload.value = def.catchValue({
							...payload,
							error: { issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config())) },
							input: payload.value
						});
						payload.issues = [];
						payload.fallback = true;
					}
					return payload;
				});
				payload.value = result.value;
				if (result.issues.length) {
					payload.value = def.catchValue({
						...payload,
						error: { issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config())) },
						input: payload.value
					});
					payload.issues = [];
					payload.fallback = true;
				}
				return payload;
			};
		});
		const $ZodPipe = /*@__PURE__*/ $constructor("$ZodPipe", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazy(inst._zod, "values", () => def.in._zod.values);
			defineLazy(inst._zod, "optin", () => def.in._zod.optin);
			defineLazy(inst._zod, "optout", () => def.out._zod.optout);
			defineLazy(inst._zod, "propValues", () => def.in._zod.propValues);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") {
					const right = def.out._zod.run(payload, ctx);
					if (right instanceof Promise) return right.then((right) => handlePipeResult(right, def.in, ctx));
					return handlePipeResult(right, def.in, ctx);
				}
				const left = def.in._zod.run(payload, ctx);
				if (left instanceof Promise) return left.then((left) => handlePipeResult(left, def.out, ctx));
				return handlePipeResult(left, def.out, ctx);
			};
		});
		function handlePipeResult(left, next, ctx) {
			if (left.issues.length) {
				left.aborted = true;
				return left;
			}
			return next._zod.run({
				value: left.value,
				issues: left.issues,
				fallback: left.fallback
			}, ctx);
		}
		const $ZodReadonly = /*@__PURE__*/ $constructor("$ZodReadonly", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazy(inst._zod, "propValues", () => def.innerType._zod.propValues);
			defineLazy(inst._zod, "values", () => def.innerType._zod.values);
			defineLazy(inst._zod, "optin", () => def.innerType?._zod?.optin);
			defineLazy(inst._zod, "optout", () => def.innerType?._zod?.optout);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
				const result = def.innerType._zod.run(payload, ctx);
				if (result instanceof Promise) return result.then(handleReadonlyResult);
				return handleReadonlyResult(result);
			};
		});
		function handleReadonlyResult(payload) {
			payload.value = Object.freeze(payload.value);
			return payload;
		}
		const $ZodCustom = /*@__PURE__*/ $constructor("$ZodCustom", (inst, def) => {
			$ZodCheck.init(inst, def);
			$ZodType.init(inst, def);
			inst._zod.parse = (payload, _) => {
				return payload;
			};
			inst._zod.check = (payload) => {
				const input = payload.value;
				const r = def.fn(input);
				if (r instanceof Promise) return r.then((r) => handleRefineResult(r, payload, input, inst));
				handleRefineResult(r, payload, input, inst);
			};
		});
		function handleRefineResult(result, payload, input, inst) {
			if (!result) {
				const _iss = {
					code: "custom",
					input,
					inst,
					path: [...inst._zod.def.path ?? []],
					continue: !inst._zod.def.abort
				};
				if (inst._zod.def.params) _iss.params = inst._zod.def.params;
				payload.issues.push(issue(_iss));
			}
		}
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/registries.js
		var _a;
		var $ZodRegistry = class {
			constructor() {
				this._map = /* @__PURE__ */ new WeakMap();
				this._idmap = /* @__PURE__ */ new Map();
			}
			add(schema, ..._meta) {
				const meta = _meta[0];
				this._map.set(schema, meta);
				if (meta && typeof meta === "object" && "id" in meta) this._idmap.set(meta.id, schema);
				return this;
			}
			clear() {
				this._map = /* @__PURE__ */ new WeakMap();
				this._idmap = /* @__PURE__ */ new Map();
				return this;
			}
			remove(schema) {
				const meta = this._map.get(schema);
				if (meta && typeof meta === "object" && "id" in meta) this._idmap.delete(meta.id);
				this._map.delete(schema);
				return this;
			}
			get(schema) {
				const p = schema._zod.parent;
				if (p) {
					const pm = { ...this.get(p) ?? {} };
					delete pm.id;
					const f = {
						...pm,
						...this._map.get(schema)
					};
					return Object.keys(f).length ? f : void 0;
				}
				return this._map.get(schema);
			}
			has(schema) {
				return this._map.has(schema);
			}
		};
		function registry() {
			return new $ZodRegistry();
		}
		(_a = globalThis).__zod_globalRegistry ?? (_a.__zod_globalRegistry = registry());
		const globalRegistry = globalThis.__zod_globalRegistry;
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/api.js
		// @__NO_SIDE_EFFECTS__
		function _string(Class, params) {
			return new Class({
				type: "string",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _email(Class, params) {
			return new Class({
				type: "string",
				format: "email",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _guid(Class, params) {
			return new Class({
				type: "string",
				format: "guid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _uuid(Class, params) {
			return new Class({
				type: "string",
				format: "uuid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _uuidv4(Class, params) {
			return new Class({
				type: "string",
				format: "uuid",
				check: "string_format",
				abort: false,
				version: "v4",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _uuidv6(Class, params) {
			return new Class({
				type: "string",
				format: "uuid",
				check: "string_format",
				abort: false,
				version: "v6",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _uuidv7(Class, params) {
			return new Class({
				type: "string",
				format: "uuid",
				check: "string_format",
				abort: false,
				version: "v7",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _url(Class, params) {
			return new Class({
				type: "string",
				format: "url",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _emoji(Class, params) {
			return new Class({
				type: "string",
				format: "emoji",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _nanoid(Class, params) {
			return new Class({
				type: "string",
				format: "nanoid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		/**
		* @deprecated CUID v1 is deprecated by its authors due to information leakage
		* (timestamps embedded in the id). Use {@link _cuid2} instead.
		* See https://github.com/paralleldrive/cuid.
		*/
		// @__NO_SIDE_EFFECTS__
		function _cuid(Class, params) {
			return new Class({
				type: "string",
				format: "cuid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _cuid2(Class, params) {
			return new Class({
				type: "string",
				format: "cuid2",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _ulid(Class, params) {
			return new Class({
				type: "string",
				format: "ulid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _xid(Class, params) {
			return new Class({
				type: "string",
				format: "xid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _ksuid(Class, params) {
			return new Class({
				type: "string",
				format: "ksuid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _ipv4(Class, params) {
			return new Class({
				type: "string",
				format: "ipv4",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _ipv6(Class, params) {
			return new Class({
				type: "string",
				format: "ipv6",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _cidrv4(Class, params) {
			return new Class({
				type: "string",
				format: "cidrv4",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _cidrv6(Class, params) {
			return new Class({
				type: "string",
				format: "cidrv6",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _base64(Class, params) {
			return new Class({
				type: "string",
				format: "base64",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _base64url(Class, params) {
			return new Class({
				type: "string",
				format: "base64url",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _e164(Class, params) {
			return new Class({
				type: "string",
				format: "e164",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _jwt(Class, params) {
			return new Class({
				type: "string",
				format: "jwt",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _isoDateTime(Class, params) {
			return new Class({
				type: "string",
				format: "datetime",
				check: "string_format",
				offset: false,
				local: false,
				precision: null,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _isoDate(Class, params) {
			return new Class({
				type: "string",
				format: "date",
				check: "string_format",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _isoTime(Class, params) {
			return new Class({
				type: "string",
				format: "time",
				check: "string_format",
				precision: null,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _isoDuration(Class, params) {
			return new Class({
				type: "string",
				format: "duration",
				check: "string_format",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _number(Class, params) {
			return new Class({
				type: "number",
				checks: [],
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _int(Class, params) {
			return new Class({
				type: "number",
				check: "number_format",
				abort: false,
				format: "safeint",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _boolean(Class, params) {
			return new Class({
				type: "boolean",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _unknown(Class) {
			return new Class({ type: "unknown" });
		}
		// @__NO_SIDE_EFFECTS__
		function _never(Class, params) {
			return new Class({
				type: "never",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _lt(value, params) {
			return new $ZodCheckLessThan({
				check: "less_than",
				...normalizeParams(params),
				value,
				inclusive: false
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _lte(value, params) {
			return new $ZodCheckLessThan({
				check: "less_than",
				...normalizeParams(params),
				value,
				inclusive: true
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _gt(value, params) {
			return new $ZodCheckGreaterThan({
				check: "greater_than",
				...normalizeParams(params),
				value,
				inclusive: false
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _gte(value, params) {
			return new $ZodCheckGreaterThan({
				check: "greater_than",
				...normalizeParams(params),
				value,
				inclusive: true
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _multipleOf(value, params) {
			return new $ZodCheckMultipleOf({
				check: "multiple_of",
				...normalizeParams(params),
				value
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _maxLength(maximum, params) {
			return new $ZodCheckMaxLength({
				check: "max_length",
				...normalizeParams(params),
				maximum
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _minLength(minimum, params) {
			return new $ZodCheckMinLength({
				check: "min_length",
				...normalizeParams(params),
				minimum
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _length(length, params) {
			return new $ZodCheckLengthEquals({
				check: "length_equals",
				...normalizeParams(params),
				length
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _regex(pattern, params) {
			return new $ZodCheckRegex({
				check: "string_format",
				format: "regex",
				...normalizeParams(params),
				pattern
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _lowercase(params) {
			return new $ZodCheckLowerCase({
				check: "string_format",
				format: "lowercase",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _uppercase(params) {
			return new $ZodCheckUpperCase({
				check: "string_format",
				format: "uppercase",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _includes(includes, params) {
			return new $ZodCheckIncludes({
				check: "string_format",
				format: "includes",
				...normalizeParams(params),
				includes
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _startsWith(prefix, params) {
			return new $ZodCheckStartsWith({
				check: "string_format",
				format: "starts_with",
				...normalizeParams(params),
				prefix
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _endsWith(suffix, params) {
			return new $ZodCheckEndsWith({
				check: "string_format",
				format: "ends_with",
				...normalizeParams(params),
				suffix
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _overwrite(tx) {
			return new $ZodCheckOverwrite({
				check: "overwrite",
				tx
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _normalize(form) {
			return /* @__PURE__ */ _overwrite((input) => input.normalize(form));
		}
		// @__NO_SIDE_EFFECTS__
		function _trim() {
			return /* @__PURE__ */ _overwrite((input) => input.trim());
		}
		// @__NO_SIDE_EFFECTS__
		function _toLowerCase() {
			return /* @__PURE__ */ _overwrite((input) => input.toLowerCase());
		}
		// @__NO_SIDE_EFFECTS__
		function _toUpperCase() {
			return /* @__PURE__ */ _overwrite((input) => input.toUpperCase());
		}
		// @__NO_SIDE_EFFECTS__
		function _slugify() {
			return /* @__PURE__ */ _overwrite((input) => slugify(input));
		}
		// @__NO_SIDE_EFFECTS__
		function _array(Class, element, params) {
			return new Class({
				type: "array",
				element,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _refine(Class, fn, _params) {
			return new Class({
				type: "custom",
				check: "custom",
				fn,
				...normalizeParams(_params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _superRefine(fn, params) {
			const ch = /* @__PURE__ */ _check((payload) => {
				payload.addIssue = (issue$2) => {
					if (typeof issue$2 === "string") payload.issues.push(issue(issue$2, payload.value, ch._zod.def));
					else {
						const _issue = issue$2;
						if (_issue.fatal) _issue.continue = false;
						_issue.code ?? (_issue.code = "custom");
						_issue.input ?? (_issue.input = payload.value);
						_issue.inst ?? (_issue.inst = ch);
						_issue.continue ?? (_issue.continue = !ch._zod.def.abort);
						payload.issues.push(issue(_issue));
					}
				};
				return fn(payload.value, payload);
			}, params);
			return ch;
		}
		// @__NO_SIDE_EFFECTS__
		function _check(fn, params) {
			const ch = new $ZodCheck({
				check: "custom",
				...normalizeParams(params)
			});
			ch._zod.check = fn;
			return ch;
		}
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/to-json-schema.js
		function initializeContext(params) {
			let target = params?.target ?? "draft-2020-12";
			if (target === "draft-4") target = "draft-04";
			if (target === "draft-7") target = "draft-07";
			return {
				processors: params.processors ?? {},
				metadataRegistry: params?.metadata ?? globalRegistry,
				target,
				unrepresentable: params?.unrepresentable ?? "throw",
				override: params?.override ?? (() => {}),
				io: params?.io ?? "output",
				counter: 0,
				seen: /* @__PURE__ */ new Map(),
				cycles: params?.cycles ?? "ref",
				reused: params?.reused ?? "inline",
				external: params?.external ?? void 0
			};
		}
		function process(schema, ctx, _params = {
			path: [],
			schemaPath: []
		}) {
			var _a;
			const def = schema._zod.def;
			const seen = ctx.seen.get(schema);
			if (seen) {
				seen.count++;
				if (_params.schemaPath.includes(schema)) seen.cycle = _params.path;
				return seen.schema;
			}
			const result = {
				schema: {},
				count: 1,
				cycle: void 0,
				path: _params.path
			};
			ctx.seen.set(schema, result);
			const overrideSchema = schema._zod.toJSONSchema?.();
			if (overrideSchema) result.schema = overrideSchema;
			else {
				const params = {
					..._params,
					schemaPath: [..._params.schemaPath, schema],
					path: _params.path
				};
				if (schema._zod.processJSONSchema) schema._zod.processJSONSchema(ctx, result.schema, params);
				else {
					const _json = result.schema;
					const processor = ctx.processors[def.type];
					if (!processor) throw new Error(`[toJSONSchema]: Non-representable type encountered: ${def.type}`);
					processor(schema, ctx, _json, params);
				}
				const parent = schema._zod.parent;
				if (parent) {
					if (!result.ref) result.ref = parent;
					process(parent, ctx, params);
					ctx.seen.get(parent).isParent = true;
				}
			}
			const meta = ctx.metadataRegistry.get(schema);
			if (meta) Object.assign(result.schema, meta);
			if (ctx.io === "input" && isTransforming(schema)) {
				delete result.schema.examples;
				delete result.schema.default;
			}
			if (ctx.io === "input" && "_prefault" in result.schema) (_a = result.schema).default ?? (_a.default = result.schema._prefault);
			delete result.schema._prefault;
			return ctx.seen.get(schema).schema;
		}
		function extractDefs(ctx, schema) {
			const root = ctx.seen.get(schema);
			if (!root) throw new Error("Unprocessed schema. This is a bug in Zod.");
			const idToSchema = /* @__PURE__ */ new Map();
			for (const entry of ctx.seen.entries()) {
				const id = ctx.metadataRegistry.get(entry[0])?.id;
				if (id) {
					const existing = idToSchema.get(id);
					if (existing && existing !== entry[0]) throw new Error(`Duplicate schema id "${id}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
					idToSchema.set(id, entry[0]);
				}
			}
			const makeURI = (entry) => {
				const defsSegment = ctx.target === "draft-2020-12" ? "$defs" : "definitions";
				if (ctx.external) {
					const externalId = ctx.external.registry.get(entry[0])?.id;
					const uriGenerator = ctx.external.uri ?? ((id) => id);
					if (externalId) return { ref: uriGenerator(externalId) };
					const id = entry[1].defId ?? entry[1].schema.id ?? `schema${ctx.counter++}`;
					entry[1].defId = id;
					return {
						defId: id,
						ref: `${uriGenerator("__shared")}#/${defsSegment}/${id}`
					};
				}
				if (entry[1] === root) return { ref: "#" };
				const defUriPrefix = `#/${defsSegment}/`;
				const defId = entry[1].schema.id ?? `__schema${ctx.counter++}`;
				return {
					defId,
					ref: defUriPrefix + defId
				};
			};
			const extractToDef = (entry) => {
				if (entry[1].schema.$ref) return;
				const seen = entry[1];
				const { ref, defId } = makeURI(entry);
				seen.def = { ...seen.schema };
				if (defId) seen.defId = defId;
				const schema = seen.schema;
				for (const key in schema) delete schema[key];
				schema.$ref = ref;
			};
			if (ctx.cycles === "throw") for (const entry of ctx.seen.entries()) {
				const seen = entry[1];
				if (seen.cycle) throw new Error(`Cycle detected: #/${seen.cycle?.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
			}
			for (const entry of ctx.seen.entries()) {
				const seen = entry[1];
				if (schema === entry[0]) {
					extractToDef(entry);
					continue;
				}
				if (ctx.external) {
					const ext = ctx.external.registry.get(entry[0])?.id;
					if (schema !== entry[0] && ext) {
						extractToDef(entry);
						continue;
					}
				}
				if (ctx.metadataRegistry.get(entry[0])?.id) {
					extractToDef(entry);
					continue;
				}
				if (seen.cycle) {
					extractToDef(entry);
					continue;
				}
				if (seen.count > 1) {
					if (ctx.reused === "ref") {
						extractToDef(entry);
						continue;
					}
				}
			}
		}
		function finalize(ctx, schema) {
			const root = ctx.seen.get(schema);
			if (!root) throw new Error("Unprocessed schema. This is a bug in Zod.");
			const flattenRef = (zodSchema) => {
				const seen = ctx.seen.get(zodSchema);
				if (seen.ref === null) return;
				const schema = seen.def ?? seen.schema;
				const _cached = { ...schema };
				const ref = seen.ref;
				seen.ref = null;
				if (ref) {
					flattenRef(ref);
					const refSeen = ctx.seen.get(ref);
					const refSchema = refSeen.schema;
					if (refSchema.$ref && (ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0")) {
						schema.allOf = schema.allOf ?? [];
						schema.allOf.push(refSchema);
					} else Object.assign(schema, refSchema);
					Object.assign(schema, _cached);
					if (zodSchema._zod.parent === ref) for (const key in schema) {
						if (key === "$ref" || key === "allOf") continue;
						if (!(key in _cached)) delete schema[key];
					}
					if (refSchema.$ref && refSeen.def) for (const key in schema) {
						if (key === "$ref" || key === "allOf") continue;
						if (key in refSeen.def && JSON.stringify(schema[key]) === JSON.stringify(refSeen.def[key])) delete schema[key];
					}
				}
				const parent = zodSchema._zod.parent;
				if (parent && parent !== ref) {
					flattenRef(parent);
					const parentSeen = ctx.seen.get(parent);
					if (parentSeen?.schema.$ref) {
						schema.$ref = parentSeen.schema.$ref;
						if (parentSeen.def) for (const key in schema) {
							if (key === "$ref" || key === "allOf") continue;
							if (key in parentSeen.def && JSON.stringify(schema[key]) === JSON.stringify(parentSeen.def[key])) delete schema[key];
						}
					}
				}
				ctx.override({
					zodSchema,
					jsonSchema: schema,
					path: seen.path ?? []
				});
			};
			for (const entry of [...ctx.seen.entries()].reverse()) flattenRef(entry[0]);
			const result = {};
			if (ctx.target === "draft-2020-12") result.$schema = "https://json-schema.org/draft/2020-12/schema";
			else if (ctx.target === "draft-07") result.$schema = "http://json-schema.org/draft-07/schema#";
			else if (ctx.target === "draft-04") result.$schema = "http://json-schema.org/draft-04/schema#";
			else if (ctx.target === "openapi-3.0") {}
			if (ctx.external?.uri) {
				const id = ctx.external.registry.get(schema)?.id;
				if (!id) throw new Error("Schema is missing an `id` property");
				result.$id = ctx.external.uri(id);
			}
			Object.assign(result, root.def ?? root.schema);
			const rootMetaId = ctx.metadataRegistry.get(schema)?.id;
			if (rootMetaId !== void 0 && result.id === rootMetaId) delete result.id;
			const defs = ctx.external?.defs ?? {};
			for (const entry of ctx.seen.entries()) {
				const seen = entry[1];
				if (seen.def && seen.defId) {
					if (seen.def.id === seen.defId) delete seen.def.id;
					defs[seen.defId] = seen.def;
				}
			}
			if (ctx.external) {} else if (Object.keys(defs).length > 0) {
				if (ctx.target === "draft-2020-12") result.$defs = defs;
				else result.definitions = defs;
			}
			try {
				const finalized = JSON.parse(JSON.stringify(result));
				Object.defineProperty(finalized, "~standard", {
					value: {
						...schema["~standard"],
						jsonSchema: {
							input: createStandardJSONSchemaMethod(schema, "input", ctx.processors),
							output: createStandardJSONSchemaMethod(schema, "output", ctx.processors)
						}
					},
					enumerable: false,
					writable: false
				});
				return finalized;
			} catch (_err) {
				throw new Error("Error converting schema to JSON.");
			}
		}
		function isTransforming(_schema, _ctx) {
			const ctx = _ctx ?? { seen: /* @__PURE__ */ new Set() };
			if (ctx.seen.has(_schema)) return false;
			ctx.seen.add(_schema);
			const def = _schema._zod.def;
			if (def.type === "transform") return true;
			if (def.type === "array") return isTransforming(def.element, ctx);
			if (def.type === "set") return isTransforming(def.valueType, ctx);
			if (def.type === "lazy") return isTransforming(def.getter(), ctx);
			if (def.type === "promise" || def.type === "optional" || def.type === "nonoptional" || def.type === "nullable" || def.type === "readonly" || def.type === "default" || def.type === "prefault") return isTransforming(def.innerType, ctx);
			if (def.type === "intersection") return isTransforming(def.left, ctx) || isTransforming(def.right, ctx);
			if (def.type === "record" || def.type === "map") return isTransforming(def.keyType, ctx) || isTransforming(def.valueType, ctx);
			if (def.type === "pipe") {
				if (_schema._zod.traits.has("$ZodCodec")) return true;
				return isTransforming(def.in, ctx) || isTransforming(def.out, ctx);
			}
			if (def.type === "object") {
				for (const key in def.shape) if (isTransforming(def.shape[key], ctx)) return true;
				return false;
			}
			if (def.type === "union") {
				for (const option of def.options) if (isTransforming(option, ctx)) return true;
				return false;
			}
			if (def.type === "tuple") {
				for (const item of def.items) if (isTransforming(item, ctx)) return true;
				if (def.rest && isTransforming(def.rest, ctx)) return true;
				return false;
			}
			return false;
		}
		/**
		* Creates a toJSONSchema method for a schema instance.
		* This encapsulates the logic of initializing context, processing, extracting defs, and finalizing.
		*/
		const createToJSONSchemaMethod = (schema, processors = {}) => (params) => {
			const ctx = initializeContext({
				...params,
				processors
			});
			process(schema, ctx);
			extractDefs(ctx, schema);
			return finalize(ctx, schema);
		};
		const createStandardJSONSchemaMethod = (schema, io, processors = {}) => (params) => {
			const { libraryOptions, target } = params ?? {};
			const ctx = initializeContext({
				...libraryOptions ?? {},
				target,
				io,
				processors
			});
			process(schema, ctx);
			extractDefs(ctx, schema);
			return finalize(ctx, schema);
		};
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/json-schema-processors.js
		const formatMap = {
			guid: "uuid",
			url: "uri",
			datetime: "date-time",
			json_string: "json-string",
			regex: ""
		};
		const stringProcessor = (schema, ctx, _json, _params) => {
			const json = _json;
			json.type = "string";
			const { minimum, maximum, format, patterns, contentEncoding } = schema._zod.bag;
			if (typeof minimum === "number") json.minLength = minimum;
			if (typeof maximum === "number") json.maxLength = maximum;
			if (format) {
				json.format = formatMap[format] ?? format;
				if (json.format === "") delete json.format;
				if (format === "time") delete json.format;
			}
			if (contentEncoding) json.contentEncoding = contentEncoding;
			if (patterns && patterns.size > 0) {
				const regexes = [...patterns];
				if (regexes.length === 1) json.pattern = regexes[0].source;
				else if (regexes.length > 1) json.allOf = [...regexes.map((regex) => ({
					...ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0" ? { type: "string" } : {},
					pattern: regex.source
				}))];
			}
		};
		const numberProcessor = (schema, ctx, _json, _params) => {
			const json = _json;
			const { minimum, maximum, format, multipleOf, exclusiveMaximum, exclusiveMinimum } = schema._zod.bag;
			if (typeof format === "string" && format.includes("int")) json.type = "integer";
			else json.type = "number";
			const exMin = typeof exclusiveMinimum === "number" && exclusiveMinimum >= (minimum ?? Number.NEGATIVE_INFINITY);
			const exMax = typeof exclusiveMaximum === "number" && exclusiveMaximum <= (maximum ?? Number.POSITIVE_INFINITY);
			const legacy = ctx.target === "draft-04" || ctx.target === "openapi-3.0";
			if (exMin) {
				if (legacy) {
					json.minimum = exclusiveMinimum;
					json.exclusiveMinimum = true;
				} else json.exclusiveMinimum = exclusiveMinimum;
			} else if (typeof minimum === "number") json.minimum = minimum;
			if (exMax) {
				if (legacy) {
					json.maximum = exclusiveMaximum;
					json.exclusiveMaximum = true;
				} else json.exclusiveMaximum = exclusiveMaximum;
			} else if (typeof maximum === "number") json.maximum = maximum;
			if (typeof multipleOf === "number") json.multipleOf = multipleOf;
		};
		const booleanProcessor = (_schema, _ctx, json, _params) => {
			json.type = "boolean";
		};
		const neverProcessor = (_schema, _ctx, json, _params) => {
			json.not = {};
		};
		const enumProcessor = (schema, _ctx, json, _params) => {
			const def = schema._zod.def;
			const values = getEnumValues(def.entries);
			if (values.every((v) => typeof v === "number")) json.type = "number";
			if (values.every((v) => typeof v === "string")) json.type = "string";
			json.enum = values;
		};
		const customProcessor = (_schema, ctx, _json, _params) => {
			if (ctx.unrepresentable === "throw") throw new Error("Custom types cannot be represented in JSON Schema");
		};
		const transformProcessor = (_schema, ctx, _json, _params) => {
			if (ctx.unrepresentable === "throw") throw new Error("Transforms cannot be represented in JSON Schema");
		};
		const arrayProcessor = (schema, ctx, _json, params) => {
			const json = _json;
			const def = schema._zod.def;
			const { minimum, maximum } = schema._zod.bag;
			if (typeof minimum === "number") json.minItems = minimum;
			if (typeof maximum === "number") json.maxItems = maximum;
			json.type = "array";
			json.items = process(def.element, ctx, {
				...params,
				path: [...params.path, "items"]
			});
		};
		const objectProcessor = (schema, ctx, _json, params) => {
			const json = _json;
			const def = schema._zod.def;
			json.type = "object";
			json.properties = {};
			const shape = def.shape;
			for (const key in shape) json.properties[key] = process(shape[key], ctx, {
				...params,
				path: [
					...params.path,
					"properties",
					key
				]
			});
			const allKeys = new Set(Object.keys(shape));
			const requiredKeys = new Set([...allKeys].filter((key) => {
				const v = def.shape[key]._zod;
				if (ctx.io === "input") return v.optin === void 0;
				else return v.optout === void 0;
			}));
			if (requiredKeys.size > 0) json.required = Array.from(requiredKeys);
			if (def.catchall?._zod.def.type === "never") json.additionalProperties = false;
			else if (!def.catchall) {
				if (ctx.io === "output") json.additionalProperties = false;
			} else if (def.catchall) json.additionalProperties = process(def.catchall, ctx, {
				...params,
				path: [...params.path, "additionalProperties"]
			});
		};
		const unionProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			const isExclusive = def.inclusive === false;
			const options = def.options.map((x, i) => process(x, ctx, {
				...params,
				path: [
					...params.path,
					isExclusive ? "oneOf" : "anyOf",
					i
				]
			}));
			if (isExclusive) json.oneOf = options;
			else json.anyOf = options;
		};
		const intersectionProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			const a = process(def.left, ctx, {
				...params,
				path: [
					...params.path,
					"allOf",
					0
				]
			});
			const b = process(def.right, ctx, {
				...params,
				path: [
					...params.path,
					"allOf",
					1
				]
			});
			const isSimpleIntersection = (val) => "allOf" in val && Object.keys(val).length === 1;
			json.allOf = [...isSimpleIntersection(a) ? a.allOf : [a], ...isSimpleIntersection(b) ? b.allOf : [b]];
		};
		const recordProcessor = (schema, ctx, _json, params) => {
			const json = _json;
			const def = schema._zod.def;
			json.type = "object";
			const keyType = def.keyType;
			const patterns = keyType._zod.bag?.patterns;
			if (def.mode === "loose" && patterns && patterns.size > 0) {
				const valueSchema = process(def.valueType, ctx, {
					...params,
					path: [
						...params.path,
						"patternProperties",
						"*"
					]
				});
				json.patternProperties = {};
				for (const pattern of patterns) json.patternProperties[pattern.source] = valueSchema;
			} else {
				if (ctx.target === "draft-07" || ctx.target === "draft-2020-12") json.propertyNames = process(def.keyType, ctx, {
					...params,
					path: [...params.path, "propertyNames"]
				});
				json.additionalProperties = process(def.valueType, ctx, {
					...params,
					path: [...params.path, "additionalProperties"]
				});
			}
			const keyValues = keyType._zod.values;
			if (keyValues) {
				const validKeyValues = [...keyValues].filter((v) => typeof v === "string" || typeof v === "number");
				if (validKeyValues.length > 0) json.required = validKeyValues;
			}
		};
		const nullableProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			const inner = process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			if (ctx.target === "openapi-3.0") {
				seen.ref = def.innerType;
				json.nullable = true;
			} else json.anyOf = [inner, { type: "null" }];
		};
		const nonoptionalProcessor = (schema, ctx, _json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
		};
		const defaultProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
			json.default = JSON.parse(JSON.stringify(def.defaultValue));
		};
		const prefaultProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
			if (ctx.io === "input") json._prefault = JSON.parse(JSON.stringify(def.defaultValue));
		};
		const catchProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
			let catchValue;
			try {
				catchValue = def.catchValue(void 0);
			} catch {
				throw new Error("Dynamic catch values are not supported in JSON Schema");
			}
			json.default = catchValue;
		};
		const pipeProcessor = (schema, ctx, _json, params) => {
			const def = schema._zod.def;
			const inIsTransform = def.in._zod.traits.has("$ZodTransform");
			const innerType = ctx.io === "input" ? inIsTransform ? def.out : def.in : def.out;
			process(innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = innerType;
		};
		const readonlyProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
			json.readOnly = true;
		};
		const optionalProcessor = (schema, ctx, _json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
		};
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/iso.js
		const ZodISODateTime = /*@__PURE__*/ $constructor("ZodISODateTime", (inst, def) => {
			$ZodISODateTime.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		function datetime(params) {
			return /* @__PURE__ */ _isoDateTime(ZodISODateTime, params);
		}
		const ZodISODate = /*@__PURE__*/ $constructor("ZodISODate", (inst, def) => {
			$ZodISODate.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		function date(params) {
			return /* @__PURE__ */ _isoDate(ZodISODate, params);
		}
		const ZodISOTime = /*@__PURE__*/ $constructor("ZodISOTime", (inst, def) => {
			$ZodISOTime.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		function time(params) {
			return /* @__PURE__ */ _isoTime(ZodISOTime, params);
		}
		const ZodISODuration = /*@__PURE__*/ $constructor("ZodISODuration", (inst, def) => {
			$ZodISODuration.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		function duration(params) {
			return /* @__PURE__ */ _isoDuration(ZodISODuration, params);
		}
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/errors.js
		const initializer = (inst, issues) => {
			$ZodError.init(inst, issues);
			inst.name = "ZodError";
			Object.defineProperties(inst, {
				format: { value: (mapper) => formatError(inst, mapper) },
				flatten: { value: (mapper) => flattenError(inst, mapper) },
				addIssue: { value: (issue) => {
					inst.issues.push(issue);
					inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
				} },
				addIssues: { value: (issues) => {
					inst.issues.push(...issues);
					inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
				} },
				isEmpty: { get() {
					return inst.issues.length === 0;
				} }
			});
		};
		const ZodRealError = /*@__PURE__*/ $constructor("ZodError", initializer, { Parent: Error });
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/parse.js
		const parse = /* @__PURE__ */ _parse(ZodRealError);
		const parseAsync = /* @__PURE__ */ _parseAsync(ZodRealError);
		const safeParse = /* @__PURE__ */ _safeParse(ZodRealError);
		const safeParseAsync = /* @__PURE__ */ _safeParseAsync(ZodRealError);
		const encode = /* @__PURE__ */ _encode(ZodRealError);
		const decode = /* @__PURE__ */ _decode(ZodRealError);
		const encodeAsync = /* @__PURE__ */ _encodeAsync(ZodRealError);
		const decodeAsync = /* @__PURE__ */ _decodeAsync(ZodRealError);
		const safeEncode = /* @__PURE__ */ _safeEncode(ZodRealError);
		const safeDecode = /* @__PURE__ */ _safeDecode(ZodRealError);
		const safeEncodeAsync = /* @__PURE__ */ _safeEncodeAsync(ZodRealError);
		const safeDecodeAsync = /* @__PURE__ */ _safeDecodeAsync(ZodRealError);
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/schemas.js
		const _installedGroups = /* @__PURE__ */ new WeakMap();
		function _installLazyMethods(inst, group, methods) {
			const proto = Object.getPrototypeOf(inst);
			let installed = _installedGroups.get(proto);
			if (!installed) {
				installed = /* @__PURE__ */ new Set();
				_installedGroups.set(proto, installed);
			}
			if (installed.has(group)) return;
			installed.add(group);
			for (const key in methods) {
				const fn = methods[key];
				Object.defineProperty(proto, key, {
					configurable: true,
					enumerable: false,
					get() {
						const bound = fn.bind(this);
						Object.defineProperty(this, key, {
							configurable: true,
							writable: true,
							enumerable: true,
							value: bound
						});
						return bound;
					},
					set(v) {
						Object.defineProperty(this, key, {
							configurable: true,
							writable: true,
							enumerable: true,
							value: v
						});
					}
				});
			}
		}
		const ZodType = /*@__PURE__*/ $constructor("ZodType", (inst, def) => {
			$ZodType.init(inst, def);
			Object.assign(inst["~standard"], { jsonSchema: {
				input: createStandardJSONSchemaMethod(inst, "input"),
				output: createStandardJSONSchemaMethod(inst, "output")
			} });
			inst.toJSONSchema = createToJSONSchemaMethod(inst, {});
			inst.def = def;
			inst.type = def.type;
			Object.defineProperty(inst, "_def", { value: def });
			inst.parse = (data, params) => parse(inst, data, params, { callee: inst.parse });
			inst.safeParse = (data, params) => safeParse(inst, data, params);
			inst.parseAsync = async (data, params) => parseAsync(inst, data, params, { callee: inst.parseAsync });
			inst.safeParseAsync = async (data, params) => safeParseAsync(inst, data, params);
			inst.spa = inst.safeParseAsync;
			inst.encode = (data, params) => encode(inst, data, params);
			inst.decode = (data, params) => decode(inst, data, params);
			inst.encodeAsync = async (data, params) => encodeAsync(inst, data, params);
			inst.decodeAsync = async (data, params) => decodeAsync(inst, data, params);
			inst.safeEncode = (data, params) => safeEncode(inst, data, params);
			inst.safeDecode = (data, params) => safeDecode(inst, data, params);
			inst.safeEncodeAsync = async (data, params) => safeEncodeAsync(inst, data, params);
			inst.safeDecodeAsync = async (data, params) => safeDecodeAsync(inst, data, params);
			_installLazyMethods(inst, "ZodType", {
				check(...chks) {
					const def = this.def;
					return this.clone(mergeDefs(def, { checks: [...def.checks ?? [], ...chks.map((ch) => typeof ch === "function" ? { _zod: {
						check: ch,
						def: { check: "custom" },
						onattach: []
					} } : ch)] }), { parent: true });
				},
				with(...chks) {
					return this.check(...chks);
				},
				clone(def, params) {
					return clone(this, def, params);
				},
				brand() {
					return this;
				},
				register(reg, meta) {
					reg.add(this, meta);
					return this;
				},
				refine(check, params) {
					return this.check(refine(check, params));
				},
				superRefine(refinement, params) {
					return this.check(superRefine(refinement, params));
				},
				overwrite(fn) {
					return this.check(/* @__PURE__ */ _overwrite(fn));
				},
				optional() {
					return optional(this);
				},
				exactOptional() {
					return exactOptional(this);
				},
				nullable() {
					return nullable(this);
				},
				nullish() {
					return optional(nullable(this));
				},
				nonoptional(params) {
					return nonoptional(this, params);
				},
				array() {
					return array(this);
				},
				or(arg) {
					return union([this, arg]);
				},
				and(arg) {
					return intersection(this, arg);
				},
				transform(tx) {
					return pipe(this, transform(tx));
				},
				default(d) {
					return _default(this, d);
				},
				prefault(d) {
					return prefault(this, d);
				},
				catch(params) {
					return _catch(this, params);
				},
				pipe(target) {
					return pipe(this, target);
				},
				readonly() {
					return readonly(this);
				},
				describe(description) {
					const cl = this.clone();
					globalRegistry.add(cl, { description });
					return cl;
				},
				meta(...args) {
					if (args.length === 0) return globalRegistry.get(this);
					const cl = this.clone();
					globalRegistry.add(cl, args[0]);
					return cl;
				},
				isOptional() {
					return this.safeParse(void 0).success;
				},
				isNullable() {
					return this.safeParse(null).success;
				},
				apply(fn) {
					return fn(this);
				}
			});
			Object.defineProperty(inst, "description", {
				get() {
					return globalRegistry.get(inst)?.description;
				},
				configurable: true
			});
			return inst;
		});
		/** @internal */
		const _ZodString = /*@__PURE__*/ $constructor("_ZodString", (inst, def) => {
			$ZodString.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => stringProcessor(inst, ctx, json, params);
			const bag = inst._zod.bag;
			inst.format = bag.format ?? null;
			inst.minLength = bag.minimum ?? null;
			inst.maxLength = bag.maximum ?? null;
			_installLazyMethods(inst, "_ZodString", {
				regex(...args) {
					return this.check(/* @__PURE__ */ _regex(...args));
				},
				includes(...args) {
					return this.check(/* @__PURE__ */ _includes(...args));
				},
				startsWith(...args) {
					return this.check(/* @__PURE__ */ _startsWith(...args));
				},
				endsWith(...args) {
					return this.check(/* @__PURE__ */ _endsWith(...args));
				},
				min(...args) {
					return this.check(/* @__PURE__ */ _minLength(...args));
				},
				max(...args) {
					return this.check(/* @__PURE__ */ _maxLength(...args));
				},
				length(...args) {
					return this.check(/* @__PURE__ */ _length(...args));
				},
				nonempty(...args) {
					return this.check(/* @__PURE__ */ _minLength(1, ...args));
				},
				lowercase(params) {
					return this.check(/* @__PURE__ */ _lowercase(params));
				},
				uppercase(params) {
					return this.check(/* @__PURE__ */ _uppercase(params));
				},
				trim() {
					return this.check(/* @__PURE__ */ _trim());
				},
				normalize(...args) {
					return this.check(/* @__PURE__ */ _normalize(...args));
				},
				toLowerCase() {
					return this.check(/* @__PURE__ */ _toLowerCase());
				},
				toUpperCase() {
					return this.check(/* @__PURE__ */ _toUpperCase());
				},
				slugify() {
					return this.check(/* @__PURE__ */ _slugify());
				}
			});
		});
		const ZodString = /*@__PURE__*/ $constructor("ZodString", (inst, def) => {
			$ZodString.init(inst, def);
			_ZodString.init(inst, def);
			inst.email = (params) => inst.check(/* @__PURE__ */ _email(ZodEmail, params));
			inst.url = (params) => inst.check(/* @__PURE__ */ _url(ZodURL, params));
			inst.jwt = (params) => inst.check(/* @__PURE__ */ _jwt(ZodJWT, params));
			inst.emoji = (params) => inst.check(/* @__PURE__ */ _emoji(ZodEmoji, params));
			inst.guid = (params) => inst.check(/* @__PURE__ */ _guid(ZodGUID, params));
			inst.uuid = (params) => inst.check(/* @__PURE__ */ _uuid(ZodUUID, params));
			inst.uuidv4 = (params) => inst.check(/* @__PURE__ */ _uuidv4(ZodUUID, params));
			inst.uuidv6 = (params) => inst.check(/* @__PURE__ */ _uuidv6(ZodUUID, params));
			inst.uuidv7 = (params) => inst.check(/* @__PURE__ */ _uuidv7(ZodUUID, params));
			inst.nanoid = (params) => inst.check(/* @__PURE__ */ _nanoid(ZodNanoID, params));
			inst.guid = (params) => inst.check(/* @__PURE__ */ _guid(ZodGUID, params));
			inst.cuid = (params) => inst.check(/* @__PURE__ */ _cuid(ZodCUID, params));
			inst.cuid2 = (params) => inst.check(/* @__PURE__ */ _cuid2(ZodCUID2, params));
			inst.ulid = (params) => inst.check(/* @__PURE__ */ _ulid(ZodULID, params));
			inst.base64 = (params) => inst.check(/* @__PURE__ */ _base64(ZodBase64, params));
			inst.base64url = (params) => inst.check(/* @__PURE__ */ _base64url(ZodBase64URL, params));
			inst.xid = (params) => inst.check(/* @__PURE__ */ _xid(ZodXID, params));
			inst.ksuid = (params) => inst.check(/* @__PURE__ */ _ksuid(ZodKSUID, params));
			inst.ipv4 = (params) => inst.check(/* @__PURE__ */ _ipv4(ZodIPv4, params));
			inst.ipv6 = (params) => inst.check(/* @__PURE__ */ _ipv6(ZodIPv6, params));
			inst.cidrv4 = (params) => inst.check(/* @__PURE__ */ _cidrv4(ZodCIDRv4, params));
			inst.cidrv6 = (params) => inst.check(/* @__PURE__ */ _cidrv6(ZodCIDRv6, params));
			inst.e164 = (params) => inst.check(/* @__PURE__ */ _e164(ZodE164, params));
			inst.datetime = (params) => inst.check(datetime(params));
			inst.date = (params) => inst.check(date(params));
			inst.time = (params) => inst.check(time(params));
			inst.duration = (params) => inst.check(duration(params));
		});
		function string(params) {
			return /* @__PURE__ */ _string(ZodString, params);
		}
		const ZodStringFormat = /*@__PURE__*/ $constructor("ZodStringFormat", (inst, def) => {
			$ZodStringFormat.init(inst, def);
			_ZodString.init(inst, def);
		});
		const ZodEmail = /*@__PURE__*/ $constructor("ZodEmail", (inst, def) => {
			$ZodEmail.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodGUID = /*@__PURE__*/ $constructor("ZodGUID", (inst, def) => {
			$ZodGUID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodUUID = /*@__PURE__*/ $constructor("ZodUUID", (inst, def) => {
			$ZodUUID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodURL = /*@__PURE__*/ $constructor("ZodURL", (inst, def) => {
			$ZodURL.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodEmoji = /*@__PURE__*/ $constructor("ZodEmoji", (inst, def) => {
			$ZodEmoji.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodNanoID = /*@__PURE__*/ $constructor("ZodNanoID", (inst, def) => {
			$ZodNanoID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		/**
		* @deprecated CUID v1 is deprecated by its authors due to information leakage
		* (timestamps embedded in the id). Use {@link ZodCUID2} instead.
		* See https://github.com/paralleldrive/cuid.
		*/
		const ZodCUID = /*@__PURE__*/ $constructor("ZodCUID", (inst, def) => {
			$ZodCUID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodCUID2 = /*@__PURE__*/ $constructor("ZodCUID2", (inst, def) => {
			$ZodCUID2.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodULID = /*@__PURE__*/ $constructor("ZodULID", (inst, def) => {
			$ZodULID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodXID = /*@__PURE__*/ $constructor("ZodXID", (inst, def) => {
			$ZodXID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodKSUID = /*@__PURE__*/ $constructor("ZodKSUID", (inst, def) => {
			$ZodKSUID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodIPv4 = /*@__PURE__*/ $constructor("ZodIPv4", (inst, def) => {
			$ZodIPv4.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodIPv6 = /*@__PURE__*/ $constructor("ZodIPv6", (inst, def) => {
			$ZodIPv6.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodCIDRv4 = /*@__PURE__*/ $constructor("ZodCIDRv4", (inst, def) => {
			$ZodCIDRv4.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodCIDRv6 = /*@__PURE__*/ $constructor("ZodCIDRv6", (inst, def) => {
			$ZodCIDRv6.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodBase64 = /*@__PURE__*/ $constructor("ZodBase64", (inst, def) => {
			$ZodBase64.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodBase64URL = /*@__PURE__*/ $constructor("ZodBase64URL", (inst, def) => {
			$ZodBase64URL.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodE164 = /*@__PURE__*/ $constructor("ZodE164", (inst, def) => {
			$ZodE164.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodJWT = /*@__PURE__*/ $constructor("ZodJWT", (inst, def) => {
			$ZodJWT.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodNumber = /*@__PURE__*/ $constructor("ZodNumber", (inst, def) => {
			$ZodNumber.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => numberProcessor(inst, ctx, json, params);
			_installLazyMethods(inst, "ZodNumber", {
				gt(value, params) {
					return this.check(/* @__PURE__ */ _gt(value, params));
				},
				gte(value, params) {
					return this.check(/* @__PURE__ */ _gte(value, params));
				},
				min(value, params) {
					return this.check(/* @__PURE__ */ _gte(value, params));
				},
				lt(value, params) {
					return this.check(/* @__PURE__ */ _lt(value, params));
				},
				lte(value, params) {
					return this.check(/* @__PURE__ */ _lte(value, params));
				},
				max(value, params) {
					return this.check(/* @__PURE__ */ _lte(value, params));
				},
				int(params) {
					return this.check(int(params));
				},
				safe(params) {
					return this.check(int(params));
				},
				positive(params) {
					return this.check(/* @__PURE__ */ _gt(0, params));
				},
				nonnegative(params) {
					return this.check(/* @__PURE__ */ _gte(0, params));
				},
				negative(params) {
					return this.check(/* @__PURE__ */ _lt(0, params));
				},
				nonpositive(params) {
					return this.check(/* @__PURE__ */ _lte(0, params));
				},
				multipleOf(value, params) {
					return this.check(/* @__PURE__ */ _multipleOf(value, params));
				},
				step(value, params) {
					return this.check(/* @__PURE__ */ _multipleOf(value, params));
				},
				finite() {
					return this;
				}
			});
			const bag = inst._zod.bag;
			inst.minValue = Math.max(bag.minimum ?? Number.NEGATIVE_INFINITY, bag.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null;
			inst.maxValue = Math.min(bag.maximum ?? Number.POSITIVE_INFINITY, bag.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null;
			inst.isInt = (bag.format ?? "").includes("int") || Number.isSafeInteger(bag.multipleOf ?? .5);
			inst.isFinite = true;
			inst.format = bag.format ?? null;
		});
		function number(params) {
			return /* @__PURE__ */ _number(ZodNumber, params);
		}
		const ZodNumberFormat = /*@__PURE__*/ $constructor("ZodNumberFormat", (inst, def) => {
			$ZodNumberFormat.init(inst, def);
			ZodNumber.init(inst, def);
		});
		function int(params) {
			return /* @__PURE__ */ _int(ZodNumberFormat, params);
		}
		const ZodBoolean = /*@__PURE__*/ $constructor("ZodBoolean", (inst, def) => {
			$ZodBoolean.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => booleanProcessor(inst, ctx, json, params);
		});
		function boolean(params) {
			return /* @__PURE__ */ _boolean(ZodBoolean, params);
		}
		const ZodUnknown = /*@__PURE__*/ $constructor("ZodUnknown", (inst, def) => {
			$ZodUnknown.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => void 0;
		});
		function unknown() {
			return /* @__PURE__ */ _unknown(ZodUnknown);
		}
		const ZodNever = /*@__PURE__*/ $constructor("ZodNever", (inst, def) => {
			$ZodNever.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => neverProcessor(inst, ctx, json, params);
		});
		function never(params) {
			return /* @__PURE__ */ _never(ZodNever, params);
		}
		const ZodArray = /*@__PURE__*/ $constructor("ZodArray", (inst, def) => {
			$ZodArray.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => arrayProcessor(inst, ctx, json, params);
			inst.element = def.element;
			_installLazyMethods(inst, "ZodArray", {
				min(n, params) {
					return this.check(/* @__PURE__ */ _minLength(n, params));
				},
				nonempty(params) {
					return this.check(/* @__PURE__ */ _minLength(1, params));
				},
				max(n, params) {
					return this.check(/* @__PURE__ */ _maxLength(n, params));
				},
				length(n, params) {
					return this.check(/* @__PURE__ */ _length(n, params));
				},
				unwrap() {
					return this.element;
				}
			});
		});
		function array(element, params) {
			return /* @__PURE__ */ _array(ZodArray, element, params);
		}
		const ZodObject = /*@__PURE__*/ $constructor("ZodObject", (inst, def) => {
			$ZodObjectJIT.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => objectProcessor(inst, ctx, json, params);
			defineLazy(inst, "shape", () => {
				return def.shape;
			});
			_installLazyMethods(inst, "ZodObject", {
				keyof() {
					return _enum(Object.keys(this._zod.def.shape));
				},
				catchall(catchall) {
					return this.clone({
						...this._zod.def,
						catchall
					});
				},
				passthrough() {
					return this.clone({
						...this._zod.def,
						catchall: unknown()
					});
				},
				loose() {
					return this.clone({
						...this._zod.def,
						catchall: unknown()
					});
				},
				strict() {
					return this.clone({
						...this._zod.def,
						catchall: never()
					});
				},
				strip() {
					return this.clone({
						...this._zod.def,
						catchall: void 0
					});
				},
				extend(incoming) {
					return extend(this, incoming);
				},
				safeExtend(incoming) {
					return safeExtend(this, incoming);
				},
				merge(other) {
					return merge(this, other);
				},
				pick(mask) {
					return pick(this, mask);
				},
				omit(mask) {
					return omit(this, mask);
				},
				partial(...args) {
					return partial(ZodOptional, this, args[0]);
				},
				required(...args) {
					return required(ZodNonOptional, this, args[0]);
				}
			});
		});
		function object(shape, params) {
			const def = {
				type: "object",
				shape: shape ?? {},
				...normalizeParams(params)
			};
			return new ZodObject(def);
		}
		const ZodUnion = /*@__PURE__*/ $constructor("ZodUnion", (inst, def) => {
			$ZodUnion.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => unionProcessor(inst, ctx, json, params);
			inst.options = def.options;
		});
		function union(options, params) {
			return new ZodUnion({
				type: "union",
				options,
				...normalizeParams(params)
			});
		}
		const ZodIntersection = /*@__PURE__*/ $constructor("ZodIntersection", (inst, def) => {
			$ZodIntersection.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => intersectionProcessor(inst, ctx, json, params);
		});
		function intersection(left, right) {
			return new ZodIntersection({
				type: "intersection",
				left,
				right
			});
		}
		const ZodRecord = /*@__PURE__*/ $constructor("ZodRecord", (inst, def) => {
			$ZodRecord.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => recordProcessor(inst, ctx, json, params);
			inst.keyType = def.keyType;
			inst.valueType = def.valueType;
		});
		function partialRecord(keyType, valueType, params) {
			const k = clone(keyType);
			k._zod.values = void 0;
			return new ZodRecord({
				type: "record",
				keyType: k,
				valueType,
				...normalizeParams(params)
			});
		}
		const ZodEnum = /*@__PURE__*/ $constructor("ZodEnum", (inst, def) => {
			$ZodEnum.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => enumProcessor(inst, ctx, json, params);
			inst.enum = def.entries;
			inst.options = Object.values(def.entries);
			const keys = new Set(Object.keys(def.entries));
			inst.extract = (values, params) => {
				const newEntries = {};
				for (const value of values) if (keys.has(value)) newEntries[value] = def.entries[value];
				else throw new Error(`Key ${value} not found in enum`);
				return new ZodEnum({
					...def,
					checks: [],
					...normalizeParams(params),
					entries: newEntries
				});
			};
			inst.exclude = (values, params) => {
				const newEntries = { ...def.entries };
				for (const value of values) if (keys.has(value)) delete newEntries[value];
				else throw new Error(`Key ${value} not found in enum`);
				return new ZodEnum({
					...def,
					checks: [],
					...normalizeParams(params),
					entries: newEntries
				});
			};
		});
		function _enum(values, params) {
			const entries = Array.isArray(values) ? Object.fromEntries(values.map((v) => [v, v])) : values;
			return new ZodEnum({
				type: "enum",
				entries,
				...normalizeParams(params)
			});
		}
		const ZodTransform = /*@__PURE__*/ $constructor("ZodTransform", (inst, def) => {
			$ZodTransform.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => transformProcessor(inst, ctx, json, params);
			inst._zod.parse = (payload, _ctx) => {
				if (_ctx.direction === "backward") throw new $ZodEncodeError(inst.constructor.name);
				payload.addIssue = (issue$1) => {
					if (typeof issue$1 === "string") payload.issues.push(issue(issue$1, payload.value, def));
					else {
						const _issue = issue$1;
						if (_issue.fatal) _issue.continue = false;
						_issue.code ?? (_issue.code = "custom");
						_issue.input ?? (_issue.input = payload.value);
						_issue.inst ?? (_issue.inst = inst);
						payload.issues.push(issue(_issue));
					}
				};
				const output = def.transform(payload.value, payload);
				if (output instanceof Promise) return output.then((output) => {
					payload.value = output;
					payload.fallback = true;
					return payload;
				});
				payload.value = output;
				payload.fallback = true;
				return payload;
			};
		});
		function transform(fn) {
			return new ZodTransform({
				type: "transform",
				transform: fn
			});
		}
		const ZodOptional = /*@__PURE__*/ $constructor("ZodOptional", (inst, def) => {
			$ZodOptional.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function optional(innerType) {
			return new ZodOptional({
				type: "optional",
				innerType
			});
		}
		const ZodExactOptional = /*@__PURE__*/ $constructor("ZodExactOptional", (inst, def) => {
			$ZodExactOptional.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function exactOptional(innerType) {
			return new ZodExactOptional({
				type: "optional",
				innerType
			});
		}
		const ZodNullable = /*@__PURE__*/ $constructor("ZodNullable", (inst, def) => {
			$ZodNullable.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => nullableProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function nullable(innerType) {
			return new ZodNullable({
				type: "nullable",
				innerType
			});
		}
		const ZodDefault = /*@__PURE__*/ $constructor("ZodDefault", (inst, def) => {
			$ZodDefault.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => defaultProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
			inst.removeDefault = inst.unwrap;
		});
		function _default(innerType, defaultValue) {
			return new ZodDefault({
				type: "default",
				innerType,
				get defaultValue() {
					return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
				}
			});
		}
		const ZodPrefault = /*@__PURE__*/ $constructor("ZodPrefault", (inst, def) => {
			$ZodPrefault.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => prefaultProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function prefault(innerType, defaultValue) {
			return new ZodPrefault({
				type: "prefault",
				innerType,
				get defaultValue() {
					return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
				}
			});
		}
		const ZodNonOptional = /*@__PURE__*/ $constructor("ZodNonOptional", (inst, def) => {
			$ZodNonOptional.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => nonoptionalProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function nonoptional(innerType, params) {
			return new ZodNonOptional({
				type: "nonoptional",
				innerType,
				...normalizeParams(params)
			});
		}
		const ZodCatch = /*@__PURE__*/ $constructor("ZodCatch", (inst, def) => {
			$ZodCatch.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => catchProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
			inst.removeCatch = inst.unwrap;
		});
		function _catch(innerType, catchValue) {
			return new ZodCatch({
				type: "catch",
				innerType,
				catchValue: typeof catchValue === "function" ? catchValue : () => catchValue
			});
		}
		const ZodPipe = /*@__PURE__*/ $constructor("ZodPipe", (inst, def) => {
			$ZodPipe.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => pipeProcessor(inst, ctx, json, params);
			inst.in = def.in;
			inst.out = def.out;
		});
		function pipe(in_, out) {
			return new ZodPipe({
				type: "pipe",
				in: in_,
				out
			});
		}
		const ZodReadonly = /*@__PURE__*/ $constructor("ZodReadonly", (inst, def) => {
			$ZodReadonly.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => readonlyProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function readonly(innerType) {
			return new ZodReadonly({
				type: "readonly",
				innerType
			});
		}
		const ZodCustom = /*@__PURE__*/ $constructor("ZodCustom", (inst, def) => {
			$ZodCustom.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => customProcessor(inst, ctx, json, params);
		});
		function refine(fn, _params = {}) {
			return /* @__PURE__ */ _refine(ZodCustom, fn, _params);
		}
		function superRefine(fn, params) {
			return /* @__PURE__ */ _superRefine(fn, params);
		}
		//#endregion
		//#region src/repository-schemas.ts
		const path = string().trim().min(1).max(4096);
		const namedReviewRepositorySchema = object({
			name: string().trim().min(1).max(120),
			path
		});
		const reviewProjectSchema = object({
			name: string().trim().max(120),
			root: path,
			includeProjectRoot: boolean(),
			configFiles: array(path).max(32),
			repositories: array(path).max(512),
			namedRepositories: array(namedReviewRepositorySchema).max(512).optional(),
			enabled: boolean().optional()
		});
		object({
			projects: array(reviewProjectSchema).max(64),
			revision: number().int().nonnegative()
		});
		const reviewWorkspaceSchema = object({
			project: reviewProjectSchema.nullable(),
			repositories: array(object({
				name: string(),
				path: string(),
				relativePath: string(),
				source: string(),
				state: _enum([
					"ready",
					"missing",
					"notGit",
					"error"
				]),
				reason: string().optional()
			})),
			warnings: array(string()),
			roots: array(string())
		});
		const reviewProjectPageSchema = object({
			project: reviewProjectSchema,
			revision: number().int().nonnegative(),
			configured: boolean(),
			workspace: reviewWorkspaceSchema,
			fileRevision: string(),
			temporaryRepositories: array(namedReviewRepositorySchema).max(512)
		});
		const saveReviewProjectSchema = object({
			project: reviewProjectSchema,
			revision: number().int().nonnegative(),
			fileRevision: string()
		});
		//#endregion
		//#region src/review-scopes.ts
		/** Property order is the review menu order; persisted IDs must not be renamed. */
		const REVIEW_SCOPES = {
			"last-turn": {
				source: "session",
				label: "reviewLastTurn"
			},
			session: {
				source: "session",
				label: "reviewSession"
			},
			pending: {
				source: "session",
				label: "reviewPending"
			},
			uncommitted: {
				source: "git",
				label: "reviewUncommitted",
				reference: "none",
				workingTree: true
			},
			unstaged: {
				source: "git",
				label: "reviewUnstaged",
				reference: "none",
				workingTree: true
			},
			staged: {
				source: "git",
				label: "reviewStaged",
				reference: "none",
				workingTree: false
			},
			commit: {
				source: "git",
				label: "reviewCommit",
				reference: "commit",
				workingTree: false
			},
			branch: {
				source: "git",
				label: "reviewBranch",
				reference: "branch",
				workingTree: false
			}
		};
		const REVIEW_MODES = Object.keys(REVIEW_SCOPES);
		function isReviewMode(value) {
			return typeof value === "string" && Object.hasOwn(REVIEW_SCOPES, value);
		}
		function isSessionReviewMode(value) {
			return isReviewMode(value) && REVIEW_SCOPES[value].source === "session";
		}
		function isGitReviewMode(value) {
			return isReviewMode(value) && REVIEW_SCOPES[value].source === "git";
		}
		function usesWorkingTree(mode) {
			const scope = REVIEW_SCOPES[mode];
			return scope.source === "git" && scope.workingTree;
		}
		//#endregion
		//#region src/git-review-schemas.ts
		const gitReviewRequestSchema = object({
			mode: _enum(REVIEW_MODES.filter(isGitReviewMode)),
			repository: string().max(4096).optional(),
			ref: string().min(1).max(1024).optional()
		});
		const gitReviewFileRequestSchema = gitReviewRequestSchema.extend({
			repository: string().max(4096),
			path: string().min(1).max(4096)
		});
		const gitReviewResultSchema = object({
			repositories: array(object({
				name: string(),
				path: string(),
				branch: string(),
				branches: array(string()),
				commits: array(object({
					oid: string(),
					subject: string(),
					date: string()
				}))
			})),
			files: array(object({
				repository: string(),
				path: string(),
				oldPath: string().optional(),
				status: string(),
				added: number(),
				removed: number(),
				binary: boolean(),
				untracked: boolean()
			})),
			warnings: array(string()),
			comparisons: array(string())
		});
		const gitReviewDiffSchema = object({
			diffs: array(object({
				path: string(),
				oldText: string().nullable(),
				newText: string(),
				oldStart: number().optional(),
				newStart: number().optional()
			})),
			binary: boolean(),
			note: string()
		});
		//#endregion
		//#region src/user-guide.ts
		const USER_GUIDE_IMAGES = [
			"01-file-review-overview.jpg",
			"02-git-review-scope.jpg",
			"03-multi-repository-settings.jpg",
			"04-unified-diff-context-controls.jpg",
			"05-expanded-context-collapse.jpg",
			"06-split-diff-search.jpg",
			"07-line-selection-context-menu.jpg",
			"08-diff-appearance-settings.jpg",
			"09-external-editor-settings.jpg",
			"10-range-comment-editor.jpg",
			"11-pending-review-comments.jpg",
			"12-review-discussion-history.jpg"
		];
		//#endregion
		//#region src/typert-descriptors.ts
		/** Strict Typert codecs shared by the Host and browser contribution artifacts. */
		const PACKAGE_NAME = "dsh-file-review-tab-multi-git-repository";
		const userGuideDocumentSchema = object({
			path: string().min(1).max(4096),
			markdown: string().max(524288),
			images: partialRecord(_enum(USER_GUIDE_IMAGES.map((name) => `image/${name}`)), string().regex(/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/).max(2097152))
		});
		const locationRequestSchema = object({
			repository: string().min(1).max(4096),
			path: string().min(1).max(4096),
			source: string().max(4096),
			side: _enum(["old", "new"]),
			line: number().int().min(1).max(1e7),
			endLine: number().int().min(1).max(1e7),
			quote: string().max(65536),
			before: string().max(65536),
			after: string().max(65536),
			fullText: string().max(8388608).optional(),
			allowRelocate: boolean().optional(),
			editorPath: string().max(4096).optional()
		});
		const locationResultSchema = object({
			state: _enum([
				"exact",
				"moved",
				"ambiguous",
				"changed",
				"missing",
				"unsupported",
				"started",
				"editor-missing",
				"error"
			]),
			line: number().int().min(1).optional(),
			endLine: number().int().min(1).optional(),
			reason: string().optional()
		});
		const diffSchema = object({
			path: string(),
			oldText: string().nullable(),
			newText: string(),
			oldStart: number().int().min(1).optional(),
			newStart: number().int().min(1).optional()
		});
		const requestSchema = object({
			action: _enum(["undo", "redo"]),
			files: array(object({
				path: string(),
				diffs: array(diffSchema)
			}))
		});
		const resultSchema = object({ files: array(object({
			path: string(),
			state: _enum([
				"applied",
				"undone",
				"conflict",
				"unsupported",
				"error"
			]),
			changed: boolean(),
			reason: string().optional()
		})) });
		const agentCodec = {
			mode: "strict",
			typeSymbol: "@deepseek-ai/dsh-session/types#SessionId",
			create: () => intersection(string(), unknown())
		};
		const requestCodec = {
			mode: "strict",
			typeSymbol: `${PACKAGE_NAME}#FileReviewRequest`,
			create: () => requestSchema
		};
		const resultCodec = {
			mode: "strict",
			typeSymbol: `${PACKAGE_NAME}#FileReviewResult`,
			create: () => resultSchema
		};
		const recordedMutationSchema = object({
			rootCallId: string(),
			name: string(),
			path: string(),
			before: string().nullable(),
			after: string()
		});
		const recordedRequestSchema = object({ rootCallIds: array(string()) });
		const recordedResultSchema = object({ mutations: array(recordedMutationSchema) });
		const recordedRequestCodec = {
			mode: "strict",
			typeSymbol: `${PACKAGE_NAME}#RecordedRequest`,
			create: () => recordedRequestSchema
		};
		const recordedResultCodec = {
			mode: "strict",
			typeSymbol: `${PACKAGE_NAME}#RecordedResult`,
			create: () => recordedResultSchema
		};
		function descriptor(method) {
			return {
				id: `${PACKAGE_NAME}#fileReview/${method}`,
				service: "fileReview",
				namespace: "fileReview",
				method,
				invocation: { kind: "direct" },
				scope: {
					context: "agent",
					wire: "agentId"
				},
				parameters: [{
					name: "agent",
					wire: "agentId",
					source: "lookup",
					lookup: "agent",
					codec: agentCodec
				}, {
					name: "request",
					wire: "request",
					source: "json",
					codec: requestCodec
				}],
				result: resultCodec
			};
		}
		function recordedDescriptor() {
			return {
				id: `${PACKAGE_NAME}#fileReview/recorded`,
				service: "fileReview",
				namespace: "fileReview",
				method: "recorded",
				invocation: { kind: "direct" },
				scope: {
					context: "agent",
					wire: "agentId"
				},
				parameters: [{
					name: "agent",
					wire: "agentId",
					source: "lookup",
					lookup: "agent",
					codec: agentCodec
				}, {
					name: "request",
					wire: "request",
					source: "json",
					codec: recordedRequestCodec
				}],
				result: recordedResultCodec
			};
		}
		//#endregion
		//#region src/remote.ts
		const TYPERT_REMOTE = {
			package: PACKAGE_NAME,
			descriptors: [
				...["locateReference", "openEditor"].map((method) => ({
					id: `${PACKAGE_NAME}#fileReview/${method}`,
					service: "fileReview",
					namespace: "fileReview",
					method,
					invocation: { kind: "direct" },
					scope: {
						context: "agent",
						wire: "agentId"
					},
					parameters: [{
						name: "agent",
						wire: "agentId",
						source: "lookup",
						lookup: "agent",
						codec: agentCodec
					}, {
						name: "request",
						wire: "request",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: `${PACKAGE_NAME}#ReviewLocationRequest`,
							create: () => locationRequestSchema
						}
					}],
					result: {
						mode: "strict",
						typeSymbol: `${PACKAGE_NAME}#ReviewLocationResult`,
						create: () => locationResultSchema
					}
				})),
				...["gitReview", "gitReviewDiff"].map((method) => ({
					id: `${PACKAGE_NAME}#fileReview/${method}`,
					service: "fileReview",
					namespace: "fileReview",
					method,
					invocation: { kind: "direct" },
					scope: {
						context: "agent",
						wire: "agentId"
					},
					parameters: [{
						name: "agent",
						wire: "agentId",
						source: "lookup",
						lookup: "agent",
						codec: agentCodec
					}, {
						name: "request",
						wire: "request",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: `${PACKAGE_NAME}#${method === "gitReview" ? "GitReviewRequest" : "GitReviewFileRequest"}`,
							create: () => method === "gitReview" ? gitReviewRequestSchema : gitReviewFileRequestSchema
						}
					}],
					result: {
						mode: "strict",
						typeSymbol: `${PACKAGE_NAME}#${method === "gitReview" ? "GitReviewResult" : "GitReviewDiff"}`,
						create: () => method === "gitReview" ? gitReviewResultSchema : gitReviewDiffSchema
					}
				})),
				{
					id: `${PACKAGE_NAME}#fileReview/directoryStart`,
					service: "fileReview",
					namespace: "fileReview",
					method: "directoryStart",
					invocation: { kind: "direct" },
					scope: {
						context: "agent",
						wire: "agentId"
					},
					parameters: [{
						name: "agent",
						wire: "agentId",
						source: "lookup",
						lookup: "agent",
						codec: agentCodec
					}, {
						name: "path",
						wire: "path",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "string",
							create: () => string().max(4096)
						}
					}],
					result: {
						mode: "strict",
						typeSymbol: "string",
						create: () => string()
					}
				},
				{
					id: `${PACKAGE_NAME}#fileReview/userGuide`,
					service: "fileReview",
					namespace: "fileReview",
					method: "userGuide",
					invocation: { kind: "direct" },
					scope: {
						context: "agent",
						wire: "agentId"
					},
					parameters: [{
						name: "agent",
						wire: "agentId",
						source: "lookup",
						lookup: "agent",
						codec: agentCodec
					}, {
						name: "language",
						wire: "language",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "'zh' | 'en'",
							create: () => _enum(["zh", "en"])
						}
					}],
					result: {
						mode: "strict",
						typeSymbol: "string",
						create: () => string().min(1)
					}
				},
				descriptor("status"),
				{
					id: `${PACKAGE_NAME}#fileReview/userGuideDocument`,
					service: "fileReview",
					namespace: "fileReview",
					method: "userGuideDocument",
					invocation: { kind: "direct" },
					scope: {
						context: "agent",
						wire: "agentId"
					},
					parameters: [{
						name: "agent",
						wire: "agentId",
						source: "lookup",
						lookup: "agent",
						codec: agentCodec
					}, {
						name: "language",
						wire: "language",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: "'zh' | 'en'",
							create: () => _enum(["zh", "en"])
						}
					}],
					result: {
						mode: "strict",
						typeSymbol: `${PACKAGE_NAME}#UserGuideDocument`,
						create: () => userGuideDocumentSchema
					}
				},
				descriptor("apply"),
				recordedDescriptor(),
				{
					id: `${PACKAGE_NAME}#fileReview/workspace`,
					service: "fileReview",
					namespace: "fileReview",
					method: "workspace",
					invocation: { kind: "direct" },
					scope: {
						context: "agent",
						wire: "agentId"
					},
					parameters: [{
						name: "agent",
						wire: "agentId",
						source: "lookup",
						lookup: "agent",
						codec: agentCodec
					}],
					result: {
						mode: "strict",
						typeSymbol: `${PACKAGE_NAME}#ReviewWorkspace`,
						create: () => reviewWorkspaceSchema
					}
				},
				{
					id: `${PACKAGE_NAME}#fileReview/project`,
					service: "fileReview",
					namespace: "fileReview",
					method: "project",
					invocation: { kind: "direct" },
					scope: {
						context: "agent",
						wire: "agentId"
					},
					parameters: [{
						name: "agent",
						wire: "agentId",
						source: "lookup",
						lookup: "agent",
						codec: agentCodec
					}],
					result: {
						mode: "strict",
						typeSymbol: `${PACKAGE_NAME}#ReviewProjectPage`,
						create: () => reviewProjectPageSchema
					}
				},
				{
					id: `${PACKAGE_NAME}#fileReview/saveProject`,
					service: "fileReview",
					namespace: "fileReview",
					method: "saveProject",
					invocation: { kind: "direct" },
					scope: {
						context: "agent",
						wire: "agentId"
					},
					parameters: [{
						name: "agent",
						wire: "agentId",
						source: "lookup",
						lookup: "agent",
						codec: agentCodec
					}, {
						name: "request",
						wire: "request",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: `${PACKAGE_NAME}#SaveReviewProject`,
							create: () => saveReviewProjectSchema
						}
					}],
					result: {
						mode: "strict",
						typeSymbol: `${PACKAGE_NAME}#ReviewProjectPage`,
						create: () => reviewProjectPageSchema
					}
				},
				{
					id: `${PACKAGE_NAME}#fileReview/setTemporaryRepositories`,
					service: "fileReview",
					namespace: "fileReview",
					method: "setTemporaryRepositories",
					invocation: { kind: "direct" },
					scope: {
						context: "agent",
						wire: "agentId"
					},
					parameters: [{
						name: "agent",
						wire: "agentId",
						source: "lookup",
						lookup: "agent",
						codec: agentCodec
					}, {
						name: "entries",
						wire: "entries",
						source: "json",
						codec: {
							mode: "strict",
							typeSymbol: `${PACKAGE_NAME}#NamedReviewRepositories`,
							create: () => array(namedReviewRepositorySchema).max(512)
						}
					}],
					result: {
						mode: "strict",
						typeSymbol: `${PACKAGE_NAME}#ReviewWorkspace`,
						create: () => reviewWorkspaceSchema
					}
				}
			]
		};
		//#endregion
		//#region src/client/deleted-paths.ts
		/**
		* Literal deletion-path extraction from terminal command text (unknown-safe).
		*
		* dsh has no dedicated delete-file tool: agents delete through the Bash/Pwsh
		* terminals, whose `tool/call` arguments carry the raw command line in
		* `command`. There is no filesystem snapshot to consult, so this parser is deliberately
		* conservative — it only reports paths that appear VERBATIM as arguments of a
		* known deletion command:
		*
		* - command substitution (`$(…)`, backticks) or process substitution anywhere
		*   in a segment disqualifies that whole segment;
		* - glob characters (`* ? [`) or variable expansion (`$`) in an argument
		*   disqualify that argument (the affected set cannot be enumerated post
		*   hoc);
		* - shell separators (`&&`, `||`, `|`, `;`, newline) split the line so
		*   `rm a && rm b` reports both while `echo rm x` reports nothing.
		*
		* A reported path is display-only vocabulary: the file is gone, so it carries
		* no diff hunks and no undo. Directories deleted with `rm -r` surface as the
		* directory path itself.
		*/
		/** Commands whose literal arguments name deleted paths (POSIX + PowerShell aliases). */
		const DELETERS = /* @__PURE__ */ new Set([
			"rm",
			"rmdir",
			"unlink",
			"shred",
			"trash",
			"remove-item",
			"ri",
			"del",
			"rd",
			"erase"
		]);
		/** PowerShell parameters whose NEXT argument is the path, not an option value. */
		const PATH_PARAMETERS = /^-(path|literalpath)$/i;
		/** Arguments never treated as paths: glob/expansion-bearing or self/parent refs. */
		function isPathlike(token) {
			if (token === "" || token === "." || token === "..") return false;
			return !/[*?\[\]$]/.test(token);
		}
		/**
		* Split one command line on shell separators, honoring quotes so a `;` inside
		* a quoted argument does not split.
		*/
		function splitSegments(command) {
			const segments = [];
			let current = "";
			let quote = null;
			for (let at = 0; at < command.length; at += 1) {
				const char = command[at];
				if (quote !== null) {
					if (char === "\\") {
						const next = command[at + 1];
						if (quote === "\"" && next === "\"") {
							current += char + "\"";
							at += 1;
							continue;
						}
						current += char;
						continue;
					}
					if (char === quote) quote = null;
					current += char;
					continue;
				}
				if (char === "\"" || char === "'") {
					quote = char;
					current += char;
					continue;
				}
				const two = command.slice(at, at + 2);
				if (two === "&&" || two === "||") {
					segments.push(current);
					current = "";
					at += 1;
					continue;
				}
				if (char === "|" || char === ";" || char === "\n") {
					segments.push(current);
					current = "";
					continue;
				}
				current += char;
			}
			segments.push(current);
			return segments;
		}
		/**
		* Shell-like tokenization of one segment, quotes joined into the token.
		* Backslash semantics follow the Windows-relevant reading: inside SINGLE
		* quotes (bash/PowerShell alike) everything is literal, and unquoted
		* backslashes stay literal too (PowerShell paths); only inside DOUBLE quotes
		* does a backslash escape the closing quote or itself (bash). A trailing open
		* quote still yields the tokens gathered so far.
		*/
		function tokenize$1(segment) {
			const tokens = [];
			let current = "";
			let quote = null;
			const flush = () => {
				if (current !== "") tokens.push(current);
				current = "";
			};
			for (let at = 0; at < segment.length; at += 1) {
				const char = segment[at];
				if (char === void 0) break;
				if (quote !== null) {
					if (char === "\\") {
						const next = segment[at + 1];
						if (quote === "\"" && (next === "\"" || next === "\\")) {
							current += next;
							at += 1;
							continue;
						}
						current += char;
						continue;
					}
					if (char === quote) {
						quote = null;
						continue;
					}
					current += char;
					continue;
				}
				if (char === "\"" || char === "'") {
					quote = char;
					continue;
				}
				if (/\s/.test(char)) {
					flush();
					continue;
				}
				current += char;
			}
			flush();
			return tokens;
		}
		/**
		* Deletion paths named literally by one terminal command line, in argument
		* order, deduplicated. `undefined`/non-string titles and non-terminal views
		* report nothing.
		*/
		function deletedPathsFromCommand(command) {
			const paths = [];
			const seen = /* @__PURE__ */ new Set();
			const accept = (raw) => {
				for (const part of raw.split(",")) {
					if (!isPathlike(part) || seen.has(part)) continue;
					seen.add(part);
					paths.push(part);
				}
			};
			for (const segment of splitSegments(command)) {
				if (segment.includes("$(") || segment.includes("`") || segment.includes("<(")) continue;
				const tokens = tokenize$1(segment);
				let at = 0;
				while (at < tokens.length) {
					const head = tokens[at];
					if (head === void 0 || !/^[A-Za-z_][A-Za-z0-9_]*=/.test(head)) break;
					at += 1;
				}
				const commandWord = tokens[at];
				if (commandWord === void 0) continue;
				const basename = commandWord.slice(Math.max(commandWord.lastIndexOf("/"), commandWord.lastIndexOf("\\")) + 1);
				if (!DELETERS.has(basename.toLowerCase())) continue;
				for (let index = at + 1; index < tokens.length; index += 1) {
					const token = tokens[index];
					if (token === void 0) continue;
					if (token.startsWith("-")) {
						if (PATH_PARAMETERS.test(token) && index + 1 < tokens.length) {
							index += 1;
							const named = tokens[index];
							if (named !== void 0) accept(named);
						}
						continue;
					}
					accept(token);
				}
			}
			return paths;
		}
		//#endregion
		//#region src/client/mutation-call.ts
		/** Parse one tool call's raw JSON arguments defensively. */
		function parseArgs(raw) {
			if (typeof raw !== "string") return null;
			try {
				const parsed = JSON.parse(raw);
				if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return null;
				return parsed;
			} catch {
				return null;
			}
		}
		/** A non-blank string path, or null. */
		function pathValue(value) {
			return typeof value === "string" && value.trim().length > 0 ? value : null;
		}
		/**
		* The call-argument-derived mutation intent for one write/edit/str_replace_editor
		* or terminal call. Unknown tools and malformed arguments return null.
		*/
		function callIntent(name, argsRaw) {
			const args = parseArgs(argsRaw);
			if (args === null) return null;
			const deletions = (name === "bash" || name === "pwsh") && typeof args.command === "string" ? deletedPathsFromCommand(args.command) : [];
			if (name === "str_replace_editor") {
				const path = pathValue(args.path);
				if (path === null) return null;
				if (args.command === "create") {
					const fileText = args.file_text;
					if (fileText !== void 0 && typeof fileText !== "string") return null;
					return {
						path,
						diffs: [{
							path,
							oldText: null,
							newText: fileText ?? ""
						}],
						deletions
					};
				}
				if (args.command === "str_replace") {
					const oldStr = args.old_str;
					const newStr = args.new_str;
					if (oldStr !== void 0 && typeof oldStr !== "string") return null;
					if (newStr !== void 0 && typeof newStr !== "string") return null;
					return {
						path,
						diffs: [{
							path,
							oldText: oldStr ?? null,
							newText: newStr ?? ""
						}],
						deletions
					};
				}
				if (args.command === "insert") {
					const newStr = args.new_str;
					if (typeof newStr !== "string") return null;
					return {
						path,
						diffs: [{
							path,
							oldText: null,
							newText: newStr
						}],
						deletions
					};
				}
				return deletions.length === 0 ? null : {
					path: null,
					diffs: [],
					deletions
				};
			}
			const path = pathValue(args.file_path);
			if (name === "write") {
				const content = args.content;
				if (path === null || typeof content !== "string") return null;
				return {
					path,
					diffs: [{
						path,
						oldText: null,
						newText: content
					}],
					deletions
				};
			}
			if (name === "edit") {
				const oldString = args.old_string;
				const newString = args.new_string;
				if (path === null || typeof oldString !== "string" || typeof newString !== "string") return null;
				return {
					path,
					diffs: [{
						path,
						oldText: oldString === "" ? null : oldString,
						newText: newString
					}],
					deletions
				};
			}
			return deletions.length === 0 ? null : {
				path: null,
				diffs: [],
				deletions
			};
		}
		/** Validate the tool-private result metadata's contextual diff hunks. */
		function appliedDiffs(meta) {
			if (typeof meta !== "object" || meta === null || Array.isArray(meta)) return null;
			const diffs = meta.diffs;
			if (!Array.isArray(diffs) || diffs.length === 0) return null;
			const out = [];
			for (const hunk of diffs) {
				if (typeof hunk !== "object" || hunk === null || Array.isArray(hunk)) return null;
				const { path, oldText, newText } = hunk;
				if (typeof path !== "string" || oldText !== null && typeof oldText !== "string" || typeof newText !== "string") return null;
				out.push({
					path,
					oldText,
					newText
				});
			}
			return out;
		}
		//#endregion
		//#region src/client/snapshot-compat.ts
		/** Structural view-source guard: a store with a callable `get`. */
		function viewStore$1(value) {
			if (typeof value !== "object" || value === null) return void 0;
			const store = value;
			return typeof store.get === "function" ? store : void 0;
		}
		/** Structural guard for the 0.1.2 ChatSnapshot.legacy slice. */
		function legacySlice(value) {
			if (typeof value !== "object" || value === null) return void 0;
			const record = value;
			if (!Array.isArray(record.nodes) || !(record.turnEnds instanceof Map) || !(record.partial === null || typeof record.partial === "object") || !Array.isArray(record.runningCalls)) return void 0;
			return {
				nodes: record.nodes,
				turnEnds: record.turnEnds,
				partial: record.partial,
				runningCalls: record.runningCalls
			};
		}
		/**
		* Normalize either release's ConversationSnapshot into the legacy slice.
		* Returns undefined for non-objects (defensive; the legacy contract returns
		* null instead of a snapshot when unbound).
		*/
		function normalizeSnapshot(snapshot) {
			if (typeof snapshot !== "object" || snapshot === null) return void 0;
			const record = snapshot;
			const direct = legacySlice(record);
			if (direct !== void 0) return direct;
			const store = viewStore$1(record.views);
			if (store === void 0) return void 0;
			const chat = store.get("chat");
			if (typeof chat !== "object" || chat === null) return void 0;
			return legacySlice(chat.legacy);
		}
		//#endregion
		//#region node_modules/.pnpm/diff@9.0.0/node_modules/diff/libesm/diff/base.js
		var Diff = class {
			diff(oldStr, newStr, options = {}) {
				let callback;
				if (typeof options === "function") {
					callback = options;
					options = {};
				} else if ("callback" in options) callback = options.callback;
				const oldString = this.castInput(oldStr, options);
				const newString = this.castInput(newStr, options);
				const oldTokens = this.removeEmpty(this.tokenize(oldString, options));
				const newTokens = this.removeEmpty(this.tokenize(newString, options));
				return this.diffWithOptionsObj(oldTokens, newTokens, options, callback);
			}
			diffWithOptionsObj(oldTokens, newTokens, options, callback) {
				var _a;
				const done = (value) => {
					value = this.postProcess(value, options);
					if (callback) {
						setTimeout(function() {
							callback(value);
						}, 0);
						return;
					} else return value;
				};
				const newLen = newTokens.length, oldLen = oldTokens.length;
				let editLength = 1;
				let maxEditLength = newLen + oldLen;
				if (options.maxEditLength != null) maxEditLength = Math.min(maxEditLength, options.maxEditLength);
				const maxExecutionTime = (_a = options.timeout) !== null && _a !== void 0 ? _a : Infinity;
				const abortAfterTimestamp = Date.now() + maxExecutionTime;
				const bestPath = [{
					oldPos: -1,
					lastComponent: void 0
				}];
				let newPos = this.extractCommon(bestPath[0], newTokens, oldTokens, 0, options);
				if (bestPath[0].oldPos + 1 >= oldLen && newPos + 1 >= newLen) return done(this.buildValues(bestPath[0].lastComponent, newTokens, oldTokens));
				let minDiagonalToConsider = -Infinity, maxDiagonalToConsider = Infinity;
				const execEditLength = () => {
					for (let diagonalPath = Math.max(minDiagonalToConsider, -editLength); diagonalPath <= Math.min(maxDiagonalToConsider, editLength); diagonalPath += 2) {
						let basePath;
						const removePath = bestPath[diagonalPath - 1], addPath = bestPath[diagonalPath + 1];
						if (removePath) bestPath[diagonalPath - 1] = void 0;
						let canAdd = false;
						if (addPath) {
							const addPathNewPos = addPath.oldPos - diagonalPath;
							canAdd = addPath && 0 <= addPathNewPos && addPathNewPos < newLen;
						}
						const canRemove = removePath && removePath.oldPos + 1 < oldLen;
						if (!canAdd && !canRemove) {
							bestPath[diagonalPath] = void 0;
							continue;
						}
						if (!canRemove || canAdd && removePath.oldPos < addPath.oldPos) basePath = this.addToPath(addPath, true, false, 0, options);
						else basePath = this.addToPath(removePath, false, true, 1, options);
						newPos = this.extractCommon(basePath, newTokens, oldTokens, diagonalPath, options);
						if (basePath.oldPos + 1 >= oldLen && newPos + 1 >= newLen) return done(this.buildValues(basePath.lastComponent, newTokens, oldTokens)) || true;
						else {
							bestPath[diagonalPath] = basePath;
							if (basePath.oldPos + 1 >= oldLen) maxDiagonalToConsider = Math.min(maxDiagonalToConsider, diagonalPath - 1);
							if (newPos + 1 >= newLen) minDiagonalToConsider = Math.max(minDiagonalToConsider, diagonalPath + 1);
						}
					}
					editLength++;
				};
				if (callback) (function exec() {
					setTimeout(function() {
						if (editLength > maxEditLength || Date.now() > abortAfterTimestamp) return callback(void 0);
						if (!execEditLength()) exec();
					}, 0);
				})();
				else while (editLength <= maxEditLength && Date.now() <= abortAfterTimestamp) {
					const ret = execEditLength();
					if (ret) return ret;
				}
			}
			addToPath(path, added, removed, oldPosInc, options) {
				const last = path.lastComponent;
				if (last && !options.oneChangePerToken && last.added === added && last.removed === removed) return {
					oldPos: path.oldPos + oldPosInc,
					lastComponent: {
						count: last.count + 1,
						added,
						removed,
						previousComponent: last.previousComponent
					}
				};
				else return {
					oldPos: path.oldPos + oldPosInc,
					lastComponent: {
						count: 1,
						added,
						removed,
						previousComponent: last
					}
				};
			}
			extractCommon(basePath, newTokens, oldTokens, diagonalPath, options) {
				const newLen = newTokens.length, oldLen = oldTokens.length;
				let oldPos = basePath.oldPos, newPos = oldPos - diagonalPath, commonCount = 0;
				while (newPos + 1 < newLen && oldPos + 1 < oldLen && this.equals(oldTokens[oldPos + 1], newTokens[newPos + 1], options)) {
					newPos++;
					oldPos++;
					commonCount++;
					if (options.oneChangePerToken) basePath.lastComponent = {
						count: 1,
						previousComponent: basePath.lastComponent,
						added: false,
						removed: false
					};
				}
				if (commonCount && !options.oneChangePerToken) basePath.lastComponent = {
					count: commonCount,
					previousComponent: basePath.lastComponent,
					added: false,
					removed: false
				};
				basePath.oldPos = oldPos;
				return newPos;
			}
			equals(left, right, options) {
				if (options.comparator) return options.comparator(left, right);
				else return left === right || !!options.ignoreCase && left.toLowerCase() === right.toLowerCase();
			}
			removeEmpty(array) {
				const ret = [];
				for (let i = 0; i < array.length; i++) if (array[i]) ret.push(array[i]);
				return ret;
			}
			castInput(value, options) {
				return value;
			}
			tokenize(value, options) {
				return Array.from(value);
			}
			join(chars) {
				return chars.join("");
			}
			postProcess(changeObjects, options) {
				return changeObjects;
			}
			get useLongestToken() {
				return false;
			}
			buildValues(lastComponent, newTokens, oldTokens) {
				const components = [];
				let nextComponent;
				while (lastComponent) {
					components.push(lastComponent);
					nextComponent = lastComponent.previousComponent;
					delete lastComponent.previousComponent;
					lastComponent = nextComponent;
				}
				components.reverse();
				const componentLen = components.length;
				let componentPos = 0, newPos = 0, oldPos = 0;
				for (; componentPos < componentLen; componentPos++) {
					const component = components[componentPos];
					if (!component.removed) {
						if (!component.added && this.useLongestToken) {
							let value = newTokens.slice(newPos, newPos + component.count);
							value = value.map(function(value, i) {
								const oldValue = oldTokens[oldPos + i];
								return oldValue.length > value.length ? oldValue : value;
							});
							component.value = this.join(value);
						} else component.value = this.join(newTokens.slice(newPos, newPos + component.count));
						newPos += component.count;
						if (!component.added) oldPos += component.count;
					} else {
						component.value = this.join(oldTokens.slice(oldPos, oldPos + component.count));
						oldPos += component.count;
					}
				}
				return components;
			}
		};
		//#endregion
		//#region node_modules/.pnpm/diff@9.0.0/node_modules/diff/libesm/diff/character.js
		var CharacterDiff = class extends Diff {};
		new CharacterDiff();
		//#endregion
		//#region node_modules/.pnpm/diff@9.0.0/node_modules/diff/libesm/util/string.js
		function longestCommonPrefix(str1, str2) {
			let i;
			for (i = 0; i < str1.length && i < str2.length; i++) if (str1[i] != str2[i]) return str1.slice(0, i);
			return str1.slice(0, i);
		}
		function longestCommonSuffix(str1, str2) {
			let i;
			if (!str1 || !str2 || str1[str1.length - 1] != str2[str2.length - 1]) return "";
			for (i = 0; i < str1.length && i < str2.length; i++) if (str1[str1.length - (i + 1)] != str2[str2.length - (i + 1)]) return str1.slice(-i);
			return str1.slice(-i);
		}
		function replacePrefix(string, oldPrefix, newPrefix) {
			if (string.slice(0, oldPrefix.length) != oldPrefix) throw Error(`string ${JSON.stringify(string)} doesn't start with prefix ${JSON.stringify(oldPrefix)}; this is a bug`);
			return newPrefix + string.slice(oldPrefix.length);
		}
		function replaceSuffix(string, oldSuffix, newSuffix) {
			if (!oldSuffix) return string + newSuffix;
			if (string.slice(-oldSuffix.length) != oldSuffix) throw Error(`string ${JSON.stringify(string)} doesn't end with suffix ${JSON.stringify(oldSuffix)}; this is a bug`);
			return string.slice(0, -oldSuffix.length) + newSuffix;
		}
		function removePrefix(string, oldPrefix) {
			return replacePrefix(string, oldPrefix, "");
		}
		function removeSuffix(string, oldSuffix) {
			return replaceSuffix(string, oldSuffix, "");
		}
		function maximumOverlap(string1, string2) {
			return string2.slice(0, overlapCount(string1, string2));
		}
		function overlapCount(a, b) {
			let startA = 0;
			if (a.length > b.length) startA = a.length - b.length;
			let endB = b.length;
			if (a.length < b.length) endB = a.length;
			const map = Array(endB);
			let k = 0;
			map[0] = 0;
			for (let j = 1; j < endB; j++) {
				if (b[j] == b[k]) map[j] = map[k];
				else map[j] = k;
				while (k > 0 && b[j] != b[k]) k = map[k];
				if (b[j] == b[k]) k++;
			}
			k = 0;
			for (let i = startA; i < a.length; i++) {
				while (k > 0 && a[i] != b[k]) k = map[k];
				if (a[i] == b[k]) k++;
			}
			return k;
		}
		/**
		* Split a string into segments using a word segmenter, merging consecutive
		* segments if they are both whitespace segments. Whitespace segments can
		* appear adjacent to one another for two reasons:
		* - newlines always get their own segment
		* - where a diacritic is attached to a whitespace character in the text, the
		*   segment ends after the diacritic, so e.g. " \u0300 " becomes two segments.
		* This function therefore runs the segmenter's .segment() method and then
		* merges consecutive segments of whitespace into a single part.
		*/
		function segment(string, segmenter) {
			const parts = [];
			for (const segmentObj of Array.from(segmenter.segment(string))) {
				const segment = segmentObj.segment;
				if (parts.length && /\s/.test(parts[parts.length - 1]) && /\s/.test(segment)) parts[parts.length - 1] += segment;
				else parts.push(segment);
			}
			return parts;
		}
		function trailingWs(string, segmenter) {
			if (segmenter) return leadingAndTrailingWs(string, segmenter)[1];
			let i;
			for (i = string.length - 1; i >= 0; i--) if (!string[i].match(/\s/)) break;
			return string.substring(i + 1);
		}
		function leadingWs(string, segmenter) {
			if (segmenter) return leadingAndTrailingWs(string, segmenter)[0];
			const match = string.match(/^\s*/);
			return match ? match[0] : "";
		}
		function leadingAndTrailingWs(string, segmenter) {
			if (!segmenter) return [leadingWs(string), trailingWs(string)];
			if (segmenter.resolvedOptions().granularity != "word") throw new Error("The segmenter passed must have a granularity of \"word\"");
			const segments = segment(string, segmenter);
			const firstSeg = segments[0];
			const lastSeg = segments[segments.length - 1];
			return [/\s/.test(firstSeg) ? firstSeg : "", /\s/.test(lastSeg) ? lastSeg : ""];
		}
		//#endregion
		//#region node_modules/.pnpm/diff@9.0.0/node_modules/diff/libesm/diff/word.js
		const extendedWordChars = "a-zA-Z0-9_\\u{AD}\\u{C0}-\\u{D6}\\u{D8}-\\u{F6}\\u{F8}-\\u{2C6}\\u{2C8}-\\u{2D7}\\u{2DE}-\\u{2FF}\\u{1E00}-\\u{1EFF}";
		const tokenizeIncludingWhitespace = new RegExp(`[${extendedWordChars}]+|\\s+|[^${extendedWordChars}]`, "ug");
		var WordDiff = class extends Diff {
			equals(left, right, options) {
				if (options.ignoreCase) {
					left = left.toLowerCase();
					right = right.toLowerCase();
				}
				return left.trim() === right.trim();
			}
			tokenize(value, options = {}) {
				let parts;
				if (options.intlSegmenter) {
					const segmenter = options.intlSegmenter;
					if (segmenter.resolvedOptions().granularity != "word") throw new Error("The segmenter passed must have a granularity of \"word\"");
					parts = segment(value, segmenter);
				} else parts = value.match(tokenizeIncludingWhitespace) || [];
				const tokens = [];
				let prevPart = null;
				parts.forEach((part) => {
					if (/\s/.test(part)) {
						if (prevPart == null) tokens.push(part);
						else tokens.push(tokens.pop() + part);
					} else if (prevPart != null && /\s/.test(prevPart)) {
						if (tokens[tokens.length - 1] == prevPart) tokens.push(tokens.pop() + part);
						else tokens.push(prevPart + part);
					} else tokens.push(part);
					prevPart = part;
				});
				return tokens;
			}
			join(tokens) {
				return tokens.map((token, i) => {
					if (i == 0) return token;
					else return token.replace(/^\s+/, "");
				}).join("");
			}
			postProcess(changes, options) {
				if (!changes || options.oneChangePerToken) return changes;
				let lastKeep = null;
				let insertion = null;
				let deletion = null;
				changes.forEach((change) => {
					if (change.added) insertion = change;
					else if (change.removed) deletion = change;
					else {
						if (insertion || deletion) dedupeWhitespaceInChangeObjects(lastKeep, deletion, insertion, change, options.intlSegmenter);
						lastKeep = change;
						insertion = null;
						deletion = null;
					}
				});
				if (insertion || deletion) dedupeWhitespaceInChangeObjects(lastKeep, deletion, insertion, null, options.intlSegmenter);
				return changes;
			}
		};
		new WordDiff();
		function dedupeWhitespaceInChangeObjects(startKeep, deletion, insertion, endKeep, segmenter) {
			if (deletion && insertion) {
				const [oldWsPrefix, oldWsSuffix] = leadingAndTrailingWs(deletion.value, segmenter);
				const [newWsPrefix, newWsSuffix] = leadingAndTrailingWs(insertion.value, segmenter);
				if (startKeep) {
					const commonWsPrefix = longestCommonPrefix(oldWsPrefix, newWsPrefix);
					startKeep.value = replaceSuffix(startKeep.value, newWsPrefix, commonWsPrefix);
					deletion.value = removePrefix(deletion.value, commonWsPrefix);
					insertion.value = removePrefix(insertion.value, commonWsPrefix);
				}
				if (endKeep) {
					const commonWsSuffix = longestCommonSuffix(oldWsSuffix, newWsSuffix);
					endKeep.value = replacePrefix(endKeep.value, newWsSuffix, commonWsSuffix);
					deletion.value = removeSuffix(deletion.value, commonWsSuffix);
					insertion.value = removeSuffix(insertion.value, commonWsSuffix);
				}
			} else if (insertion) {
				if (startKeep) {
					const ws = leadingWs(insertion.value, segmenter);
					insertion.value = insertion.value.substring(ws.length);
				}
				if (endKeep) {
					const ws = leadingWs(endKeep.value, segmenter);
					endKeep.value = endKeep.value.substring(ws.length);
				}
			} else if (startKeep && endKeep) {
				const newWsFull = leadingWs(endKeep.value, segmenter), [delWsStart, delWsEnd] = leadingAndTrailingWs(deletion.value, segmenter);
				const newWsStart = longestCommonPrefix(newWsFull, delWsStart);
				deletion.value = removePrefix(deletion.value, newWsStart);
				const newWsEnd = longestCommonSuffix(removePrefix(newWsFull, newWsStart), delWsEnd);
				deletion.value = removeSuffix(deletion.value, newWsEnd);
				endKeep.value = replacePrefix(endKeep.value, newWsFull, newWsEnd);
				startKeep.value = replaceSuffix(startKeep.value, newWsFull, newWsFull.slice(0, newWsFull.length - newWsEnd.length));
			} else if (endKeep) {
				const endKeepWsPrefix = leadingWs(endKeep.value, segmenter);
				const overlap = maximumOverlap(trailingWs(deletion.value, segmenter), endKeepWsPrefix);
				deletion.value = removeSuffix(deletion.value, overlap);
			} else if (startKeep) {
				const overlap = maximumOverlap(trailingWs(startKeep.value, segmenter), leadingWs(deletion.value, segmenter));
				deletion.value = removePrefix(deletion.value, overlap);
			}
		}
		var WordsWithSpaceDiff = class extends Diff {
			tokenize(value) {
				const regex = new RegExp(`(\\r?\\n)|[${extendedWordChars}]+|[^\\S\\n\\r]+|[^${extendedWordChars}]`, "ug");
				return value.match(regex) || [];
			}
		};
		new WordsWithSpaceDiff();
		//#endregion
		//#region node_modules/.pnpm/diff@9.0.0/node_modules/diff/libesm/diff/line.js
		var LineDiff = class extends Diff {
			constructor() {
				super(...arguments);
				this.tokenize = tokenize;
			}
			equals(left, right, options) {
				if (options.ignoreWhitespace) {
					if (!options.newlineIsToken || !left.includes("\n")) left = left.trim();
					if (!options.newlineIsToken || !right.includes("\n")) right = right.trim();
				} else if (options.ignoreNewlineAtEof && !options.newlineIsToken) {
					if (left.endsWith("\n")) left = left.slice(0, -1);
					if (right.endsWith("\n")) right = right.slice(0, -1);
				}
				return super.equals(left, right, options);
			}
		};
		new LineDiff();
		function tokenize(value, options) {
			if (options.stripTrailingCr) value = value.replace(/\r\n/g, "\n");
			const retLines = [], linesAndNewlines = value.split(/(\n|\r\n)/);
			if (!linesAndNewlines[linesAndNewlines.length - 1]) linesAndNewlines.pop();
			for (let i = 0; i < linesAndNewlines.length; i++) {
				const line = linesAndNewlines[i];
				if (i % 2 && !options.newlineIsToken) retLines[retLines.length - 1] += line;
				else retLines.push(line);
			}
			return retLines;
		}
		//#endregion
		//#region node_modules/.pnpm/diff@9.0.0/node_modules/diff/libesm/diff/sentence.js
		function isSentenceEndPunct(char) {
			return char == "." || char == "!" || char == "?";
		}
		var SentenceDiff = class extends Diff {
			tokenize(value) {
				var _a;
				const result = [];
				let tokenStartI = 0;
				for (let i = 0; i < value.length; i++) {
					if (i == value.length - 1) {
						result.push(value.slice(tokenStartI));
						break;
					}
					if (isSentenceEndPunct(value[i]) && value[i + 1].match(/\s/)) {
						result.push(value.slice(tokenStartI, i + 1));
						i = tokenStartI = i + 1;
						while ((_a = value[i + 1]) === null || _a === void 0 ? void 0 : _a.match(/\s/)) i++;
						result.push(value.slice(tokenStartI, i + 1));
						tokenStartI = i + 1;
					}
				}
				return result;
			}
		};
		new SentenceDiff();
		//#endregion
		//#region node_modules/.pnpm/diff@9.0.0/node_modules/diff/libesm/diff/css.js
		var CssDiff = class extends Diff {
			tokenize(value) {
				return value.split(/([{}:;,]|\s+)/);
			}
		};
		new CssDiff();
		//#endregion
		//#region node_modules/.pnpm/diff@9.0.0/node_modules/diff/libesm/diff/json.js
		var JsonDiff = class extends Diff {
			constructor() {
				super(...arguments);
				this.tokenize = tokenize;
			}
			get useLongestToken() {
				return true;
			}
			castInput(value, options) {
				const { undefinedReplacement, stringifyReplacer = (k, v) => typeof v === "undefined" ? undefinedReplacement : v } = options;
				return typeof value === "string" ? value : JSON.stringify(canonicalize(value, null, null, stringifyReplacer), null, "  ");
			}
			equals(left, right, options) {
				return super.equals(left.replace(/,([\r\n])/g, "$1"), right.replace(/,([\r\n])/g, "$1"), options);
			}
		};
		new JsonDiff();
		function canonicalize(obj, stack, replacementStack, replacer, key) {
			stack = stack || [];
			replacementStack = replacementStack || [];
			if (replacer) obj = replacer(key === void 0 ? "" : key, obj);
			let i;
			for (i = 0; i < stack.length; i += 1) if (stack[i] === obj) return replacementStack[i];
			let canonicalizedObj;
			if ("[object Array]" === Object.prototype.toString.call(obj)) {
				stack.push(obj);
				canonicalizedObj = new Array(obj.length);
				replacementStack.push(canonicalizedObj);
				for (i = 0; i < obj.length; i += 1) canonicalizedObj[i] = canonicalize(obj[i], stack, replacementStack, replacer, String(i));
				stack.pop();
				replacementStack.pop();
				return canonicalizedObj;
			}
			if (obj && obj.toJSON) obj = obj.toJSON();
			if (typeof obj === "object" && obj !== null) {
				stack.push(obj);
				canonicalizedObj = {};
				replacementStack.push(canonicalizedObj);
				const sortedKeys = [];
				let key;
				for (key in obj)
 /* istanbul ignore else */
				if (Object.prototype.hasOwnProperty.call(obj, key)) sortedKeys.push(key);
				sortedKeys.sort();
				for (i = 0; i < sortedKeys.length; i += 1) {
					key = sortedKeys[i];
					canonicalizedObj[key] = canonicalize(obj[key], stack, replacementStack, replacer, key);
				}
				stack.pop();
				replacementStack.pop();
			} else canonicalizedObj = obj;
			return canonicalizedObj;
		}
		//#endregion
		//#region node_modules/.pnpm/diff@9.0.0/node_modules/diff/libesm/diff/array.js
		var ArrayDiff = class extends Diff {
			tokenize(value) {
				return value.slice();
			}
			join(value) {
				return value;
			}
			removeEmpty(value) {
				return value;
			}
		};
		const arrayDiff = new ArrayDiff();
		function diffArrays(oldArr, newArr, options) {
			return arrayDiff.diff(oldArr, newArr, options);
		}
		//#endregion
		//#region src/client/diff-text.ts
		/**
		* Split one side of a diff into content lines without manufacturing a final
		* empty line for a trailing line terminator.
		* @param text - One diff side's text.
		* @returns Content lines without the terminating newline.
		*/
		function diffContentLines(text) {
			if (text === "") return [];
			return (text.endsWith("\n") ? text.slice(0, -1) : text).split("\n");
		}
		//#endregion
		//#region src/client/recorded-diffs.ts
		/**
		* Reconstruct line-level review hunks from one recorded Code Mode mutation's
		* full before/after content. The wire views that carry reusable hunks only
		* ride model-direct tool/call frames; nested `run_code` dispatches are logged
		* with the raw values instead, so this module rebuilds the same hunk shape
		* (`ProducedFileDiff` with line anchors) the rest of the tab renders and the
		* Host undo service applies.
		*/
		/** Unchanged lines kept around each change run, matching unified-diff taste. */
		const CONTEXT_LINES = 3;
		/** Count identical trailing (context) lines of one hunk. */
		function trailingContext(hunk) {
			let count = 0;
			const max = Math.min(hunk.old.length, hunk.new.length);
			for (let offset = 1; offset <= max; offset += 1) {
				if (hunk.old[hunk.old.length - offset] !== hunk.new[hunk.new.length - offset]) break;
				count += 1;
			}
			return count;
		}
		/**
		* Line-level hunks for one file mutation, or a single whole-file entry when the
		* file was created (`before === null`, mirroring the write tool's null-content
		* card). Returns [] when the mutation did not change the file.
		*/
		function diffsFromBeforeAfter(path, before, after) {
			if (before === null) return after === "" ? [] : [{
				path,
				oldText: null,
				newText: after
			}];
			const oldLines = diffContentLines(before);
			const newLines = diffContentLines(after);
			if (oldLines.length === 0 && newLines.length === 0) return [];
			if (oldLines.join("\n") === newLines.join("\n")) return [];
			const hunks = [];
			const changes = diffArrays(oldLines, newLines);
			let contextBuffer = [];
			let oldCursor = 1;
			let newCursor = 1;
			let hunk = null;
			for (const change of changes) {
				if (!change.removed && !change.added) {
					const run = change.value;
					if (hunk !== null) {
						const beforeLen = hunk.old.length;
						const beforeNewLen = hunk.new.length;
						hunk.old.push(...run);
						hunk.new.push(...run);
						oldCursor += run.length;
						newCursor += run.length;
						if (run.length > 6) {
							const target = beforeLen + CONTEXT_LINES;
							hunk.old.length = target;
							hunk.new.length = beforeNewLen + CONTEXT_LINES;
							contextBuffer = run.slice(-3);
							hunk = null;
						}
					} else {
						contextBuffer.push(...run);
						oldCursor += run.length;
						newCursor += run.length;
						if (contextBuffer.length > CONTEXT_LINES) contextBuffer = contextBuffer.slice(-3);
					}
					continue;
				}
				const removed = change.removed ? change.value : [];
				const added = change.added ? change.value : [];
				if (hunk === null) {
					const leading = contextBuffer;
					hunk = {
						oldStart: oldCursor - leading.length,
						newStart: newCursor - leading.length,
						old: [...leading],
						new: [...leading]
					};
					hunks.push(hunk);
				}
				hunk.old.push(...removed);
				hunk.new.push(...added);
				oldCursor += removed.length;
				newCursor += added.length;
			}
			for (const current of hunks) {
				const extra = Math.max(0, trailingContext(current) - CONTEXT_LINES);
				if (extra > 0) {
					current.old.length -= extra;
					current.new.length -= extra;
				}
			}
			return hunks.filter((hunkEntry) => hunkEntry.old.length > 0 || hunkEntry.new.length > 0).map((hunkEntry) => ({
				path,
				oldText: hunkEntry.old.join("\n"),
				newText: hunkEntry.new.join("\n"),
				oldStart: hunkEntry.oldStart,
				newStart: hunkEntry.newStart
			}));
		}
		//#endregion
		//#region src/client/session-changes.ts
		/** The call head of a running or settled tool block, when it carries one. */
		function callOf(block) {
			const record = block;
			if (record.call !== void 0 && record.call !== null) {
				if (typeof record.call.name === "string" && typeof record.call.argsRaw === "string") return {
					name: record.call.name,
					argsRaw: record.call.argsRaw
				};
				return null;
			}
			if (typeof record.name === "string" && typeof record.argsRaw === "string") return {
				name: record.name,
				argsRaw: record.argsRaw
			};
			return null;
		}
		/** The applied hunks for one settled block, or the call-argument intent. */
		function blockChanges(block) {
			const call = callOf(block);
			if (call === null) return [];
			const intent = callIntent(call.name, call.argsRaw);
			if (intent === null) return [];
			const settled = block.isError !== void 0;
			if (settled && block.isError) return [];
			const changes = [];
			if (intent.path !== null) {
				let diffs = intent.diffs;
				if (settled) {
					const applied = appliedDiffs(block.meta);
					if (applied !== null) {
						const own = applied.filter((diff) => diff.path === intent.path);
						if (own.length > 0) diffs = own;
					}
				}
				if (diffs.length > 0) changes.push({
					path: intent.path,
					diffs
				});
			}
			for (const path of intent.deletions) changes.push({
				path,
				diffs: [],
				deleted: true
			});
			return changes;
		}
		/** Settled changes for a tool block tree (the block itself plus `subCalls`). */
		function collectChanges(block, out) {
			if (block.kind === "tool-result") for (const change of blockChanges(block)) out.push(change);
			const subCalls = block.subCalls;
			if (!Array.isArray(subCalls)) return;
			for (const child of subCalls) {
				const node = child;
				if (node.kind === "tool-result") collectChanges(node, out);
			}
		}
		/**
		* Attribute an event seq to its owning turn. Completed turns own the seq
		* range up to their `turn/end` seq; anything past the last completed end
		* belongs to the live turn (the in-flight `partial` / running call's turn,
		* or the next turn number when nothing live is observable).
		*/
		function turnAttribution(snapshot) {
			const view = normalizeSnapshot(snapshot);
			const ends = [...view?.turnEnds.entries() ?? []].sort((a, b) => a[1] - b[1]);
			const liveTurn = view?.partial?.turn ?? view?.runningCalls[0]?.turn ?? (ends.at(-1)?.[0] ?? 0) + 1;
			return (seq) => {
				for (const [turn, endSeq] of ends) if (endSeq >= seq) return {
					turn,
					live: false
				};
				return {
					turn: liveTurn,
					live: true
				};
			};
		}
		/** Derive one session's per-turn produced-file changes (uncached core). */
		function derive(snapshot) {
			const attribute = turnAttribution(snapshot);
			const byTurn = /* @__PURE__ */ new Map();
			const view = normalizeSnapshot(snapshot);
			for (const node of view?.nodes ?? []) {
				if (node.kind !== "tool-result" || node.isError) continue;
				const changes = [];
				collectChanges(node, changes);
				if (changes.length === 0) continue;
				const { turn, live } = attribute(node.seq);
				let group = byTurn.get(turn);
				if (group === void 0) {
					group = {
						live,
						files: /* @__PURE__ */ new Map()
					};
					byTurn.set(turn, group);
				}
				for (const change of changes) {
					const existing = group.files.get(change.path);
					if (change.deleted === true) {
						if (existing === void 0) group.files.set(change.path, {
							diffs: [],
							deleted: true
						});
						else existing.deleted = true;
						continue;
					}
					if (existing === void 0) group.files.set(change.path, { diffs: [...change.diffs] });
					else {
						existing.diffs.push(...change.diffs);
						delete existing.deleted;
					}
				}
			}
			return [...byTurn.entries()].sort((a, b) => a[0] - b[0]).map(([turn, group]) => ({
				turn,
				live: group.live,
				files: [...group.files.entries()].map(([path, own]) => ({
					path,
					diffs: own.diffs,
					...own.deleted === true ? { deleted: true } : {}
				}))
			}));
		}
		/**
		* Snapshot-identity cache: the sidebar badge runs this derivation on every
		* tab-bar render, so the result is memoized per immutable snapshot reference
		* (the session publishes a fresh reference only when content changes).
		*/
		const cache = /* @__PURE__ */ new WeakMap();
		/** Derive per-turn produced-file changes for one session snapshot. */
		function deriveSessionChanges(snapshot) {
			if (snapshot === null) return [];
			const hit = cache.get(snapshot);
			if (hit !== void 0) return hit;
			const derived = derive(snapshot);
			cache.set(snapshot, derived);
			return derived;
		}
		/** Latest actual conversation turn, including a turn that changed no files. */
		function lastTurnChanges(snapshot, turns) {
			const view = normalizeSnapshot(snapshot);
			const completed = [...view?.turnEnds.entries() ?? []].sort((a, b) => a[1] - b[1]).at(-1)?.[0];
			const latest = view?.partial?.turn ?? view?.runningCalls[0]?.turn ?? completed ?? turns.at(-1)?.turn;
			return turns.filter((turn) => turn.turn === latest);
		}
		/** Every `run_code` tool-result node whose nested changes are not in the snapshot. */
		function deriveSessionRoots(snapshot) {
			const attribute = turnAttribution(snapshot);
			const roots = [];
			const view = normalizeSnapshot(snapshot);
			for (const node of view?.nodes ?? []) {
				if (node.kind !== "tool-result" || node.isError) continue;
				if (node.subCalls.length === 0) continue;
				const nested = [];
				for (const child of node.subCalls) if (child.kind === "tool-result") collectChanges(child, nested);
				if (nested.some((change) => change.diffs.length > 0)) continue;
				const { turn, live } = attribute(node.seq);
				roots.push({
					turn,
					live,
					rootCallId: node.callId
				});
			}
			return roots;
		}
		/**
		* Merge Host-recorded Code Mode mutations into the snapshot-derived turns:
		* hunks rebuilt from the full before/after are appended to the owning turn's
		* file groups (same-path entries stay one row, hunks appended in dispatch
		* order), so the tab's diff rendering, status inspection and undo all work on
		* programmatic edits exactly like model-direct ones. All inputs are immutable;
		* the result is a fresh array only when a recorded mutation matched a visible
		* root.
		*/
		function mergeRecordedTurns(turns, roots, recorded) {
			if (recorded.length === 0 || roots.length === 0) return turns;
			const rootTurns = /* @__PURE__ */ new Map();
			for (const root of roots) rootTurns.set(root.rootCallId, {
				turn: root.turn,
				live: root.live
			});
			const byRoot = /* @__PURE__ */ new Map();
			for (const mutation of recorded) {
				const list = byRoot.get(mutation.rootCallId);
				if (list === void 0) byRoot.set(mutation.rootCallId, [mutation]);
				else list.push(mutation);
			}
			let matched = false;
			for (const root of roots) if (byRoot.has(root.rootCallId)) {
				matched = true;
				break;
			}
			if (!matched) return turns;
			const groups = /* @__PURE__ */ new Map();
			for (const turn of turns) {
				const files = /* @__PURE__ */ new Map();
				for (const file of turn.files) files.set(file.path, {
					diffs: [...file.diffs],
					...file.reviewDiffs ? { reviewDiffs: [...file.reviewDiffs] } : {},
					...file.deleted === true ? { deleted: true } : {}
				});
				groups.set(turn.turn, {
					live: turn.live,
					files
				});
			}
			for (const [rootCallId, mutations] of byRoot) {
				const owner = rootTurns.get(rootCallId);
				if (owner === void 0) continue;
				let group = groups.get(owner.turn);
				if (group === void 0) {
					group = {
						live: owner.live,
						files: /* @__PURE__ */ new Map()
					};
					groups.set(owner.turn, group);
				}
				for (const mutation of mutations) {
					const diffs = diffsFromBeforeAfter(mutation.path, mutation.before, mutation.after);
					if (diffs.length === 0) continue;
					const full = {
						path: mutation.path,
						oldText: mutation.before,
						newText: mutation.after,
						oldStart: 1,
						newStart: 1
					};
					const existing = group.files.get(mutation.path);
					if (existing === void 0) group.files.set(mutation.path, {
						diffs: [...diffs],
						reviewDiffs: [full]
					});
					else {
						existing.reviewDiffs = [...existing.reviewDiffs ?? existing.diffs, full];
						existing.diffs.push(...diffs);
					}
				}
			}
			return [...groups.entries()].sort((a, b) => a[0] - b[0]).map(([turn, group]) => ({
				turn,
				live: group.live,
				files: [...group.files.entries()].map(([path, own]) => ({
					path,
					diffs: own.diffs,
					...own.reviewDiffs ? { reviewDiffs: own.reviewDiffs } : {},
					...own.deleted === true ? { deleted: true } : {}
				}))
			}));
		}
		/** Count distinct changed paths across every turn (the sidebar badge count). */
		function countChangedFiles(turns) {
			const paths = /* @__PURE__ */ new Set();
			for (const turn of turns) for (const file of turn.files) paths.add(file.path);
			return paths.size;
		}
		/**
		* Debug/demo override for the keep threshold: `?frtArchiveKeep=N` in the app
		* URL forces N (0 archives every completed turn) so the archive UI can be
		* exercised on sessions with few change-bearing turns. Null when absent.
		*/
		function archiveKeepOverride() {
			try {
				const param = new URLSearchParams(window.location.search).get("frtArchiveKeep");
				if (param === null) return null;
				const value = Number(param);
				if (Number.isInteger(value) && value >= 0) return value;
			} catch {}
			return null;
		}
		/** Split turns into the main list and the auto-archived tail (both newest-first). */
		function splitArchivedTurns(turns, keep = 5) {
			const effective = archiveKeepOverride() ?? keep;
			const descending = [...turns].sort((left, right) => right.turn - left.turn);
			const kept = new Set(descending.slice(0, effective).map((turn) => turn.turn));
			const main = [];
			const archived = [];
			for (const turn of descending) if (turn.live || kept.has(turn.turn)) main.push(turn);
			else archived.push(turn);
			return {
				main,
				archived
			};
		}
		/** Trailing path segment, the part that identifies the file at a glance. */
		function basename$1(path) {
			const at = Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\"));
			return at === -1 ? path : path.slice(at + 1);
		}
		/** POSIX root, drive-letter, or UNC absolute-path test (separator-agnostic). */
		function isAbsolutePath(path) {
			return path.startsWith("/") || path.startsWith("\\\\") || /^[A-Za-z]:[\\/]/.test(path);
		}
		/** Resolve a (possibly relative) tool path against the session cwd. */
		function resolveSessionPath(cwd, path) {
			if (isAbsolutePath(path)) return path;
			const base = cwd ?? "";
			if (base === "") return path;
			const separator = base.includes("\\") ? "\\" : "/";
			return `${base.replace(/[\\/]+$/, "")}${separator}${path}`;
		}
		/** Align each contiguous replacement, keeping absent lines blank on that side. */
		function splitDiffRows(lines) {
			const rows = [];
			let cursor = 0;
			while (cursor < lines.length) {
				const line = lines[cursor];
				if (line.kind === "context") {
					rows.push({
						old: line,
						next: line
					});
					cursor++;
					continue;
				}
				const old = [];
				const next = [];
				while (cursor < lines.length && lines[cursor]?.kind !== "context") {
					const changed = lines[cursor++];
					if (changed.kind === "del") old.push(changed);
					else next.push(changed);
				}
				for (let index = 0; index < Math.max(old.length, next.length); index++) rows.push({
					old: old[index] ?? null,
					next: next[index] ?? null
				});
			}
			return rows;
		}
		function hunkLines(diff) {
			const changes = diffArrays(diff.oldText === null ? [] : diffContentLines(diff.oldText), diffContentLines(diff.newText));
			const lines = [];
			let oldNumber = diff.oldStart ?? 1;
			let newNumber = diff.newStart ?? 1;
			for (const change of changes) for (const text of change.value) if (change.removed) lines.push({
				kind: "del",
				oldNumber: oldNumber++,
				newNumber: null,
				text
			});
			else if (change.added) lines.push({
				kind: "add",
				oldNumber: null,
				newNumber: newNumber++,
				text
			});
			else lines.push({
				kind: "context",
				oldNumber: oldNumber++,
				newNumber: newNumber++,
				text
			});
			return lines;
		}
		function collapsedRows(lines, contextLines, hunkIndex) {
			const rows = [];
			let cursor = 0;
			let gapIndex = 0;
			const context = Math.max(0, Math.floor(contextLines));
			while (cursor < lines.length) {
				const current = lines[cursor];
				if (current.kind !== "context") {
					rows.push(current);
					cursor++;
					continue;
				}
				const start = cursor;
				while (cursor < lines.length && lines[cursor]?.kind === "context") cursor++;
				const run = lines.slice(start, cursor);
				const leading = start === 0;
				const trailing = cursor === lines.length;
				const hiddenStart = leading ? 0 : Math.min(context, run.length);
				const hiddenEnd = trailing ? run.length : Math.max(hiddenStart, run.length - context);
				rows.push(...run.slice(0, hiddenStart));
				const hidden = run.slice(hiddenStart, hiddenEnd);
				if (hidden.length) rows.push({
					kind: "gap",
					id: `${hunkIndex}:${gapIndex++}`,
					position: leading ? "leading" : trailing ? "trailing" : "middle",
					lines: hidden
				});
				rows.push(...run.slice(hiddenEnd));
			}
			return rows;
		}
		function buildUnifiedHunks(diffs, contextLines) {
			let previousPath;
			let previousOldEnd = 1;
			let previousNewEnd = 1;
			return diffs.map((diff, index) => {
				const lines = hunkLines(diff);
				const oldStart = diff.oldStart ?? 1;
				const newStart = diff.newStart ?? 1;
				const unchangedBefore = diff.oldStart !== void 0 && diff.newStart !== void 0 ? Math.max(0, Math.min(oldStart - (diff.path === previousPath ? previousOldEnd : 1), newStart - (diff.path === previousPath ? previousNewEnd : 1))) : 0;
				previousPath = diff.path;
				previousOldEnd = oldStart + lines.filter((line) => line.oldNumber !== null).length;
				previousNewEnd = newStart + lines.filter((line) => line.newNumber !== null).length;
				return {
					lines,
					rows: collapsedRows(lines, contextLines, index),
					unchangedBefore,
					added: lines.filter((line) => line.kind === "add").length,
					removed: lines.filter((line) => line.kind === "del").length
				};
			});
		}
		/** Reveal up to the configured number of lines next to the visible changes. */
		function expandContextGap(gap, previous = {
			before: 0,
			after: 0
		}, lines = 20) {
			const remaining = Math.max(0, gap.lines.length - previous.before - previous.after);
			const count = Math.min(Number.isSafeInteger(lines) && lines > 0 ? lines : 20, remaining);
			if (gap.position === "leading") return {
				before: previous.before,
				after: previous.after + count
			};
			if (gap.position === "trailing") return {
				before: previous.before + count,
				after: previous.after
			};
			return {
				before: previous.before + Math.ceil(count / 2),
				after: previous.after + Math.floor(count / 2)
			};
		}
		/** Reveal the whole remaining interval from the selected neighboring change. */
		function expandAllContextGap(gap, direction, previous = {
			before: 0,
			after: 0
		}) {
			const remaining = Math.max(0, gap.lines.length - previous.before - previous.after);
			return direction === "up" ? {
				before: previous.before,
				after: previous.after + remaining
			} : {
				before: previous.before + remaining,
				after: previous.after
			};
		}
		/** Expansion never changes the recorded hunks, line anchors, or change totals. */
		function visibleHunkRows(hunk, expansions, preserveExpandedGaps = false) {
			return hunk.rows.flatMap((row) => {
				if (row.kind !== "gap") return [row];
				const expansion = expansions.get(row.id);
				if (expansion?.revealed?.length) {
					const ranges = [
						{
							start: 0,
							end: expansion.before
						},
						...expansion.revealed,
						{
							start: row.lines.length - expansion.after,
							end: row.lines.length
						}
					].map((range) => ({
						start: Math.max(0, range.start),
						end: Math.min(row.lines.length, range.end)
					})).filter((range) => range.end > range.start).sort((a, b) => a.start - b.start);
					const merged = [];
					for (const range of ranges) {
						const last = merged.at(-1);
						if (last && range.start <= last.end) last.end = Math.max(last.end, range.end);
						else merged.push({ ...range });
					}
					const result = [];
					const hidden = (start, end) => {
						if (end <= start) return;
						result.push({
							kind: "gap",
							id: `${row.id}:slice:${start}`,
							originId: row.id,
							offset: start,
							position: start === 0 && row.position === "leading" ? "leading" : end === row.lines.length && row.position === "trailing" ? "trailing" : "middle",
							lines: row.lines.slice(start, end)
						});
					};
					let cursor = 0;
					for (const range of merged) {
						hidden(cursor, range.start);
						result.push(...row.lines.slice(range.start, range.end));
						cursor = range.end;
					}
					hidden(cursor, row.lines.length);
					if (preserveExpandedGaps && !result.some((line) => line.kind === "gap")) result.unshift({
						...row,
						lines: []
					});
					return result;
				}
				const before = Math.min(row.lines.length, expansion?.before ?? 0);
				const after = Math.min(row.lines.length - before, expansion?.after ?? 0);
				const remaining = row.lines.slice(before, row.lines.length - after);
				if (!remaining.length && preserveExpandedGaps) return [{
					...row,
					lines: []
				}, ...row.lines];
				return [
					...row.lines.slice(0, before),
					...remaining.length ? [{
						...row,
						lines: remaining
					}] : [],
					...row.lines.slice(row.lines.length - after)
				];
			});
		}
		/** Each blue separator describes the actual contiguous block below it. */
		function unifiedVisibleBlocks(rows) {
			const blocks = [];
			let gap = null;
			let lines = [];
			for (const row of rows) if (row.kind === "gap") {
				if (gap !== null || lines.length) blocks.push({
					gap,
					lines
				});
				gap = row;
				lines = [];
			} else lines.push(row);
			if (gap !== null || lines.length) blocks.push({
				gap,
				lines
			});
			return blocks;
		}
		function unifiedHunkRange(lines, diff) {
			const old = lines.filter((line) => line.oldNumber !== null);
			const next = lines.filter((line) => line.newNumber !== null);
			const oldStart = old[0]?.oldNumber ?? Math.max(0, (diff.oldStart ?? 1) - 1);
			const newStart = next[0]?.newNumber ?? Math.max(0, (diff.newStart ?? 1) - 1);
			return `@@ -${oldStart},${old.length} +${newStart},${next.length} @@`;
		}
		function unifiedDiffText(diffs) {
			let previousPath;
			const output = [];
			for (const diff of diffs) {
				if (diff.path !== previousPath) output.push(diff.path);
				previousPath = diff.path;
				const hunk = buildUnifiedHunks([diff], 3)[0];
				for (const block of unifiedVisibleBlocks(hunk.rows)) {
					if (!block.lines.length) continue;
					output.push(unifiedHunkRange(block.lines, diff));
					for (const line of block.lines) output.push(`${line.kind === "del" ? "-" : line.kind === "add" ? "+" : " "} ${line.text}`);
				}
			}
			return output.join("\n");
		}
		function summarizeDiffs(diffs) {
			let added = 0;
			let removed = 0;
			for (const diff of diffs) for (const line of hunkLines(diff)) {
				if (line.kind === "add") added++;
				if (line.kind === "del") removed++;
			}
			return {
				added,
				removed
			};
		}
		//#endregion
		//#region \0dsh-file-review-tab-multi-git-repository-css:D:\projectZJGG\dsh-file-review-tab-Multi-git-repository\src\client\UnifiedDiff.module.css.mjs
		const css$7 = ".b3fMAa_unifiedBlock{--diff-number-width:4ch;--diff-comment-width:0px;--diff-gutter-width:calc(var(--diff-number-width) + 16px);--diff-base:var(--dsw-alias-bg-base,var(--dsw-alias-bg-layer-1,#fff));--diff-add:var(--dsw-alias-state-success-primary,#1a7f37);--diff-del:var(--dsw-alias-state-error-primary,#cf222e);--diff-link:var(--dsw-alias-state-link-primary,#0969da);color:var(--dsw-alias-label-primary);background:var(--diff-base);border:1px solid var(--dsw-alias-border-l2);border-radius:6px;margin:16px 0;overflow:hidden}.b3fMAa_unifiedEmbedded{border:0;border-radius:0;margin:0}.b3fMAa_commentEnabled{--diff-comment-width:24px}.b3fMAa_unifiedToolbar{background:var(--dsw-alias-bg-layer-1,var(--dsw-alias-bg-layer-2,#f6f8fa));border-bottom:1px solid var(--dsw-alias-border-l2);min-height:28px;font:var(--dsw-font-xs-13);flex-wrap:wrap;align-items:center;gap:8px;padding:0 10px;display:flex}.b3fMAa_unifiedToolbar button{color:var(--dsw-alias-label-secondary);cursor:pointer;font:inherit;background:0 0;border:0;padding:2px 0}.b3fMAa_unifiedToolbar button:hover{color:var(--diff-link)}.b3fMAa_unifiedCopyButton{margin-left:auto}.b3fMAa_unifiedFile+.b3fMAa_unifiedFile{border-top:1px solid var(--dsw-alias-border-l2)}.b3fMAa_unifiedHeader{border-bottom:1px solid var(--dsw-alias-border-l2);min-height:38px;font:var(--dsw-font-markdown-code-block);align-items:center;gap:8px;padding:0 12px;display:flex}.b3fMAa_unifiedStatus{color:var(--diff-add);font-weight:600}.b3fMAa_unifiedPath{text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden}.b3fMAa_unifiedAdded{color:var(--diff-add);margin-left:auto}.b3fMAa_unifiedRemoved{color:var(--diff-del)}.b3fMAa_unifiedBody{font:var(--dsw-font-markdown-code-block);overflow:auto hidden}.b3fMAa_unifiedLine{grid-template-columns:calc(var(--diff-gutter-width) + var(--diff-comment-width)) var(--diff-gutter-width) 20px minmax(max-content, 1fr);white-space:pre;min-width:max-content;min-height:22px;line-height:22px;display:grid}.b3fMAa_unifiedLineNumber{color:var(--dsw-alias-label-secondary);text-align:right;user-select:none;padding:0 8px;position:relative}.b3fMAa_unifiedOldNumber{padding-left:calc(8px + var(--diff-comment-width))}.b3fMAa_unifiedSign{text-align:center;user-select:none}.b3fMAa_unifiedText{padding:0 14px 0 6px}.b3fMAa_wrapLines .b3fMAa_unifiedLine{grid-template-columns:calc(var(--diff-gutter-width) + var(--diff-comment-width)) var(--diff-gutter-width) 20px minmax(0, 1fr);min-width:0}.b3fMAa_wrapLines .b3fMAa_unifiedText{white-space:pre-wrap;overflow-wrap:anywhere;tab-size:4}.b3fMAa_unifiedBody{font-family:var(--diff-font,monospace);font-size:var(--diff-font-size,13px);line-height:var(--diff-row-height,22px)}.b3fMAa_unifiedLine,.b3fMAa_splitLine{min-height:var(--diff-row-height,22px);line-height:var(--diff-row-height,22px)}.b3fMAa_unifiedText,.b3fMAa_wrapLines .b3fMAa_unifiedText{tab-size:var(--diff-tab-size,4)}.b3fMAa_splitLegend{background:var(--dsw-alias-bg-layer-2);border-bottom:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);font:var(--dsw-font-xs-13);grid-template-columns:repeat(2,minmax(0,1fr));display:grid}.b3fMAa_splitLegend span{padding:4px 10px}.b3fMAa_splitLegend span+span{border-left:1px solid var(--dsw-alias-border-l2)}.b3fMAa_splitBody{overflow:visible}.b3fMAa_splitGrid{grid-template-columns:repeat(2,minmax(0,1fr));display:grid}.b3fMAa_splitPane{grid-template-rows:subgrid;scrollbar-width:thin;grid-row:1/-1;min-width:0;display:grid;overflow:auto hidden}.b3fMAa_splitOldPane{grid-column:1}.b3fMAa_splitNewPane{border-left:1px solid var(--dsw-alias-border-l2);grid-column:2}.b3fMAa_splitCell{min-width:0}.b3fMAa_splitMissing{background:var(--dsw-alias-bg-layer-2,#f6f8fa)}.b3fMAa_splitLine{grid-template-columns:calc(var(--diff-gutter-width) + var(--diff-comment-width)) 20px minmax(max-content, 1fr);white-space:pre;min-width:max-content;min-height:22px;line-height:22px;display:grid}.b3fMAa_wrapLines .b3fMAa_splitLine{grid-template-columns:calc(var(--diff-gutter-width) + var(--diff-comment-width)) 20px minmax(0, 1fr);min-width:0}.b3fMAa_unified_del{background:color-mix(in srgb, var(--diff-del) var(--diff-del-strength,10%), var(--diff-base))}.b3fMAa_unified_add{background:color-mix(in srgb, var(--diff-add) var(--diff-add-strength,14%), var(--diff-base))}.b3fMAa_unified_del .b3fMAa_unifiedLineNumber{background:color-mix(in srgb, var(--diff-del) 22%, var(--diff-base))}.b3fMAa_unified_add .b3fMAa_unifiedLineNumber{background:color-mix(in srgb, var(--diff-add) 26%, var(--diff-base))}.b3fMAa_unifiedHunkHeader{grid-template-columns:calc(var(--diff-gutter-width) * 2 + var(--diff-comment-width)) minmax(0, 1fr);min-height:30px;color:var(--dsw-alias-label-secondary);background:color-mix(in srgb, var(--diff-link) 10%, var(--diff-base));display:grid}.b3fMAa_unifiedHunkGutter{min-height:30px}.b3fMAa_unifiedHunkRange{overflow-wrap:anywhere;padding:5px 8px;line-height:20px}.b3fMAa_unifiedHunkRange small{font:var(--dsw-font-xs-13);display:block}.b3fMAa_unifiedGapControls{display:flex}.b3fMAa_unifiedGapButton{background:color-mix(in srgb, var(--diff-link) 22%, var(--diff-base));min-width:0;min-height:30px;color:var(--dsw-alias-label-secondary);cursor:pointer;border:0;flex:1;justify-content:center;align-self:stretch;align-items:center;padding:0;display:flex}.b3fMAa_unifiedGapButton:hover{color:var(--diff-link);background:color-mix(in srgb, var(--diff-link) 30%, var(--diff-base))}.b3fMAa_unifiedGapButton:focus-visible{outline:2px solid var(--diff-link);outline-offset:-2px}.b3fMAa_unifiedGapButton svg{fill:none;stroke:currentColor;stroke-width:1.5px;stroke-linecap:round;stroke-linejoin:round;width:18px;height:18px}.b3fMAa_unifiedUnavailable{color:var(--dsw-alias-label-tertiary);background:var(--dsw-alias-bg-layer-2);font:var(--dsw-font-xs-13);padding:6px 12px}.b3fMAa_unifiedBlock:focus-visible{outline:2px solid var(--diff-link);outline-offset:-2px}.b3fMAa_unifiedToolbar .b3fMAa_toolButton{justify-content:center;align-items:center;gap:4px;min-width:26px;min-height:28px;padding:3px 5px;display:inline-flex}.b3fMAa_toolButton svg{fill:none;stroke:currentColor;stroke-width:1.5px;width:14px;height:14px}.b3fMAa_unifiedToolbar button:disabled,.b3fMAa_searchToolbar button:disabled{opacity:.45;cursor:default}.b3fMAa_changeSelect{border:1px solid var(--dsw-alias-border-l2);min-width:0;max-width:155px;color:var(--dsw-alias-label-primary);background:var(--diff-base);font:inherit;border-radius:4px;padding:3px 4px}.b3fMAa_languageLabel{color:var(--dsw-alias-label-secondary);font-size:11px}.b3fMAa_searchToolbar{border-bottom:1px solid var(--dsw-alias-border-l2);background:var(--diff-base);font:var(--dsw-font-xs-13);flex-wrap:wrap;align-items:center;gap:5px;padding:7px 8px;display:flex}.b3fMAa_searchToolbar input{flex:145px;min-width:100px;max-width:100%}.b3fMAa_searchToolbar input,.b3fMAa_searchToolbar select,.b3fMAa_searchToolbar button{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);min-height:28px;color:var(--dsw-alias-label-primary);background:var(--diff-base);font:inherit;border-radius:4px;padding:3px 5px}.b3fMAa_searchToolbar button{white-space:nowrap;cursor:pointer;min-width:28px}.b3fMAa_searchToolbar button[aria-pressed=true]{border-color:var(--diff-link);background:color-mix(in srgb, var(--diff-link) 15%, var(--diff-base))}.b3fMAa_searchToolbar input:focus-visible,.b3fMAa_searchToolbar button:focus-visible,.b3fMAa_searchToolbar select:focus-visible,.b3fMAa_changeSelect:focus-visible,.b3fMAa_toolButton:focus-visible{outline:2px solid var(--diff-link);outline-offset:1px}.b3fMAa_searchStatus{min-width:45px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}.b3fMAa_searchToolbar small{color:var(--dsw-alias-label-secondary)}.b3fMAa_syntax_keyword{color:var(--diff-link);font-weight:600}.b3fMAa_syntax_string{color:var(--diff-add)}.b3fMAa_syntax_comment{color:var(--dsw-alias-label-secondary,#656d76)}.b3fMAa_syntax_number{color:color-mix(in srgb, var(--diff-link) 60%, var(--diff-del))}.b3fMAa_syntax_property,.b3fMAa_syntax_heading{color:var(--diff-link)}.b3fMAa_syntax_heading{font-weight:600}.b3fMAa_searchMatch{color:#1f2328;background:#ffe58f;border-radius:2px;padding:0}.b3fMAa_searchMatch span{color:inherit}.b3fMAa_searchActive{background:#ffb86c;outline:1px solid #7d4e00}.b3fMAa_unifiedBlock [data-navigation-target]{box-shadow:inset 3px 0 var(--diff-link);animation:.7s ease-out b3fMAa_diffFocus}@keyframes b3fMAa_diffFocus{0%{outline:2px solid var(--diff-link);outline-offset:-2px}to{outline-offset:-2px;outline:2px solid #0000}}@media (prefers-reduced-motion:reduce){.b3fMAa_unifiedBlock [data-navigation-target]{animation:none}}.b3fMAa_splitPair{grid-template-columns:repeat(2,minmax(0,1fr));min-width:0;display:grid}.b3fMAa_splitPair>.b3fMAa_splitCell{overflow:auto hidden}.b3fMAa_splitPair>.b3fMAa_splitCell+.b3fMAa_splitCell{border-left:1px solid var(--dsw-alias-border-l2)}.b3fMAa_splitPair .b3fMAa_splitLine{line-height:var(--diff-row-height,22px);min-height:var(--diff-row-height,22px)}.b3fMAa_lineSelect{color:inherit;font:inherit;cursor:pointer;text-align:right;background:0 0;border:0;min-width:2ch;padding:0}.b3fMAa_lineSelect:hover{color:var(--diff-link);text-decoration:underline}.b3fMAa_lineSelect:focus-visible{outline:2px solid var(--diff-link);outline-offset:0}.b3fMAa_referenceMenuAnchor{width:0;height:0;position:absolute}.b3fMAa_referenceMenu{background:var(--dsw-alias-bg-layer-1,#fff);max-width:calc(100vw - 24px);color:var(--dsw-alias-label-primary,#1f2328);border:1px solid var(--dsw-alias-border-l2,#d0d7de);border-radius:8px;box-shadow:0 4px 18px #0003}.b3fMAa_referenceMenuHeading{font:var(--dsw-font-xs-13,13px sans-serif);padding:8px 12px;font-weight:600;display:block}.b3fMAa_referenceNotice{color:var(--dsw-alias-label-secondary,#656d76);font:var(--dsw-font-xs-13,13px sans-serif);margin:0;padding:6px 10px;line-height:1.6}.b3fMAa_referenceMenu .b3fMAa_referenceNotice{border-top:1px solid var(--dsw-alias-border-l2,#d0d7de)}.b3fMAa_unifiedBlock [data-reference-selected]{outline:1px solid var(--diff-link);outline-offset:-1px;background:color-mix(in srgb, var(--diff-link) 18%, var(--diff-base))}";
		const styleId$7 = "dsh-file-review-tab-multi-git-repository/UnifiedDiff.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(styleId$7) + "]") === null) {
			const style = document.createElement("style");
			style.dataset.plugin = "dsh-file-review-tab-multi-git-repository";
			style.dataset.pluginCss = styleId$7;
			style.textContent = css$7;
			document.head.appendChild(style);
		}
		var UnifiedDiff_module_css_default = {
			"splitCell": "b3fMAa_splitCell",
			"splitMissing": "b3fMAa_splitMissing",
			"unifiedGapButton": "b3fMAa_unifiedGapButton",
			"syntax_number": "b3fMAa_syntax_number",
			"referenceMenu": "b3fMAa_referenceMenu",
			"diffFocus": "b3fMAa_diffFocus",
			"toolButton": "b3fMAa_toolButton",
			"splitPair": "b3fMAa_splitPair",
			"unifiedBlock": "b3fMAa_unifiedBlock",
			"unifiedEmbedded": "b3fMAa_unifiedEmbedded",
			"splitBody": "b3fMAa_splitBody",
			"unifiedLine": "b3fMAa_unifiedLine",
			"unified_add": "b3fMAa_unified_add",
			"unifiedSign": "b3fMAa_unifiedSign",
			"unifiedUnavailable": "b3fMAa_unifiedUnavailable",
			"searchToolbar": "b3fMAa_searchToolbar",
			"wrapLines": "b3fMAa_wrapLines",
			"unifiedHunkHeader": "b3fMAa_unifiedHunkHeader",
			"unifiedHunkRange": "b3fMAa_unifiedHunkRange",
			"unifiedText": "b3fMAa_unifiedText",
			"unifiedCopyButton": "b3fMAa_unifiedCopyButton",
			"searchStatus": "b3fMAa_searchStatus",
			"referenceMenuAnchor": "b3fMAa_referenceMenuAnchor",
			"unified_del": "b3fMAa_unified_del",
			"unifiedLineNumber": "b3fMAa_unifiedLineNumber",
			"unifiedOldNumber": "b3fMAa_unifiedOldNumber",
			"referenceMenuHeading": "b3fMAa_referenceMenuHeading",
			"unifiedStatus": "b3fMAa_unifiedStatus",
			"splitGrid": "b3fMAa_splitGrid",
			"languageLabel": "b3fMAa_languageLabel",
			"syntax_keyword": "b3fMAa_syntax_keyword",
			"searchActive": "b3fMAa_searchActive",
			"commentEnabled": "b3fMAa_commentEnabled",
			"unifiedBody": "b3fMAa_unifiedBody",
			"splitLine": "b3fMAa_splitLine",
			"splitPane": "b3fMAa_splitPane",
			"unifiedToolbar": "b3fMAa_unifiedToolbar",
			"referenceNotice": "b3fMAa_referenceNotice",
			"changeSelect": "b3fMAa_changeSelect",
			"unifiedPath": "b3fMAa_unifiedPath",
			"unifiedGapControls": "b3fMAa_unifiedGapControls",
			"syntax_string": "b3fMAa_syntax_string",
			"syntax_heading": "b3fMAa_syntax_heading",
			"splitLegend": "b3fMAa_splitLegend",
			"unifiedFile": "b3fMAa_unifiedFile",
			"unifiedAdded": "b3fMAa_unifiedAdded",
			"unifiedHunkGutter": "b3fMAa_unifiedHunkGutter",
			"unifiedRemoved": "b3fMAa_unifiedRemoved",
			"searchMatch": "b3fMAa_searchMatch",
			"unifiedHeader": "b3fMAa_unifiedHeader",
			"syntax_comment": "b3fMAa_syntax_comment",
			"lineSelect": "b3fMAa_lineSelect",
			"syntax_property": "b3fMAa_syntax_property",
			"splitOldPane": "b3fMAa_splitOldPane",
			"splitNewPane": "b3fMAa_splitNewPane"
		};
		//#endregion
		//#region src/client/repository-paths.ts
		/** Browser-side path labels; the Host independently enforces canonical roots. */
		function normalizeReviewPath(path) {
			const slash = path.replace(/\\/g, "/");
			const prefix = slash.startsWith("//") ? "//" : slash.startsWith("/") ? "/" : "";
			const segments = [];
			for (const segment of slash.slice(prefix.length).split("/")) {
				if (!segment || segment === ".") continue;
				const parent = segments.at(-1);
				if (segment === ".." && parent !== void 0 && parent !== ".." && !parent.endsWith(":")) segments.pop();
				else segments.push(segment);
			}
			return prefix + segments.join("/");
		}
		function repositoryPathKey(path) {
			const normalized = normalizeReviewPath(path);
			return /^[A-Za-z]:/.test(normalized) || normalized.startsWith("//") ? normalized.toLowerCase() : normalized;
		}
		function absoluteReviewPath(path) {
			const normalized = normalizeReviewPath(path);
			return /^[A-Za-z]:(?:\/|$)/.test(normalized) || normalized.startsWith("//") || normalized.startsWith("/");
		}
		/** Windows drives and UNC shares compare without case; POSIX paths retain case. */
		function parseAbsolutePath(value) {
			const path = normalizeReviewPath(value);
			const drive = /^([A-Za-z]:)(?:\/|$)/.exec(path);
			if (drive !== null) return {
				volume: drive[1].toLowerCase(),
				segments: path.slice(drive[1].length).split("/").filter(Boolean),
				caseInsensitive: true
			};
			const share = /^(\/\/[^/]+\/[^/]+)(?:\/|$)/.exec(path);
			if (share !== null) return {
				volume: share[1].toLowerCase(),
				segments: path.slice(share[1].length).split("/").filter(Boolean),
				caseInsensitive: true
			};
			if (path.startsWith("/")) return {
				volume: "/",
				segments: path.slice(1).split("/").filter(Boolean),
				caseInsensitive: false
			};
			return null;
		}
		/** Return a portable path only for the project itself or its descendants. */
		function relativeProjectDirectory(root, selected) {
			const project = parseAbsolutePath(root);
			const target = parseAbsolutePath(selected);
			if (project === null || target === null || project.volume !== target.volume) return null;
			if (target.segments.length < project.segments.length) return null;
			for (let index = 0; index < project.segments.length; index += 1) {
				const parent = project.segments[index];
				const child = target.segments[index];
				if (!(project.caseInsensitive ? parent.toLowerCase() === child.toLowerCase() : parent === child)) return null;
			}
			return target.segments.slice(project.segments.length).join("/") || ".";
		}
		/** Normalize manual ../ entries to absolute temporary paths outside the project. */
		function repositoryProjectPath(root, input) {
			const path = input.trim();
			if (path === "") return "";
			const target = absoluteReviewPath(path) ? normalizeReviewPath(path) : normalizeReviewPath(`${root}/${path}`);
			return relativeProjectDirectory(root, target) ?? target;
		}
		function fileRepository(path, repositories) {
			const candidate = repositoryPathKey(path);
			return [...repositories].sort((left, right) => right.path.length - left.path.length).find((repo) => {
				if (repo.state !== "ready" && repo.source !== "project") return false;
				const root = repositoryPathKey(repo.path);
				return candidate === root || candidate.startsWith(`${root}/`);
			});
		}
		function repositoryRelativePath(path, repo) {
			return normalizeReviewPath(path).slice(normalizeReviewPath(repo.path).length).replace(/^\//, "") || repo.name;
		}
		//#endregion
		//#region src/client/review-comments.ts
		const COMMENT_TEXT_LIMIT = 6e3;
		function pathKey(path) {
			const normalized = normalizeReviewPath(path);
			return /^[A-Za-z]:/.test(normalized) || normalized.startsWith("//") ? normalized.toLowerCase() : normalized;
		}
		/** Session review scopes address the same recorded turn, regardless of the filter. */
		function commentFileKey(target) {
			const source = isSessionReviewMode(target.scope) ? `turn:${target.turn}` : target.scope;
			return JSON.stringify([
				pathKey(target.repository),
				pathKey(target.absolutePath),
				source,
				target.ref ?? ""
			]);
		}
		function commentAnchorKey(anchor) {
			return JSON.stringify([
				commentFileKey(anchor),
				anchor.side,
				anchor.line,
				anchor.endLine ?? anchor.line,
				anchor.revision,
				anchor.quote,
				anchor.sourceKey ?? ""
			]);
		}
		/** A deterministic snapshot tag: comments never silently move to another diff revision. */
		function reviewDiffRevision(diffs) {
			let hash = 2166136261;
			const add = (value) => {
				for (let index = 0; index < value.length; index++) hash = Math.imul(hash ^ value.charCodeAt(index), 16777619);
				hash = Math.imul(hash ^ 255, 16777619);
			};
			for (const diff of diffs) {
				add(diff.path);
				add(String(diff.oldStart));
				add(String(diff.newStart));
				add(diff.oldText === null ? "\0" : diff.oldText);
				add(diff.newText);
			}
			return (hash >>> 0).toString(16);
		}
		function fileCommentAnchor(target) {
			return {
				...target,
				side: "file",
				line: null,
				quote: "",
				before: "",
				after: "",
				revision: ""
			};
		}
		const referenceIndexes = /* @__PURE__ */ new WeakMap();
		/** Full-file context must not be scanned again for every visible comment line. */
		function referenceIndex(lines) {
			let index = referenceIndexes.get(lines);
			if (!index) {
				index = {
					old: [],
					next: [],
					oldIndex: /* @__PURE__ */ new WeakMap(),
					newIndex: /* @__PURE__ */ new WeakMap()
				};
				for (const row of lines) {
					if (row.oldNumber !== null) {
						index.oldIndex.set(row, index.old.length);
						index.old.push(row);
					}
					if (row.newNumber !== null) {
						index.newIndex.set(row, index.next.length);
						index.next.push(row);
					}
				}
				referenceIndexes.set(lines, index);
			}
			return index;
		}
		function lineCommentAnchor(target, row, lines, revision, contextSide = "new") {
			const side = row.kind === "del" ? "old" : row.kind === "add" ? "new" : contextSide;
			const reference = referenceIndex(lines);
			const sameSide = side === "old" ? reference.old : reference.next;
			const index = (side === "old" ? reference.oldIndex : reference.newIndex).get(row) ?? -1;
			const excerpt = (items) => items.map((line) => line.text.slice(0, 1e3)).join("\n");
			return {
				...target,
				side,
				line: side === "old" ? row.oldNumber : row.newNumber,
				quote: row.text.slice(0, 2e3),
				before: index < 0 ? "" : excerpt(sameSide.slice(Math.max(0, index - 2), index)),
				after: index < 0 ? "" : excerpt(sameSide.slice(index + 1, index + 3)),
				revision
			};
		}
		function parseReviewComments(raw) {
			const data = JSON.parse(raw);
			if (!data || typeof data !== "object" || !("version" in data) || data.version !== 1 || !("comments" in data) || !Array.isArray(data.comments)) throw new Error("Invalid review comment data");
			const ids = /* @__PURE__ */ new Set();
			return data.comments.map((item) => {
				if (!item || typeof item !== "object") throw new Error("Invalid review comment");
				const value = item;
				const anchor = value.anchor;
				if (typeof value.id !== "string" || ids.has(value.id) || typeof value.text !== "string" || !value.text.trim() || value.text.length > 6e3 || !anchor) throw new Error("Invalid review comment");
				ids.add(value.id);
				if (!isReviewMode(anchor.scope) || ![
					"old",
					"new",
					"file"
				].includes(String(anchor.side))) throw new Error("Invalid review anchor");
				for (const field of [
					"repository",
					"repositoryName",
					"path",
					"absolutePath",
					"quote",
					"before",
					"after",
					"revision"
				]) if (typeof anchor[field] !== "string") throw new Error("Invalid review anchor");
				if (anchor.side === "file" ? anchor.line !== null : typeof anchor.line !== "number" || !Number.isInteger(anchor.line) || anchor.line < 1) throw new Error("Invalid review line");
				if (anchor.endLine !== void 0 && (anchor.side === "file" || typeof anchor.endLine !== "number" || !Number.isSafeInteger(anchor.endLine) || anchor.endLine < Number(anchor.line))) throw new Error("Invalid review range");
				for (const field of ["ref", "sourceKey"]) if (anchor[field] !== void 0 && typeof anchor[field] !== "string") throw new Error("Invalid review source");
				if (isSessionReviewMode(anchor.scope)) {
					if (typeof anchor.turn !== "number" || !Number.isInteger(anchor.turn) || anchor.turn < 1) throw new Error("Invalid review turn");
				}
				if (value.discussionId !== void 0 && typeof value.discussionId !== "string") throw new Error("Invalid discussion link");
				return {
					id: value.id,
					text: value.text,
					anchor,
					...typeof value.discussionId === "string" ? { discussionId: value.discussionId } : {}
				};
			});
		}
		function codeBlock(text) {
			const longest = Math.max(2, ...[...text.matchAll(/`+/g)].map((match) => match[0].length));
			const fence = "`".repeat(longest + 1);
			return `${fence}text\n${text}\n${fence}`;
		}
		function formatReviewComments(comments, labels) {
			return [labels.introduction, ...comments.map((comment, index) => {
				const anchor = comment.anchor;
				return [
					`${index + 1}. [${anchor.repositoryName}] ${anchor.path}`,
					`${labels.repository}: ${anchor.repository}`,
					`${labels.file}: ${anchor.absolutePath}`,
					`${labels.source}: ${labels.scope(anchor.scope)}${anchor.turn === void 0 ? "" : ` · ${labels.turn(anchor.turn)}`}${anchor.ref ? ` · ${anchor.ref}` : ""} · ${labels.position(anchor)}${anchor.revision ? ` · ${anchor.revision}` : ""}`,
					...anchor.side === "file" ? [] : [`${labels.reference}:`, codeBlock([
						anchor.before,
						anchor.quote.split("\n").map((line) => `> ${line}`).join("\n"),
						anchor.after
					].filter(Boolean).join("\n"))],
					`${labels.opinion}:\n${comment.text}`
				].join("\n");
			})].join("\n\n");
		}
		/** Per-session draft store. Submission clears only the batch accepted by the host. */
		var ReviewCommentStore = class {
			snapshot = {
				comments: [],
				busy: false,
				storageError: false
			};
			listeners = /* @__PURE__ */ new Set();
			storage;
			key;
			constructor(storage, key = "") {
				this.storage = storage;
				this.key = key;
				try {
					const raw = storage?.getItem(key);
					if (raw) this.snapshot = {
						...this.snapshot,
						comments: parseReviewComments(raw)
					};
				} catch {
					this.snapshot = {
						...this.snapshot,
						storageError: true
					};
				}
			}
			getSnapshot = () => this.snapshot;
			subscribe = (listener) => {
				this.listeners.add(listener);
				return () => {
					this.listeners.delete(listener);
				};
			};
			publish(comments = this.snapshot.comments, busy = this.snapshot.busy, persist = false) {
				let storageError = this.snapshot.storageError;
				if (persist) try {
					if (!this.storage) storageError = true;
					else {
						this.storage.setItem(this.key, JSON.stringify({
							version: 1,
							comments
						}));
						storageError = false;
					}
				} catch {
					storageError = true;
				}
				this.snapshot = {
					comments,
					busy,
					storageError
				};
				for (const listener of this.listeners) listener();
			}
			save(anchor, text, id, discussionId) {
				if (this.snapshot.busy || !text.trim() || text.length > 6e3) return;
				const existing = id ? this.snapshot.comments.find((item) => item.id === id) : void 0;
				const comment = {
					id: existing?.id ?? globalThis.crypto.randomUUID(),
					anchor,
					text: text.trim(),
					...discussionId ?? existing?.discussionId ? { discussionId: discussionId ?? existing?.discussionId } : {}
				};
				this.publish(existing ? this.snapshot.comments.map((item) => item.id === existing.id ? comment : item) : [...this.snapshot.comments, comment], false, true);
			}
			remove(id) {
				if (!this.snapshot.busy) this.publish(this.snapshot.comments.filter((item) => item.id !== id), false, true);
			}
			/** Explicitly accepted draft relocation; submitted/history records keep the original anchor. */
			relocate(id, anchor) {
				if (!this.snapshot.busy) this.publish(this.snapshot.comments.map((item) => item.id === id ? {
					...item,
					anchor
				} : item), false, true);
			}
			acknowledge(batch) {
				const accepted = new Map(batch.map((item) => [item.id, item]));
				const remaining = this.snapshot.comments.filter((item) => {
					const sent = accepted.get(item.id);
					return !sent || sent.text !== item.text || commentAnchorKey(sent.anchor) !== commentAnchorKey(item.anchor);
				});
				if (remaining.length !== this.snapshot.comments.length) this.publish(remaining, this.snapshot.busy, true);
			}
			async submit(send) {
				if (this.snapshot.busy || this.snapshot.comments.length === 0) return false;
				const batch = this.snapshot.comments;
				this.publish(batch, true);
				try {
					await send(batch);
					const ids = new Set(batch.map((item) => item.id));
					this.publish(this.snapshot.comments.filter((item) => !ids.has(item.id)), false, true);
					return true;
				} catch (cause) {
					this.publish(this.snapshot.comments, false);
					throw cause;
				}
			}
		};
		//#endregion
		//#region src/client/review-discussion-events.ts
		function asRecord$1(value) {
			return value && typeof value === "object" ? value : {};
		}
		function userRequestId(message) {
			const source = asRecord$1(asRecord$1(message).source);
			return source.kind === "user" && typeof source.rpcId === "string" ? source.rpcId : "";
		}
		function assistantText(content) {
			if (!Array.isArray(content)) return "";
			return content.filter((part) => asRecord$1(part).type === "text" && typeof asRecord$1(part).text === "string").map((part) => asRecord$1(part).text).join("\n");
		}
		function orderedEvents(entries) {
			return entries.map((entry) => asRecord$1(asRecord$1(entry).event ?? entry)).filter((event) => typeof event.type === "string" && typeof event.seq === "number").map((event) => ({
				type: String(event.type),
				seq: Number(event.seq),
				data: asRecord$1(event.data)
			})).sort((left, right) => left.seq - right.seq);
		}
		/** Build request/turn indexes once; inbox edits must be replayed in sequence order. */
		function indexDiscussionEvents(entries) {
			const admitted = /* @__PURE__ */ new Map();
			const replies = /* @__PURE__ */ new Map();
			const endings = /* @__PURE__ */ new Map();
			const cancelled = /* @__PURE__ */ new Set();
			const pending = {
				"next-turn": [],
				"next-step": []
			};
			let turn;
			for (const event of orderedEvents(entries)) {
				const { data } = event;
				switch (event.type) {
					case "turn/start":
						if (typeof data.turn === "number") turn = data.turn;
						break;
					case "user/message": {
						const requestId = userRequestId(data);
						if (requestId) admitted.set(requestId, {
							seq: event.seq,
							turn
						});
						break;
					}
					case "turn/end":
						if (typeof data.turn === "number") {
							const reason = typeof data.reason === "string" ? data.reason : String(asRecord$1(data.reason).kind);
							endings.set(data.turn, reason);
							if (turn === data.turn) turn = void 0;
						}
						break;
					case "assistant/message": {
						if (typeof data.turn !== "number") break;
						const message = asRecord$1(data.message);
						const text = assistantText(message.content);
						if (!text) break;
						const turnReplies = replies.get(data.turn) ?? [];
						turnReplies.push({
							id: typeof message.id === "string" ? message.id : `seq:${event.seq}`,
							seq: event.seq,
							text,
							interrupted: data.interrupted === true
						});
						replies.set(data.turn, turnReplies);
						break;
					}
					case "agent/inbox/spliced": {
						const inbox = pending[String(data.target)];
						if (!inbox || typeof data.start !== "number" || !Array.isArray(data.inserted)) break;
						const removed = inbox.splice(data.start, Number(data.removedCount ?? 0), ...data.inserted);
						if (data.outcome === "canceled") for (const message of removed) {
							const requestId = userRequestId(message);
							if (requestId) cancelled.add(requestId);
						}
						break;
					}
				}
			}
			return {
				admitted,
				replies,
				endings,
				cancelled,
				queued: new Set(Object.values(pending).flat().map(userRequestId).filter(Boolean))
			};
		}
		/** A recorded answer takes precedence over the turn's eventual ending reason. */
		function discussionState(discussion, events, userSeq, turn, replies) {
			if (events.cancelled.has(discussion.requestId) && userSeq === void 0) return "cancelled";
			if (replies.length > 0) return "answered";
			const ending = turn === void 0 ? void 0 : events.endings.get(turn);
			if (ending !== void 0) {
				if (/abort|cancel|stop|interrupt/i.test(ending)) return "cancelled";
				if (/error|fail/i.test(ending)) return "failed";
				return "completed";
			}
			if (userSeq !== void 0) return "running";
			if (events.queued.has(discussion.requestId)) return "queued";
			return discussion.state;
		}
		/** Reconcile durable request -> user event -> turn -> assistant messages, never the latest unrelated reply. */
		function reconcileDiscussions(records, entries) {
			const events = indexDiscussionEvents(entries);
			return records.map((discussion) => {
				if (!discussion.requestId) return discussion;
				const admission = events.admitted.get(discussion.requestId);
				const turn = admission?.turn ?? discussion.turn;
				const userSeq = admission?.seq ?? discussion.userSeq;
				const incoming = turn === void 0 || userSeq === void 0 ? [] : (events.replies.get(turn) ?? []).filter((reply) => reply.seq > userSeq);
				const repliesById = new Map(discussion.replies.map((reply) => [reply.id, reply]));
				for (const reply of incoming) repliesById.set(reply.id, reply);
				const replies = [...repliesById.values()].sort((left, right) => left.seq - right.seq);
				const state = discussionState(discussion, events, userSeq, turn, replies);
				return {
					...discussion,
					state,
					userSeq,
					turn,
					replies
				};
			});
		}
		//#endregion
		//#region src/client/review-discussions.ts
		const DISCUSSION_STATES = [
			"submitting",
			"queued",
			"running",
			"answered",
			"completed",
			"cancelled",
			"failed",
			"unknown",
			"unlinked"
		];
		const ADMITTED_STATES = [
			"queued",
			"running",
			"answered",
			"completed",
			"cancelled"
		];
		function isAdmittedDiscussionState(state) {
			return ADMITTED_STATES.includes(state);
		}
		function asRecord(value) {
			return value && typeof value === "object" ? value : {};
		}
		function validateReply(reply) {
			const value = asRecord(reply);
			if (typeof value.id !== "string" || typeof value.seq !== "number" || typeof value.text !== "string" || typeof value.interrupted !== "boolean") throw new Error("Invalid discussion reply");
		}
		function parseReviewDiscussions(raw) {
			const data = asRecord(JSON.parse(raw));
			if (data.version !== 1 || !Array.isArray(data.records)) throw new Error("Invalid discussions");
			const ids = /* @__PURE__ */ new Set();
			return data.records.map((item) => {
				const entry = asRecord(item);
				if (typeof entry.id !== "string" || ids.has(entry.id) || typeof entry.requestId !== "string" || typeof entry.createdAt !== "number" || !DISCUSSION_STATES.includes(String(entry.state)) || !Array.isArray(entry.replies) || !Array.isArray(entry.resolved) || !entry.resolved.every((id) => typeof id === "string") || typeof entry.readSeq !== "number") throw new Error("Invalid discussion");
				ids.add(entry.id);
				const comments = parseReviewComments(JSON.stringify({
					version: 1,
					comments: entry.comments
				}));
				if (comments.length === 0) throw new Error("Empty discussion");
				for (const reply of entry.replies) validateReply(reply);
				for (const key of ["userSeq", "turn"]) {
					const value = entry[key];
					if (value !== void 0 && (typeof value !== "number" || !Number.isSafeInteger(value) || value < 1)) throw new Error("Invalid discussion identity");
				}
				if (entry.parentId !== void 0 && typeof entry.parentId !== "string") throw new Error("Invalid parent discussion");
				return {
					...entry,
					comments,
					state: entry.state === "submitting" ? "unknown" : entry.state
				};
			});
		}
		var ReviewDiscussionStore = class {
			snapshot = {
				records: [],
				storageError: false
			};
			listeners = /* @__PURE__ */ new Set();
			storage;
			key;
			constructor(storage, key = "") {
				this.storage = storage;
				this.key = key;
				try {
					const raw = storage?.getItem(key);
					if (raw) this.snapshot = {
						records: parseReviewDiscussions(raw),
						storageError: false
					};
				} catch {
					this.snapshot = {
						records: [],
						storageError: true
					};
				}
			}
			getSnapshot = () => this.snapshot;
			subscribe = (listener) => {
				this.listeners.add(listener);
				return () => {
					this.listeners.delete(listener);
				};
			};
			publish(records) {
				let storageError = this.snapshot.storageError;
				try {
					if (!this.storage) throw new Error("Storage unavailable");
					this.storage.setItem(this.key, JSON.stringify({
						version: 1,
						records
					}));
					storageError = false;
				} catch {
					storageError = true;
				}
				this.snapshot = {
					records,
					storageError
				};
				for (const listener of this.listeners) listener();
			}
			begin(comments, requestId, parentId) {
				const id = globalThis.crypto.randomUUID();
				this.publish([...this.snapshot.records, {
					id,
					requestId,
					parentId,
					comments,
					createdAt: Date.now(),
					state: "submitting",
					replies: [],
					readSeq: 0,
					resolved: []
				}]);
				return id;
			}
			settle(id, state) {
				this.publish(this.snapshot.records.map((discussion) => {
					return discussion.id === id && (discussion.state === "submitting" || discussion.state === "unknown") ? {
						...discussion,
						state
					} : discussion;
				}));
			}
			read(id) {
				this.publish(this.snapshot.records.map((discussion) => discussion.id === id ? {
					...discussion,
					readSeq: discussion.replies.at(-1)?.seq ?? 0
				} : discussion));
			}
			resolve(id, commentId, resolved) {
				this.publish(this.snapshot.records.map((discussion) => {
					if (discussion.id !== id) return discussion;
					const resolvedIds = resolved ? [.../* @__PURE__ */ new Set([...discussion.resolved, commentId])] : discussion.resolved.filter((value) => value !== commentId);
					return {
						...discussion,
						resolved: resolvedIds
					};
				}));
			}
			reconcile(entries) {
				const records = reconcileDiscussions(this.snapshot.records, entries);
				if (JSON.stringify(records) !== JSON.stringify(this.snapshot.records)) this.publish(records);
			}
		};
		//#endregion
		//#region src/client/review-comment-context.ts
		const ReviewCommentsContext = (0, react.createContext)(null);
		const commentStores = /* @__PURE__ */ new Map();
		const discussionStores = /* @__PURE__ */ new Map();
		/** Missing browser storage still allows drafts and discussions to work in memory. */
		function browserStorage() {
			try {
				return window.localStorage;
			} catch {
				return;
			}
		}
		function commentStoreFor(sessionId) {
			let store = commentStores.get(sessionId);
			if (store === void 0) {
				store = new ReviewCommentStore(browserStorage(), `dsh-file-review-tab-multi-git-repository:comments:${sessionId}`);
				commentStores.set(sessionId, store);
			}
			return store;
		}
		function discussionStoreFor(sessionId) {
			let store = discussionStores.get(sessionId);
			if (store === void 0) {
				store = new ReviewDiscussionStore(browserStorage(), `dsh-file-review-tab-multi-git-repository:discussions:${sessionId}`);
				discussionStores.set(sessionId, store);
			}
			return store;
		}
		//#endregion
		//#region src/client/reading-locales.ts
		const readingZh = {
			appearance: "外观",
			diffFontSize: "代码字号（px）",
			diffFontFamily: "代码字体",
			diffSystemMono: "系统等宽字体",
			diffFontHint: "使用本机已安装字体，未安装时使用系统等宽字体。",
			diffLineHeight: "行高倍数",
			diffTabSize: "Tab 宽度",
			diffColors: "差异配色",
			diffThemeColors: "跟随主题（红 / 绿）",
			diffAccessibleColors: "蓝 / 橙",
			diffColorStrength: "背景颜色强度（%）",
			externalEditor: "外部 IDE",
			editorPath: "外部 IDE 程序路径",
			editorAutoDetect: "留空自动检测推荐的 VS Code",
			editorPathHint: "推荐 VS Code，也可使用 Antigravity。Windows 填写 Code.exe 或 Antigravity IDE.exe 的完整路径；不需要填写启动参数。",
			diffShortcuts: "文件内快捷键",
			diffScopedShortcuts: "仅在当前差异区域生效；评论和其他输入框保留自身的编辑快捷键。",
			diffVirtualize: "大文件使用虚拟化（超过 400 行）",
			diffReset: "恢复默认值",
			diffPreferencesStorageError: "设置已在当前窗口生效，但本地存储不可用；重启后可能丢失。",
			referenceSelect: "选择引用行",
			referenceHint: "点击行号选择，Shift+点击同一侧行号选择连续范围；也可拖选代码。选中后右键打开操作菜单，也可按 Shift+F10。",
			referenceRange: "{side} {start}–{end} 行",
			referenceCopy: "复制行引用",
			referenceCopyPath: "复制路径与范围",
			referenceComment: "评论选中范围",
			referenceClear: "清除选区",
			referenceInvalid: "请选择同一文件、同一版本侧、同一差异片段中的连续行；选区不能跨越未记录的行或超过 64 KiB。",
			referenceCopied: "引用已复制",
			referenceCopyFailed: "复制失败，请检查剪贴板权限。",
			editorOpenLine: "在外部 IDE 中打开此行",
			editorOpenSelection: "在外部 IDE 中打开选区",
			editorOpenFile: "在内置查看器中打开文件",
			editorOpening: "正在核对并打开…",
			editorStarted: "已发送给外部 IDE",
			editorMoved: "引用在当前文件中位于第 {line} 行，请确认后定位。",
			editorConfirmMoved: "定位到第 {line} 行",
			editorMissing: "文件已不存在，请查看当前历史差异。",
			editorUnavailable: "未找到有效的外部 IDE，请在设置中填写程序路径。",
			editorChanged: "当前文件已变化，找不到一致的引用；请刷新或打开文件查看。",
			editorAmbiguous: "引用存在重复匹配，无法可靠定位，请打开文件查看。",
			editorOld: "旧版代码不能直接当作当前文件行号，请查看历史差异或打开文件。",
			editorUnsupported: "路径、文件类型或引用内容不支持定位。",
			editorFailed: "打开失败；请检查外部 IDE 程序路径或服务连接。",
			discussionEnabled: "保存已提交意见与讨论记录",
			discussionList: "讨论记录（{count}）",
			discussionEmpty: "暂无已提交的讨论记录。",
			discussionHint: "答复按提交请求及其所属轮次关联；一批意见共享该批次答复，不推断每条意见的处理结果。",
			discussionStorageError: "讨论记录的本地存储不可用或已损坏；当前记录保留在内存中，关闭应用可能丢失。",
			discussionSubmitting: "正在提交",
			discussionQueued: "已提交，等待入轮",
			discussionRunning: "处理中",
			discussionAnswered: "已有答复",
			discussionCompleted: "本轮结束，未记录文字答复",
			discussionCancelled: "已取消",
			discussionFailed: "提交失败",
			discussionUnknown: "提交结果待核对，请先查看会话，避免重复发送",
			discussionResolved: "已解决",
			discussionUnresolved: "未解决",
			discussionResolve: "标记已解决",
			discussionReopen: "重新打开",
			discussionUnread: "新回复",
			discussionRead: "标记已读",
			discussionReply: "追加意见",
			discussionRetry: "重新发送",
			discussionResponse: "本批次 Agent 答复",
			discussionInterrupted: "本轮已停止，保留已收到的答复。",
			discussionReadOriginal: "加载关联会话记录",
			discussionNoCorrelation: "宿主缺少请求身份接口；已发送意见，答复仅在会话中查看。",
			referenceRelocate: "核对当前位置",
			referenceRelocateApply: "将草稿引用更新到第 {line} 行",
			referenceExact: "引用仍位于原位置",
			referenceHistorical: "历史来源保留原始位置，不自动移动。"
		};
		const readingEn = {
			appearance: "Appearance",
			diffFontSize: "Code font size (px)",
			diffFontFamily: "Code font",
			diffSystemMono: "System monospace",
			diffFontHint: "Uses installed fonts; unavailable fonts fall back to system monospace.",
			diffLineHeight: "Line height multiplier",
			diffTabSize: "Tab width",
			diffColors: "Diff colors",
			diffThemeColors: "Follow theme (red / green)",
			diffAccessibleColors: "Blue / orange",
			diffColorStrength: "Background intensity (%)",
			externalEditor: "External IDE",
			editorPath: "External IDE executable path",
			editorAutoDetect: "Leave empty to detect the recommended VS Code",
			editorPathHint: "VS Code is recommended; Antigravity is also supported. On Windows, enter the full path to Code.exe or Antigravity IDE.exe without launch arguments.",
			diffShortcuts: "File shortcuts",
			diffScopedShortcuts: "Applies within the current diff only. Comments and other inputs keep their own editing shortcuts.",
			diffVirtualize: "Virtualize large files (over 400 rows)",
			diffReset: "Reset defaults",
			diffPreferencesStorageError: "Settings apply in this window, but local storage is unavailable. They may be lost on restart.",
			referenceSelect: "Select reference lines",
			referenceHint: "Click a line number; Shift+click on the same side selects a contiguous range, or drag-select code. Right-click the selection or press Shift+F10 for actions.",
			referenceRange: "{side} lines {start}–{end}",
			referenceCopy: "Copy line reference",
			referenceCopyPath: "Copy path and range",
			referenceComment: "Comment on selection",
			referenceClear: "Clear selection",
			referenceInvalid: "Select contiguous lines in one file, version side and recorded hunk. References cannot cross missing lines or exceed 64 KiB.",
			referenceCopied: "Reference copied",
			referenceCopyFailed: "Copy failed. Check clipboard permissions.",
			editorOpenLine: "Open this line in external IDE",
			editorOpenSelection: "Open selection in external IDE",
			editorOpenFile: "Open file in built-in viewer",
			editorOpening: "Checking and opening…",
			editorStarted: "Sent to external IDE",
			editorMoved: "The reference is now at line {line}. Confirm before navigating.",
			editorConfirmMoved: "Go to line {line}",
			editorMissing: "The file no longer exists. View the historical diff here.",
			editorUnavailable: "No valid external IDE found. Set its path in Settings.",
			editorChanged: "The file has changed and the reference no longer matches. Refresh or open the file.",
			editorAmbiguous: "The reference has multiple matches and cannot be located reliably. Open the file to inspect it.",
			editorOld: "Old-version line numbers do not identify the current file. View the historical diff or open the file.",
			editorUnsupported: "This path, file type or reference cannot be located.",
			editorFailed: "Open failed. Check the external IDE path or service connection.",
			discussionEnabled: "Keep submitted feedback and discussion history",
			discussionList: "Discussions ({count})",
			discussionEmpty: "No submitted discussions yet.",
			discussionHint: "Replies are linked to the submitted request and its turn. Comments in one batch share its reply; individual outcomes are not inferred.",
			discussionStorageError: "Discussion storage is unavailable or damaged. Current records remain in memory and may be lost when the app closes.",
			discussionSubmitting: "Submitting",
			discussionQueued: "Submitted, waiting for a turn",
			discussionRunning: "In progress",
			discussionAnswered: "Reply received",
			discussionCompleted: "Turn ended without a text reply",
			discussionCancelled: "Cancelled",
			discussionFailed: "Submission failed",
			discussionUnknown: "Submission outcome needs checking. Inspect the conversation before resending.",
			discussionResolved: "Resolved",
			discussionUnresolved: "Unresolved",
			discussionResolve: "Mark resolved",
			discussionReopen: "Reopen",
			discussionUnread: "New reply",
			discussionRead: "Mark read",
			discussionReply: "Add follow-up",
			discussionRetry: "Resend",
			discussionResponse: "Agent reply to this batch",
			discussionInterrupted: "The turn stopped. Received replies are retained.",
			discussionReadOriginal: "Load linked conversation records",
			discussionNoCorrelation: "The host has no request identity interface. Feedback was sent; read replies in the conversation.",
			referenceRelocate: "Check current location",
			referenceRelocateApply: "Update draft reference to line {line}",
			referenceExact: "Reference still matches its original position",
			referenceHistorical: "Historical references retain their original position."
		};
		//#endregion
		//#region src/client/locales.ts
		/**
		* Minimal zh/en copy for the file-review sidebar tab. Follows the DSH i18n
		* system: the client apply attaches the locale service (`ctx.locale`,
		* provided by `@deepseek-ai/dsh-client-locale`) through {@link attachLocale},
		* and `t()` resolves the active locale from it. Without an attached service
		* (standalone/test compositions) the browser language is used. Mirrors the
		* the host locale subscription pattern.
		*/
		/** The dictionary namespace this plugin owns in the DSH locale registry. */
		const LOCALE_NS = "fileReviewTab";
		/** The zh dictionary (the key-set source of truth). */
		const zh$1 = {
			...readingZh,
			tabTitle: "文件审查",
			userGuide: "操作指南",
			userGuideOpening: "正在打开…",
			userGuideHint: "打开支持图片预览的使用手册",
			userGuideFailed: "无法打开操作指南。",
			userGuideServiceUnavailable: "使用手册服务不可用；安装或更新插件后，请完整退出并重启 Desktop，再重试。",
			userGuideClose: "关闭操作指南",
			userGuideCloseLegacy: "关闭此旧标签",
			userGuideLegacyHint: "操作指南已改为插件弹窗；此标签仅兼容之前保存的布局。",
			sidebarGuideDescription: "按轮次及 Git 范围审查多仓库文件改动",
			sidebarUnavailable: "原生文件查看器尚未就绪，请重新打开文件审查。",
			sidebarSessionNotVisible: "请先切换到目标会话，再打开文件审查。",
			sidebarWorkspaceUnavailable: "当前会话的工作目录不可用。",
			sidebarOpenFailed: "无法在内置查看器中打开文件。",
			sidebarTargetMissing: "该审查目标已不存在，或不在当前已加载的会话记录中。",
			userGuideImageOpen: "查看图片",
			userGuideImageDialog: "截图预览",
			userGuideImageClose: "关闭图片",
			userGuideImageLoading: "正在加载图片…",
			userGuideImageFailed: "图片加载失败",
			userGuideCodeCopy: "复制代码",
			userGuideFootnotes: "脚注",
			commentAddLine: "添加行评论",
			commentAddFile: "评论",
			commentWholeFile: "整个文件",
			commentOldLine: "旧版第 {line} 行",
			commentNewLine: "新版第 {line} 行",
			commentYou: "你",
			commentPlaceholder: "添加一条修改意见…",
			commentAdd: "评论",
			commentSave: "保存评论",
			commentEdit: "编辑",
			commentDraft: "待提交",
			commentPending: "修改意见（{count}）",
			commentSubmit: "提交修改意见",
			commentSending: "正在提交…",
			commentList: "待提交的修改意见",
			commentEmpty: "悬停代码行并点击「＋」，或点击文件旁的「评论」添加修改意见。",
			commentDraftHint: "评论保存在当前会话；点击「提交修改意见」将这些意见汇总发送给当前会话中的 Agent。",
			commentSendHint: "将全部待提交意见发送给当前会话；Agent 忙碌时按新一轮消息排队",
			commentFinishEditing: "请先保存或取消正在编辑的评论",
			commentSent: "修改意见已发送给当前会话",
			commentSendFailed: "提交失败，评论已保留，可重试",
			commentStorageError: "评论目前保留在内存中，本地草稿存储不可用或已损坏；关闭应用可能丢失未提交意见。",
			commentChanged: "差异已变化；以下评论保留原始位置和参考代码。",
			commentFile: "文件",
			commentSource: "审查来源",
			commentReference: "参考代码（> 标记评论行）",
			commentOpinion: "修改意见",
			commentPrompt: "请根据以下文件审查意见修改当前工程，并完成必要验证。先读取当前文件，核对参考代码及新旧版本；历史轮次和 Git 差异中的行号可能已经变化，请按当前内容定位。对删除行的评论引用的是旧版代码。完成后说明每条意见的处理结果。",
			reviewScope: "审查范围",
			reviewLastTurn: "上一轮",
			reviewSession: "本会话",
			reviewPending: "待确认",
			reviewPendingHint: "仅显示未确认轮次；确认后隐藏，可在“本会话”中取消确认。",
			pendingEmpty: "本会话暂无待确认的文件改动",
			pendingRepoEmpty: "此仓库暂无待确认的文件改动",
			confirmTurn: "确认本轮",
			unconfirmTurn: "取消确认",
			turnConfirmed: "已确认",
			confirmTurnHint: "确认本轮全部仓库的改动（{count} 个文件），从“待确认”中隐藏",
			unconfirmTurnHint: "将本轮重新放回“待确认”",
			confirmTurnLive: "本轮仍在修改代码，结束后才能确认",
			confirmationStorageError: "确认状态目前仅保留在内存中，本地存储不可用或已损坏；重启后需重新确认。",
			reviewUncommitted: "未提交",
			reviewUnstaged: "未暂存",
			reviewStaged: "已暂存",
			reviewCommit: "已提交",
			reviewBranch: "分支",
			reviewHead: "最新提交（HEAD）",
			reviewAutoBranch: "自动选择基准分支",
			reviewSelectRepository: "选择单个仓库后，可指定提交或基准分支；全部仓库按各自的最新提交或默认分支审查。",
			reviewGitHint: "查看 Git 差异；不修改工作区、暂存区或提交。",
			reviewRepoCount: "{count} 个仓库",
			reviewLoading: "正在加载差异…",
			reviewGitEmpty: "当前范围暂无 Git 改动",
			reviewNoGit: "当前范围没有可用的 Git 仓库",
			reviewFiles: "{count} 个文件",
			reviewBinary: "二进制",
			reviewBinaryHint: "二进制文件、符号链接或超出大小限制，无法显示文本差异。",
			reviewMetadataOnly: "仅有重命名或文件模式变化，没有文本差异。",
			empty: "本会话暂无文件改动",
			sessionUnavailable: "会话不可用",
			remoteUnavailable: "文件审查服务不可用",
			turn: "第 {n} 轮",
			turnLive: "进行中",
			files: "{count} 个文件",
			filesOne: "1 个文件",
			undo: "撤销",
			redo: "重新应用",
			undoing: "正在撤销…",
			redoing: "正在重新应用…",
			undoTurn: "撤销本轮",
			redoTurn: "重新应用本轮",
			toggleUnavailable: "没有可安全还原的文件",
			stateUndone: "已撤销",
			stateConflict: "内容冲突",
			stateUnsupported: "不可还原",
			stateError: "错误",
			deleted: "已删除",
			deletedHint: "该文件在本轮中被终端命令删除，内容已不存在，无法查看差异或撤销。",
			archived: "已归档 {n} 轮",
			archivedExpand: "展开已归档轮次",
			archivedCollapse: "收起已归档轮次",
			loadMore: "加载更多（还有 {n} 轮）",
			undoSuccess: "已成功撤销更改",
			redoSuccess: "已成功重新应用更改",
			undoPartial: "部分文件未能撤销",
			redoPartial: "部分文件未能重新应用",
			toggleError: "操作失败",
			openInEditor: "在内置查看器中打开",
			open: "打开 {name}",
			copy: "复制差异",
			copied: "已复制",
			showUnchanged: "显示 {count} 行未更改内容",
			hideUnchanged: "隐藏 {count} 行未更改内容",
			expandContext: "展开 {count} 行未修改代码（剩余 {remaining} 行）",
			expandAllContextUp: "向上展开全部 {count} 行未修改代码",
			expandAllContextDown: "向下展开全部 {count} 行未修改代码",
			collapseContextGap: "收起这段已展开的未修改代码（{count} 行）",
			diffSettings: "设置",
			diffSettingsSave: "保存",
			diffContextExpansionLines: "每次展开的未修改代码行数",
			diffContextExpansionHint: "请输入正整数，默认 20 行。设置保存在本地，适用于统一和并排视图。",
			collapseContext: "收起展开的上下文",
			unavailableContext: "省略 {count} 行：历史记录未包含这些代码",
			diffLayout: "差异布局",
			diffSplit: "并排",
			diffUnified: "统一",
			diffWrap: "自动换行",
			diffOld: "旧版",
			diffNew: "新版",
			diffSearch: "搜索",
			diffSearchShortcut: "搜索当前文件（Ctrl/Cmd+F）",
			diffSearchQuery: "在已记录代码中搜索",
			diffSearchSide: "搜索版本",
			diffSearchBoth: "新旧版本",
			diffSearchCase: "区分大小写",
			diffSearchWord: "整词",
			diffSearchCount: "{current} / {count}",
			diffSearchLimited: "前 {count} 处匹配",
			diffSearchRecorded: "仅搜索已记录的代码",
			diffSearchPrevious: "上一处匹配（Shift+Enter / Shift+F3）",
			diffSearchNext: "下一处匹配（Enter / F3）",
			diffSearchClose: "关闭搜索（Esc）",
			diffPreviousChange: "上一处改动",
			diffNextChange: "下一处改动",
			diffPreviousChangeShortcut: "上一处改动（Ctrl/Cmd+↑）",
			diffNextChangeShortcut: "下一处改动（Ctrl/Cmd+↓）",
			diffChangeNavigation: "跳转到改动块",
			diffChangeCount: "{count} 处改动",
			diffChangePosition: "改动 {current} / {count}",
			diffSyntaxLanguage: "语法高亮语言",
			diffPlainText: "纯文本",
			collapseRepositoryFiles: "收起 {name} 的文件内容",
			expandRepositoryFiles: "展开 {name} 的文件内容",
			collapseTurnRepositories: "收起本轮全部仓库的文件内容",
			expandTurnRepositories: "展开本轮全部仓库的文件内容",
			collapseAllRepositories: "收起全部仓库的文件内容",
			expandAllRepositories: "展开全部仓库的文件内容",
			stats: "新增 {added} 行，删除 {removed} 行",
			unavailable: "无法为此更改还原可审查的差异。",
			refresh: "刷新状态",
			projectTab: "多代码仓管理",
			projectCurrentRoot: "当前工程目录",
			projectIntro: "为当前工程增删改 Git 仓库，保存到工程目录中的配置文件。仓库路径以当前工程目录为基准。",
			projectSave: "保存配置",
			projectGenerate: "生成新配置文件",
			projectReload: "重新加载已保存配置",
			projectSaved: "项目配置已保存",
			projectWorking: "处理中…",
			projectName: "项目名称",
			projectConfigFile: "工程配置文件（相对工程目录）",
			projectInactive: "当前工程没有配置文件（dsh-file-review-repositories.json）。点击上方「生成新配置文件」保存当前列表。",
			projectEnable: "启用多代码仓管理",
			projectDisabledHint: "已停用多代码仓管理，审查将按原有单目录方式进行；保存配置后生效。",
			projectIncludeRoot: "同时审查项目根目录内的文件",
			projectFiles: "仓库清单文件（每行一个，可选）",
			projectFilesHint: "支持 INI 的 [仓库名] / path 字段、.gitmodules，以及 JSON 的 repositories 数组；清单文件路径可相对项目根目录或使用绝对路径。",
			projectRepos: "代码仓库",
			projectReposHint: "工程内的仓库使用相对路径；工程外的仓库使用绝对路径，仅临时使用，不写入配置文件。",
			projectImportHint: "已导入原有仓库清单；保存后将写入本工程配置文件，不再依赖原清单。",
			projectAddRepo: "添加仓库",
			projectOpenRepo: "打开",
			projectRemoveRepo: "删除",
			projectTemporary: "临时使用，不保存",
			projectTemporaryShort: "临时",
			projectTemporaryHint: "该仓库位于当前工程目录外，只在本会话临时使用，不写入配置文件。",
			projectPickerUnavailable: "目录选择服务不可用，或尚未安装 Desktop 起始目录适配；请更新适配后重启应用",
			projectPickerInvalid: "目录选择器没有返回绝对路径",
			projectDeleteTitle: "确认删除仓库？",
			projectDeleteDescription: "确定从列表移除“{name}”吗？不会删除磁盘目录；保存配置后列表改动才会写入文件。",
			projectCancel: "取消",
			projectResolved: "已识别 {count} / {total} 个 Git 仓库",
			projectPath: "路径（工程内相对，工程外绝对）",
			projectState: "状态",
			projectRootSource: "项目根目录",
			projectManual: "手动配置",
			repository: "仓库",
			repoReady: "可用",
			repoMissing: "路径不存在",
			repoNotGit: "不是 Git 根目录",
			repoAll: "全部仓库",
			repoOther: "其他文件",
			repoScope: "{name} · {count} 个仓库",
			repoFilterEmpty: "此仓库暂无会话文件改动",
			repoSettingsHint: "仓库来源和维护范围可在会话的“多代码仓管理”页签中配置"
		};
		/** The en dictionary. */
		const en$1 = {
			...readingEn,
			tabTitle: "File Review",
			userGuide: "User guide",
			userGuideOpening: "Opening…",
			userGuideHint: "Open the user guide with screenshot previews",
			userGuideFailed: "Failed to open the user guide.",
			userGuideServiceUnavailable: "The user guide service is unavailable. Fully quit and restart Desktop after installing or updating the plugin, then try again.",
			userGuideClose: "Close user guide",
			userGuideCloseLegacy: "Close this old tab",
			userGuideLegacyHint: "The user guide now opens in a plugin dialog. This tab preserves an older saved layout.",
			sidebarGuideDescription: "Review multi-repository changes by turn or Git scope",
			sidebarUnavailable: "The native file viewer is not ready. Reopen File Review.",
			sidebarSessionNotVisible: "Switch to the target session before opening File Review.",
			sidebarWorkspaceUnavailable: "The working directory for this session is unavailable.",
			sidebarOpenFailed: "Failed to open the file in the built-in viewer.",
			sidebarTargetMissing: "This review target no longer exists or is outside the loaded session history.",
			userGuideImageOpen: "View image",
			userGuideImageDialog: "Screenshot preview",
			userGuideImageClose: "Close image",
			userGuideImageLoading: "Loading image…",
			userGuideImageFailed: "Failed to load image",
			userGuideCodeCopy: "Copy code",
			userGuideFootnotes: "Footnotes",
			commentAddLine: "Add line comment",
			commentAddFile: "Comment",
			commentWholeFile: "Entire file",
			commentOldLine: "Old line {line}",
			commentNewLine: "New line {line}",
			commentYou: "You",
			commentPlaceholder: "Add a review comment…",
			commentAdd: "Comment",
			commentSave: "Save comment",
			commentEdit: "Edit",
			commentDraft: "Pending",
			commentPending: "Review comments ({count})",
			commentSubmit: "Submit review comments",
			commentSending: "Submitting…",
			commentList: "Pending review comments",
			commentEmpty: "Hover a code line and click +, or click Comment beside a file.",
			commentDraftHint: "Comments belong to this session. Submit review comments sends them together to this session’s Agent.",
			commentSendHint: "Send all pending comments to this session; queue a new turn when the Agent is busy",
			commentFinishEditing: "Save or cancel the comment being edited first",
			commentSent: "Review comments sent to this session",
			commentSendFailed: "Submission failed; comments kept for retry",
			commentStorageError: "Comments remain in memory. Local draft storage is unavailable or corrupt; closing the app may lose pending comments.",
			commentChanged: "The diff changed. These comments retain their original location and reference code.",
			commentFile: "File",
			commentSource: "Review source",
			commentReference: "Reference code (> marks the commented line)",
			commentOpinion: "Requested change",
			commentPrompt: "Apply the following file review feedback to the current project and perform the necessary validation. Read the current files and verify the reference code and diff side first: line numbers in historical turns and Git diffs may have changed. Comments on deleted lines refer to old code. Report how each comment was addressed.",
			reviewScope: "Review scope",
			reviewLastTurn: "Last turn",
			reviewSession: "This session",
			reviewPending: "Pending review",
			reviewPendingHint: "Only unconfirmed turns appear. Confirm to hide a turn; undo confirmation in This session.",
			pendingEmpty: "No file changes pending review in this session",
			pendingRepoEmpty: "No file changes pending review in this repository",
			confirmTurn: "Confirm turn",
			unconfirmTurn: "Undo confirmation",
			turnConfirmed: "confirmed",
			confirmTurnHint: "Confirm all repositories in this turn ({count} files) and hide it from Pending review",
			unconfirmTurnHint: "Return this turn to Pending review",
			confirmTurnLive: "Wait until this turn finishes changing files before confirming",
			confirmationStorageError: "Confirmations remain in memory. Local storage is unavailable or corrupt; review again after restarting.",
			reviewUncommitted: "Uncommitted",
			reviewUnstaged: "Unstaged",
			reviewStaged: "Staged",
			reviewCommit: "Committed",
			reviewBranch: "Branch",
			reviewHead: "Latest commit (HEAD)",
			reviewAutoBranch: "Automatic base branch",
			reviewSelectRepository: "Select a repository to choose a commit or base branch. All repositories use their latest commit or default base branch.",
			reviewGitHint: "View Git differences without changing the worktree, index, or commits.",
			reviewRepoCount: "{count} repositories",
			reviewLoading: "Loading differences…",
			reviewGitEmpty: "No Git changes in this scope",
			reviewNoGit: "No available Git repository in this scope",
			reviewFiles: "{count} files",
			reviewBinary: "Binary",
			reviewBinaryHint: "Binary, symbolic link, or size limit exceeded; text differences are unavailable.",
			reviewMetadataOnly: "Only rename or file mode changes; no text difference.",
			empty: "No file changes in this session yet",
			sessionUnavailable: "Session is unavailable",
			remoteUnavailable: "File review service is unavailable",
			turn: "Turn {n}",
			turnLive: "in progress",
			files: "{count} files",
			filesOne: "1 file",
			undo: "Undo",
			redo: "Reapply",
			undoing: "Undoing…",
			redoing: "Reapplying…",
			undoTurn: "Undo turn",
			redoTurn: "Reapply turn",
			toggleUnavailable: "No safely reversible files are available",
			stateUndone: "undone",
			stateConflict: "conflict",
			stateUnsupported: "not reversible",
			stateError: "error",
			deleted: "deleted",
			deletedHint: "This file was deleted by a terminal command in this turn; its content is gone, so no diff or undo is available.",
			archived: "Archived turns ({n})",
			archivedExpand: "Expand archived turns",
			archivedCollapse: "Collapse archived turns",
			loadMore: "Load more ({n} more turns)",
			undoSuccess: "Changes undone",
			redoSuccess: "Changes reapplied",
			undoPartial: "Some files could not be undone",
			redoPartial: "Some files could not be reapplied",
			toggleError: "Operation failed",
			openInEditor: "Open in built-in viewer",
			open: "Open {name}",
			copy: "Copy diff",
			copied: "Copied",
			showUnchanged: "{count} unchanged lines",
			hideUnchanged: "Hide {count} unchanged lines",
			expandContext: "Expand {count} unchanged lines ({remaining} hidden)",
			expandAllContextUp: "Expand all {count} unchanged lines upward",
			expandAllContextDown: "Expand all {count} unchanged lines downward",
			collapseContextGap: "Collapse this expanded interval ({count} unchanged lines)",
			diffSettings: "Settings",
			diffSettingsSave: "Save",
			diffContextExpansionLines: "Unchanged lines to expand per click",
			diffContextExpansionHint: "Enter a positive integer. Default: 20 lines. Saved locally for unified and split views.",
			collapseContext: "Collapse expanded context",
			unavailableContext: "{count} lines omitted: their code was not recorded",
			diffLayout: "Diff layout",
			diffSplit: "Split",
			diffUnified: "Unified",
			diffWrap: "Wrap lines",
			diffOld: "Before",
			diffNew: "After",
			diffSearch: "Search",
			diffSearchShortcut: "Search this file (Ctrl/Cmd+F)",
			diffSearchQuery: "Search recorded code",
			diffSearchSide: "Search version",
			diffSearchBoth: "Both versions",
			diffSearchCase: "Match case",
			diffSearchWord: "Whole word",
			diffSearchCount: "{current} / {count}",
			diffSearchLimited: "First {count} matches",
			diffSearchRecorded: "Only searches recorded code",
			diffSearchPrevious: "Previous match (Shift+Enter / Shift+F3)",
			diffSearchNext: "Next match (Enter / F3)",
			diffSearchClose: "Close search (Esc)",
			diffPreviousChange: "Previous change",
			diffNextChange: "Next change",
			diffPreviousChangeShortcut: "Previous change (Ctrl/Cmd+↑)",
			diffNextChangeShortcut: "Next change (Ctrl/Cmd+↓)",
			diffChangeNavigation: "Go to change",
			diffChangeCount: "{count} changes",
			diffChangePosition: "Change {current} / {count}",
			diffSyntaxLanguage: "Syntax language",
			diffPlainText: "Plain text",
			collapseRepositoryFiles: "Collapse file contents in {name}",
			expandRepositoryFiles: "Expand file contents in {name}",
			collapseTurnRepositories: "Collapse file contents in all repositories in this turn",
			expandTurnRepositories: "Expand file contents in all repositories in this turn",
			collapseAllRepositories: "Collapse file contents in all repositories",
			expandAllRepositories: "Expand file contents in all repositories",
			stats: "{added} lines added, {removed} lines removed",
			unavailable: "No reconstructable diff is available for this change.",
			refresh: "Refresh status",
			projectTab: "Multi-repository management",
			projectCurrentRoot: "Current project directory",
			projectIntro: "Add, edit, and remove Git repositories for this project. Save them to a configuration file in the project directory. Paths are relative to the project directory.",
			projectSave: "Save configuration",
			projectGenerate: "Generate new configuration file",
			projectReload: "Reload saved configuration",
			projectSaved: "Project configuration saved",
			projectWorking: "Working…",
			projectName: "Project name",
			projectConfigFile: "Project configuration file (relative to project)",
			projectInactive: "This project has no configuration file (dsh-file-review-repositories.json). Click \"Generate new configuration file\" above to save the list.",
			projectEnable: "Enable multi-repository management",
			projectDisabledHint: "Multi-repository management is disabled. Review will use single-directory scope; save configuration to apply.",
			projectIncludeRoot: "Also review files within the project root",
			projectFiles: "Repository manifests (one per line, optional)",
			projectFilesHint: "Supports INI [repository] / path fields, .gitmodules, and JSON repositories arrays. Manifest paths may be relative to the project root or absolute.",
			projectRepos: "Repositories",
			projectReposHint: "Repositories inside the project use relative paths. Outside repositories use absolute paths for this session only and are excluded from the configuration file.",
			projectImportHint: "Existing manifest entries have been imported. Saving writes the project configuration file and removes the manifest dependency.",
			projectAddRepo: "Add repository",
			projectOpenRepo: "Open",
			projectRemoveRepo: "Remove",
			projectTemporary: "Temporary, not saved",
			projectTemporaryShort: "Temp",
			projectTemporaryHint: "This repository is outside the project. It is temporary for this session and will not be written to the configuration file.",
			projectPickerUnavailable: "Directory picker unavailable, or the Desktop starting-directory adapter is missing; update the adapter and restart",
			projectPickerInvalid: "The directory picker did not return an absolute path",
			projectDeleteTitle: "Remove this repository?",
			projectDeleteDescription: "Remove “{name}” from the list? The directory on disk stays intact; the list change is written when you save.",
			projectCancel: "Cancel",
			projectResolved: "{count} / {total} Git repositories available",
			projectPath: "Path (relative inside project, absolute outside)",
			projectState: "Status",
			projectRootSource: "Project root",
			projectManual: "Manual",
			repository: "Repository",
			repoReady: "Ready",
			repoMissing: "Missing path",
			repoNotGit: "Not a Git root",
			repoAll: "All repositories",
			repoOther: "Other files",
			repoScope: "{name} · {count} repositories",
			repoFilterEmpty: "No session changes in this repository",
			repoSettingsHint: "Configure repository sources and scope in this conversation’s Multi-repository management tab"
		};
		const localeListeners = /* @__PURE__ */ new Set();
		let localeAttachment;
		const notifyLocale = () => {
			for (const listener of localeListeners) listener();
		};
		/** Follow the host's General settings language; dispose on plugin disable/HMR. */
		function attachLocale(service) {
			localeAttachment?.unsubscribe?.();
			const attachment = {
				service,
				unsubscribe: service?.subscribe?.(notifyLocale)
			};
			localeAttachment = attachment;
			notifyLocale();
			return () => {
				if (localeAttachment !== attachment) return;
				attachment.unsubscribe?.();
				localeAttachment = void 0;
				notifyLocale();
			};
		}
		function subscribeLocale(listener) {
			localeListeners.add(listener);
			return () => {
				localeListeners.delete(listener);
			};
		}
		/** The active locale id ('zh' | 'en'): the DSH locale service's snapshot when attached. */
		function getLocaleSnapshot() {
			return (localeAttachment?.service?.getSnapshot().active ?? (typeof navigator !== "undefined" ? navigator.language : "") ?? "en").toLowerCase().startsWith("zh") ? "zh" : "en";
		}
		/** Translate a copy key; `{name}` placeholders interpolate from `params`. */
		function t(key, params) {
			let text = (getLocaleSnapshot() === "zh" ? zh$1 : en$1)[key];
			if (params !== void 0) for (const [name, value] of Object.entries(params)) text = text.replaceAll(`{${name}}`, String(value));
			return text;
		}
		//#endregion
		//#region src/client/review-comment-labels.ts
		const DISCUSSION_LABELS = {
			submitting: "discussionSubmitting",
			queued: "discussionQueued",
			running: "discussionRunning",
			answered: "discussionAnswered",
			completed: "discussionCompleted",
			cancelled: "discussionCancelled",
			failed: "discussionFailed",
			unknown: "discussionUnknown",
			unlinked: "discussionNoCorrelation"
		};
		function commentScopeLabel(scope) {
			return t(REVIEW_SCOPES[scope].label);
		}
		function discussionStateLabel(state) {
			return t(DISCUSSION_LABELS[state]);
		}
		function commentPositionLabel(anchor) {
			if (anchor.line !== null && anchor.endLine !== void 0 && anchor.endLine !== anchor.line) return t("referenceRange", {
				side: t(anchor.side === "old" ? "diffOld" : "diffNew"),
				start: anchor.line,
				end: anchor.endLine
			});
			return t(anchor.side === "file" ? "commentWholeFile" : anchor.side === "old" ? "commentOldLine" : "commentNewLine", { line: anchor.line ?? "" });
		}
		//#endregion
		//#region src/client/review-file-opener.ts
		function referenceRequest(anchor, editorPath = "", fullText) {
			if (anchor.side === "file" || anchor.line === null) throw new Error("A code line is required");
			return {
				repository: anchor.repository,
				path: anchor.absolutePath,
				source: anchor.sourceKey ?? JSON.stringify([
					anchor.scope,
					anchor.turn,
					anchor.ref,
					anchor.revision
				]),
				side: anchor.side,
				line: anchor.line,
				endLine: anchor.endLine ?? anchor.line,
				quote: anchor.quote,
				before: anchor.before,
				after: anchor.after,
				...editorPath ? { editorPath } : {},
				...fullText !== void 0 && fullText.length <= 8388608 ? { fullText } : {}
			};
		}
		async function reviewLocation(ctx, sessionId, request, method = "openEditor") {
			const remote = ctx.sessions.scope(sessionId)?.get("remote.fileReview");
			if (!remote?.[method]) return { state: "error" };
			const result = await remote[method](request);
			return result.ok ? result.value : { state: "error" };
		}
		//#endregion
		//#region \0dsh-file-review-tab-multi-git-repository-css:D:\projectZJGG\dsh-file-review-tab-Multi-git-repository\src\client\ReviewComments.module.css.mjs
		const css$6 = ".GrXiwW_toolbar{border-bottom:1px solid var(--dsw-alias-border-l2);font:var(--dsw-font-xs-13);flex-wrap:wrap;flex-shrink:0;align-items:center;gap:8px;padding:8px 12px;display:flex}.GrXiwW_toolbar small,.GrXiwW_meta,.GrXiwW_cardHeader small,.GrXiwW_summary>small,.GrXiwW_thread>small{color:var(--dsw-alias-label-secondary)}.GrXiwW_button,.GrXiwW_fileButton{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer;white-space:nowrap;border-radius:6px;padding:5px 10px}.GrXiwW_button:hover,.GrXiwW_fileButton:hover{background:var(--dsw-alias-bg-layer-2)}.GrXiwW_button:disabled,.GrXiwW_fileButton:disabled,.GrXiwW_lineAdd:disabled{opacity:.45;cursor:default}.GrXiwW_primary{background:var(--dsw-alias-state-link-primary,#4d6bfe);color:#fff;border-color:#0000}.GrXiwW_primary:hover{background:var(--dsw-alias-state-link-primary,#4d6bfe);filter:brightness(.94)}.GrXiwW_fileButton{font:var(--dsw-font-xs-13);flex-shrink:0;padding:3px 7px}.GrXiwW_notice{color:var(--dsw-alias-label-secondary);font:var(--dsw-font-xs-13);overflow-wrap:anywhere;flex-shrink:0;margin:0;padding:8px 12px}.GrXiwW_summary{border-bottom:1px solid var(--dsw-alias-border-l2);min-height:80px;max-height:45%;font:var(--dsw-font-xs-13);flex-shrink:0;padding:10px 12px;overflow-y:auto}.GrXiwW_thread{box-sizing:border-box;white-space:normal;width:100%;min-width:0;font:var(--dsw-font-xs-13);color:var(--dsw-alias-label-primary);padding:8px 12px;position:sticky;left:0}.GrXiwW_card{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2,#ddd);min-width:0;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1,#fff);border-radius:12px;margin:8px 0;padding:12px;box-shadow:0 2px 8px #00000008}.GrXiwW_cardHeader{flex-wrap:wrap;align-items:center;gap:8px;display:flex}.GrXiwW_cardHeader small{margin-left:auto}.GrXiwW_card textarea{box-sizing:border-box;resize:vertical;width:100%;min-height:80px;color:var(--dsw-alias-label-primary);font:inherit;background:0 0;border:0;outline:none;margin:10px 0;padding:6px 0;line-height:1.6;display:block}.GrXiwW_card textarea:focus-visible{outline:1px solid var(--dsw-alias-state-link-primary,#4d6bfe);outline-offset:3px;border-radius:4px}.GrXiwW_actions{flex-wrap:wrap;justify-content:flex-end;gap:8px;display:flex}.GrXiwW_commentText{white-space:pre-wrap;overflow-wrap:anywhere;margin:10px 0;line-height:1.6}.GrXiwW_meta{overflow-wrap:anywhere;margin-top:6px;display:block}.GrXiwW_quote{background:var(--dsw-alias-bg-layer-2);white-space:pre-wrap;overflow-wrap:anywhere;max-height:90px;font:var(--dsw-font-markdown-code-block);border-radius:4px;margin:8px 0;padding:6px 8px;overflow:auto}.GrXiwW_lineAdd{opacity:0;color:#fff;background:var(--dsw-alias-state-link-primary,#4d6bfe);cursor:pointer;border:0;border-radius:4px;width:20px;height:20px;padding:0;font:18px/20px sans-serif;position:absolute;top:2px;left:3px}[data-line-kind]:hover .GrXiwW_lineAdd,[data-line-kind]:focus-within .GrXiwW_lineAdd,.GrXiwW_lineAdd:focus-visible{opacity:1}@media (hover:none){.GrXiwW_lineAdd{opacity:1}}.GrXiwW_unread{color:var(--dsw-alias-state-link-primary,#0969da);background:var(--dsw-alias-bg-layer-2,#e7efff);border-radius:5px;padding:2px 6px;font-size:12px}.GrXiwW_discussionOpinion+.GrXiwW_discussionOpinion{border-top:1px solid var(--dsw-alias-border-l2);margin-top:10px;padding-top:10px}.GrXiwW_discussionReplies{margin:12px 0}.GrXiwW_discussionReplies summary{cursor:pointer;font-weight:600}.GrXiwW_discussionReplies .GrXiwW_commentText{max-height:340px;overflow:auto}";
		const styleId$6 = "dsh-file-review-tab-multi-git-repository/ReviewComments.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(styleId$6) + "]") === null) {
			const style = document.createElement("style");
			style.dataset.plugin = "dsh-file-review-tab-multi-git-repository";
			style.dataset.pluginCss = styleId$6;
			style.textContent = css$6;
			document.head.appendChild(style);
		}
		var ReviewComments_module_css_default = {
			"unread": "GrXiwW_unread",
			"meta": "GrXiwW_meta",
			"toolbar": "GrXiwW_toolbar",
			"primary": "GrXiwW_primary",
			"thread": "GrXiwW_thread",
			"quote": "GrXiwW_quote",
			"discussionReplies": "GrXiwW_discussionReplies",
			"lineAdd": "GrXiwW_lineAdd",
			"card": "GrXiwW_card",
			"actions": "GrXiwW_actions",
			"fileButton": "GrXiwW_fileButton",
			"cardHeader": "GrXiwW_cardHeader",
			"discussionOpinion": "GrXiwW_discussionOpinion",
			"commentText": "GrXiwW_commentText",
			"button": "GrXiwW_button",
			"notice": "GrXiwW_notice",
			"summary": "GrXiwW_summary"
		};
		//#endregion
		//#region src/client/review-comment-components.tsx
		function CommentEditor() {
			const context = (0, react.useContext)(ReviewCommentsContext);
			if (!context?.composer) return null;
			const { composer, setComposer, store, snapshot } = context;
			const save = () => {
				if (!composer.text.trim() || snapshot.busy) return;
				store.save(composer.anchor, composer.text, composer.id, composer.discussionId);
				setComposer(null);
			};
			const submit = (event) => {
				event.preventDefault();
				save();
			};
			const handleEditorKey = (event) => {
				if (event.key === "Escape") {
					event.preventDefault();
					setComposer(null);
				} else if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
					event.preventDefault();
					save();
				}
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
				className: ReviewComments_module_css_default.card,
				"data-review-comment-editor": "",
				onSubmit: submit,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: ReviewComments_module_css_default.cardHeader,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: t("commentYou") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: commentPositionLabel(composer.anchor) })]
					}),
					composer.placement === "list" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("small", {
						className: ReviewComments_module_css_default.meta,
						children: [
							composer.anchor.repositoryName,
							" · ",
							composer.anchor.path,
							" ·",
							" ",
							commentScopeLabel(composer.anchor.scope)
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
						autoFocus: true,
						"aria-label": t("commentPlaceholder"),
						placeholder: t("commentPlaceholder"),
						value: composer.text,
						maxLength: COMMENT_TEXT_LIMIT,
						rows: 3,
						disabled: snapshot.busy,
						onChange: (event) => {
							setComposer({
								...composer,
								text: event.target.value
							});
						},
						onKeyDown: handleEditorKey
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: ReviewComments_module_css_default.actions,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							className: ReviewComments_module_css_default.button,
							type: "button",
							onClick: () => {
								setComposer(null);
							},
							children: t("projectCancel")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							className: `${ReviewComments_module_css_default.button} ${ReviewComments_module_css_default.primary}`,
							type: "submit",
							disabled: !composer.text.trim() || snapshot.busy,
							children: t(composer.id ? "commentSave" : "commentAdd")
						})]
					})
				]
			});
		}
		function CommentCard({ comment, placement, showFile = false, currentAnchor }) {
			const context = (0, react.useContext)(ReviewCommentsContext);
			const [location, setLocation] = (0, react.useState)(null);
			const [checking, setChecking] = (0, react.useState)(false);
			if (!context) return null;
			const { composer, snapshot, start, store } = context;
			if (composer?.id === comment.id && composer.placement === placement) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CommentEditor, {});
			const canRelocate = currentAnchor && comment.anchor.side === "new" && usesWorkingTree(comment.anchor.scope);
			const checkLocation = () => {
				setChecking(true);
				reviewLocation(context.ctx, context.sessionId, referenceRequest(comment.anchor), "locateReference").then(setLocation).catch(() => setLocation({ state: "error" })).finally(() => setChecking(false));
			};
			const applyLocation = () => {
				if (!currentAnchor || !location || location.line === void 0) return;
				setChecking(true);
				reviewLocation(context.ctx, context.sessionId, referenceRequest(comment.anchor), "locateReference").then((result) => {
					if (result.line !== location.line || result.state !== location.state) {
						setLocation(result);
						return;
					}
					const next = currentAnchor(comment.anchor, result.line);
					if (next) {
						store.relocate(comment.id, next);
						setLocation(null);
					} else setLocation({ state: "changed" });
				}).catch(() => setLocation({ state: "error" })).finally(() => setChecking(false));
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", {
				className: ReviewComments_module_css_default.card,
				"data-review-comment": "",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: ReviewComments_module_css_default.cardHeader,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: t("commentYou") }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("small", { children: [
							commentPositionLabel(comment.anchor),
							" · ",
							t("commentDraft")
						] })]
					}),
					showFile && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("small", {
						className: ReviewComments_module_css_default.meta,
						title: comment.anchor.absolutePath,
						children: [
							comment.anchor.repositoryName,
							" · ",
							comment.anchor.path,
							" ·",
							" ",
							commentScopeLabel(comment.anchor.scope),
							comment.anchor.turn === void 0 ? "" : ` · ${t("turn", { n: comment.anchor.turn })}`
						]
					}), comment.anchor.side !== "file" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", {
						className: ReviewComments_module_css_default.quote,
						children: comment.anchor.quote
					})] }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: ReviewComments_module_css_default.commentText,
						children: comment.text
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: ReviewComments_module_css_default.actions,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: ReviewComments_module_css_default.button,
								disabled: snapshot.busy,
								onClick: () => {
									start(comment.anchor, placement, comment);
								},
								children: t("commentEdit")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: ReviewComments_module_css_default.button,
								disabled: snapshot.busy,
								onClick: () => {
									store.remove(comment.id);
								},
								children: t("projectRemoveRepo")
							}),
							canRelocate && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: ReviewComments_module_css_default.button,
								disabled: snapshot.busy || checking,
								onClick: checkLocation,
								children: t("referenceRelocate")
							})
						]
					}),
					location && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: ReviewComments_module_css_default.meta,
						role: "status",
						children: t(location.state === "exact" ? "referenceExact" : location.state === "moved" ? "editorMoved" : location.state === "ambiguous" ? "editorAmbiguous" : "editorChanged", { line: location.line ?? "" })
					}),
					currentAnchor && (location?.state === "moved" || location?.state === "exact") && location.line !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: ReviewComments_module_css_default.button,
						disabled: snapshot.busy || checking,
						onClick: applyLocation,
						children: t("referenceRelocateApply", { line: location.line })
					})
				]
			});
		}
		function commentMatchesAnchor(candidate, anchor) {
			return commentFileKey(candidate) === commentFileKey(anchor) && candidate.revision === anchor.revision && candidate.side === anchor.side && candidate.line === anchor.line && (!candidate.sourceKey || candidate.sourceKey === anchor.sourceKey);
		}
		function CommentThread({ anchor }) {
			const context = (0, react.useContext)(ReviewCommentsContext);
			if (!context) return null;
			const key = commentAnchorKey(anchor);
			const comments = context.snapshot.comments.filter((item) => commentMatchesAnchor(item.anchor, anchor));
			const editing = context.composer?.placement === "inline" && commentMatchesAnchor(context.composer.anchor, anchor);
			const discussions = context.discussions.records.filter((item) => item.comments.some((comment) => commentMatchesAnchor(comment.anchor, anchor)));
			if (!comments.length && !editing && !discussions.length) return null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: ReviewComments_module_css_default.thread,
				children: [
					comments.map((comment) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CommentCard, {
						comment,
						placement: "inline"
					}, comment.id)),
					editing && !context.composer?.id && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CommentEditor, {}, key),
					discussions.map((item) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(DiscussionCard, {
						discussion: item,
						anchor
					}, item.id))
				]
			});
		}
		/** Inline comment affordance shared by historical tool diffs and working-tree diffs. */
		function ReviewCommentLine({ anchor, alternateAnchor, children }) {
			const context = (0, react.useContext)(ReviewCommentsContext);
			if (!context || !anchor) return children(null);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				children(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: ReviewComments_module_css_default.lineAdd,
					title: t("commentAddLine"),
					"aria-label": `${t("commentAddLine")} · ${commentPositionLabel(anchor)}`,
					disabled: context.snapshot.busy,
					onClick: () => {
						context.start(anchor, "inline");
					},
					children: "+"
				})),
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(CommentThread, { anchor }),
				alternateAnchor && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CommentThread, { anchor: alternateAnchor })
			] });
		}
		function ReviewFileCommentButton({ target }) {
			const context = (0, react.useContext)(ReviewCommentsContext);
			if (!context || !target) return null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: ReviewComments_module_css_default.fileButton,
				disabled: context.snapshot.busy,
				onKeyDown: (event) => {
					event.stopPropagation();
				},
				onClick: (event) => {
					event.stopPropagation();
					context.start(fileCommentAnchor(target), "inline");
				},
				children: t("commentAddFile")
			});
		}
		function ReviewFileCommentThread({ target }) {
			return target ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CommentThread, { anchor: fileCommentAnchor(target) }) : null;
		}
		function ReviewOutdatedComments({ target, revision, currentAnchor }) {
			const context = (0, react.useContext)(ReviewCommentsContext);
			const comments = target && context?.snapshot.comments.filter((item) => item.anchor.side !== "file" && commentFileKey(item.anchor) === commentFileKey(target) && item.anchor.revision !== revision);
			const discussions = target && context?.discussions.records.filter((item) => item.comments.some((comment) => comment.anchor.side !== "file" && commentFileKey(comment.anchor) === commentFileKey(target) && comment.anchor.revision !== revision));
			if (!comments?.length && !discussions?.length) return null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: ReviewComments_module_css_default.thread,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: t("commentChanged") }),
					comments?.map((comment) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CommentCard, {
						comment,
						placement: "inline",
						showFile: true,
						currentAnchor
					}, comment.id)),
					discussions?.map((item) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(DiscussionCard, { discussion: item }, item.id))
				]
			});
		}
		/** Shared explicit actions; standalone diff viewers can still copy references without a provider. */
		function useReviewInteractions() {
			return (0, react.useContext)(ReviewCommentsContext);
		}
		function DiscussionCard({ discussion, anchor }) {
			const context = (0, react.useContext)(ReviewCommentsContext);
			if (!context) return null;
			const { discussionStore, start, snapshot, ctx, sessionId } = context;
			const comments = anchor ? discussion.comments.filter((item) => commentMatchesAnchor(item.anchor, anchor)) : discussion.comments;
			const unread = (discussion.replies.at(-1)?.seq ?? 0) > discussion.readSeq;
			const stateLabel = discussionStateLabel(discussion.state);
			const readOriginal = () => {
				const sessions = ctx.sessions;
				(typeof sessions.binding === "function" ? sessions.binding(sessionId)?.session : void 0)?.loadThrough(discussion.userSeq).catch(() => {});
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", {
				className: ReviewComments_module_css_default.card,
				"data-review-discussion": "",
				"data-discussion-state": discussion.state,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: ReviewComments_module_css_default.cardHeader,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: stateLabel }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: discussion.turn ? t("turn", { n: discussion.turn }) : new Date(discussion.createdAt).toLocaleString() }),
							unread && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: ReviewComments_module_css_default.unread,
								children: t("discussionUnread")
							})
						]
					}),
					comments.map((comment) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: ReviewComments_module_css_default.discussionOpinion,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("small", {
								className: ReviewComments_module_css_default.meta,
								children: [
									comment.anchor.repositoryName,
									" · ",
									comment.anchor.path,
									" · ",
									commentPositionLabel(comment.anchor),
									" ·",
									" ",
									t(discussion.resolved.includes(comment.id) ? "discussionResolved" : "discussionUnresolved")
								]
							}),
							comment.anchor.quote && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", {
								className: ReviewComments_module_css_default.quote,
								children: comment.anchor.quote
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: ReviewComments_module_css_default.commentText,
								children: comment.text
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: ReviewComments_module_css_default.actions,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: ReviewComments_module_css_default.button,
									onClick: () => discussionStore.resolve(discussion.id, comment.id, !discussion.resolved.includes(comment.id)),
									children: t(discussion.resolved.includes(comment.id) ? "discussionReopen" : "discussionResolve")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: ReviewComments_module_css_default.button,
									disabled: snapshot.busy,
									onClick: () => start(comment.anchor, "list", void 0, discussion.id),
									children: t("discussionReply")
								})]
							})
						]
					}, comment.id)),
					discussion.replies.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("details", {
						className: ReviewComments_module_css_default.discussionReplies,
						onToggle: (event) => {
							if (event.currentTarget.open) discussionStore.read(discussion.id);
						},
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("summary", { children: t("discussionResponse") }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: t("discussionHint") }),
							discussion.replies.map((reply) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: ReviewComments_module_css_default.commentText,
								children: reply.text
							}), reply.interrupted && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: t("discussionInterrupted") })] }, reply.id))
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: ReviewComments_module_css_default.actions,
						children: [unread && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: ReviewComments_module_css_default.button,
							onClick: () => discussionStore.read(discussion.id),
							children: t("discussionRead")
						}), discussion.userSeq !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: ReviewComments_module_css_default.button,
							onClick: readOriginal,
							children: t("discussionReadOriginal")
						})]
					})
				]
			});
		}
		//#endregion
		//#region src/client/review-comments-send.ts
		/** Use the session-addressed host send, preserving the composer's existing draft. */
		async function sendReviewComments(ctx, sessionId, text, onPrepared) {
			const sessions = ctx.sessions;
			const scope = sessions.scope(sessionId);
			if (!scope?.conversation) throw new Error("Review conversation is unavailable");
			const session = typeof sessions.sessionOf === "function" ? sessions.sessionOf(scope) : void 0;
			if (onPrepared && session?.beginSubmission) {
				const handle = session.beginSubmission({
					mode: "queue",
					text,
					attachments: []
				});
				try {
					onPrepared(String(handle.requestId));
					const result = await session.prompt([{
						type: "text",
						text
					}], "queue", void 0, handle.requestId);
					if (!result.ok) throw new ReviewSendFailure(result.error.code);
				} catch (cause) {
					handle.abandon();
					throw cause;
				}
				return;
			}
			onPrepared?.("");
			await scope.conversation.send(text);
		}
		var ReviewSendFailure = class extends Error {
			code;
			get uncertain() {
				return this.code === "gateway/internal" || this.code === "gateway/cancelled";
			}
			constructor(code) {
				super(`Review submission failed: ${code}`);
				this.code = code;
			}
		};
		//#endregion
		//#region src/client/review-comment-submission.ts
		const PARENT_RESPONSE_LIMIT = 2e4;
		/** Follow-up opinions include each parent once, with a bounded copy of its replies. */
		function formatReviewSubmission(comments, discussions) {
			let message = formatReviewComments(comments, {
				introduction: t("commentPrompt"),
				repository: t("repository"),
				file: t("commentFile"),
				source: t("commentSource"),
				reference: t("commentReference"),
				opinion: t("commentOpinion"),
				scope: commentScopeLabel,
				turn: (turn) => t("turn", { n: turn }),
				position: commentPositionLabel
			});
			const parentIds = new Set(comments.map((comment) => comment.discussionId).filter(Boolean));
			for (const parentId of parentIds) {
				const parent = discussions.find((discussion) => discussion.id === parentId);
				if (parent === void 0) continue;
				const opinions = parent.comments.map((comment) => comment.text).join("\n");
				const replies = parent.replies.map((reply) => reply.text).join("\n").slice(0, PARENT_RESPONSE_LIMIT);
				message += `\n\n${t("discussionReply")}:\n${opinions}\n${t("discussionResponse")}:\n${replies}`;
			}
			return message;
		}
		/** Persist request identity before sending so late admission can acknowledge the right drafts. */
		async function submitReviewCommentBatch({ ctx, sessionId, comments, discussions, discussionStore, discussionEnabled }) {
			const message = formatReviewSubmission(comments, discussions);
			let discussionId;
			const prepare = discussionEnabled ? (requestId) => {
				discussionId = discussionStore.begin(comments, requestId, comments[0]?.discussionId);
			} : void 0;
			try {
				await sendReviewComments(ctx, sessionId, message, prepare);
				if (discussionId) {
					const discussion = discussionStore.getSnapshot().records.find((record) => record.id === discussionId);
					discussionStore.settle(discussionId, discussion?.requestId ? "queued" : "unlinked");
				}
			} catch (cause) {
				const admitted = discussionId && discussionStore.getSnapshot().records.find((record) => record.id === discussionId);
				if (admitted && isAdmittedDiscussionState(admitted.state)) return;
				if (discussionId) {
					const definiteFailure = cause instanceof ReviewSendFailure && !cause.uncertain;
					discussionStore.settle(discussionId, definiteFailure ? "failed" : "unknown");
				}
				throw cause;
			}
		}
		//#endregion
		//#region src/client/use-review-discussion-events.ts
		/** Reattach when the host replaces a session binding, including after reconnect. */
		function useReviewDiscussionEvents(ctx, sessionId, store) {
			(0, react.useEffect)(() => {
				const sessions = ctx.sessions;
				let source;
				let unsubscribe;
				const attach = () => {
					const next = typeof sessions.binding === "function" ? sessions.binding(sessionId)?.eventSource : void 0;
					if (source === next) return;
					unsubscribe?.();
					source = next;
					if (!next) return;
					const sync = () => store.reconcile(next.getSnapshot().entries);
					unsubscribe = next.subscribe(sync);
					sync();
				};
				attach();
				const unsubscribeList = sessions.list?.subscribe(attach);
				return () => {
					unsubscribe?.();
					unsubscribeList?.();
				};
			}, [
				ctx,
				sessionId,
				store
			]);
		}
		/** Preserve newly edited drafts while removing the exact opinions accepted by the host. */
		function useAdmittedReviewComments(discussions, store) {
			(0, react.useEffect)(() => {
				for (const discussion of discussions.records) if (discussion.userSeq !== void 0 || isAdmittedDiscussionState(discussion.state)) store.acknowledge(discussion.comments);
			}, [discussions, store]);
		}
		//#endregion
		//#region src/client/diff-view-preferences.ts
		const DEFAULT_DIFF_VIEW = Object.freeze({
			layout: "unified",
			wrap: true,
			contextExpansionLines: 20,
			fontSize: 13,
			lineHeight: 1.7,
			tabSize: 4,
			fontFamily: "mono",
			colors: "theme",
			colorStrength: 14,
			editorPath: "",
			discussionEnabled: true,
			virtualize: true,
			searchShortcut: "mod+f",
			changeShortcut: "mod+arrow"
		});
		const DIFF_VIEW_STORAGE_KEY = "dsh-file-review-tab-multi-git-repository:diff-view";
		function numericPreference(record, key, min, max, integer = false) {
			const value = record[key];
			return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max && (!integer || Number.isInteger(value)) ? value : DEFAULT_DIFF_VIEW[key];
		}
		function choicePreference(record, key, options) {
			return options.includes(String(record[key])) ? record[key] : DEFAULT_DIFF_VIEW[key];
		}
		function parseDiffViewPreferences(raw) {
			try {
				const value = raw === null ? null : JSON.parse(raw);
				if (value && typeof value === "object" && "layout" in value && ["split", "unified"].includes(String(value.layout)) && "wrap" in value && typeof value.wrap === "boolean") {
					const count = "contextExpansionLines" in value ? value.contextExpansionLines : void 0;
					const record = value;
					return {
						...DEFAULT_DIFF_VIEW,
						layout: value.layout,
						wrap: value.wrap,
						contextExpansionLines: typeof count === "number" && Number.isSafeInteger(count) && count > 0 ? count : DEFAULT_DIFF_VIEW.contextExpansionLines,
						fontSize: numericPreference(record, "fontSize", 10, 24, true),
						lineHeight: numericPreference(record, "lineHeight", 1.2, 2.5),
						tabSize: numericPreference(record, "tabSize", 1, 8, true),
						colorStrength: numericPreference(record, "colorStrength", 5, 40, true),
						fontFamily: choicePreference(record, "fontFamily", [
							"mono",
							"consolas",
							"cascadia",
							"jetbrains"
						]),
						colors: choicePreference(record, "colors", ["theme", "blue-orange"]),
						searchShortcut: choicePreference(record, "searchShortcut", [
							"mod+f",
							"mod+shift+f",
							"mod+alt+f"
						]),
						changeShortcut: choicePreference(record, "changeShortcut", ["mod+arrow", "alt+arrow"]),
						editorPath: typeof record.editorPath === "string" && record.editorPath.length <= 4096 ? record.editorPath.trim() : "",
						discussionEnabled: typeof record.discussionEnabled === "boolean" ? record.discussionEnabled : true,
						virtualize: typeof record.virtualize === "boolean" ? record.virtualize : true
					};
				}
			} catch {}
			return DEFAULT_DIFF_VIEW;
		}
		/** Share display preferences across open tabs without storing project data. */
		var DiffViewStore = class {
			storageError = false;
			value;
			listeners = /* @__PURE__ */ new Set();
			storage;
			constructor(storage) {
				this.storage = storage;
				let raw = null;
				try {
					raw = storage?.getItem("dsh-file-review-tab-multi-git-repository:diff-view") ?? null;
				} catch {}
				this.value = parseDiffViewPreferences(raw);
			}
			getSnapshot = () => this.value;
			subscribe = (listener) => {
				this.listeners.add(listener);
				return () => {
					this.listeners.delete(listener);
				};
			};
			set(patch) {
				const next = parseDiffViewPreferences(JSON.stringify({
					...this.value,
					...patch
				}));
				if (JSON.stringify(next) === JSON.stringify(this.value) && !this.storageError) return;
				this.value = next;
				try {
					if (!this.storage) throw new Error("Storage unavailable");
					this.storage.setItem(DIFF_VIEW_STORAGE_KEY, JSON.stringify(next));
					this.storageError = false;
				} catch {
					this.storageError = true;
				}
				for (const listener of this.listeners) listener();
			}
		};
		//#endregion
		//#region src/client/use-review-locale.ts
		/** Re-render on the host language preference, keeping component state intact. */
		function useReviewLocale() {
			return (0, react.useSyncExternalStore)(subscribeLocale, getLocaleSnapshot, getLocaleSnapshot);
		}
		//#endregion
		//#region \0dsh-file-review-tab-multi-git-repository-css:D:\projectZJGG\dsh-file-review-tab-Multi-git-repository\src\client\DiffViewControls.module.css.mjs
		const css$5 = ".Bf6_Iq_controls{flex-wrap:wrap;align-items:center;gap:6px;margin-left:auto;display:flex}.Bf6_Iq_controls select,.Bf6_Iq_controls button{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2,#d0d7de);min-height:28px;color:var(--dsw-alias-label-primary,#1f2328);background:var(--dsw-alias-bg-layer-1,var(--dsw-alias-bg-base,#fff));font:inherit;cursor:pointer;border-radius:6px;padding:4px 7px}.Bf6_Iq_controls button{white-space:nowrap;align-items:center;gap:5px;display:inline-flex}.Bf6_Iq_controls button[aria-pressed=true]{color:var(--dsw-alias-state-link-primary,#0969da);background:color-mix(in srgb, var(--dsw-alias-state-link-primary,#0969da) 9%, var(--dsw-alias-bg-base,#fff))}.Bf6_Iq_controls button:hover{border-color:var(--dsw-alias-state-link-primary,#0969da)}.Bf6_Iq_controls svg{fill:none;stroke:currentColor;stroke-width:1.3px;stroke-linecap:round;stroke-linejoin:round;width:14px;height:14px}.Bf6_Iq_controls :focus-visible{outline:2px solid var(--dsw-alias-state-link-primary,#0969da);outline-offset:1px}.Bf6_Iq_settingsDialog{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2,#d0d7de);width:min(460px,100vw - 32px);max-height:calc(100vh - 32px);color:var(--dsw-alias-label-primary,#1f2328);background:var(--dsw-alias-bg-base,#fff);font:inherit;border-radius:10px;padding:20px;overflow:auto;box-shadow:0 16px 48px #00000040}.Bf6_Iq_settingsDialog::backdrop{background:#00000059}.Bf6_Iq_settingsDialog h2{margin:0 0 20px;font-size:16px}.Bf6_Iq_settingsDialog label{margin-bottom:8px;display:block}.Bf6_Iq_settingsDialog input{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2,#d0d7de);width:100%;color:inherit;background:var(--dsw-alias-bg-layer-1,var(--dsw-alias-bg-base,#fff));font:inherit;border-radius:6px;padding:8px}.Bf6_Iq_settingsDialog p{color:var(--dsw-alias-label-secondary,#656d76);margin:8px 0 20px;font-size:12px;line-height:1.6}.Bf6_Iq_settingsActions{justify-content:flex-end;gap:8px;display:flex}.Bf6_Iq_settingsActions .Bf6_Iq_settingsSave{color:#fff;background:var(--dsw-alias-state-link-primary,#0969da)}.Bf6_Iq_settingsDialog fieldset{border:1px solid var(--dsw-alias-border-l2,#d0d7de);border-radius:6px;margin:16px 0;padding:12px}.Bf6_Iq_settingsDialog legend{padding:0 6px;font-weight:600}.Bf6_Iq_settingsDialog label{margin:8px 0}.Bf6_Iq_settingsDialog select{width:100%;margin-top:4px}.Bf6_Iq_settingsDialog small{color:var(--dsw-alias-label-secondary,#656d76);line-height:1.5}.Bf6_Iq_settingsDialog .Bf6_Iq_checkbox{align-items:center;gap:8px;display:flex}.Bf6_Iq_checkbox input{width:auto}.Bf6_Iq_settingsActions{background:var(--dsw-alias-bg-base,#fff);flex-wrap:wrap;padding:12px 0;position:sticky;bottom:-20px}";
		const styleId$5 = "dsh-file-review-tab-multi-git-repository/DiffViewControls.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(styleId$5) + "]") === null) {
			const style = document.createElement("style");
			style.dataset.plugin = "dsh-file-review-tab-multi-git-repository";
			style.dataset.pluginCss = styleId$5;
			style.textContent = css$5;
			document.head.appendChild(style);
		}
		var DiffViewControls_module_css_default = {
			"checkbox": "Bf6_Iq_checkbox",
			"settingsSave": "Bf6_Iq_settingsSave",
			"controls": "Bf6_Iq_controls",
			"settingsDialog": "Bf6_Iq_settingsDialog",
			"settingsActions": "Bf6_Iq_settingsActions"
		};
		//#endregion
		//#region src/client/DiffViewControls.tsx
		let store;
		function viewStore() {
			if (!store) {
				let storage;
				try {
					storage = window.localStorage;
				} catch {}
				store = new DiffViewStore(storage);
			}
			return store;
		}
		function useDiffViewPreferences() {
			const store = viewStore();
			return (0, react.useSyncExternalStore)(store.subscribe, store.getSnapshot, store.getSnapshot);
		}
		function DiffViewControls() {
			useReviewLocale();
			const preferences = useDiffViewPreferences();
			const dialog = (0, react.useRef)(null);
			const titleId = (0, react.useId)();
			const inputId = (0, react.useId)();
			const hintId = (0, react.useId)();
			const [count, setCount] = (0, react.useState)(String(preferences.contextExpansionLines));
			const [draft, setDraft] = (0, react.useState)(preferences);
			const [storageError, setStorageError] = (0, react.useState)(false);
			const patch = (value) => setDraft((current) => ({
				...current,
				...value
			}));
			const openSettings = () => {
				setCount(String(preferences.contextExpansionLines));
				setDraft(preferences);
				setStorageError(false);
				dialog.current?.showModal();
			};
			const saveSettings = (event) => {
				event.preventDefault();
				const lines = Number(count);
				if (!Number.isSafeInteger(lines) || lines < 1) return;
				const store = viewStore();
				store.set({
					...draft,
					contextExpansionLines: lines
				});
				if (store.storageError) setStorageError(true);
				else dialog.current?.close();
			};
			const resetSettings = () => {
				setDraft(DEFAULT_DIFF_VIEW);
				setCount(String(DEFAULT_DIFF_VIEW.contextExpansionLines));
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: DiffViewControls_module_css_default.controls,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						"aria-label": t("diffSettings"),
						title: t("diffSettings"),
						"aria-haspopup": "dialog",
						onClick: openSettings,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
							viewBox: "0 0 16 16",
							"aria-hidden": "true",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m6.5 2 .5-1h2l.5 1 1.5.9 1.2-.1 1 1.7-.7 1v1.8l.7 1-1 1.7-1.2-.1-1.5.9-.5 1H7l-.5-1-1.5-.9-1.2.1-1-1.7.7-1V5.5l-.7-1 1-1.7 1.2.1Z" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
								cx: "8",
								cy: "6.4",
								r: "2"
							})]
						}), t("diffSettings")]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dialog", {
						ref: dialog,
						className: DiffViewControls_module_css_default.settingsDialog,
						"aria-labelledby": titleId,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
							onSubmit: saveSettings,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
									id: titleId,
									children: t("diffSettings")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
									htmlFor: inputId,
									children: t("diffContextExpansionLines")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									id: inputId,
									type: "number",
									min: "1",
									max: Number.MAX_SAFE_INTEGER,
									step: "1",
									required: true,
									autoFocus: true,
									value: count,
									"aria-describedby": hintId,
									onChange: (event) => {
										setCount(event.target.value);
									}
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									id: hintId,
									children: t("diffContextExpansionHint")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("fieldset", { children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("legend", { children: t("appearance") }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [t("diffFontSize"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										type: "number",
										min: "10",
										max: "24",
										step: "1",
										required: true,
										value: draft.fontSize,
										onChange: (event) => patch({ fontSize: Number(event.target.value) })
									})] }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [t("diffFontFamily"), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
										value: draft.fontFamily,
										onChange: (event) => patch({ fontFamily: event.target.value }),
										children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
												value: "mono",
												children: t("diffSystemMono")
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
												value: "consolas",
												children: "Consolas"
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
												value: "cascadia",
												children: "Cascadia Code"
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
												value: "jetbrains",
												children: "JetBrains Mono"
											})
										]
									})] }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: t("diffFontHint") }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [t("diffLineHeight"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										type: "number",
										min: "1.2",
										max: "2.5",
										step: "0.1",
										required: true,
										value: draft.lineHeight,
										onChange: (event) => patch({ lineHeight: Number(event.target.value) })
									})] }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [t("diffTabSize"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										type: "number",
										min: "1",
										max: "8",
										step: "1",
										required: true,
										value: draft.tabSize,
										onChange: (event) => patch({ tabSize: Number(event.target.value) })
									})] }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [t("diffColors"), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
										value: draft.colors,
										onChange: (event) => patch({ colors: event.target.value }),
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: "theme",
											children: t("diffThemeColors")
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: "blue-orange",
											children: t("diffAccessibleColors")
										})]
									})] }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [t("diffColorStrength"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										type: "number",
										min: "5",
										max: "40",
										step: "1",
										required: true,
										value: draft.colorStrength,
										onChange: (event) => patch({ colorStrength: Number(event.target.value) })
									})] })
								] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("fieldset", { children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("legend", { children: t("externalEditor") }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [t("editorPath"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										type: "text",
										maxLength: 4096,
										value: draft.editorPath,
										placeholder: t("editorAutoDetect"),
										onChange: (event) => patch({ editorPath: event.target.value })
									})] }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: t("editorPathHint") })
								] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("fieldset", { children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("legend", { children: t("diffShortcuts") }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [t("diffSearch"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("select", {
										value: draft.searchShortcut,
										onChange: (event) => patch({ searchShortcut: event.target.value }),
										children: [
											"mod+f",
											"mod+shift+f",
											"mod+alt+f"
										].map((value) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value,
											children: value.replace("mod", "Ctrl/Cmd")
										}, value))
									})] }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [t("diffChangeNavigation"), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
										value: draft.changeShortcut,
										onChange: (event) => patch({ changeShortcut: event.target.value }),
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: "mod+arrow",
											children: "Ctrl/Cmd + ↑ / ↓"
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: "alt+arrow",
											children: "Alt + ↑ / ↓"
										})]
									})] }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: t("diffScopedShortcuts") })
								] }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: DiffViewControls_module_css_default.checkbox,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: draft.discussionEnabled,
										onChange: (event) => patch({ discussionEnabled: event.target.checked })
									}), t("discussionEnabled")]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: DiffViewControls_module_css_default.checkbox,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: draft.virtualize,
										onChange: (event) => patch({ virtualize: event.target.checked })
									}), t("diffVirtualize")]
								}),
								storageError && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									role: "alert",
									children: t("diffPreferencesStorageError")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: DiffViewControls_module_css_default.settingsActions,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: resetSettings,
											children: t("diffReset")
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => {
												dialog.current?.close();
											},
											children: t("projectCancel")
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											type: "submit",
											className: DiffViewControls_module_css_default.settingsSave,
											children: t("diffSettingsSave")
										})
									]
								})
							]
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
						"aria-label": t("diffLayout"),
						title: t("diffLayout"),
						value: preferences.layout,
						onChange: (event) => {
							viewStore().set({ layout: event.target.value });
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
							value: "split",
							children: t("diffSplit")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
							value: "unified",
							children: t("diffUnified")
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						"aria-pressed": preferences.wrap,
						title: t("diffWrap"),
						onClick: () => {
							viewStore().set({ wrap: !preferences.wrap });
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
							viewBox: "0 0 16 16",
							"aria-hidden": "true",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M2 3h12M2 7h9a3 3 0 0 1 0 6H7m2-2-2 2 2 2M2 11h2" })
						}), t("diffWrap")]
					})
				]
			});
		}
		//#endregion
		//#region src/client/message-locales.ts
		/** Host diagnostics stay language-neutral on the wire and translate at render. */
		const diagnostics = {
			"symbolic links are not supported": "不支持符号链接",
			"path is not a regular file": "路径不是普通文件",
			"resolved path is outside the configured project repositories": "解析后的路径不在已配置的工程仓库范围内",
			"file is not valid UTF-8 text": "文件不是有效的 UTF-8 文本",
			"change has no complete reversible diff": "此更改没有完整的可还原差异",
			"current content does not match the recorded change": "当前文件内容与记录的更改不一致",
			"file changed while the operation was being prepared": "准备操作期间文件内容发生了变化",
			"session has no workspace directory": "当前会话没有工作区目录",
			"Project root does not belong to this session": "工程根目录不属于当前会话",
			"Enable this project before adding temporary repositories": "请先启用该工程，再添加临时仓库",
			"Temporary repositories must use absolute paths outside the project": "临时仓库必须使用工程目录外的绝对路径",
			"This repository has no commits": "此仓库尚无提交",
			"Select a comparison branch": "请选择用于比较的分支",
			"Invalid commit": "无效的提交",
			"Invalid repository file path": "无效的仓库文件路径",
			"Incomplete Git name-status output": "Git 文件状态输出不完整",
			"File resolves outside the repository": "文件解析后的路径位于仓库外",
			"Repository is outside this session": "仓库不在当前会话的范围内",
			"This file changed; refresh the review": "此文件已发生变化，请刷新审查",
			"Binary, symbolic link, or file exceeds 2 MiB": "二进制文件、符号链接或文件超过 2 MiB",
			"Rename or file mode change; no text difference": "仅重命名或文件权限变化，没有文本差异",
			"Project configuration file changed; reload before saving": "工程配置文件已发生变化，请重新加载后再保存",
			"Native project settings are unavailable": "宿主工程设置服务不可用",
			"JSON must contain an array or a repositories array": "JSON 必须包含数组或 repositories 数组",
			"Supported formats: .ini, .gitmodules, .json": "支持的格式：.ini、.gitmodules、.json",
			"No section with a path field was found": "未找到包含 path 字段的节",
			"Project root must be an absolute path": "工程根目录必须为绝对路径",
			"Project root is not a directory": "工程根路径不是目录",
			"Configuration file exceeds 1 MiB": "配置文件超过 1 MiB",
			"Configuration file exceeds 512 repositories": "配置文件包含超过 512 个仓库",
			"Repository path is not a directory": "仓库路径不是目录",
			"File review Remote is unavailable": "文件审查远程服务不可用",
			"Session is unavailable": "会话不可用",
			"Host file toggle is unavailable": "宿主文件撤销与重新应用服务不可用",
			"Review conversation is unavailable": "文件审查所属会话不可用"
		};
		const copyKeys = /* @__PURE__ */ new Map();
		for (const key of Object.keys(en$1)) {
			copyKeys.set(en$1[key], key);
			copyKeys.set(zh$1[key], key);
		}
		const englishDiagnostics = new Map(Object.entries(diagnostics).map(([english, chinese]) => [chinese, english]));
		/** Preserve paths, Git output and unrecognized technical details verbatim. */
		function localizeReviewMessage(message) {
			const key = copyKeys.get(message);
			if (key) return t(key);
			if (getLocaleSnapshot() === "en") return englishDiagnostics.get(message) ?? message;
			if (diagnostics[message]) return diagnostics[message];
			const limit = /^Review exceeds (\d+) files; select a smaller scope$/.exec(message);
			if (limit) return `审查文件数超过 ${limit[1]}，请选择更小的范围`;
			const repository = /^repository (\d+) has no path$/.exec(message);
			if (repository) return `第 ${repository[1]} 个仓库没有路径`;
			const file = /^(.+)( must be a regular file| exceeds 1 MiB)$/.exec(message);
			if (file) return file[1] + (file[2] === " must be a regular file" ? " 必须为普通文件" : " 超过 1 MiB");
			const separator = message.lastIndexOf(": ");
			if (separator >= 0) {
				const suffix = message.slice(separator + 2);
				const localized = localizeReviewMessage(suffix);
				if (localized !== suffix) return message.slice(0, separator + 2) + localized;
			}
			return message;
		}
		//#endregion
		//#region src/client/ReviewComments.tsx
		/** Compose draft/discussion stores with the toolbar; card rendering and request handling live separately. */
		function ReviewCommentsProvider({ ctx, sessionId, children, controls }) {
			useReviewLocale();
			const store = (0, react.useMemo)(() => commentStoreFor(sessionId), [sessionId]);
			const snapshot = (0, react.useSyncExternalStore)(store.subscribe, store.getSnapshot, store.getSnapshot);
			const preferences = useDiffViewPreferences();
			const discussionStore = (0, react.useMemo)(() => discussionStoreFor(sessionId), [sessionId]);
			const discussions = (0, react.useSyncExternalStore)(discussionStore.subscribe, discussionStore.getSnapshot, discussionStore.getSnapshot);
			const [composer, setComposer] = (0, react.useState)(null);
			const [open, setOpen] = (0, react.useState)(false);
			const [discussionOpen, setDiscussionOpen] = (0, react.useState)(false);
			const [notice, setNotice] = (0, react.useState)(null);
			useReviewDiscussionEvents(ctx, sessionId, discussionStore);
			useAdmittedReviewComments(discussions, store);
			const start = (anchor, placement, comment, discussionId) => {
				if (snapshot.busy) return;
				setComposer({
					anchor,
					placement,
					id: comment?.id,
					text: comment?.text ?? "",
					discussionId: discussionId ?? comment?.discussionId
				});
				setOpen(placement === "list");
				setNotice(null);
			};
			const submit = async () => {
				if (composer || snapshot.busy) return;
				setNotice(null);
				try {
					if (await store.submit((comments) => submitReviewCommentBatch({
						ctx,
						sessionId,
						comments,
						discussions: discussions.records,
						discussionStore,
						discussionEnabled: preferences.discussionEnabled
					}))) {
						setNotice({ key: "commentSent" });
						setOpen(false);
					}
				} catch (cause) {
					setNotice({
						key: "commentSendFailed",
						details: cause instanceof Error ? cause.message : String(cause)
					});
				}
			};
			const toggleComments = () => {
				setOpen(!open);
				if (!open && composer) setComposer({
					...composer,
					placement: "list"
				});
			};
			const hasUnreadDiscussion = discussions.records.some((discussion) => (discussion.replies.at(-1)?.seq ?? 0) > discussion.readSeq);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(ReviewCommentsContext.Provider, {
				value: {
					snapshot,
					store,
					composer,
					setComposer,
					start,
					discussions,
					discussionStore,
					ctx,
					sessionId
				},
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: ReviewComments_module_css_default.toolbar,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: ReviewComments_module_css_default.button,
								"aria-expanded": open,
								onClick: toggleComments,
								children: t("commentPending", { count: snapshot.comments.length })
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: `${ReviewComments_module_css_default.button} ${ReviewComments_module_css_default.primary}`,
								disabled: !snapshot.comments.length || snapshot.busy || composer !== null,
								title: composer ? t("commentFinishEditing") : t("commentSendHint"),
								onClick: () => {
									submit();
								},
								children: t(snapshot.busy ? "commentSending" : "commentSubmit")
							}),
							composer && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: t("commentFinishEditing") }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: ReviewComments_module_css_default.button,
								"aria-expanded": discussionOpen,
								onClick: () => setDiscussionOpen(!discussionOpen),
								children: [t("discussionList", { count: discussions.records.length }), hasUnreadDiscussion ? " •" : ""]
							}),
							controls
						]
					}),
					notice && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
						className: ReviewComments_module_css_default.notice,
						role: "status",
						children: [t(notice.key), notice.details ? `: ${localizeReviewMessage(notice.details)}` : ""]
					}),
					snapshot.storageError && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: ReviewComments_module_css_default.notice,
						role: "alert",
						children: t("commentStorageError")
					}),
					discussions.storageError && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: ReviewComments_module_css_default.notice,
						role: "alert",
						children: t("discussionStorageError")
					}),
					discussionOpen && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: ReviewComments_module_css_default.summary,
						"aria-label": t("discussionList", { count: discussions.records.length }),
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: t("discussionHint") }),
							!discussions.records.length && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("discussionEmpty") }),
							[...discussions.records].reverse().map((discussion) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(DiscussionCard, { discussion }, discussion.id))
						]
					}),
					open && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: ReviewComments_module_css_default.summary,
						"aria-label": t("commentList"),
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: t("commentDraftHint") }),
							snapshot.comments.length === 0 && !composer && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("commentEmpty") }),
							snapshot.comments.map((comment) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CommentCard, {
								comment,
								placement: "list",
								showFile: true
							}, comment.id)),
							composer?.placement === "list" && !composer.id && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CommentEditor, {}, commentAnchorKey(composer.anchor))
						]
					}),
					children
				]
			});
		}
		//#endregion
		//#region src/client/DiffCode.tsx
		/** React text nodes retain exact whitespace and escape HTML; search marks wrap syntax spans. */
		function DiffCode({ text, tokens = [], matches = [], active }) {
			let tokenIndex = 0;
			const renderSyntaxRange = (start, end) => {
				const parts = [];
				let cursor = start;
				while (cursor < end) {
					while (tokenIndex < tokens.length && tokens[tokenIndex].end <= cursor) tokenIndex++;
					const token = tokens[tokenIndex];
					if (!token || token.start >= end) {
						parts.push(text.slice(cursor, end));
						break;
					}
					if (token.start > cursor) {
						parts.push(text.slice(cursor, token.start));
						cursor = token.start;
					}
					const next = Math.min(end, token.end);
					parts.push(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: UnifiedDiff_module_css_default[`syntax_${token.kind}`],
						"data-syntax": token.kind,
						children: text.slice(cursor, next)
					}, `${cursor}:${next}`));
					cursor = next;
				}
				return parts;
			};
			const parts = [];
			let cursor = 0;
			for (const match of matches) {
				parts.push(...renderSyntaxRange(cursor, match.start));
				parts.push(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("mark", {
					"data-search-match": match.id,
					className: `${UnifiedDiff_module_css_default.searchMatch} ${match.id === active ? UnifiedDiff_module_css_default.searchActive : ""}`,
					children: renderSyntaxRange(match.start, match.end)
				}, match.id));
				cursor = match.end;
			}
			parts.push(...renderSyntaxRange(cursor, text.length));
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: parts });
		}
		//#endregion
		//#region src/client/diff-highlight.ts
		const HIGHLIGHT_CHARACTER_LIMIT = 5e5;
		const cppKeywords = new Set("alignas alignof asm auto bool break case catch char class const constexpr consteval constinit continue decltype default delete do double else enum explicit export extern false float for friend goto if inline int long mutable namespace new noexcept nullptr operator override private protected public register reinterpret_cast return short signed sizeof static static_assert static_cast struct switch template this thread_local throw true try typedef typename union unsigned using virtual void volatile wchar_t while".split(" "));
		const jsKeywords = new Set("async await break case catch class const continue debugger default delete do else export extends false finally for from function if import in instanceof let new null of return static super switch this throw true try typeof undefined var void while with yield".split(" "));
		const tsKeywords = /* @__PURE__ */ new Set([...jsKeywords, ..."abstract any as asserts bigint boolean declare enum implements infer interface is keyof module namespace never number private protected public readonly require satisfies string symbol type unknown".split(" ")]);
		const jsonKeywords = /* @__PURE__ */ new Set([
			"true",
			"false",
			"null"
		]);
		const pythonKeywords = new Set("False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield match case".split(" "));
		const identifierStart = /[A-Za-z_$]/;
		const identifierPart = /[A-Za-z0-9_$]/;
		const numberPattern = /(?:0[xob][\da-f_]+|(?:\d[\d_]*(?:\.[\d_]*)?|\.\d[\d_]*)(?:e[+-]?[\d_]+)?)[a-z]*/iy;
		function keywordsForLanguage(language) {
			switch (language) {
				case "cpp": return cppKeywords;
				case "typescript": return tsKeywords;
				case "json": return jsonKeywords;
				case "python": return pythonKeywords;
				default: return jsKeywords;
			}
		}
		/** Skip a closing delimiter preceded by an odd number of backslashes. */
		function findStringEnd(text, from, delimiter, escapes) {
			let end = text.indexOf(delimiter, from);
			while (escapes && end >= 0) {
				let backslashes = 0;
				for (let index = end - 1; index >= 0 && text[index] === "\\"; index--) backslashes++;
				if (backslashes % 2 === 0) break;
				end = text.indexOf(delimiter, end + 1);
			}
			return end;
		}
		function resetSyntaxState(state) {
			delete state.quote;
			delete state.blockComment;
			delete state.rawClose;
			delete state.fence;
		}
		function highlightMarkdownSource(text, state, addToken) {
			const fence = /^\s*(`{3,}|~{3,})/.exec(text)?.[1];
			if (state.fence) {
				addToken(0, text.length, "string");
				if (fence && fence[0] === state.fence[0] && fence.length >= state.fence.length) delete state.fence;
				return;
			}
			if (fence) {
				state.fence = fence;
				addToken(0, text.length, "string");
				return;
			}
			if (/^\s{0,3}#{1,6}\s/.test(text)) {
				addToken(0, text.length, "heading");
				return;
			}
			for (const match of text.matchAll(/`[^`]+`|\*\*[^*]+\*\*|\[[^\]\n]+\]\([^\)\n]*\)/g)) addToken(match.index, match.index + match[0].length, "string");
		}
		function diffLanguage(path) {
			const extension = path.toLowerCase().split(/[\\/]/).at(-1)?.split(".").at(-1);
			if ([
				"c",
				"h",
				"cc",
				"hh",
				"cpp",
				"hpp",
				"cxx",
				"hxx",
				"c++"
			].includes(extension ?? "")) return "cpp";
			if ([
				"js",
				"jsx",
				"mjs",
				"cjs"
			].includes(extension ?? "")) return "javascript";
			if ([
				"ts",
				"tsx",
				"mts",
				"cts"
			].includes(extension ?? "")) return "typescript";
			if (["json", "jsonc"].includes(extension ?? "")) return "json";
			if ([
				"py",
				"pyw",
				"pyi"
			].includes(extension ?? "")) return "python";
			if ([
				"md",
				"markdown",
				"mdown"
			].includes(extension ?? "")) return "markdown";
			return "text";
		}
		/** Bounded, linear basic lexer. Tokens only describe ranges; recorded text is never rewritten. */
		function highlightLine(text, language, state) {
			if (language === "text") return [];
			if (text.length > 16e3) {
				resetSyntaxState(state);
				return [];
			}
			const tokens = [];
			const addToken = (start, end, kind) => {
				if (end > start) tokens.push({
					start,
					end,
					kind
				});
			};
			if (language === "markdown") {
				highlightMarkdownSource(text, state, addToken);
				return tokens;
			}
			const keywords = keywordsForLanguage(language);
			let cursor = 0;
			while (cursor < text.length) {
				const start = cursor;
				if (state.blockComment) {
					const closingIndex = text.indexOf("*/", cursor);
					cursor = closingIndex < 0 ? text.length : closingIndex + 2;
					if (closingIndex >= 0) delete state.blockComment;
					addToken(start, cursor, "comment");
					continue;
				}
				if (state.rawClose) {
					const closingIndex = findStringEnd(text, cursor, state.rawClose, language === "python");
					cursor = closingIndex < 0 ? text.length : closingIndex + state.rawClose.length;
					if (closingIndex >= 0) delete state.rawClose;
					addToken(start, cursor, "string");
					continue;
				}
				if (language === "python" && (text.startsWith("\"\"\"", cursor) || text.startsWith("'''", cursor))) {
					state.rawClose = text.slice(cursor, cursor + 3);
					cursor += 3;
					const closingIndex = findStringEnd(text, cursor, state.rawClose, true);
					cursor = closingIndex < 0 ? text.length : closingIndex + 3;
					if (closingIndex >= 0) delete state.rawClose;
					addToken(start, cursor, "string");
					continue;
				}
				const startsQuotedString = text[cursor] === "\"" || text[cursor] === "'" || (language === "javascript" || language === "typescript") && text[cursor] === "`";
				const quote = state.quote ?? (startsQuotedString ? text[cursor] : void 0);
				if (quote) {
					if (!state.quote) cursor++;
					state.quote = quote;
					while (cursor < text.length) {
						const character = text[cursor++];
						if (character === "\\") {
							cursor = Math.min(text.length, cursor + 1);
							continue;
						}
						if (character === quote) {
							delete state.quote;
							break;
						}
					}
					const kind = language === "json" && /^\s*:/.test(text.slice(cursor)) ? "property" : "string";
					addToken(start, cursor, kind);
					if (state.quote !== "`" && !text.endsWith("\\")) delete state.quote;
					continue;
				}
				if (language === "python" ? text[cursor] === "#" : text.startsWith("//", cursor)) {
					addToken(cursor, text.length, "comment");
					break;
				}
				if (language !== "python" && text.startsWith("/*", cursor)) {
					state.blockComment = true;
					continue;
				}
				if (language === "cpp" && text.startsWith("R\"", cursor)) {
					const raw = /^R"([^\s()\\]{0,16})\(/.exec(text.slice(cursor));
					if (raw) {
						state.rawClose = `)${raw[1]}"`;
						cursor += raw[0].length;
						const closingIndex = text.indexOf(state.rawClose, cursor);
						cursor = closingIndex < 0 ? text.length : closingIndex + state.rawClose.length;
						if (closingIndex >= 0) delete state.rawClose;
						addToken(start, cursor, "string");
						continue;
					}
				}
				if (identifierStart.test(text[cursor])) {
					while (cursor < text.length && identifierPart.test(text[cursor])) cursor++;
					if (keywords.has(text.slice(start, cursor))) addToken(start, cursor, "keyword");
					continue;
				}
				if (/\d/.test(text[cursor]) || text[cursor] === "." && /\d/.test(text[cursor + 1] ?? "")) {
					numberPattern.lastIndex = cursor;
					const match = numberPattern.exec(text);
					if (match) {
						cursor += match[0].length;
						addToken(start, cursor, "number");
						continue;
					}
				}
				cursor++;
			}
			return tokens;
		}
		/** Independent old/new lexical states handle edits that change multiline comment boundaries. */
		function highlightDiff(diffs, hunks) {
			const result = /* @__PURE__ */ new Map();
			let remainingCharacters = HIGHLIGHT_CHARACTER_LIMIT;
			hunks.forEach((hunk, index) => {
				const language = diffLanguage(diffs[index]?.path ?? "");
				if (language === "text") return;
				const hunkCharacters = hunk.lines.reduce((sum, line) => sum + line.text.length, 0);
				if (hunkCharacters > remainingCharacters) return;
				remainingCharacters -= hunkCharacters;
				const oldState = {};
				const newState = {};
				for (const line of hunk.lines) result.set(line, {
					old: line.oldNumber === null ? [] : highlightLine(line.text, language, oldState),
					next: line.newNumber === null ? [] : highlightLine(line.text, language, newState)
				});
			});
			return result;
		}
		//#endregion
		//#region src/client/diff-navigation.ts
		/** Identities use the recorded hunk, never a potentially repeated line number. */
		function indexDiff(hunks, contextLines) {
			const lines = [];
			const byLine = /* @__PURE__ */ new Map();
			const changes = [];
			hunks.forEach((hunk, hunkIndex) => {
				let first;
				let last;
				const finish = () => {
					if (first && last) changes.push({
						id: first.id,
						first,
						last
					});
				};
				hunk.lines.forEach((line, lineIndex) => {
					const location = {
						id: `${hunkIndex}:${lineIndex}`,
						hunkIndex,
						lineIndex,
						line
					};
					lines.push(location);
					byLine.set(line, location);
					if (line.kind === "context") return;
					if (last && lineIndex - last.lineIndex > 2 * contextLines + 1) {
						finish();
						first = void 0;
					}
					first ??= location;
					last = location;
				});
				finish();
			});
			return {
				lines,
				byLine,
				changes
			};
		}
		function stepDiffIndex(current, direction, count) {
			if (count === 0) return -1;
			if (current < 0 || current >= count) return direction === 1 ? 0 : count - 1;
			return (current + direction + count) % count;
		}
		/** Search only reveals a small window around the recorded line, including inside a large gap. */
		function revealDiffLocation(hunks, expansions, location, context = 3) {
			const gap = hunks[location.hunkIndex]?.rows.find((row) => row.kind === "gap" && row.lines.includes(location.line));
			if (!gap) return expansions;
			const index = gap.lines.indexOf(location.line);
			const result = new Map(expansions);
			const previous = expansions.get(gap.id) ?? {
				before: 0,
				after: 0
			};
			result.set(gap.id, {
				...previous,
				revealed: [...previous.revealed ?? [], {
					start: Math.max(0, index - context),
					end: Math.min(gap.lines.length, index + context + 1)
				}]
			});
			return result;
		}
		/** Expand the interval shown beside a search window, without revealing unrelated code. */
		function expandDiffGapSlice(gap, previous, count, direction) {
			const start = gap.offset ?? 0;
			const end = start + gap.lines.length;
			const take = Math.min(count, gap.lines.length);
			const fromEnd = direction === "up" || direction === void 0 && gap.position === "leading";
			const fromStart = direction === "down" || direction === void 0 && gap.position === "trailing";
			const ranges = fromEnd ? [{
				start: end - take,
				end
			}] : fromStart ? [{
				start,
				end: start + take
			}] : [{
				start,
				end: start + Math.ceil(take / 2)
			}, {
				start: end - Math.floor(take / 2),
				end
			}];
			return {
				...previous,
				revealed: [...previous.revealed ?? [], ...ranges]
			};
		}
		function nearestDiffChange(changes, location) {
			let nearest = -1;
			let distance = Infinity;
			changes.forEach((change, index) => {
				if (change.first.hunkIndex !== location.hunkIndex) return;
				const next = Math.max(change.first.lineIndex - location.lineIndex, location.lineIndex - change.last.lineIndex, 0);
				if (next < distance) {
					nearest = index;
					distance = next;
				}
			});
			return nearest;
		}
		const word = /[\p{L}\p{N}\p{M}_$]/u;
		function wordBefore(text, index) {
			return word.test(Array.from(text.slice(Math.max(0, index - 2), index)).at(-1) ?? "");
		}
		function wordAfter(text, index) {
			return word.test(Array.from(text.slice(index, index + 2))[0] ?? "");
		}
		/** Literal Unicode search: regex metacharacters in user input are always escaped. */
		function searchDiff(lines, query, options) {
			if (!query) return {
				matches: [],
				truncated: false
			};
			const pattern = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), options.caseSensitive ? "gu" : "giu");
			const matches = [];
			for (const location of lines) {
				const line = location.line;
				if (options.side === "old" && line.oldNumber === null || options.side === "new" && line.newNumber === null) continue;
				const side = options.side === "old" || line.newNumber === null ? "old" : "new";
				pattern.lastIndex = 0;
				for (let match = pattern.exec(line.text); match; match = pattern.exec(line.text)) {
					const start = match.index;
					const end = start + match[0].length;
					if (options.wholeWord && (wordBefore(line.text, start) || wordAfter(line.text, end))) continue;
					if (matches.length === 1e4) return {
						matches,
						truncated: true
					};
					matches.push({
						id: `${location.id}:${side}:${start}`,
						location,
						side,
						start,
						end
					});
				}
			}
			return {
				matches,
				truncated: false
			};
		}
		const referenceTextFits = (text) => {
			return text.length <= 65536 && new TextEncoder().encode(text).length <= 65536;
		};
		//#endregion
		//#region src/client/review-reference.ts
		/** Select complete, contiguous original rows on one side and in one hunk/version. */
		function rangeReference(target, locations, start, end, side, revision, sourceKey) {
			if (start.hunkIndex !== end.hunkIndex) return null;
			const first = Math.min(start.lineIndex, end.lineIndex), last = Math.max(start.lineIndex, end.lineIndex);
			const number = (item) => side === "old" ? item.line.oldNumber : item.line.newNumber;
			const same = locations.filter((item) => item.hunkIndex === start.hunkIndex && number(item) !== null);
			const rows = same.filter((item) => item.lineIndex >= first && item.lineIndex <= last);
			if (!rows.length || number(start) === null || number(end) === null) return null;
			const line = number(rows[0]), endLine = number(rows.at(-1));
			if (rows.some((row, index) => number(row) !== line + index)) return null;
			const quote = rows.map((row) => row.line.text).join("\n");
			if (!referenceTextFits(quote)) return null;
			const from = same.indexOf(rows[0]), to = same.indexOf(rows.at(-1));
			const adjacent = (items) => items.map((item) => item.line.text).join("\n");
			const before = adjacent(same.slice(Math.max(0, from - 2), from)), after = adjacent(same.slice(to + 1, to + 3));
			if (!referenceTextFits(before) || !referenceTextFits(after)) return null;
			return {
				...target,
				side,
				line,
				endLine,
				quote,
				before,
				after,
				revision,
				sourceKey
			};
		}
		/** Verbatim text + explicit provenance. This only copies; it never edits the composer. */
		function formatReviewReference(reference) {
			const fence = "`".repeat(Math.max(3, ...[...reference.quote.matchAll(/`+/g)].map((match) => match[0].length + 1)));
			return `${reference.absolutePath}:${reference.line}-${reference.endLine}\n[${reference.repositoryName}] ${reference.scope}${reference.turn === void 0 ? "" : ` · turn ${reference.turn}`}${reference.ref ? ` · ${reference.ref}` : ""} · ${reference.side} · ${reference.revision}\n${fence}text\n${reference.quote}\n${fence}`;
		}
		//#endregion
		//#region src/client/review-context-selection.ts
		/** Right-clicking inside a range preserves it; other rows start a single-line reference. */
		function contextSelection(current, identity, location, side) {
			return current?.identity === identity && current.side === side && current.start.hunkIndex === location.hunkIndex && location.lineIndex >= Math.min(current.start.lineIndex, current.end.lineIndex) && location.lineIndex <= Math.max(current.start.lineIndex, current.end.lineIndex) ? current : {
				identity,
				start: location,
				end: location,
				side
			};
		}
		//#endregion
		//#region src/client/review-navigation.tsx
		const FileNavigation = (0, react.createContext)(null);
		/** One navigation capability covers file headers, comments and selection fallbacks. */
		function ReviewNavigationProvider({ openFile, children }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FileNavigation.Provider, {
				value: openFile,
				children
			});
		}
		function useReviewFileOpener() {
			return (0, react.useContext)(FileNavigation) ?? (() => {
				throw new Error(t("sidebarUnavailable"));
			});
		}
		//#endregion
		//#region src/client/use-diff-selection.ts
		/** Own one file's reference, menu focus and asynchronous editor feedback. */
		function useDiffSelection({ diffs, identity, revision, index, reviewTarget, isSplit, editorPath, interactions, container, lineElements }) {
			const openFile = useReviewFileOpener();
			const [selection, setSelection] = (0, react.useState)(null);
			const selected = selection?.identity === identity ? selection : null;
			const reference = (0, react.useMemo)(() => {
				if (!selected || !reviewTarget) return null;
				return rangeReference(reviewTarget, index.lines, selected.start, selected.end, selected.side, revision, `${identity}:hunk:${selected.start.hunkIndex}`);
			}, [
				selected,
				reviewTarget,
				index,
				revision,
				identity
			]);
			const [referenceNotice, setReferenceNotice] = (0, react.useState)(null);
			const [editorResult, setEditorResult] = (0, react.useState)(null);
			const [editorBusy, setEditorBusy] = (0, react.useState)(false);
			const [menuPoint, setMenuPoint] = (0, react.useState)(null);
			const menuOrigin = (0, react.useRef)(null);
			const menuOwner = (0, react.useRef)(null);
			const referenceKey = reference ? JSON.stringify([
				identity,
				reference.side,
				reference.line,
				reference.endLine,
				reference.sourceKey
			]) : "";
			const latestReferenceKey = (0, react.useRef)(referenceKey);
			latestReferenceKey.current = referenceKey;
			const latestIdentity = (0, react.useRef)(identity);
			latestIdentity.current = identity;
			const clearFeedback = () => {
				setReferenceNotice(null);
				setEditorResult(null);
			};
			const invalidateSelection = () => {
				setSelection(null);
				setReferenceNotice("referenceInvalid");
				setEditorResult(null);
			};
			(0, react.useEffect)(() => {
				setSelection(null);
				setReferenceNotice(null);
				setEditorResult(null);
				setMenuPoint(null);
			}, [identity]);
			(0, react.useEffect)(() => {
				setMenuPoint(null);
			}, [isSplit]);
			const closeMenu = (0, react.useCallback)(() => {
				const active = document.activeElement;
				const menuHasFocus = active instanceof Element && menuOwner.current?.contains(active);
				setMenuPoint(null);
				if (!menuHasFocus) return;
				queueMicrotask(() => {
					if (document.activeElement === document.body || document.activeElement === active) menuOrigin.current?.focus({ preventScroll: true });
				});
			}, []);
			(0, react.useEffect)(() => {
				if (!menuPoint) return;
				const frame = requestAnimationFrame(() => {
					menuOwner.current?.querySelector("button:not(:disabled)")?.focus({ preventScroll: true });
				});
				const dismiss = (event) => {
					if (!(event.type === "scroll" && event.target instanceof Element && menuOwner.current && event.target.closest("[role=\"menu\"]")?.contains(menuOwner.current))) closeMenu();
				};
				window.addEventListener("scroll", dismiss, true);
				window.addEventListener("resize", dismiss);
				window.addEventListener("blur", dismiss);
				return () => {
					cancelAnimationFrame(frame);
					window.removeEventListener("scroll", dismiss, true);
					window.removeEventListener("resize", dismiss);
					window.removeEventListener("blur", dismiss);
				};
			}, [menuPoint, closeMenu]);
			const contextRow = (target) => {
				if (!(target instanceof Element)) return null;
				if (target.closest("input, textarea, select, [contenteditable=\"true\"], button:not([data-reference-number-side])")) return null;
				const row = target.closest("[data-diff-line-id]");
				if (!row || row.closest("[data-diff]") !== container.current) return null;
				const location = index.lines.find((item) => item.id === row.dataset.diffLineId);
				const side = target.closest("[data-reference-number-side]")?.dataset.referenceNumberSide ?? row.dataset.referenceSide;
				return location && (side === "old" || side === "new") ? {
					row,
					location,
					side
				} : null;
			};
			const showMenu = (location, side, row, x, y) => {
				if (!reviewTarget) return false;
				const next = contextSelection(selected, identity, location, side);
				if (!rangeReference(reviewTarget, index.lines, next.start, next.end, side, revision, identity)) return false;
				menuOrigin.current = row.querySelector(`[data-reference-number-side="${side}"]`) ?? container.current;
				setSelection(next);
				clearFeedback();
				setMenuPoint({
					x,
					y
				});
				return true;
			};
			const showKeyboardMenu = (target) => {
				const clicked = contextRow(target);
				const location = clicked?.location ?? selected?.end;
				const side = clicked?.side ?? selected?.side;
				const row = clicked?.row ?? (location ? lineElements.current?.get(`${location.id}:${isSplit ? side : "unified"}`) : void 0);
				if (!location || !side || !row) return false;
				const rect = row.getBoundingClientRect();
				const x = Math.max(12, rect.left + 40);
				const y = Math.min(window.innerHeight - 12, Math.max(12, rect.bottom));
				return showMenu(location, side, row, x, y);
			};
			const selectLine = (row, side, extend) => {
				setMenuPoint(null);
				const location = index.byLine.get(row);
				if (extend && selected && selected.side !== side) {
					invalidateSelection();
					return;
				}
				const start = extend && selected?.side === side ? selected.start : location;
				if (!reviewTarget || !rangeReference(reviewTarget, index.lines, start, location, side, revision, identity)) {
					invalidateSelection();
					return;
				}
				setSelection({
					identity,
					start,
					end: location,
					side
				});
				clearFeedback();
			};
			const selectedByDrag = () => {
				const native = window.getSelection();
				if (!native || native.isCollapsed) return;
				const selectedCell = (node) => {
					const element = node instanceof Element ? node : node?.parentElement;
					if (!element?.closest("[data-diff-code]")) return null;
					const row = element.closest("[data-diff-line-id]");
					return row?.closest("[data-diff]") === container.current ? row : null;
				};
				const from = selectedCell(native.anchorNode);
				const to = selectedCell(native.focusNode);
				if (!from || !to) return;
				const start = index.lines.find((item) => item.id === from.dataset.diffLineId);
				const end = index.lines.find((item) => item.id === to.dataset.diffLineId);
				const side = from.dataset.referenceSide;
				const crossesOtherSide = !isSplit && start && end && index.lines.some((item) => {
					const withinSelection = item.hunkIndex === start.hunkIndex && item.lineIndex >= Math.min(start.lineIndex, end.lineIndex) && item.lineIndex <= Math.max(start.lineIndex, end.lineIndex);
					const absentOnSide = side === "new" ? item.line.newNumber === null : item.line.oldNumber === null;
					return withinSelection && absentOnSide;
				});
				if (!reviewTarget || !start || !end || crossesOtherSide || side !== to.dataset.referenceSide || !rangeReference(reviewTarget, index.lines, start, end, side, revision, identity)) {
					invalidateSelection();
					return;
				}
				setSelection({
					identity,
					start,
					end,
					side
				});
				clearFeedback();
				setMenuPoint(null);
			};
			const openSelection = async (allowRelocate = false) => {
				if (!reference || !interactions || editorBusy) return;
				if (reference.side !== "new") {
					setEditorResult({
						state: "unsupported",
						reason: "old"
					});
					return;
				}
				setEditorBusy(true);
				const requestedIdentity = identity;
				const requestedReference = referenceKey;
				const selectedDiff = diffs[selected.start.hunkIndex];
				const fullText = selectedDiff?.newStart === 1 ? selectedDiff.newText : void 0;
				const isCurrentRequest = () => requestedIdentity === latestIdentity.current && requestedReference === latestReferenceKey.current;
				try {
					const result = await reviewLocation(interactions.ctx, interactions.sessionId, {
						...referenceRequest(reference, editorPath, fullText),
						allowRelocate
					});
					if (isCurrentRequest()) setEditorResult(result);
				} catch {
					if (isCurrentRequest()) setEditorResult({ state: "error" });
				} finally {
					setEditorBusy(false);
				}
			};
			const copyReference = async (pathOnly) => {
				if (!reference) return;
				const requestedReference = referenceKey;
				try {
					if (!navigator.clipboard) throw new Error("Clipboard unavailable");
					const text = pathOnly ? `${reference.absolutePath}:${reference.line}-${reference.endLine} (${reference.side})` : formatReviewReference(reference);
					await navigator.clipboard.writeText(text);
					if (requestedReference === latestReferenceKey.current) setReferenceNotice("referenceCopied");
				} catch {
					if (requestedReference === latestReferenceKey.current) setReferenceNotice("referenceCopyFailed");
				}
			};
			const clearSelection = () => {
				closeMenu();
				setSelection(null);
				clearFeedback();
				window.getSelection()?.removeAllRanges();
			};
			const commentSelection = () => {
				if (!reference || !interactions) return;
				setMenuPoint(null);
				interactions.start(reference, "inline");
			};
			const openInternalFile = () => {
				if (!reference || !interactions) return;
				try {
					openFile(reference.absolutePath);
					closeMenu();
				} catch {
					setEditorResult({ state: "error" });
				}
			};
			const rowSelected = (row, targetSide) => {
				if (!reference) return false;
				const location = index.byLine.get(row);
				const number = reference.side === "old" ? row.oldNumber : row.newNumber;
				return selected?.start.hunkIndex === location.hunkIndex && number !== null && number >= reference.line && number <= reference.endLine && (targetSide === "unified" || targetSide === reference.side);
			};
			return {
				reference,
				referenceNotice,
				editorResult,
				editorBusy,
				menuPoint,
				menuOwner,
				closeMenu,
				contextRow,
				showMenu,
				showKeyboardMenu,
				selectLine,
				selectedByDrag,
				openSelection,
				copyReference,
				clearSelection,
				commentSelection,
				openInternalFile,
				rowSelected
			};
		}
		//#endregion
		//#region src/client/unified-diff-controls.tsx
		function DiffToolbar({ preferences, labels, searchButton, searchOpen, toggleSearch, changes, changeIndex, moveChange, selectChange, path, contextExpanded, collapseContext, showCopyButton, copied, copyDiff }) {
			const changeShortcut = preferences.changeShortcut === "mod+arrow" ? "Ctrl/Cmd" : "Alt";
			const language = {
				cpp: "C/C++",
				javascript: "JavaScript",
				typescript: "TypeScript",
				python: "Python 3",
				json: "JSON",
				markdown: "Markdown",
				text: t("diffPlainText")
			}[diffLanguage(path)];
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: UnifiedDiff_module_css_default.unifiedToolbar,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						ref: searchButton,
						type: "button",
						className: UnifiedDiff_module_css_default.toolButton,
						"aria-label": t("diffSearch"),
						"aria-expanded": searchOpen,
						title: `${t("diffSearch")} (${preferences.searchShortcut.replace("mod", "Ctrl/Cmd")})`,
						onClick: toggleSearch,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
							viewBox: "0 0 16 16",
							"aria-hidden": "true",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
								cx: "6.5",
								cy: "6.5",
								r: "4"
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m9.5 9.5 4 4" })]
						}), t("diffSearch")]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: UnifiedDiff_module_css_default.toolButton,
						"aria-label": t("diffPreviousChange"),
						title: `${t("diffPreviousChange")} (${changeShortcut}+↑)`,
						disabled: !changes.length,
						onClick: () => moveChange(-1),
						children: "↑"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
						className: UnifiedDiff_module_css_default.changeSelect,
						"aria-label": t("diffChangeNavigation"),
						value: changeIndex,
						disabled: !changes.length,
						onChange: (event) => selectChange(Number(event.target.value)),
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
							value: -1,
							children: t("diffChangeCount", { count: changes.length })
						}), changes.map((change, number) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
							value: number,
							children: t("diffChangePosition", {
								current: number + 1,
								count: changes.length
							})
						}, change.id))]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: UnifiedDiff_module_css_default.toolButton,
						"aria-label": t("diffNextChange"),
						title: `${t("diffNextChange")} (${changeShortcut}+↓)`,
						disabled: !changes.length,
						onClick: () => moveChange(1),
						children: "↓"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: UnifiedDiff_module_css_default.languageLabel,
						title: t("diffSyntaxLanguage"),
						children: language
					}),
					contextExpanded && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: collapseContext,
						children: labels.collapseContext
					}),
					showCopyButton && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: UnifiedDiff_module_css_default.unifiedCopyButton,
						onClick: copyDiff,
						children: copied ? labels.copied : labels.copy
					})
				]
			});
		}
		function DiffSearchControls({ input, query, setQuery, side, setSide, caseSensitive, toggleCase, wholeWord, toggleWholeWord, matches, truncated, matchIndex, activeMatch, moveMatch, closeSearch }) {
			const status = !query ? t("diffSearchRecorded") : truncated ? t("diffSearchLimited", { count: matches.length }) : t("diffSearchCount", {
				current: matchIndex + 1,
				count: matches.length
			});
			const activeLine = activeMatch?.side === "old" ? activeMatch.location.line.oldNumber : activeMatch?.location.line.newNumber;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: UnifiedDiff_module_css_default.searchToolbar,
				role: "search",
				"aria-label": t("diffSearch"),
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						ref: input,
						type: "search",
						maxLength: 256,
						"aria-label": t("diffSearchQuery"),
						placeholder: t("diffSearchQuery"),
						value: query,
						onChange: (event) => setQuery(event.target.value)
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
						"aria-label": t("diffSearchSide"),
						value: side,
						onChange: (event) => setSide(event.target.value),
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
								value: "both",
								children: t("diffSearchBoth")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
								value: "old",
								children: t("diffOld")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
								value: "new",
								children: t("diffNew")
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						title: t("diffSearchCase"),
						"aria-label": t("diffSearchCase"),
						"aria-pressed": caseSensitive,
						onClick: toggleCase,
						children: "Aa"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						title: t("diffSearchWord"),
						"aria-label": t("diffSearchWord"),
						"aria-pressed": wholeWord,
						onClick: toggleWholeWord,
						children: t("diffSearchWord")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: UnifiedDiff_module_css_default.searchStatus,
						role: "status",
						children: status
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": t("diffSearchPrevious"),
						title: t("diffSearchPrevious"),
						disabled: !matches.length,
						onClick: () => moveMatch(-1),
						children: "↑"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": t("diffSearchNext"),
						title: t("diffSearchNext"),
						disabled: !matches.length,
						onClick: () => moveMatch(1),
						children: "↓"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": t("diffSearchClose"),
						title: t("diffSearchClose"),
						onClick: closeSearch,
						children: "×"
					}),
					activeMatch && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: t(activeMatch.side === "old" ? "commentOldLine" : "commentNewLine", { line: activeLine ?? "" }) })
				]
			});
		}
		function editorResultText(result) {
			return t(result.reason === "old" ? "editorOld" : {
				exact: "referenceExact",
				moved: "editorMoved",
				ambiguous: "editorAmbiguous",
				changed: "editorChanged",
				missing: "editorMissing",
				unsupported: "editorUnsupported",
				started: "editorStarted",
				"editor-missing": "editorUnavailable",
				error: "editorFailed"
			}[result.state], { line: result.line ?? "" });
		}
		/** Display actions without owning selection or request state. */
		function DiffReferenceMenu({ selection, commentEnabled, commentsBusy }) {
			const { reference, referenceNotice, editorResult, editorBusy, menuPoint, menuOwner } = selection;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [reference && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
				open: menuPoint !== null,
				portal: true,
				anchor: null,
				className: UnifiedDiff_module_css_default.referenceMenuAnchor,
				listClassName: UnifiedDiff_module_css_default.referenceMenu,
				getAnchorRect: () => menuPoint ? new DOMRect(menuPoint.x, menuPoint.y, 0, 0) : null,
				onClose: selection.closeMenu,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					ref: menuOwner,
					role: "presentation",
					onContextMenu: (event) => event.preventDefault(),
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", {
							className: UnifiedDiff_module_css_default.referenceMenuHeading,
							children: t("referenceRange", {
								side: t(reference.side === "old" ? "diffOld" : "diffNew"),
								start: reference.line,
								end: reference.endLine
							})
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MenuItemButton, {
							onSelect: () => void selection.copyReference(false),
							children: t("referenceCopy")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MenuItemButton, {
							onSelect: () => void selection.copyReference(true),
							children: t("referenceCopyPath")
						}),
						commentEnabled && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MenuItemButton, {
							disabled: commentsBusy,
							onSelect: selection.commentSelection,
							children: t("referenceComment")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MenuItemButton, {
							disabled: editorBusy,
							onSelect: () => void selection.openSelection(),
							children: t(editorBusy ? "editorOpening" : "editorOpenSelection")
						})] }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MenuItemButton, {
							separatorBefore: true,
							onSelect: selection.clearSelection,
							children: t("referenceClear")
						}),
						referenceNotice && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: UnifiedDiff_module_css_default.referenceNotice,
							role: "status",
							children: t(referenceNotice)
						}),
						editorResult && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: UnifiedDiff_module_css_default.referenceNotice,
							role: "status",
							children: [
								editorResultText(editorResult),
								editorResult.state === "moved" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MenuItemButton, {
									disabled: editorBusy,
									onSelect: () => void selection.openSelection(true),
									children: t("editorConfirmMoved", { line: editorResult.line ?? "" })
								}),
								commentEnabled && editorResult.state !== "started" && editorResult.state !== "missing" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MenuItemButton, {
									onSelect: selection.openInternalFile,
									children: t("editorOpenFile")
								})
							]
						})
					]
				})
			}), referenceNotice === "referenceInvalid" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				className: UnifiedDiff_module_css_default.referenceNotice,
				role: "status",
				children: t(referenceNotice)
			})] });
		}
		//#endregion
		//#region src/client/virtual-diff-model.ts
		function rowOffsets(count, estimate, measured) {
			const offsets = [0];
			for (let index = 0; index < count; index++) offsets.push(offsets[index] + Math.max(1, measured.get(index) ?? estimate));
			return offsets;
		}
		function virtualRange(offsets, top, height, overscan = 250) {
			const count = Math.max(0, offsets.length - 1);
			const at = (value) => {
				let low = 0, high = count;
				while (low < high) {
					const middle = low + high >>> 1;
					if (offsets[middle + 1] < value) low = middle + 1;
					else high = middle;
				}
				return low;
			};
			return {
				start: Math.min(count, at(Math.max(0, top - overscan))),
				end: Math.min(count, at(top + height + overscan) + 1)
			};
		}
		//#endregion
		//#region \0dsh-file-review-tab-multi-git-repository-css:D:\projectZJGG\dsh-file-review-tab-Multi-git-repository\src\client\VirtualDiffRows.module.css.mjs
		const css$4 = ".azX9Ka_viewport{overscroll-behavior:contain;overflow-anchor:none;min-height:120px;max-height:min(600px,65vh);overflow:hidden auto}.azX9Ka_spacer{pointer-events:none;min-width:1px}";
		const styleId$4 = "dsh-file-review-tab-multi-git-repository/VirtualDiffRows.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(styleId$4) + "]") === null) {
			const style = document.createElement("style");
			style.dataset.plugin = "dsh-file-review-tab-multi-git-repository";
			style.dataset.pluginCss = styleId$4;
			style.textContent = css$4;
			document.head.appendChild(style);
		}
		var VirtualDiffRows_module_css_default = {
			"viewport": "azX9Ka_viewport",
			"spacer": "azX9Ka_spacer"
		};
		//#endregion
		//#region src/client/VirtualDiffRows.tsx
		const VIRTUAL_ROW_THRESHOLD = 400;
		function visibleRowIndices(start, end, count, keepIndices) {
			const visible = Array.from({ length: end - start }, (_, index) => start + index);
			const pinned = keepIndices.filter((index) => index >= 0 && index < count);
			return [.../* @__PURE__ */ new Set([...visible, ...pinned])].sort((first, second) => first - second);
		}
		function viewportScroll(element) {
			return {
				top: element.scrollTop,
				height: element.clientHeight
			};
		}
		/** Variable-height rows include wrapping and complete comment threads. Both split cells are one measured row. */
		function VirtualDiffRows({ count, enabled, estimate, identity, render, focusIndex = -1, focusVersion = 0, keepIndices = [] }) {
			const viewport = (0, react.useRef)(null);
			const measurements = (0, react.useRef)(/* @__PURE__ */ new Map());
			const [version, setVersion] = (0, react.useState)(0);
			const [scroll, setScroll] = (0, react.useState)({
				top: 0,
				height: 600
			});
			const virtual = enabled && count > VIRTUAL_ROW_THRESHOLD;
			(0, react.useLayoutEffect)(() => {
				measurements.current.clear();
				setVersion((value) => value + 1);
			}, [identity, estimate]);
			const offsets = (0, react.useMemo)(() => rowOffsets(count, estimate, measurements.current), [
				count,
				estimate,
				identity,
				version
			]);
			const { start, end } = virtualRange(offsets, scroll.top, scroll.height);
			const indices = virtual ? visibleRowIndices(start, end, count, keepIndices) : [];
			const indexKey = indices.join(",");
			(0, react.useLayoutEffect)(() => {
				const element = viewport.current;
				if (!virtual || !element || typeof ResizeObserver === "undefined") return;
				let scheduled = 0;
				let pendingAdjustment = 0;
				const updateMeasurements = () => {
					scheduled = 0;
					element.scrollTop += pendingAdjustment;
					pendingAdjustment = 0;
					setVersion((value) => value + 1);
					setScroll(viewportScroll(element));
				};
				const rowObserver = new ResizeObserver((entries) => {
					let changed = false;
					let adjustment = 0;
					for (const entry of entries) {
						const row = Number(entry.target.dataset.virtualRow);
						if (!Number.isSafeInteger(row)) continue;
						const height = entry.target.getBoundingClientRect().height;
						const previous = measurements.current.get(row) ?? estimate;
						if (height > 0 && Math.abs(height - previous) > .5) {
							measurements.current.set(row, height);
							changed = true;
							if (row < start) adjustment += height - previous;
						}
					}
					pendingAdjustment += adjustment;
					if (changed && !scheduled) scheduled = requestAnimationFrame(updateMeasurements);
				});
				for (const row of element.querySelectorAll("[data-virtual-row]")) rowObserver.observe(row);
				const viewportObserver = new ResizeObserver(() => setScroll(viewportScroll(element)));
				viewportObserver.observe(element);
				return () => {
					rowObserver.disconnect();
					viewportObserver.disconnect();
					if (scheduled) cancelAnimationFrame(scheduled);
				};
			}, [
				virtual,
				indexKey,
				identity,
				estimate,
				start
			]);
			(0, react.useEffect)(() => {
				if (!virtual || focusIndex < 0 || focusIndex >= count || !viewport.current) return;
				const element = viewport.current;
				element.scrollTop = Math.max(0, offsets[focusIndex] - element.clientHeight / 2);
				setScroll(viewportScroll(element));
			}, [
				focusIndex,
				focusVersion,
				identity,
				virtual
			]);
			(0, react.useEffect)(() => {
				if (virtual && focusIndex >= start && focusIndex < end) viewport.current?.querySelector("[data-navigation-target]")?.scrollIntoView({
					block: "nearest",
					inline: "nearest"
				});
			}, [
				indexKey,
				focusIndex,
				virtual
			]);
			if (!virtual) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: Array.from({ length: count }, (_, index) => render(index)) });
			const children = [];
			let previousEnd = 0;
			for (const index of indices) {
				if (index > previousEnd) children.push(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: VirtualDiffRows_module_css_default.spacer,
					style: { height: offsets[index] - offsets[previousEnd] },
					"aria-hidden": "true"
				}, `space:${previousEnd}`));
				children.push(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					"data-virtual-row": index,
					children: render(index)
				}, index));
				previousEnd = index + 1;
			}
			if (previousEnd < count) children.push(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: VirtualDiffRows_module_css_default.spacer,
				style: { height: offsets[count] - offsets[previousEnd] },
				"aria-hidden": "true"
			}, "space:end"));
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				ref: viewport,
				className: VirtualDiffRows_module_css_default.viewport,
				tabIndex: 0,
				role: "region",
				"aria-label": t("diffVirtualize"),
				"data-virtual-diff": "",
				"data-total-rows": count,
				onScroll: (event) => setScroll(viewportScroll(event.currentTarget)),
				children
			});
		}
		//#endregion
		//#region src/client/unified-diff-block.tsx
		function ExpandIcon({ direction }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				viewBox: "0 0 16 16",
				"aria-hidden": "true",
				children: [
					direction !== "trailing" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m4 5 4-3 4 3M8 2v4" }),
					direction !== "leading" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m4 11 4 3 4-3M8 14v-4" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M2 8h1m3 0h1m3 0h1m3 0h1" })
				]
			});
		}
		function ExpandAllIcon({ direction }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				viewBox: "0 0 16 16",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: direction === "up" ? "m4 8 4-4 4 4m-8 4 4-4 4 4M3 2h10" : "m4 4 4 4 4-4m-8 4 4 4 4-4M3 14h10" })
			});
		}
		function CollapseContextIcon() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				viewBox: "0 0 16 16",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m4 2 4 4 4-4M8 2v4m-4 8 4-4 4 4M8 14v-4M2 8h12" })
			});
		}
		function GapControls({ gap, expandedLines, expansionLines, labels, expand, collapse }) {
			const hiddenLines = gap.lines.length;
			const expandLabel = hiddenLines > 0 ? labels.expandContext(Math.min(expansionLines, hiddenLines), hiddenLines) : "";
			const collapseLabel = t("collapseContextGap", { count: expandedLines });
			const expandUpLabel = t("expandAllContextUp", { count: hiddenLines });
			const expandDownLabel = t("expandAllContextDown", { count: hiddenLines });
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: UnifiedDiff_module_css_default.unifiedGapControls,
				children: [
					expandedLines > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: UnifiedDiff_module_css_default.unifiedGapButton,
						"aria-label": collapseLabel,
						title: collapseLabel,
						"data-context-collapse": gap.id,
						onClick: () => collapse(gap),
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CollapseContextIcon, {})
					}),
					hiddenLines > 0 && gap.position !== "trailing" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: UnifiedDiff_module_css_default.unifiedGapButton,
						"aria-label": expandUpLabel,
						title: expandUpLabel,
						"data-context-expand-all": "up",
						onClick: () => expand(gap, "up"),
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ExpandAllIcon, { direction: "up" })
					}),
					hiddenLines > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: UnifiedDiff_module_css_default.unifiedGapButton,
						"aria-label": expandLabel,
						title: expandLabel,
						"data-context-gap": gap.position,
						"data-hidden-lines": hiddenLines,
						onClick: () => expand(gap),
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ExpandIcon, { direction: gap.position })
					}),
					hiddenLines > 0 && gap.position !== "leading" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: UnifiedDiff_module_css_default.unifiedGapButton,
						"aria-label": expandDownLabel,
						title: expandDownLabel,
						"data-context-expand-all": "down",
						onClick: () => expand(gap, "down"),
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ExpandAllIcon, { direction: "down" })
					})
				]
			});
		}
		/** Share block identity and pinned comment rows across both presentations. */
		function DiffBlock({ diff, block, blockIndex, hunkIndex, hunkLines, identity, index, preferences, labels, expandedLines, focused, commentAnchor, expand, collapse, renderLine, renderSplitCell }) {
			const isSplit = preferences.layout === "split";
			const splitRows = isSplit ? splitDiffRows(block.lines) : [];
			const rowCount = isSplit ? splitRows.length : block.lines.length;
			const firstLineId = block.lines[0] ? index.byLine.get(block.lines[0]).id : "";
			const virtualIdentity = `${identity}:${hunkIndex}:${block.gap?.id ?? blockIndex}:${block.lines.length}:${firstLineId}:${preferences.layout}:${preferences.wrap}:${preferences.fontFamily}:${preferences.fontSize}:${preferences.lineHeight}:${preferences.tabSize}`;
			const focusIndex = !focused ? -1 : isSplit ? splitRows.findIndex((pair) => (focused.side === "old" ? pair.old : pair.next) === focused.location.line) : block.lines.indexOf(focused.location.line);
			const keepIndices = [];
			if (commentAnchor?.sourceKey === `${identity}:hunk:${hunkIndex}`) for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
				const row = isSplit ? commentAnchor.side === "old" ? splitRows[rowIndex].old : splitRows[rowIndex].next : block.lines[rowIndex];
				const number = commentAnchor.side === "old" ? row?.oldNumber : row?.newNumber;
				if (row && number === commentAnchor.line) keepIndices.push(rowIndex);
			}
			const renderRow = (rowIndex) => {
				if (isSplit) {
					const pair = splitRows[rowIndex];
					return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: UnifiedDiff_module_css_default.splitPair,
						children: [renderSplitCell(pair.old, "old", rowIndex, hunkLines), renderSplitCell(pair.next, "new", rowIndex, hunkLines)]
					}, rowIndex);
				}
				const row = block.lines[rowIndex];
				return renderLine(row, `${row.kind}:${rowIndex}`, hunkLines);
			};
			const gap = block.gap;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: UnifiedDiff_module_css_default.unifiedHunkHeader,
				children: [gap ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(GapControls, {
					gap,
					expandedLines,
					expansionLines: preferences.contextExpansionLines,
					labels,
					expand,
					collapse
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: UnifiedDiff_module_css_default.unifiedHunkGutter }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
					className: UnifiedDiff_module_css_default.unifiedHunkRange,
					children: [block.lines.length ? unifiedHunkRange(block.lines, diff) : "", gap && block.lines.length === 0 && gap.lines.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: labels.expandContext(Math.min(preferences.contextExpansionLines, gap.lines.length), gap.lines.length) })]
				})]
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(VirtualDiffRows, {
				count: rowCount,
				enabled: preferences.virtualize,
				estimate: preferences.fontSize * preferences.lineHeight,
				identity: virtualIdentity,
				focusVersion: focused?.serial ?? 0,
				focusIndex,
				keepIndices,
				render: renderRow
			})] });
		}
		//#endregion
		//#region src/client/UnifiedDiff.tsx
		const DIFF_FONTS = {
			mono: "ui-monospace, SFMono-Regular, Consolas, monospace",
			consolas: "Consolas, monospace",
			cascadia: "\"Cascadia Code\", Consolas, monospace",
			jetbrains: "\"JetBrains Mono\", Consolas, monospace"
		};
		/** Two presentations share the original rows, context expansion, and anchors. */
		function UnifiedDiff({ diffs, contextLines, labels, className, showCopyButton = true, showFileHeaders = true, reviewTarget, sourceKey }) {
			useReviewLocale();
			const preferences = useDiffViewPreferences();
			const interactions = useReviewInteractions();
			const isSplit = preferences.layout === "split";
			const hunks = (0, react.useMemo)(() => buildUnifiedHunks(diffs, contextLines), [contextLines, diffs]);
			const revision = (0, react.useMemo)(() => reviewDiffRevision(diffs), [diffs]);
			const identity = `${sourceKey ?? (reviewTarget ? commentFileKey(reviewTarget) : "")}:${revision}`;
			const index = (0, react.useMemo)(() => indexDiff(hunks, contextLines), [hunks, contextLines]);
			const container = (0, react.useRef)(null);
			const lineElements = (0, react.useRef)(/* @__PURE__ */ new Map());
			const selection = useDiffSelection({
				diffs,
				identity,
				revision,
				index,
				reviewTarget,
				isSplit,
				editorPath: preferences.editorPath,
				interactions,
				container,
				lineElements
			});
			const syntax = (0, react.useMemo)(() => highlightDiff(diffs, hunks), [diffs, hunks]);
			const input = (0, react.useRef)(null);
			const searchButton = (0, react.useRef)(null);
			const [searchOpen, setSearchOpen] = (0, react.useState)(false);
			const [query, setQuery] = (0, react.useState)("");
			const [side, setSide] = (0, react.useState)("both");
			const [caseSensitive, setCaseSensitive] = (0, react.useState)(false);
			const [wholeWord, setWholeWord] = (0, react.useState)(false);
			const result = (0, react.useMemo)(() => searchDiff(index.lines, searchOpen ? query : "", {
				side,
				caseSensitive,
				wholeWord
			}), [
				index,
				searchOpen,
				query,
				side,
				caseSensitive,
				wholeWord
			]);
			const searchKey = JSON.stringify([
				identity,
				searchOpen,
				query,
				side,
				caseSensitive,
				wholeWord
			]);
			const [selectedMatch, setSelectedMatch] = (0, react.useState)({
				key: "",
				index: -1
			});
			const matchIndex = selectedMatch.key === searchKey ? selectedMatch.index : result.matches.length ? 0 : -1;
			const activeMatch = result.matches[matchIndex];
			const matchesByLine = (0, react.useMemo)(() => {
				const matches = /* @__PURE__ */ new Map();
				for (const match of result.matches) {
					const group = matches.get(match.location.id) ?? [];
					group.push(match);
					matches.set(match.location.id, group);
				}
				return matches;
			}, [result]);
			const [selectedChange, setSelectedChange] = (0, react.useState)({
				identity: "",
				index: -1
			});
			const changeIndex = selectedChange.identity === identity ? selectedChange.index : -1;
			const [focus, setFocus] = (0, react.useState)(null);
			const focused = (0, react.useMemo)(() => {
				if (focus?.identity !== identity) return null;
				const row = hunks[focus.location.hunkIndex]?.lines[focus.location.lineIndex];
				const location = row ? index.byLine.get(row) : void 0;
				return location ? {
					...focus,
					location
				} : null;
			}, [
				focus,
				identity,
				hunks,
				index
			]);
			const [progress, setProgress] = (0, react.useState)(() => ({
				revision: identity,
				gaps: /* @__PURE__ */ new Map()
			}));
			const expansions = (0, react.useMemo)(() => {
				const base = progress.revision === identity ? progress.gaps : /* @__PURE__ */ new Map();
				return focused ? revealDiffLocation(hunks, base, focused.location) : base;
			}, [
				progress,
				identity,
				hunks,
				focused
			]);
			const locate = (0, react.useCallback)((location, targetSide) => {
				setSelectedChange({
					identity,
					index: nearestDiffChange(index.changes, location)
				});
				setFocus((current) => ({
					identity,
					location,
					side: targetSide,
					serial: (current?.serial ?? 0) + 1
				}));
			}, [identity, index]);
			const lastSearchKey = (0, react.useRef)("");
			(0, react.useEffect)(() => {
				if (lastSearchKey.current === searchKey) return;
				lastSearchKey.current = searchKey;
				setSelectedMatch({
					key: searchKey,
					index: result.matches.length ? 0 : -1
				});
				const first = result.matches[0];
				if (first) locate(first.location, first.side);
				else setFocus(null);
			}, [
				searchKey,
				result,
				locate
			]);
			(0, react.useEffect)(() => {
				if (searchOpen) input.current?.focus();
			}, [searchOpen]);
			(0, react.useEffect)(() => {
				if (!focused) return;
				lineElements.current.get(`${focused.location.id}:${isSplit ? focused.side : "unified"}`)?.scrollIntoView({
					block: "center",
					inline: "nearest"
				});
			}, [focused, isSplit]);
			const moveMatch = (direction) => {
				const next = stepDiffIndex(matchIndex, direction, result.matches.length);
				const match = result.matches[next];
				if (!match) return;
				setSelectedMatch({
					key: searchKey,
					index: next
				});
				locate(match.location, match.side);
			};
			const moveChange = (direction) => {
				const next = stepDiffIndex(changeIndex, direction, index.changes.length);
				const change = index.changes[next];
				if (change) locate(change.first, change.first.line.newNumber === null ? "old" : "new");
			};
			const closeSearch = () => {
				setSearchOpen(false);
				setFocus(null);
				searchButton.current?.focus();
			};
			const selectChange = (number) => {
				const change = index.changes[number];
				if (change) locate(change.first, change.first.line.newNumber === null ? "old" : "new");
			};
			const collapseAllContext = () => {
				setFocus(null);
				setProgress({
					revision: identity,
					gaps: /* @__PURE__ */ new Map()
				});
			};
			const onKeyDown = (event) => {
				if (event.defaultPrevented || event.nativeEvent.isComposing) return;
				if (event.target instanceof Element && event.target.closest("[role=\"menu\"]")) return;
				const editable = event.target instanceof Element && event.target.closest("input, textarea, select, [contenteditable=\"true\"]");
				if (editable && event.target !== input.current) return;
				const contextMenuShortcut = event.key === "ContextMenu" || event.key === "F10" && event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey;
				if (!editable && contextMenuShortcut) {
					if (selection.showKeyboardMenu(event.target)) event.preventDefault();
					return;
				}
				const shortcut = preferences.searchShortcut;
				const searchShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "f" && event.altKey === shortcut.includes("alt") && event.shiftKey === shortcut.includes("shift");
				const matchShortcut = searchOpen && (event.key === "F3" || event.target === input.current && event.key === "Enter");
				const changeModifier = preferences.changeShortcut === "mod+arrow" ? (event.ctrlKey || event.metaKey) && !event.altKey : event.altKey && !event.ctrlKey && !event.metaKey;
				const changeShortcut = !editable && !event.shiftKey && changeModifier && (event.key === "ArrowDown" || event.key === "ArrowUp");
				if (searchShortcut) {
					event.preventDefault();
					setSearchOpen(true);
					input.current?.focus();
					input.current?.select();
				} else if (matchShortcut) {
					event.preventDefault();
					moveMatch(event.shiftKey ? -1 : 1);
				} else if (searchOpen && event.key === "Escape") {
					event.preventDefault();
					closeSearch();
				} else if (changeShortcut) {
					event.preventDefault();
					moveChange(event.key === "ArrowDown" ? 1 : -1);
				}
			};
			const [copied, setCopied] = (0, react.useState)(false);
			const expand = (gap, direction) => {
				const originId = gap.originId ?? gap.id;
				setProgress((current) => {
					const gaps = new Map(current.revision === identity ? current.gaps : []);
					const original = hunks.flatMap((hunk) => hunk.rows).find((row) => row.kind === "gap" && row.id === originId);
					const previous = expansions.get(originId);
					if (original) {
						let next;
						if (previous?.revealed?.length) next = expandDiffGapSlice(gap, previous, direction ? gap.lines.length : preferences.contextExpansionLines, direction);
						else if (direction) next = expandAllContextGap(original, direction, gaps.get(originId));
						else next = expandContextGap(original, gaps.get(originId), preferences.contextExpansionLines);
						gaps.set(originId, next);
					}
					return {
						revision: identity,
						gaps
					};
				});
			};
			const collapseGap = (gap) => {
				setFocus(null);
				setProgress((current) => {
					const gaps = new Map(current.revision === identity ? current.gaps : []);
					gaps.delete(gap.originId ?? gap.id);
					return {
						revision: identity,
						gaps
					};
				});
			};
			const onCopy = (0, react.useCallback)(() => {
				if (copied) return;
				navigator.clipboard?.writeText(unifiedDiffText(diffs)).then(() => {
					setCopied(true);
					window.setTimeout(() => {
						setCopied(false);
					}, 1e3);
				}).catch(() => {});
			}, [copied, diffs]);
			const rowAnchor = (row, lines, side = "new") => {
				if (!reviewTarget) return void 0;
				const hunkIndex = index.byLine.get(row).hunkIndex;
				return {
					...lineCommentAnchor(reviewTarget, row, lines, revision, side),
					sourceKey: `${identity}:hunk:${hunkIndex}`
				};
			};
			const numberButton = (row, side) => {
				const number = side === "old" ? row.oldNumber : row.newNumber;
				if (!reviewTarget) return number;
				if (number === null) return null;
				return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: UnifiedDiff_module_css_default.lineSelect,
					"data-reference-number-side": side,
					"aria-haspopup": "menu",
					title: t("referenceHint"),
					"aria-label": `${t("referenceSelect")} · ${t(side === "old" ? "commentOldLine" : "commentNewLine", { line: number })}`,
					onClick: (event) => {
						event.stopPropagation();
						selection.selectLine(row, side, event.shiftKey);
					},
					children: number
				});
			};
			const currentAnchor = (anchor, line) => {
				if (!reviewTarget) return null;
				const endLine = line + (anchor.endLine ?? anchor.line ?? line) - (anchor.line ?? line);
				const ranges = index.lines.filter((item) => item.line.newNumber === line).map((start) => {
					const end = index.lines.find((item) => item.hunkIndex === start.hunkIndex && item.line.newNumber === endLine);
					return end ? rangeReference(reviewTarget, index.lines, start, end, "new", revision, `${identity}:hunk:${start.hunkIndex}`) : null;
				}).filter((item) => item?.quote === anchor.quote && item.before === anchor.before && item.after === anchor.after);
				return ranges.length === 1 ? ranges[0] : null;
			};
			if (!diffs.length) return null;
			const maxNumber = hunks.reduce((max, hunk) => hunk.lines.reduce((current, line) => Math.max(current, line.oldNumber ?? 0, line.newNumber ?? 0), max), 1);
			const style = {
				"--diff-number-width": `${Math.max(4, String(maxNumber).length)}ch`,
				"--diff-font": DIFF_FONTS[preferences.fontFamily],
				"--diff-font-size": `${preferences.fontSize}px`,
				"--diff-row-height": `${preferences.fontSize * preferences.lineHeight}px`,
				"--diff-tab-size": preferences.tabSize,
				"--diff-add-strength": `${preferences.colorStrength}%`,
				"--diff-del-strength": `${preferences.colorStrength}%`,
				...preferences.colors === "blue-orange" ? {
					"--diff-add": "#0969da",
					"--diff-del": "#bc4c00"
				} : {}
			};
			const totals = /* @__PURE__ */ new Map();
			diffs.forEach((diff, index) => {
				const total = totals.get(diff.path) ?? {
					added: 0,
					removed: 0
				};
				totals.set(diff.path, {
					added: total.added + (hunks[index]?.added ?? 0),
					removed: total.removed + (hunks[index]?.removed ?? 0)
				});
			});
			const lineProps = (row, targetSide) => {
				const location = index.byLine.get(row);
				const key = `${location.id}:${targetSide}`;
				return {
					ref: (element) => {
						if (element) lineElements.current.set(key, element);
						else lineElements.current.delete(key);
					},
					"data-diff-line-id": location.id,
					"data-navigation-target": focused?.location.id === location.id ? "" : void 0,
					"data-reference-side": targetSide === "unified" ? row.kind === "del" ? "old" : "new" : targetSide,
					"data-reference-selected": selection.rowSelected(row, targetSide) ? "" : void 0
				};
			};
			const code = (row, targetSide) => {
				const location = index.byLine.get(row);
				const actualSide = targetSide === "unified" ? row.newNumber === null ? "old" : "new" : targetSide;
				const tokens = syntax.get(row)?.[actualSide === "old" ? "old" : "next"];
				const matches = matchesByLine.get(location.id)?.filter((match) => targetSide === "unified" || match.side === targetSide);
				return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(DiffCode, {
					text: row.text,
					tokens,
					matches,
					active: activeMatch?.id
				});
			};
			const renderLine = (row, key, lines) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ReviewCommentLine, {
				anchor: rowAnchor(row, lines),
				alternateAnchor: row.kind === "context" ? rowAnchor(row, lines, "old") : void 0,
				children: (button) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					...lineProps(row, "unified"),
					className: `${UnifiedDiff_module_css_default.unifiedLine} ${UnifiedDiff_module_css_default[`unified_${row.kind}`] ?? ""}`,
					"data-line-kind": row.kind,
					"data-old-line": row.oldNumber ?? void 0,
					"data-new-line": row.newNumber ?? void 0,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: `${UnifiedDiff_module_css_default.unifiedLineNumber} ${UnifiedDiff_module_css_default.unifiedOldNumber}`,
							children: [button, numberButton(row, "old")]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: UnifiedDiff_module_css_default.unifiedLineNumber,
							children: numberButton(row, "new")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: UnifiedDiff_module_css_default.unifiedSign,
							children: row.kind === "del" ? "-" : row.kind === "add" ? "+" : " "
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: UnifiedDiff_module_css_default.unifiedText,
							"data-diff-code": "",
							children: code(row, "unified")
						})
					]
				})
			}, key);
			const renderSplitCell = (row, side, key, lines) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: `${UnifiedDiff_module_css_default.splitCell} ${row ? UnifiedDiff_module_css_default[`unified_${row.kind}`] ?? "" : UnifiedDiff_module_css_default.splitMissing}`,
				children: row && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ReviewCommentLine, {
					anchor: rowAnchor(row, lines, side),
					children: (button) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						...lineProps(row, side),
						className: `${UnifiedDiff_module_css_default.splitLine} ${UnifiedDiff_module_css_default[`unified_${row.kind}`] ?? ""}`,
						"data-line-kind": row.kind,
						"data-diff-side": side,
						"data-old-line": side === "old" ? row.oldNumber ?? void 0 : void 0,
						"data-new-line": side === "new" ? row.newNumber ?? void 0 : void 0,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: `${UnifiedDiff_module_css_default.unifiedLineNumber} ${UnifiedDiff_module_css_default.unifiedOldNumber}`,
								children: [button, numberButton(row, side)]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: UnifiedDiff_module_css_default.unifiedSign,
								children: row.kind === "del" ? "-" : row.kind === "add" ? "+" : " "
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: UnifiedDiff_module_css_default.unifiedText,
								"data-diff-code": "",
								children: code(row, side)
							})
						]
					})
				})
			}, `${side}:${key}`);
			let previousPath;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				ref: container,
				tabIndex: 0,
				onKeyDown,
				onMouseUp: (event) => {
					const insideMenu = event.target instanceof Element && event.target.closest("[role=\"menu\"]");
					if (event.button === 0 && !insideMenu) selection.selectedByDrag();
				},
				onContextMenu: (event) => {
					const clicked = selection.contextRow(event.target);
					if (clicked && selection.showMenu(clicked.location, clicked.side, clicked.row, event.clientX, event.clientY)) event.preventDefault();
				},
				className: `${UnifiedDiff_module_css_default.unifiedBlock} ${showFileHeaders ? "" : UnifiedDiff_module_css_default.unifiedEmbedded} ${reviewTarget ? UnifiedDiff_module_css_default.commentEnabled : ""} ${preferences.wrap ? UnifiedDiff_module_css_default.wrapLines : ""} ${className ?? ""}`,
				style,
				"data-diff": "",
				"data-diff-layout": preferences.layout,
				"data-diff-wrap": preferences.wrap,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(DiffToolbar, {
						preferences,
						labels,
						searchButton,
						searchOpen,
						toggleSearch: () => {
							if (searchOpen) closeSearch();
							else setSearchOpen(true);
						},
						changes: index.changes,
						changeIndex,
						moveChange,
						selectChange,
						path: diffs[0].path,
						contextExpanded: expansions.size > 0,
						collapseContext: collapseAllContext,
						showCopyButton,
						copied,
						copyDiff: onCopy
					}),
					searchOpen && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(DiffSearchControls, {
						input,
						query,
						setQuery,
						side,
						setSide,
						caseSensitive,
						toggleCase: () => setCaseSensitive(!caseSensitive),
						wholeWord,
						toggleWholeWord: () => setWholeWord(!wholeWord),
						matches: result.matches,
						truncated: result.truncated,
						matchIndex,
						activeMatch,
						moveMatch,
						closeSearch
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(DiffReferenceMenu, {
						selection,
						commentEnabled: interactions !== null,
						commentsBusy: interactions?.snapshot.busy ?? false
					}),
					diffs.map((diff, hunkIndex) => {
						const firstForPath = diff.path !== previousPath;
						previousPath = diff.path;
						const hunk = hunks[hunkIndex];
						const total = totals.get(diff.path);
						const visibleRows = visibleHunkRows(hunk, expansions, true);
						const blocks = unifiedVisibleBlocks(visibleRows);
						const hiddenCounts = /* @__PURE__ */ new Map();
						for (const row of visibleRows) {
							if (row.kind !== "gap") continue;
							const key = row.originId ?? row.id;
							hiddenCounts.set(key, (hiddenCounts.get(key) ?? 0) + row.lines.length);
						}
						const expandedCounts = /* @__PURE__ */ new Map();
						for (const row of hunk.rows) if (row.kind === "gap") expandedCounts.set(row.id, row.lines.length - (hiddenCounts.get(row.id) ?? 0));
						return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
							className: UnifiedDiff_module_css_default.unifiedFile,
							"data-syntax-language": diffLanguage(diff.path),
							children: [
								showFileHeaders && firstForPath && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
									className: UnifiedDiff_module_css_default.unifiedHeader,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: UnifiedDiff_module_css_default.unifiedStatus,
											children: "M"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: UnifiedDiff_module_css_default.unifiedPath,
											children: diff.path
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
											className: UnifiedDiff_module_css_default.unifiedAdded,
											children: ["+", total.added]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
											className: UnifiedDiff_module_css_default.unifiedRemoved,
											children: ["-", total.removed]
										})
									]
								}),
								hunk.unchangedBefore > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: UnifiedDiff_module_css_default.unifiedUnavailable,
									title: labels.unavailableContext(hunk.unchangedBefore),
									children: labels.unavailableContext(hunk.unchangedBefore)
								}),
								isSplit && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: UnifiedDiff_module_css_default.splitLegend,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("diffOld") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("diffNew") })]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: `${UnifiedDiff_module_css_default.unifiedBody} ${isSplit ? UnifiedDiff_module_css_default.splitBody : ""}`,
									children: blocks.map((block, blockIndex) => {
										const originalId = block.gap?.originId ?? block.gap?.id;
										const expandedLines = originalId ? expandedCounts.get(originalId) ?? 0 : 0;
										return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(DiffBlock, {
											diff,
											block,
											blockIndex,
											hunkIndex,
											hunkLines: hunk.lines,
											identity,
											index,
											preferences,
											labels,
											expandedLines,
											focused,
											commentAnchor: interactions?.composer?.placement === "inline" ? interactions.composer.anchor : void 0,
											expand,
											collapse: collapseGap,
											renderLine,
											renderSplitCell
										}, block.gap?.id ?? `block:${blockIndex}`);
									})
								})
							]
						}, `${diff.path}:${hunkIndex}`);
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ReviewOutdatedComments, {
						target: reviewTarget,
						revision,
						currentAnchor
					})
				]
			});
		}
		//#endregion
		//#region src/client/user-guide.ts
		async function loadUserGuide(ctx, sessionId, language) {
			const remote = ctx.sessions.scope(sessionId)?.get("remote.fileReview");
			if (!remote?.userGuideDocument) throw new Error(t("userGuideServiceUnavailable"));
			const result = await remote.userGuideDocument(language);
			if (!result.ok) throw new Error(result.error.message);
			return result.value;
		}
		/** The host renderer only receives explicitly shipped images; no URL depends on the GUI origin. */
		function guideImageResolver(document) {
			const images = new Map(Object.entries(document.images));
			return (destination) => images.get(destination.replace(/^\.\//, ""));
		}
		//#endregion
		//#region \0dsh-file-review-tab-multi-git-repository-css:D:\projectZJGG\dsh-file-review-tab-Multi-git-repository\src\client\UserGuideTab.module.css.mjs
		const css$3 = ".eFPIYa_root{height:100%;min-height:0;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1,#fff);--dsw-font-markdown-base:14px/1.7 var(--dsw-font-family,sans-serif);flex-direction:column;display:flex}.eFPIYa_header{border-bottom:1px solid var(--dsw-alias-border-l2);font:var(--dsw-font-xs-13,13px sans-serif);flex-wrap:wrap;flex:none;align-items:center;gap:10px;padding:8px 12px;display:flex}.eFPIYa_modal{background:var(--dsw-alias-bg-layer-2,#fff);width:min(1100px,100%);max-height:100%;color:var(--dsw-alias-label-primary,#111);gap:0;padding-bottom:0}.eFPIYa_modalContent{flex:1;min-height:0}.eFPIYa_modalContent>div:last-child{min-height:0;margin-top:0;padding:0;overflow:hidden}.eFPIYa_modal .eFPIYa_root{height:min(75vh,850px)}.eFPIYa_header span{color:var(--dsw-alias-label-secondary)}.eFPIYa_header button{border:1px solid var(--dsw-alias-border-l2);color:inherit;font:inherit;cursor:pointer;background:0 0;border-radius:6px;margin-left:auto;padding:4px 8px}.eFPIYa_header button:focus-visible{outline:2px solid var(--dsw-alias-state-focus-primary,#006fee);outline-offset:2px}.eFPIYa_content{flex:1;min-height:0;padding:20px;overflow:auto}.eFPIYa_content>div{max-width:1100px;margin:0 auto}.eFPIYa_content img{max-width:100%;height:auto}.eFPIYa_content table{max-width:100%;display:block;overflow-x:auto}.eFPIYa_message{font:var(--dsw-font-xs-13,13px sans-serif);padding:20px}";
		const styleId$3 = "dsh-file-review-tab-multi-git-repository/UserGuideTab.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(styleId$3) + "]") === null) {
			const style = document.createElement("style");
			style.dataset.plugin = "dsh-file-review-tab-multi-git-repository";
			style.dataset.pluginCss = styleId$3;
			style.textContent = css$3;
			document.head.appendChild(style);
		}
		var UserGuideTab_module_css_default = {
			"message": "eFPIYa_message",
			"modalContent": "eFPIYa_modalContent",
			"root": "eFPIYa_root",
			"modal": "eFPIYa_modal",
			"header": "eFPIYa_header",
			"content": "eFPIYa_content"
		};
		//#endregion
		//#region src/client/UserGuideContent.tsx
		/** The scoped document channel supplies both Markdown and shipped image bytes. */
		function UserGuideContent({ ctx, sessionId }) {
			const language = useReviewLocale();
			const [tick, setTick] = (0, react.useState)(0);
			const [loaded, setLoaded] = (0, react.useState)(null);
			const [failure, setFailure] = (0, react.useState)(null);
			const key = JSON.stringify([
				sessionId,
				language,
				tick
			]);
			const document = loaded?.key === key ? loaded.document : null;
			(0, react.useEffect)(() => {
				let active = true;
				setFailure(null);
				loadUserGuide(ctx, sessionId, language).then((document) => {
					if (active) setLoaded({
						key,
						document
					});
				}).catch((error) => {
					if (active) setFailure({
						key,
						message: error instanceof Error ? error.message : t("userGuideFailed")
					});
				});
				return () => {
					active = false;
				};
			}, [
				ctx,
				sessionId,
				language,
				key
			]);
			const imageResolver = (0, react.useMemo)(() => document === null ? () => void 0 : guideImageResolver(document), [document]);
			const pathImages = (0, react.useMemo)(() => ({ resolve: imageResolver }), [imageResolver]);
			const fileImages = (0, react.useMemo)(() => ({
				resolve: imageResolver,
				labels: {
					open: t("userGuideImageOpen"),
					dialog: t("userGuideImageDialog"),
					close: t("userGuideImageClose"),
					loading: t("userGuideImageLoading"),
					failed: t("userGuideImageFailed")
				}
			}), [imageResolver, language]);
			const labels = (0, react.useMemo)(() => ({
				code: {
					copyLabel: t("userGuideCodeCopy"),
					copiedLabel: t("copied")
				},
				footnotes: t("userGuideFootnotes")
			}), [language]);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: UserGuideTab_module_css_default.root,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
					className: UserGuideTab_module_css_default.header,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: language === "zh" ? "USER_GUIDE.md" : "USER_GUIDE.en.md" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						"data-modal-autofocus": true,
						onClick: () => setTick((value) => value + 1),
						children: t("refresh")
					})]
				}), failure?.key === key ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: UserGuideTab_module_css_default.message,
					role: "alert",
					children: [
						t("userGuideFailed"),
						" ",
						failure.message
					]
				}) : document === null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: UserGuideTab_module_css_default.message,
					role: "status",
					children: t("userGuideOpening")
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: UserGuideTab_module_css_default.content,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MarkdownDelegateProvider, {
						fileImages,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MarkdownText, {
							text: document.markdown,
							labels,
							pathImages
						})
					})
				}, key)]
			});
		}
		//#endregion
		//#region src/client/UserGuideTab.tsx
		/** Unmount document and image previews when the owning tab hides or closes. */
		function UserGuideDialog({ ctx, sessionId, onClose }) {
			const language = useReviewLocale();
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
				open: true,
				title: t("userGuide"),
				closeLabel: t("userGuideClose"),
				onClose,
				className: UserGuideTab_module_css_default.modal,
				contentClassName: UserGuideTab_module_css_default.modalContent,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(UserGuideContent, {
					ctx,
					sessionId
				}, `${sessionId}:${language}`)
			});
		}
		/** Restore old saved guide tabs without depending on the removed third-party bridge. */
		function LegacyUserGuideTab({ ctx, reviewSessionId: sessionId, useTabInfo }) {
			useReviewLocale();
			const { tab } = useTabInfo();
			const [open, setOpen] = (0, react.useState)(false);
			const close = (0, react.useCallback)(() => setOpen(false), []);
			(0, react.useEffect)(() => {
				if (!tab.visible) close();
			}, [tab.visible, close]);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: UserGuideTab_module_css_default.message,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("userGuideLegacyHint") }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setOpen(true),
						children: t("userGuide")
					}),
					" ",
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => tab.actions.close(),
						children: t("userGuideCloseLegacy")
					}),
					open && tab.visible && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(UserGuideDialog, {
						ctx,
						sessionId,
						onClose: close
					})
				]
			});
		}
		function LegacyUserGuideTitle() {
			useReviewLocale();
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				title: t("userGuide"),
				children: t("userGuide")
			});
		}
		//#endregion
		//#region src/client/repository-events.ts
		/** Refresh visible review tabs after this client saves native project settings. */
		const listeners$1 = /* @__PURE__ */ new Set();
		function repositoriesChanged() {
			for (const listener of listeners$1) listener();
		}
		function subscribeRepositories(listener) {
			listeners$1.add(listener);
			return () => {
				listeners$1.delete(listener);
			};
		}
		//#endregion
		//#region \0dsh-file-review-tab-multi-git-repository-css:D:\projectZJGG\dsh-file-review-tab-Multi-git-repository\src\client\FileReviewTab.module.css.mjs
		const css$2 = ".nO5n0W_root{height:100%;min-height:0;color:var(--dsw-alias-label-primary);font:var(--dsw-font-xs-13);flex-direction:column;display:flex;container-type:inline-size}.nO5n0W_header{border-bottom:1px solid var(--dsw-alias-border-l2);flex-wrap:wrap;flex:none;align-items:center;gap:8px;min-height:36px;padding:4px 10px;display:flex}.nO5n0W_headerTitle{flex:none;font-weight:600}.nO5n0W_guideButton{border:1px solid var(--dsw-alias-border-l2);color:inherit;background:var(--dsw-alias-bg-layer-1,#fff);font:inherit;white-space:nowrap;cursor:pointer;border-radius:6px;flex:none;align-items:center;gap:5px;padding:3px 7px;display:inline-flex}.nO5n0W_guideButton:hover:not(:disabled){background:var(--dsw-alias-border-l1)}.nO5n0W_guideButton:focus-visible{outline:2px solid var(--dsw-alias-state-focus-primary,#006fee);outline-offset:2px}.nO5n0W_guideButton:disabled{opacity:.6;cursor:default}.nO5n0W_scopeSelect{border:1px solid var(--dsw-alias-border-l2);min-width:0;max-width:150px;color:inherit;background:var(--dsw-alias-bg-layer-1,#fff);font:inherit;border-radius:6px;padding:3px 6px}.nO5n0W_gitPanel{flex-direction:column;flex:1;min-height:0;display:flex}.nO5n0W_gitFileName{text-align:left;min-width:0;color:inherit;font:inherit;cursor:pointer;background:0 0;border:0;flex:1;align-items:center;gap:6px;padding:0;display:flex}.nO5n0W_repositoryBar{border-bottom:1px solid var(--dsw-alias-border-l2);flex-wrap:wrap;flex:none;align-items:center;gap:8px;padding:8px 10px;display:flex}.nO5n0W_repositoryBar select{max-width:100%;color:inherit;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l2);border-radius:5px;padding:3px}.nO5n0W_repositoryBar small{color:var(--dsw-alias-label-secondary);flex-basis:100%;font-size:11px}.nO5n0W_repositoryBadge{text-overflow:ellipsis;white-space:nowrap;max-width:120px;color:var(--dsw-alias-label-secondary);border:1px solid var(--dsw-alias-border-l2);border-radius:4px;flex:none;padding:1px 4px;font-size:10px;overflow:hidden}.nO5n0W_refreshButton{color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:0;border-radius:6px;margin-left:auto;padding:2px 6px;font-size:13px;line-height:1}.nO5n0W_refreshButton:hover:not(:disabled){background:var(--dsw-alias-border-l1);color:var(--dsw-alias-label-primary)}.nO5n0W_refreshButton:disabled{opacity:.5;cursor:default}.nO5n0W_notice{border-radius:8px;flex:none;margin:8px 10px 0;padding:6px 10px;font-size:12px}.nO5n0W_noticeSuccess{color:var(--dsw-alias-state-success-primary);background:color-mix(in srgb, var(--dsw-alias-state-success-primary) 12%, transparent);border:1px solid color-mix(in srgb, var(--dsw-alias-state-success-primary) 35%, transparent)}.nO5n0W_noticeError{color:var(--dsw-alias-state-error-primary);background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 12%, transparent);border:1px solid color-mix(in srgb, var(--dsw-alias-state-error-primary) 35%, transparent)}.nO5n0W_body{flex:1;min-height:0;padding:8px 0 16px;overflow-y:auto}.nO5n0W_empty{color:var(--dsw-alias-label-tertiary);text-align:center;padding:24px 12px}.nO5n0W_turnGroup{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-markdown-code-block);border-radius:10px;margin:0 8px 10px;overflow:hidden}.nO5n0W_turnHeader{border-bottom:1px solid var(--dsw-alias-border-l2);flex-wrap:wrap;align-items:center;gap:4px 8px;min-height:34px;padding:0 8px 0 10px;display:flex}.nO5n0W_turnTitle{white-space:nowrap;font-weight:600}.nO5n0W_liveBadge{color:var(--dsw-alias-state-warning-primary,#d9a13b);background:color-mix(in srgb, var(--dsw-alias-state-warning-primary,#d9a13b) 14%, transparent);white-space:nowrap;border-radius:999px;padding:1px 6px;font-size:11px}.nO5n0W_turnCount{color:var(--dsw-alias-label-tertiary);white-space:nowrap}.nO5n0W_confirmedBadge{color:var(--dsw-alias-state-success-primary);background:color-mix(in srgb, var(--dsw-alias-state-success-primary) 12%, transparent);white-space:nowrap;border-radius:999px;padding:1px 6px;font-size:11px}.nO5n0W_turnActions{flex-wrap:wrap;align-items:center;gap:6px;margin-left:auto;display:flex}.nO5n0W_pendingHint{color:var(--dsw-alias-label-tertiary);margin:0 10px 8px;font-size:12px}.nO5n0W_stats{white-space:nowrap;gap:6px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;display:inline-flex}.nO5n0W_added{color:var(--dsw-alias-state-success-primary)}.nO5n0W_removed{color:var(--dsw-alias-state-error-primary)}.nO5n0W_actionButton{border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);cursor:pointer;white-space:nowrap;background:0 0;border-radius:6px;align-items:center;gap:4px;padding:3px 8px;font-size:12px;display:inline-flex}.nO5n0W_actionButton:hover:not(:disabled){color:var(--dsw-alias-label-primary);background:var(--dsw-alias-border-l1)}.nO5n0W_actionButton:disabled{opacity:.5;cursor:default}.nO5n0W_buttonIcon{fill:none;stroke:currentColor;stroke-width:1.6px;stroke-linecap:round;stroke-linejoin:round;width:13px;height:13px}.nO5n0W_fileList{margin:0;padding:0;list-style:none}.nO5n0W_fileItem+.nO5n0W_fileItem{border-top:1px solid var(--dsw-alias-border-l2)}.nO5n0W_fileRow{cursor:pointer;user-select:none;align-items:center;gap:6px;min-height:32px;padding:0 8px 0 6px;display:flex}.nO5n0W_fileRow:hover{background:color-mix(in srgb, var(--dsw-alias-border-l1) 55%, transparent)}.nO5n0W_chevron{fill:none;width:12px;height:12px;stroke:var(--dsw-alias-label-tertiary);stroke-width:1.8px;stroke-linecap:round;stroke-linejoin:round;flex:none;transition:transform .12s}.nO5n0W_chevronOpen{transform:rotate(90deg)}.nO5n0W_fileName{text-overflow:ellipsis;white-space:nowrap;min-width:0;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;overflow:hidden}.nO5n0W_stateBadge{white-space:nowrap;border-radius:999px;padding:1px 6px;font-size:11px}.nO5n0W_badgeUndone{color:var(--dsw-alias-state-warning-primary,#d9a13b);background:color-mix(in srgb, var(--dsw-alias-state-warning-primary,#d9a13b) 14%, transparent)}.nO5n0W_badgeMuted{color:var(--dsw-alias-label-tertiary);background:var(--dsw-alias-border-l1)}.nO5n0W_badgeError{color:var(--dsw-alias-state-error-primary);background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 12%, transparent)}.nO5n0W_smallButton{border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);cursor:pointer;white-space:nowrap;background:0 0;border-radius:6px;flex:none;padding:2px 7px;font-size:11px}.nO5n0W_smallButton:hover:not(:disabled){color:var(--dsw-alias-label-primary);background:var(--dsw-alias-border-l1)}.nO5n0W_smallButton:disabled{opacity:.5;cursor:default}.nO5n0W_fileRow .nO5n0W_smallButton:first-of-type{margin-left:auto}.nO5n0W_diffWrap{border-top:1px solid var(--dsw-alias-border-l2);overflow-x:auto}.nO5n0W_diffUnavailable{color:var(--dsw-alias-label-tertiary);margin:0;padding:10px 12px;font-size:12px}.nO5n0W_reviewDiff{border:0;border-radius:0;margin:0}.nO5n0W_deletedBadge{color:var(--dsw-alias-state-error-primary);background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 12%, transparent);white-space:nowrap;border-radius:999px;padding:1px 6px;font-size:11px}@container (width<=430px){.nO5n0W_turnHeader .nO5n0W_stats,.nO5n0W_editorButton{display:none}}.nO5n0W_archiveSection{border:1px dashed var(--dsw-alias-border-l2);border-radius:10px;margin:4px 8px 6px}.nO5n0W_archiveHeader{cursor:pointer;width:100%;min-height:34px;color:var(--dsw-alias-label-secondary);background:0 0;border:0;align-items:center;gap:6px;padding:0 8px 0 10px;display:flex}.nO5n0W_archiveHeader:hover{color:var(--dsw-alias-label-primary)}.nO5n0W_archiveTitle{font-size:12px}.nO5n0W_repositoryGroup+.nO5n0W_repositoryGroup{border-top:1px solid var(--dsw-alias-border-l2)}.nO5n0W_repositoryGroupHeader{box-sizing:border-box;background:var(--dsw-alias-bg-layer-2,#f6f8fa);width:100%;color:var(--dsw-alias-label-primary);text-align:left;font:inherit;border:0;align-items:center;gap:8px;padding:8px 10px;display:flex}.nO5n0W_repositoryGroupTitle:hover{background:var(--dsw-alias-border-l1)}.nO5n0W_repositoryGroupTitle:focus-visible{outline:2px solid var(--dsw-alias-state-link-primary,#4d6bfe);outline-offset:-2px}.nO5n0W_repositoryGroupName{text-overflow:ellipsis;white-space:nowrap;min-width:0;font-weight:600;overflow:hidden}.nO5n0W_repositoryGroupHeader .nO5n0W_turnCount{flex:none}.nO5n0W_repositoryGroupTitle{min-width:0;color:inherit;font:inherit;text-align:left;cursor:pointer;background:0 0;border:0;border-radius:4px;flex:1;align-items:center;gap:8px;padding:2px 0;display:flex}.nO5n0W_repositoryVisibilityButton{width:28px;height:26px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:1px solid #0000;border-radius:5px;flex:none;justify-content:center;align-items:center;padding:3px;display:inline-flex}.nO5n0W_repositoryVisibilityButton svg{fill:none;stroke:currentColor;stroke-width:1.4px;stroke-linecap:round;stroke-linejoin:round;width:18px;height:18px}.nO5n0W_repositoryVisibilityButton:hover{color:var(--dsw-alias-state-link-primary,#0969da);background:var(--dsw-alias-border-l1);border-color:var(--dsw-alias-border-l2)}.nO5n0W_repositoryVisibilityButton:focus-visible{outline:2px solid var(--dsw-alias-state-link-primary,#0969da);outline-offset:1px}.nO5n0W_gitVisibility{margin-left:auto}.nO5n0W_archiveLoadMore{border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border-radius:6px;margin:0 10px 8px;padding:5px 10px;font-size:12px}.nO5n0W_archiveLoadMore:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-border-l1)}.nO5n0W_archiveSection .nO5n0W_turnGroup{margin:0 8px 8px}";
		const styleId$2 = "dsh-file-review-tab-multi-git-repository/FileReviewTab.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(styleId$2) + "]") === null) {
			const style = document.createElement("style");
			style.dataset.plugin = "dsh-file-review-tab-multi-git-repository";
			style.dataset.pluginCss = styleId$2;
			style.textContent = css$2;
			document.head.appendChild(style);
		}
		var FileReviewTab_module_css_default = {
			"archiveHeader": "nO5n0W_archiveHeader",
			"archiveTitle": "nO5n0W_archiveTitle",
			"turnHeader": "nO5n0W_turnHeader",
			"repositoryGroupName": "nO5n0W_repositoryGroupName",
			"repositoryGroupTitle": "nO5n0W_repositoryGroupTitle",
			"repositoryVisibilityButton": "nO5n0W_repositoryVisibilityButton",
			"archiveLoadMore": "nO5n0W_archiveLoadMore",
			"scopeSelect": "nO5n0W_scopeSelect",
			"repositoryGroup": "nO5n0W_repositoryGroup",
			"root": "nO5n0W_root",
			"repositoryGroupHeader": "nO5n0W_repositoryGroupHeader",
			"gitFileName": "nO5n0W_gitFileName",
			"diffWrap": "nO5n0W_diffWrap",
			"gitPanel": "nO5n0W_gitPanel",
			"turnTitle": "nO5n0W_turnTitle",
			"headerTitle": "nO5n0W_headerTitle",
			"turnCount": "nO5n0W_turnCount",
			"notice": "nO5n0W_notice",
			"gitVisibility": "nO5n0W_gitVisibility",
			"badgeError": "nO5n0W_badgeError",
			"refreshButton": "nO5n0W_refreshButton",
			"chevronOpen": "nO5n0W_chevronOpen",
			"diffUnavailable": "nO5n0W_diffUnavailable",
			"reviewDiff": "nO5n0W_reviewDiff",
			"repositoryBadge": "nO5n0W_repositoryBadge",
			"fileItem": "nO5n0W_fileItem",
			"stateBadge": "nO5n0W_stateBadge",
			"fileRow": "nO5n0W_fileRow",
			"badgeUndone": "nO5n0W_badgeUndone",
			"smallButton": "nO5n0W_smallButton",
			"header": "nO5n0W_header",
			"removed": "nO5n0W_removed",
			"chevron": "nO5n0W_chevron",
			"noticeSuccess": "nO5n0W_noticeSuccess",
			"pendingHint": "nO5n0W_pendingHint",
			"buttonIcon": "nO5n0W_buttonIcon",
			"fileName": "nO5n0W_fileName",
			"stats": "nO5n0W_stats",
			"empty": "nO5n0W_empty",
			"badgeMuted": "nO5n0W_badgeMuted",
			"body": "nO5n0W_body",
			"fileList": "nO5n0W_fileList",
			"deletedBadge": "nO5n0W_deletedBadge",
			"repositoryBar": "nO5n0W_repositoryBar",
			"guideButton": "nO5n0W_guideButton",
			"editorButton": "nO5n0W_editorButton",
			"actionButton": "nO5n0W_actionButton",
			"confirmedBadge": "nO5n0W_confirmedBadge",
			"archiveSection": "nO5n0W_archiveSection",
			"noticeError": "nO5n0W_noticeError",
			"added": "nO5n0W_added",
			"liveBadge": "nO5n0W_liveBadge",
			"turnGroup": "nO5n0W_turnGroup",
			"turnActions": "nO5n0W_turnActions"
		};
		//#endregion
		//#region src/client/review-repository-groups.ts
		function repositoryGroupId(session, range, repository) {
			return JSON.stringify([
				session,
				range,
				repository
			]);
		}
		function allFileContentsExpanded(expanded, keys) {
			return keys.length > 0 && keys.every((key) => expanded.has(key));
		}
		/** Change only these file contents; repository lists and other scopes are independent. */
		function setFileContentsExpanded(current, keys, expanded) {
			const next = new Set(current);
			for (const key of keys) if (expanded) next.add(key);
			else next.delete(key);
			return next;
		}
		/** Scope the command to these visible groups; other turns and repositories stay as they were. */
		function setRepositoryGroupsCollapsed(current, keys, collapsed) {
			const next = new Set(current);
			for (const key of keys) if (collapsed) next.add(key);
			else next.delete(key);
			return next;
		}
		/** Preserve file order and keep identically named repositories isolated by root. */
		function groupReviewFiles(files, owner) {
			const groups = /* @__PURE__ */ new Map();
			for (const file of files) {
				const repository = owner(file);
				const existing = groups.get(repository.key);
				if (existing) existing.files.push(file);
				else groups.set(repository.key, {
					...repository,
					files: [file]
				});
			}
			return [...groups.values()];
		}
		//#endregion
		//#region src/client/ReviewRepositoryGroup.tsx
		function FileContentsButton({ expanded, label, onClick, controls }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: FileReviewTab_module_css_default.repositoryVisibilityButton,
				title: label,
				"aria-label": label,
				"aria-expanded": expanded,
				"aria-controls": controls,
				onClick,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
					viewBox: "0 0 20 20",
					"aria-hidden": "true",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M3 10h14" }), expanded ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m7 3 3 3 3-3M10 1v5m-3 11 3-3 3 3m-3-3v5" }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m7 5 3-3 3 3M10 2v5m-3 8 3 3 3-3m-3-2v5" })]
				})
			});
		}
		function ReviewRepositoryGroup({ name, path, count, children, collapsed, onCollapsedChange, contentsExpanded, onContentsExpandedChange }) {
			useReviewLocale();
			const bodyId = (0, react.useId)();
			const expanded = contentsExpanded && !collapsed;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: FileReviewTab_module_css_default.repositoryGroup,
				"aria-label": name,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: FileReviewTab_module_css_default.repositoryGroupHeader,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: FileReviewTab_module_css_default.repositoryGroupTitle,
							"aria-expanded": !collapsed,
							"aria-controls": bodyId,
							title: path ? `${name}\n${path}` : name,
							onClick: () => {
								onCollapsedChange(!collapsed);
							},
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
								viewBox: "0 0 20 20",
								"aria-hidden": "true",
								className: `${FileReviewTab_module_css_default.chevron} ${collapsed ? "" : FileReviewTab_module_css_default.chevronOpen}`,
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m7 5 5 5-5 5" })
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: FileReviewTab_module_css_default.repositoryGroupName,
								children: name
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(FileContentsButton, {
							expanded,
							controls: bodyId,
							label: t(expanded ? "collapseRepositoryFiles" : "expandRepositoryFiles", { name }),
							onClick: () => {
								if (!expanded) onCollapsedChange(false);
								onContentsExpandedChange(!expanded);
							}
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: FileReviewTab_module_css_default.turnCount,
							children: count === 1 ? t("filesOne") : t("files", { count })
						})
					]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					id: bodyId,
					children: !collapsed && children
				})]
			});
		}
		//#endregion
		//#region src/client/git-review-diff-loader.ts
		/** Deduplicate queued/in-flight diffs and bound a bulk expansion to four requests. */
		async function loadMissingReviewDiffs(files, keyOf, requested, load) {
			const pending = files.filter((file) => {
				const key = keyOf(file);
				if (requested.has(key)) return false;
				requested.add(key);
				return true;
			});
			let cursor = 0;
			await Promise.all(Array.from({ length: Math.min(4, pending.length) }, async () => {
				while (cursor < pending.length) {
					const file = pending[cursor++];
					await load(file);
				}
			}));
		}
		//#endregion
		//#region src/client/GitReviewFile.tsx
		/** Controlled Git file display; comparison requests and loading stay in the panel. */
		function GitReviewFile({ file, target, sourceKey, open, diff, onToggle }) {
			const openFile = useReviewFileOpener();
			const [openError, setOpenError] = (0, react.useState)(null);
			const openInEditor = () => {
				setOpenError(null);
				try {
					openFile(resolveSessionPath(file.repository, file.path));
				} catch (error) {
					setOpenError(error instanceof Error ? error.message : t("sidebarOpenFailed"));
				}
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
				className: FileReviewTab_module_css_default.fileItem,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: FileReviewTab_module_css_default.fileRow,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								className: FileReviewTab_module_css_default.gitFileName,
								type: "button",
								"aria-expanded": open,
								title: file.path,
								onClick: onToggle,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: open ? "⌄" : "›" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: FileReviewTab_module_css_default.fileName,
									children: file.oldPath ? `${file.oldPath} → ${file.path}` : file.path
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: FileReviewTab_module_css_default.stateBadge,
								children: file.status
							}),
							file.binary ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: FileReviewTab_module_css_default.stateBadge,
								children: t("reviewBinary")
							}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: FileReviewTab_module_css_default.stats,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: FileReviewTab_module_css_default.added,
									children: ["+", file.added]
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: FileReviewTab_module_css_default.removed,
									children: ["-", file.removed]
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ReviewFileCommentButton, { target }),
							file.status !== "D" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								className: `${FileReviewTab_module_css_default.smallButton} ${FileReviewTab_module_css_default.editorButton}`,
								type: "button",
								onClick: openInEditor,
								children: t("openInEditor")
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ReviewFileCommentThread, { target }),
					openError && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
						role: "alert",
						children: [
							t("sidebarOpenFailed"),
							" ",
							openError
						]
					}),
					open && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: FileReviewTab_module_css_default.diffWrap,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(GitReviewFileDiff, {
							diff,
							sourceKey,
							target
						})
					})
				]
			});
		}
		function GitReviewFileDiff({ diff, sourceKey, target }) {
			if (diff === null || diff === void 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("reviewLoading") });
			if (typeof diff === "string") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				role: "alert",
				children: localizeReviewMessage(diff)
			});
			if (diff.diffs.length === 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", { children: [diff.binary ? t("reviewBinaryHint") : t("reviewMetadataOnly"), diff.note ? ` (${localizeReviewMessage(diff.note)})` : ""] });
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(UnifiedDiff, {
				diffs: diff.diffs,
				sourceKey,
				reviewTarget: target,
				contextLines: 3,
				showCopyButton: true,
				showFileHeaders: false,
				labels: {
					copy: t("copy"),
					copied: t("copied"),
					expandContext: (count, remaining) => t("expandContext", {
						count,
						remaining
					}),
					collapseContext: t("collapseContext"),
					unavailableContext: (count) => t("unavailableContext", { count })
				}
			});
		}
		//#endregion
		//#region src/client/review-confirmations.ts
		const revisions = /* @__PURE__ */ new WeakMap();
		/** Identify the complete recorded turn, independent of repository filtering. */
		function turnConfirmationRevision(turn) {
			const cached = revisions.get(turn);
			if (cached !== void 0) return cached;
			let first = 2166136261;
			let second = 2654435769;
			const add = (value) => {
				for (let index = 0; index < value.length; index++) {
					const code = value.charCodeAt(index);
					first = Math.imul(first ^ code, 16777619);
					second = Math.imul(second ^ code, 1540483477);
				}
				first = Math.imul(first ^ 255, 16777619);
				second = Math.imul(second ^ 255, 1540483477);
			};
			add(String(turn.turn));
			for (const file of [...turn.files].sort((left, right) => left.path < right.path ? -1 : left.path > right.path ? 1 : 0)) add(JSON.stringify([
				file.path,
				file.deleted === true,
				file.diffs.map((diff) => [
					diff.path,
					diff.oldStart ?? null,
					diff.newStart ?? null,
					diff.oldText,
					diff.newText
				])
			]));
			const revision = `r1:${(first >>> 0).toString(16).padStart(8, "0")}${(second >>> 0).toString(16).padStart(8, "0")}`;
			revisions.set(turn, revision);
			return revision;
		}
		function isTurnConfirmed(turn, confirmed) {
			const revision = confirmed.get(turn.turn);
			return !turn.live && revision !== void 0 && revision === turnConfirmationRevision(turn);
		}
		function pendingTurnChanges(turns, confirmed) {
			return turns.filter((turn) => !isTurnConfirmed(turn, confirmed));
		}
		function parseConfirmations(raw) {
			const value = JSON.parse(raw);
			if (value?.version !== 1 || !Array.isArray(value.confirmed)) throw new Error("Invalid review confirmations");
			const confirmed = /* @__PURE__ */ new Map();
			for (const entry of value.confirmed) {
				if (!Array.isArray(entry) || entry.length !== 2 || !Number.isSafeInteger(entry[0]) || entry[0] < 1 || typeof entry[1] !== "string" || !/^r1:[0-9a-f]{16}$/.test(entry[1]) || confirmed.has(entry[0])) throw new Error("Invalid review confirmation");
				confirmed.set(entry[0], entry[1]);
			}
			return confirmed;
		}
		/** Session-local review decisions; confirming never writes project files or Git. */
		var ReviewConfirmationStore = class {
			snapshot = {
				confirmed: /* @__PURE__ */ new Map(),
				storageError: false
			};
			listeners = /* @__PURE__ */ new Set();
			storage;
			key;
			constructor(storage, key = "") {
				this.storage = storage;
				this.key = key;
				try {
					const raw = storage?.getItem(key);
					if (raw !== null && raw !== void 0) this.snapshot = {
						confirmed: parseConfirmations(raw),
						storageError: false
					};
				} catch {
					this.snapshot = {
						...this.snapshot,
						storageError: true
					};
				}
			}
			getSnapshot = () => this.snapshot;
			subscribe = (listener) => {
				this.listeners.add(listener);
				return () => {
					this.listeners.delete(listener);
				};
			};
			setConfirmed(turn, confirm) {
				if (!Number.isSafeInteger(turn.turn) || turn.turn < 1 || confirm && (turn.live || turn.files.length === 0)) return false;
				const confirmed = new Map(this.snapshot.confirmed);
				if (confirm) confirmed.set(turn.turn, turnConfirmationRevision(turn));
				else confirmed.delete(turn.turn);
				let storageError = false;
				try {
					if (!this.storage) storageError = true;
					else this.storage.setItem(this.key, JSON.stringify({
						version: 1,
						confirmed: [...confirmed]
					}));
				} catch {
					storageError = true;
				}
				this.snapshot = {
					confirmed,
					storageError
				};
				for (const listener of this.listeners) listener();
				return true;
			}
		};
		const stores = /* @__PURE__ */ new Map();
		function confirmationStoreFor(sessionId) {
			let store = stores.get(sessionId);
			if (!store) {
				let storage;
				try {
					storage = window.localStorage;
				} catch {}
				store = new ReviewConfirmationStore(storage, `dsh-file-review-tab-multi-git-repository:confirmations:${sessionId}`);
				stores.set(sessionId, store);
			}
			return store;
		}
		//#endregion
		//#region src/client/review-scope-model.ts
		/** A new session scope must explicitly choose its filtering and paging behavior. */
		const SESSION_SCOPE_BEHAVIORS = {
			"last-turn": {
				select: ({ snapshot, turns }) => lastTurnChanges(snapshot, turns),
				pagination: "archive",
				empty: "empty",
				filteredEmpty: "repoFilterEmpty"
			},
			session: {
				select: ({ turns }) => turns,
				pagination: "archive",
				empty: "empty",
				filteredEmpty: "repoFilterEmpty"
			},
			pending: {
				select: ({ turns, confirmed }) => pendingTurnChanges(turns, confirmed),
				pagination: "pending",
				empty: "pendingEmpty",
				filteredEmpty: "pendingRepoEmpty"
			}
		};
		/** Session hooks remain mounted in Git scopes and keep their existing all-turn view. */
		function sessionScopeBehavior(mode) {
			return SESSION_SCOPE_BEHAVIORS[isSessionReviewMode(mode) ? mode : "session"];
		}
		const REFERENCE_SELECTORS = {
			commit: {
				defaultLabel: "reviewHead",
				options: (repository) => repository.commits.map((commit) => ({
					value: commit.oid,
					label: `${commit.oid.slice(0, 8)} · ${commit.subject} · ${commit.date}`
				}))
			},
			branch: {
				defaultLabel: "reviewAutoBranch",
				options: (repository) => repository.branches.map((branch) => ({
					value: branch,
					label: branch
				}))
			}
		};
		function gitReferenceSelector(mode, repository) {
			const scope = REVIEW_SCOPES[mode];
			if (scope.reference === "none") return null;
			const selector = REFERENCE_SELECTORS[scope.reference];
			return {
				label: scope.label,
				defaultLabel: selector.defaultLabel,
				options: repository === void 0 ? [] : selector.options(repository)
			};
		}
		//#endregion
		//#region src/client/GitReviewPanel.tsx
		async function unwrap(promise) {
			const result = await promise;
			if (!result.ok) throw new Error(result.error.message);
			return result.value;
		}
		/** Own the comparison epoch and loading queue; individual files only render their state. */
		function GitReviewPanel({ ctx, sessionId, mode, visible, tick }) {
			useReviewLocale();
			const sessions = ctx.sessions;
			const remote = () => {
				const value = sessions.scope(sessionId)?.get("remote.fileReview");
				if (!value) throw new Error(t("remoteUnavailable"));
				return value;
			};
			const [repository, setRepository] = (0, react.useState)("*");
			const [ref, setRef] = (0, react.useState)("");
			const [data, setData] = (0, react.useState)(null);
			const [loading, setLoading] = (0, react.useState)(false);
			const [error, setError] = (0, react.useState)("");
			const [expanded, setExpanded] = (0, react.useState)(() => /* @__PURE__ */ new Set());
			const [collapsedRepositories, setCollapsedRepositories] = (0, react.useState)(() => /* @__PURE__ */ new Set());
			const [diffs, setDiffs] = (0, react.useState)(/* @__PURE__ */ new Map());
			const version = (0, react.useRef)(0);
			const requestedDiffs = (0, react.useRef)(/* @__PURE__ */ new Set());
			const keyOf = (file) => `${file.repository}\0${file.path}`;
			const request = () => ({
				mode,
				...repository !== "*" ? { repository } : {},
				...ref ? { ref } : {}
			});
			(0, react.useEffect)(() => {
				setRepository("*");
				setRef("");
				setCollapsedRepositories(/* @__PURE__ */ new Set());
			}, [sessionId, mode]);
			(0, react.useEffect)(() => {
				if (!visible) return;
				const current = ++version.current;
				requestedDiffs.current = /* @__PURE__ */ new Set();
				setLoading(true);
				setError("");
				setExpanded(/* @__PURE__ */ new Set());
				setDiffs(/* @__PURE__ */ new Map());
				Promise.resolve().then(() => unwrap(remote().gitReview(request()))).then((result) => {
					if (version.current !== current) return;
					setData(result);
				}).catch((cause) => {
					if (version.current === current) setError(cause instanceof Error ? cause.message : String(cause));
				}).finally(() => {
					if (version.current === current) setLoading(false);
				});
				return () => {
					version.current++;
				};
			}, [
				sessionId,
				mode,
				repository,
				ref,
				visible,
				tick
			]);
			const loadDiffs = (files) => {
				const current = version.current;
				const comparison = request();
				loadMissingReviewDiffs(files, keyOf, requestedDiffs.current, async (file) => {
					if (version.current !== current) return;
					const key = keyOf(file);
					setDiffs((value) => new Map(value).set(key, null));
					try {
						const result = await unwrap(remote().gitReviewDiff({
							...comparison,
							repository: file.repository,
							path: file.path
						}));
						if (version.current === current) setDiffs((value) => new Map(value).set(key, result));
					} catch (cause) {
						if (version.current === current) setDiffs((value) => new Map(value).set(key, cause instanceof Error ? cause.message : String(cause)));
					}
				});
			};
			const setContents = (files, open) => {
				setExpanded((current) => setFileContentsExpanded(current, files.map(keyOf), open));
				if (open) loadDiffs(files);
			};
			const toggleFile = (file) => {
				setContents([file], !expanded.has(keyOf(file)));
			};
			const selected = data?.repositories.find((repo) => repo.path === repository);
			const totals = data?.files.reduce((stats, file) => ({
				added: stats.added + file.added,
				removed: stats.removed + file.removed
			}), {
				added: 0,
				removed: 0
			});
			const referenceSelector = gitReferenceSelector(mode, selected);
			const refsMode = referenceSelector !== null;
			const repositoryGroups = groupReviewFiles(data?.files ?? [], (file) => ({
				key: file.repository,
				path: file.repository,
				name: data?.repositories.find((repo) => repo.path === file.repository)?.name ?? file.repository
			}));
			const groupKeys = repositoryGroups.map((group) => repositoryGroupId(sessionId, mode, group.key));
			const allExpanded = allFileContentsExpanded(expanded, (data?.files ?? []).map(keyOf)) && groupKeys.every((key) => !collapsedRepositories.has(key));
			const selectRepository = (path) => {
				setRepository(path);
				setRef("");
			};
			const toggleAllContents = () => {
				if (data === null) return;
				setContents(data.files, !allExpanded);
				if (!allExpanded) setCollapsedRepositories((current) => setRepositoryGroupsCollapsed(current, groupKeys, false));
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: FileReviewTab_module_css_default.gitPanel,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: FileReviewTab_module_css_default.repositoryBar,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
							"aria-label": t("repository"),
							value: repository,
							onChange: (event) => {
								selectRepository(event.target.value);
							},
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
								value: "*",
								children: t("repoAll")
							}), data?.repositories.map((repo) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
								value: repo.path,
								children: repo.name
							}, repo.path))]
						}),
						referenceSelector !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
							"aria-label": t(referenceSelector.label),
							value: ref,
							disabled: !selected,
							onChange: (event) => {
								setRef(event.target.value);
							},
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
								value: "",
								children: t(referenceSelector.defaultLabel)
							}), referenceSelector.options.map((option) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
								value: option.value,
								children: option.label
							}, option.value))]
						}),
						!loading && totals && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: FileReviewTab_module_css_default.stats,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: FileReviewTab_module_css_default.added,
								children: ["+", totals.added]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: FileReviewTab_module_css_default.removed,
								children: ["-", totals.removed]
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: refsMode && repository === "*" ? t("reviewSelectRepository") : t("reviewGitHint") }),
						!loading && data?.comparisons.length ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", {
							title: data.comparisons.join("\n"),
							children: selected ? data.comparisons[0] : t("reviewRepoCount", { count: data.repositories.length })
						}) : null
					]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: FileReviewTab_module_css_default.body,
					children: [
						error && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: `${FileReviewTab_module_css_default.notice} ${FileReviewTab_module_css_default.noticeError}`,
							role: "alert",
							children: localizeReviewMessage(error)
						}),
						!loading && !error && data?.warnings.map((warning) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: `${FileReviewTab_module_css_default.notice} ${FileReviewTab_module_css_default.noticeError}`,
							children: localizeReviewMessage(warning)
						}, warning)),
						loading ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: FileReviewTab_module_css_default.empty,
							role: "status",
							children: t("reviewLoading")
						}) : !error && data && !data.files.length ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: FileReviewTab_module_css_default.empty,
							children: t(data.repositories.length ? "reviewGitEmpty" : "reviewNoGit")
						}) : null,
						!loading && !error && data && data.files.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
							className: FileReviewTab_module_css_default.turnGroup,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
								className: FileReviewTab_module_css_default.turnHeader,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: FileReviewTab_module_css_default.turnTitle,
									children: t("reviewFiles", { count: data.files.length })
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: FileReviewTab_module_css_default.gitVisibility,
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FileContentsButton, {
										expanded: allExpanded,
										label: t(allExpanded ? "collapseAllRepositories" : "expandAllRepositories"),
										onClick: toggleAllContents
									})
								})]
							}), repositoryGroups.map((group) => {
								const groupId = repositoryGroupId(sessionId, mode, group.key);
								const groupFileKeys = group.files.map(keyOf);
								return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ReviewRepositoryGroup, {
									name: group.name,
									path: group.path,
									count: group.files.length,
									collapsed: collapsedRepositories.has(groupId),
									onCollapsedChange: (collapsed) => {
										setCollapsedRepositories((current) => setRepositoryGroupsCollapsed(current, [groupId], collapsed));
									},
									contentsExpanded: allFileContentsExpanded(expanded, groupFileKeys),
									onContentsExpandedChange: (open) => {
										setContents(group.files, open);
									},
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
										className: FileReviewTab_module_css_default.fileList,
										children: group.files.map((file) => {
											const key = keyOf(file);
											const repo = data.repositories.find((item) => item.path === file.repository);
											const commentTarget = {
												scope: mode,
												repository: file.repository,
												repositoryName: repo?.name ?? file.repository,
												path: file.path,
												absolutePath: resolveSessionPath(file.repository, file.path),
												...refsMode ? { ref: ref || data.comparisons.join("\n") } : {}
											};
											return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(GitReviewFile, {
												file,
												target: commentTarget,
												sourceKey: JSON.stringify([
													sessionId,
													mode,
													file.repository,
													file.path,
													ref
												]),
												open: expanded.has(key),
												diff: diffs.get(key),
												onToggle: () => {
													toggleFile(file);
												}
											}, key);
										})
									})
								}, `${sessionId}:${mode}:${group.key}`);
							})]
						})
					]
				})]
			});
		}
		//#endregion
		//#region src/client/file-review-model.ts
		/** Keep the existing row identity: expansion, status and deep links share it. */
		function stateKey(turn, path) {
			return `${turn}|${path}`;
		}
		/** A change group is reversible only with complete contextual hunks. */
		function isReversible(file) {
			return file.diffs.length > 0 && file.diffs.every((diff) => diff.path === file.path && diff.oldText !== null && diff.oldText !== diff.newText && (diff.oldText !== "" || diff.oldStart !== void 0) && (diff.newText !== "" || diff.newStart !== void 0));
		}
		function addStats$1(left, right) {
			return {
				added: left.added + right.added,
				removed: left.removed + right.removed
			};
		}
		//#endregion
		//#region src/client/file-review-turn.tsx
		function FileReviewStats({ stats }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
				className: FileReviewTab_module_css_default.stats,
				"aria-label": t("stats", {
					added: String(stats.added),
					removed: String(stats.removed)
				}),
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
					className: FileReviewTab_module_css_default.added,
					children: ["+", stats.added]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
					className: FileReviewTab_module_css_default.removed,
					children: ["-", stats.removed]
				})]
			});
		}
		function UndoIcon() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				viewBox: "0 0 20 20",
				"aria-hidden": "true",
				className: FileReviewTab_module_css_default.buttonIcon,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M8 5 4 9l4 4M4 9h7a5 5 0 0 1 5 5v1" })
			});
		}
		function RedoIcon() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				viewBox: "0 0 20 20",
				"aria-hidden": "true",
				className: FileReviewTab_module_css_default.buttonIcon,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m12 5 4 4-4 4M16 9H9a5 5 0 0 0-5 5v1" })
			});
		}
		function FileReviewChevron({ open }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				viewBox: "0 0 20 20",
				"aria-hidden": "true",
				className: `${FileReviewTab_module_css_default.chevron} ${open ? FileReviewTab_module_css_default.chevronOpen : ""}`,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m7 5 5 5-5 5" })
			});
		}
		/** Per-(turn,file) host-inspected state badge; nothing renders for 'applied'. */
		function StateBadge({ state }) {
			if (state === void 0 || state === "applied") return null;
			const label = state === "undone" ? t("stateUndone") : state === "conflict" ? t("stateConflict") : state === "unsupported" ? t("stateUnsupported") : t("stateError");
			const tone = state === "undone" ? FileReviewTab_module_css_default.badgeUndone : state === "unsupported" ? FileReviewTab_module_css_default.badgeMuted : FileReviewTab_module_css_default.badgeError;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: `${FileReviewTab_module_css_default.stateBadge} ${tone}`,
				children: label
			});
		}
		/** Mounts the heavy diff renderer only when the row nears the viewport. */
		function LazyDiff({ children }) {
			const holderRef = (0, react.useRef)(null);
			const [inView, setInView] = (0, react.useState)(false);
			(0, react.useEffect)(() => {
				if (inView) return;
				const element = holderRef.current;
				if (element === null) return;
				if (typeof IntersectionObserver === "undefined") {
					setInView(true);
					return;
				}
				const observer = new IntersectionObserver((entries) => {
					if (entries.some((entry) => entry.isIntersecting)) {
						setInView(true);
						observer.disconnect();
					}
				}, { rootMargin: "200px 0px" });
				observer.observe(element);
				return () => {
					observer.disconnect();
				};
			}, [inView]);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				ref: holderRef,
				children: inView ? children : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { style: { minHeight: "96px" } })
			});
		}
		/** A filtered turn retains its complete original turn for confirmation identity. */
		function FileReviewTurn({ turn, fullTurn, view }) {
			const { sessionId, cwd, workspace, expansion, actions, confirmationStore, confirmationSnapshot, turnRefs } = view;
			const { expanded, collapsedRepositories, setExpanded, setCollapsedRepositories } = expansion;
			const { states, statusPending, busyKey, runToggle } = actions;
			const ownerOf = (path) => fileRepository(resolveSessionPath(cwd, path), workspace?.repositories ?? []);
			const repositoryGroups = groupReviewFiles(turn.files, (file) => {
				const repository = ownerOf(file.path);
				if (repository) return {
					key: repository.path,
					name: repository.name,
					path: repository.path
				};
				if (workspace?.project) return {
					key: "?",
					name: t("repoOther"),
					path: ""
				};
				return {
					key: cwd ?? "?",
					name: basename$1(cwd ?? "") || t("repoOther"),
					path: cwd ?? ""
				};
			});
			const groupKeys = repositoryGroups.map((group) => repositoryGroupId(sessionId, turn.turn, group.key));
			const fileKeys = turn.files.map((file) => stateKey(turn.turn, file.path));
			const allExpanded = allFileContentsExpanded(expanded, fileKeys) && groupKeys.every((key) => !collapsedRepositories.has(key));
			const confirmed = isTurnConfirmed(fullTurn, confirmationSnapshot.confirmed);
			const turnStats = turn.files.reduce((total, file) => addStats$1(total, summarizeDiffs(file.diffs)), {
				added: 0,
				removed: 0
			});
			const reversible = turn.files.filter(isReversible);
			const turnAction = reversible.length > 0 && reversible.every((file) => states.get(stateKey(turn.turn, file.path)) === "undone") ? "redo" : "undo";
			const turnKey = `turn:${turn.turn}`;
			const turnBusy = busyKey === turnKey;
			const confirmTitle = fullTurn.live ? t("confirmTurnLive") : confirmed ? t("unconfirmTurnHint") : t("confirmTurnHint", { count: fullTurn.files.length });
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				ref: (element) => {
					if (element === null) turnRefs.current.delete(turn.turn);
					else turnRefs.current.set(turn.turn, element);
				},
				className: FileReviewTab_module_css_default.turnGroup,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
					className: FileReviewTab_module_css_default.turnHeader,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: FileReviewTab_module_css_default.turnTitle,
							children: t("turn", { n: turn.turn })
						}),
						turn.live && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: FileReviewTab_module_css_default.liveBadge,
							children: t("turnLive")
						}),
						confirmed && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: FileReviewTab_module_css_default.confirmedBadge,
							children: t("turnConfirmed")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: FileReviewTab_module_css_default.turnCount,
							children: turn.files.length === 1 ? t("filesOne") : t("files", { count: turn.files.length })
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(FileReviewStats, { stats: turnStats }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: FileReviewTab_module_css_default.turnActions,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(FileContentsButton, {
									expanded: allExpanded,
									label: t(allExpanded ? "collapseTurnRepositories" : "expandTurnRepositories"),
									onClick: () => {
										setExpanded((current) => setFileContentsExpanded(current, fileKeys, !allExpanded));
										if (!allExpanded) setCollapsedRepositories((current) => setRepositoryGroupsCollapsed(current, groupKeys, false));
									}
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: FileReviewTab_module_css_default.actionButton,
									disabled: fullTurn.live || busyKey !== null,
									title: confirmTitle,
									onClick: () => {
										confirmationStore.setConfirmed(fullTurn, !confirmed);
									},
									children: t(confirmed ? "unconfirmTurn" : "confirmTurn")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: FileReviewTab_module_css_default.actionButton,
									disabled: statusPending || busyKey !== null || reversible.length === 0,
									title: reversible.length === 0 ? t("toggleUnavailable") : void 0,
									onClick: () => {
										runToggle(turnKey, turn.files.filter((file) => file.deleted !== true).map((file) => ({
											turn: turn.turn,
											path: file.path,
											diffs: file.diffs
										})), turnAction);
									},
									children: [turnAction === "undo" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(UndoIcon, {}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(RedoIcon, {}), turnBusy ? t(turnAction === "undo" ? "undoing" : "redoing") : t(turnAction === "undo" ? "undoTurn" : "redoTurn")]
								})
							]
						})
					]
				}), repositoryGroups.map((group) => {
					const groupId = repositoryGroupId(sessionId, turn.turn, group.key);
					const groupFileKeys = group.files.map((file) => stateKey(turn.turn, file.path));
					return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ReviewRepositoryGroup, {
						name: group.name,
						path: group.path,
						count: group.files.length,
						collapsed: collapsedRepositories.has(groupId),
						onCollapsedChange: (collapsed) => {
							setCollapsedRepositories((current) => setRepositoryGroupsCollapsed(current, [groupId], collapsed));
						},
						contentsExpanded: allFileContentsExpanded(expanded, groupFileKeys),
						onContentsExpandedChange: (open) => {
							setExpanded((current) => setFileContentsExpanded(current, groupFileKeys, open));
						},
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
							className: FileReviewTab_module_css_default.fileList,
							children: group.files.map((file) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FileReviewFile, {
								turn,
								file,
								view
							}, file.path))
						})
					}, `${sessionId}:${turn.turn}:${group.key}`);
				})]
			}, turn.turn);
		}
		/** One file row owns its comment target and mounts a diff only while expanded. */
		function FileReviewFile({ turn, file, view }) {
			const { sessionId, cwd, workspace, reviewMode, expansion, actions, rowRefs, toggleExpanded, openInEditor } = view;
			const { expanded } = expansion;
			const { states, statusPending, busyKey, runToggle } = actions;
			const ownerOf = (path) => fileRepository(resolveSessionPath(cwd, path), workspace?.repositories ?? []);
			const key = stateKey(turn.turn, file.path);
			const isOpen = expanded.has(key);
			const state = states.get(key);
			const reversible = isReversible(file);
			const fileAction = state === "undone" ? "redo" : "undo";
			const fileBusy = busyKey === key;
			const stats = summarizeDiffs(file.diffs);
			const repository = ownerOf(file.path);
			const absolutePath = resolveSessionPath(cwd, file.path);
			const commentTarget = {
				scope: isSessionReviewMode(reviewMode) ? reviewMode : "session",
				turn: turn.turn,
				repository: repository?.path ?? cwd ?? "",
				repositoryName: repository?.name ?? basename$1(cwd ?? ""),
				path: repository ? repositoryRelativePath(absolutePath, repository) : relativeProjectDirectory(cwd ?? "", absolutePath) ?? file.path,
				absolutePath
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
				className: FileReviewTab_module_css_default.fileItem,
				ref: (element) => {
					if (element === null) rowRefs.current.delete(key);
					else rowRefs.current.set(key, element);
				},
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: FileReviewTab_module_css_default.fileRow,
						role: "button",
						tabIndex: 0,
						title: file.path,
						"aria-expanded": isOpen,
						onClick: () => {
							toggleExpanded(key);
						},
						onKeyDown: (event) => {
							if (event.key === "Enter" || event.key === " ") {
								event.preventDefault();
								toggleExpanded(key);
							}
						},
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(FileReviewChevron, { open: isOpen }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: FileReviewTab_module_css_default.fileName,
								children: commentTarget.path
							}),
							file.deleted === true ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: FileReviewTab_module_css_default.deletedBadge,
								children: t("deleted")
							}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FileReviewStats, { stats }),
							file.deleted !== true && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(StateBadge, { state }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ReviewFileCommentButton, { target: commentTarget }),
							file.deleted !== true && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: `${FileReviewTab_module_css_default.smallButton} ${FileReviewTab_module_css_default.editorButton}`,
								onClick: (event) => {
									event.stopPropagation();
									openInEditor(file.path);
								},
								children: t("openInEditor")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: FileReviewTab_module_css_default.smallButton,
								disabled: statusPending || busyKey !== null || !reversible,
								title: file.deleted === true ? t("deletedHint") : !reversible ? t("toggleUnavailable") : void 0,
								onClick: (event) => {
									event.stopPropagation();
									runToggle(key, [{
										turn: turn.turn,
										path: file.path,
										diffs: file.diffs
									}], fileAction);
								},
								children: fileBusy ? t(fileAction === "undo" ? "undoing" : "redoing") : t(fileAction === "undo" ? "undo" : "redo")
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ReviewFileCommentThread, { target: commentTarget }),
					isOpen && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: FileReviewTab_module_css_default.diffWrap,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(LazyDiff, { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FileReviewDiff, {
							sessionId,
							file,
							target: commentTarget
						}) })
					})
				]
			}, file.path);
		}
		/** Display data may include full context; Host undo always uses the original hunks. */
		function FileReviewDiff({ sessionId, file, target }) {
			if (file.deleted === true) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				className: FileReviewTab_module_css_default.diffUnavailable,
				children: t("deletedHint")
			});
			if (file.diffs.length === 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				className: FileReviewTab_module_css_default.diffUnavailable,
				children: t("unavailable")
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(UnifiedDiff, {
				diffs: file.reviewDiffs ?? file.diffs,
				sourceKey: JSON.stringify([
					sessionId,
					target.turn,
					target.repository,
					file.path
				]),
				contextLines: 3,
				showCopyButton: true,
				showFileHeaders: false,
				labels: {
					copy: t("copy"),
					copied: t("copied"),
					expandContext: (count, remaining) => t("expandContext", {
						count,
						remaining
					}),
					collapseContext: t("collapseContext"),
					unavailableContext: (count) => t("unavailableContext", { count })
				},
				className: FileReviewTab_module_css_default.reviewDiff,
				reviewTarget: target
			});
		}
		//#endregion
		//#region src/client/use-file-review-conversation.ts
		/** Read the conversation and merge Host-only nested Code Mode mutations. */
		function useFileReviewConversation(ctx, sessions, sessionId, visible, tick) {
			const uiConversation = ctx.get("uiConversation");
			let conversationSource;
			try {
				conversationSource = uiConversation?.binding(sessionId).snapshot;
			} catch {
				conversationSource = void 0;
			}
			const subscribe = (0, react.useCallback)((listener) => visible ? conversationSource?.subscribe(listener) ?? (() => {}) : () => {}, [conversationSource, visible]);
			const retainedSnapshot = (0, react.useRef)(null);
			const getSnapshot = (0, react.useCallback)(() => {
				if (visible) retainedSnapshot.current = conversationSource?.getSnapshot() ?? null;
				return retainedSnapshot.current;
			}, [conversationSource, visible]);
			const snapshot = (0, react.useSyncExternalStore)(subscribe, getSnapshot);
			const roots = (0, react.useMemo)(() => snapshot === null ? [] : deriveSessionRoots(snapshot), [snapshot]);
			const rootsKey = (0, react.useMemo)(() => roots.map((root) => root.rootCallId).join("|"), [roots]);
			const [recorded, setRecorded] = (0, react.useState)(() => []);
			const [recordedKey, setRecordedKey] = (0, react.useState)(null);
			(0, react.useEffect)(() => {
				if (!visible || roots.length === 0) return;
				let active = true;
				const timer = window.setTimeout(() => {
					const scope = sessions.scope(sessionId);
					const remote = scope?.get("remote.fileReview");
					if (scope === void 0 || remote === void 0) {
						active = false;
						return;
					}
					remote.recorded({ rootCallIds: roots.map((root) => root.rootCallId) }).then((result) => {
						if (!result.ok || !active) return;
						setRecorded(result.value.mutations);
						setRecordedKey(rootsKey);
					}).catch(() => {});
				}, 200);
				return () => {
					active = false;
					window.clearTimeout(timer);
				};
			}, [
				visible,
				rootsKey,
				tick,
				sessions,
				sessionId
			]);
			return {
				snapshot,
				turns: (0, react.useMemo)(() => mergeRecordedTurns(deriveSessionChanges(snapshot), roots, recorded), [
					snapshot,
					roots,
					recorded
				]),
				ready: snapshot !== null && (roots.length === 0 || recordedKey === rootsKey)
			};
		}
		//#endregion
		//#region src/client/use-file-review-archive.ts
		const ARCHIVE_STORAGE_PREFIX = "dsh-file-review-tab-multi-git-repository:archive:";
		const LEGACY_ARCHIVE_STORAGE_PREFIX = "dsh-file-review-tab:archive:";
		/** Pending queues page newest-first; other session scopes use a saved archive. */
		function useFileReviewArchive(sessionId, filteredTurns, reviewMode, pendingPages) {
			const pendingQueue = sessionScopeBehavior(reviewMode).pagination === "pending";
			const { main: mainTurns, archived: archivedTurns } = (0, react.useMemo)(() => {
				if (!pendingQueue) return splitArchivedTurns(filteredTurns);
				return {
					main: [...filteredTurns].sort((left, right) => right.turn - left.turn).slice(0, pendingPages * 10),
					archived: []
				};
			}, [
				filteredTurns,
				pendingQueue,
				pendingPages
			]);
			const pendingRemaining = pendingQueue ? filteredTurns.length - mainTurns.length : 0;
			const [archiveOpen, setArchiveOpen] = (0, react.useState)(false);
			const [archivePages, setArchivePages] = (0, react.useState)(1);
			(0, react.useEffect)(() => {
				try {
					const storageKey = `${ARCHIVE_STORAGE_PREFIX}${sessionId}`;
					let raw = window.localStorage.getItem(storageKey);
					if (raw === null) {
						raw = window.localStorage.getItem(`${LEGACY_ARCHIVE_STORAGE_PREFIX}${sessionId}`);
						if (raw !== null) window.localStorage.setItem(storageKey, raw);
					}
					const parsed = raw === null ? void 0 : JSON.parse(raw);
					setArchiveOpen(parsed?.open === true);
					setArchivePages(typeof parsed?.pages === "number" && Number.isInteger(parsed.pages) && parsed.pages >= 1 ? parsed.pages : 1);
				} catch {
					setArchiveOpen(false);
					setArchivePages(1);
				}
			}, [sessionId]);
			(0, react.useEffect)(() => {
				try {
					window.localStorage.setItem(`${ARCHIVE_STORAGE_PREFIX}${sessionId}`, JSON.stringify({
						open: archiveOpen,
						pages: archivePages
					}));
				} catch {}
			}, [
				sessionId,
				archiveOpen,
				archivePages
			]);
			const archivedVisible = (0, react.useMemo)(() => archiveOpen ? archivedTurns.slice(0, archivePages * 10) : [], [
				archiveOpen,
				archivePages,
				archivedTurns
			]);
			const archivedRemaining = archivedTurns.length - archivedVisible.length;
			return {
				mainTurns,
				archivedTurns,
				archivedVisible,
				renderedTurns: (0, react.useMemo)(() => [...mainTurns, ...archivedVisible], [mainTurns, archivedVisible]),
				pendingRemaining,
				archivedRemaining,
				archiveOpen,
				setArchiveOpen,
				setArchivePages
			};
		}
		//#endregion
		//#region src/client/deep-link.ts
		const latest = /* @__PURE__ */ new Map();
		const listeners = /* @__PURE__ */ new Set();
		let nonce = 0;
		/** Publish a deep link for one session and return the stored seed. */
		function publishFileReviewSeed(sessionId, paths, turn) {
			nonce += 1;
			const seed = {
				paths: [...paths],
				...turn === void 0 ? {} : { turn },
				nonce
			};
			latest.set(sessionId, seed);
			for (const listener of listeners) listener(sessionId, seed);
			return seed;
		}
		/** The most recent seed for a session, if the tab has not consumed it yet. */
		function currentFileReviewSeed(sessionId) {
			return latest.get(sessionId);
		}
		/** Only the request that actually completed may remove the session's latest target. */
		function discardFileReviewSeed(sessionId, consumedNonce) {
			const seed = latest.get(sessionId);
			if (consumedNonce === void 0 || seed?.nonce === consumedNonce) latest.delete(sessionId);
		}
		function clearFileReviewSeeds() {
			latest.clear();
			listeners.clear();
		}
		/** Observe every publish; the caller filters by session. */
		function subscribeFileReviewSeed(listener) {
			listeners.add(listener);
			return () => {
				listeners.delete(listener);
			};
		}
		//#endregion
		//#region src/client/use-file-review-deep-link.ts
		/** Replay chat links without replacing the user's expansion or scrolling the sidebar shell. */
		function useFileReviewDeepLink({ sessionId, turns, visible, ready, meta, expanded, flatKey, setReviewMode, setRepositoryFilter, setArchiveOpen, setArchivePages, setExpanded, setCollapsedRepositories, onMissing }) {
			const turnsRef = (0, react.useRef)(turns);
			turnsRef.current = turns;
			const archivedTurnsRef = (0, react.useRef)(splitArchivedTurns(turns).archived);
			archivedTurnsRef.current = splitArchivedTurns(turns).archived;
			const rowRefs = (0, react.useRef)(/* @__PURE__ */ new Map());
			const turnRefs = (0, react.useRef)(/* @__PURE__ */ new Map());
			const bodyRef = (0, react.useRef)(null);
			const lastSeedNonceRef = (0, react.useRef)(void 0);
			const pendingScrollRef = (0, react.useRef)(null);
			const [seed, setSeed] = (0, react.useState)(() => currentFileReviewSeed(sessionId));
			const replayLink = (0, react.useCallback)((paths, targetTurn, nonce) => {
				if (paths.length === 0) return;
				setReviewMode("session");
				setRepositoryFilter("*");
				const ownerTurn = targetTurn !== void 0 ? turnsRef.current.find((turn) => turn.turn === targetTurn) : turnsRef.current.find((turn) => turn.files.some((file) => paths.includes(file.path)));
				if (ownerTurn !== void 0 && ownerTurn.live !== true) {
					const archivedIndex = archivedTurnsRef.current.findIndex((turn) => turn.turn === ownerTurn.turn);
					if (archivedIndex !== -1) {
						setArchiveOpen(true);
						setArchivePages((current) => Math.max(current, Math.ceil((archivedIndex + 1) / 10)));
					}
				}
				const matches = (item) => paths.includes(item.path) && (targetTurn === void 0 || item.turn === targetTurn);
				const allFiles = turnsRef.current.flatMap((turn) => turn.files.map((file) => ({
					turn: turn.turn,
					path: file.path
				})));
				const linkedTurns = new Set(allFiles.filter(matches).map((item) => item.turn));
				setCollapsedRepositories((current) => new Set([...current].filter((key) => {
					const [ownerSession, ownerTurn] = JSON.parse(key);
					return ownerSession !== sessionId || !linkedTurns.has(ownerTurn);
				})));
				setExpanded((current) => {
					const next = new Set(current);
					for (const item of allFiles) if (matches(item)) next.add(stateKey(item.turn, item.path));
					return next;
				});
				const first = allFiles.find((item) => matches(item));
				pendingScrollRef.current = first === void 0 ? null : {
					rowKey: stateKey(first.turn, first.path),
					turn: paths.length > 1 ? first.turn : null,
					...nonce !== void 0 ? { nonce } : {}
				};
			}, [sessionId]);
			(0, react.useEffect)(() => {
				pendingScrollRef.current = null;
				lastSeedNonceRef.current = void 0;
				setSeed(currentFileReviewSeed(sessionId));
				return subscribeFileReviewSeed((ownerSessionId, seed) => {
					if (ownerSessionId !== sessionId) return;
					pendingScrollRef.current = null;
					setSeed(seed);
				});
			}, [sessionId]);
			(0, react.useEffect)(() => {
				if (!visible || !ready || !seed || lastSeedNonceRef.current === seed.nonce) return;
				const matched = turns.some((turn) => (seed.turn === void 0 || turn.turn === seed.turn) && turn.files.some((file) => seed.paths.includes(file.path)));
				if (!matched && turns.some((turn) => turn.live)) return;
				lastSeedNonceRef.current = seed.nonce;
				if (matched) replayLink(seed.paths, seed.turn, seed.nonce);
				else {
					pendingScrollRef.current = null;
					discardFileReviewSeed(sessionId, seed.nonce);
					onMissing();
				}
			}, [
				visible,
				ready,
				seed,
				turns,
				sessionId,
				replayLink,
				onMissing
			]);
			(0, react.useEffect)(() => {
				if (typeof meta !== "object" || meta === null || Array.isArray(meta)) return;
				const raw = meta.expandPaths;
				if (!Array.isArray(raw)) return;
				const paths = raw.slice(0, 1e3).filter((value) => typeof value === "string" && value.length <= 4096);
				const turnNo = meta.turn;
				replayLink(paths, typeof turnNo === "number" && Number.isInteger(turnNo) ? turnNo : void 0);
			}, [meta, replayLink]);
			(0, react.useEffect)(() => {
				if (!visible) return;
				const pending = pendingScrollRef.current;
				if (pending === null) return;
				const element = (pending.turn !== null ? turnRefs.current.get(pending.turn) : void 0) ?? rowRefs.current.get(pending.rowKey);
				if (element === void 0) return;
				pendingScrollRef.current = null;
				const scroll = () => {
					const container = bodyRef.current;
					if (container === null) return;
					const delta = element.getBoundingClientRect().top - container.getBoundingClientRect().top;
					container.scrollTo({
						top: container.scrollTop + delta - 8,
						behavior: "smooth"
					});
				};
				scroll();
				if (pending.nonce !== void 0) discardFileReviewSeed(sessionId, pending.nonce);
				const timer = window.setTimeout(scroll, 150);
				return () => window.clearTimeout(timer);
			}, [
				visible,
				expanded,
				meta,
				flatKey,
				seed,
				sessionId
			]);
			return {
				rowRefs,
				turnRefs,
				bodyRef
			};
		}
		//#endregion
		//#region src/client/use-file-review-actions.ts
		/** Inspect displayed changes and serialize per-turn/per-file undo and redo. */
		function useFileReviewActions({ sessions, sessionId, visible, isGitMode, flat, inspectable, flatKey, tick, showNotice, state }) {
			const { states, setStates, statusPending, setStatusPending, busyKey, setBusyKey } = state;
			const invoke = (0, react.useCallback)(async (method, request) => {
				const scope = sessions.scope(sessionId);
				if (scope === void 0) throw new Error(t("sessionUnavailable"));
				const remote = scope.get("remote.fileReview");
				if (remote === void 0) throw new Error(t("remoteUnavailable"));
				const result = await remote[method](request);
				if (!result.ok) throw new Error(result.error.message);
				return result.value;
			}, [sessions, sessionId]);
			(0, react.useEffect)(() => {
				if (!visible || isGitMode || flat.length === 0) {
					setStatusPending(false);
					return;
				}
				let active = true;
				setStatusPending(true);
				const timer = window.setTimeout(() => {
					const request = {
						action: "undo",
						files: inspectable.map((item) => ({
							path: item.path,
							diffs: item.diffs
						}))
					};
					invoke("status", request).then((result) => {
						if (!active) return;
						setStates(() => {
							const next = /* @__PURE__ */ new Map();
							inspectable.forEach((item, index) => {
								const file = result.files[index];
								if (file !== void 0) next.set(stateKey(item.turn, item.path), file.state);
							});
							return next;
						});
					}).catch(() => {}).finally(() => {
						if (active) setStatusPending(false);
					});
				}, 300);
				return () => {
					active = false;
					window.clearTimeout(timer);
				};
			}, [
				visible,
				isGitMode,
				flatKey,
				tick,
				invoke
			]);
			const mergeResultStates = (0, react.useCallback)((items, result) => {
				setStates((current) => {
					const next = new Map(current);
					items.forEach((item, index) => {
						const file = result.files[index];
						if (file !== void 0) next.set(stateKey(item.turn, item.path), file.state);
					});
					return next;
				});
			}, []);
			return {
				states,
				statusPending,
				busyKey,
				runToggle: (0, react.useCallback)((key, items, action) => {
					if (busyKey !== null || items.length === 0) return;
					setBusyKey(key);
					invoke("apply", {
						action,
						files: items.map((item) => ({
							path: item.path,
							diffs: item.diffs
						}))
					}).then((result) => {
						mergeResultStates(items, result);
						const target = action === "undo" ? "undone" : "applied";
						if (result.files.filter((file) => file.state !== target).length === 0) showNotice("success", action === "undo" ? "undoSuccess" : "redoSuccess");
						else showNotice("error", action === "undo" ? "undoPartial" : "redoPartial");
					}).catch((error) => {
						showNotice("error", "toggleError", error instanceof Error ? error.message : String(error));
					}).finally(() => {
						setBusyKey(null);
					});
				}, [
					busyKey,
					invoke,
					mergeResultStates,
					showNotice
				])
			};
		}
		//#endregion
		//#region src/client/FileReviewTab.tsx
		/** Session/Git review page: scope controls, review state and composed turn groups. */
		const SUCCESS_NOTICE_DURATION$1 = 3e3;
		const ERROR_NOTICE_DURATION$1 = 8e3;
		function emptyStateMessage(mode, repositoryFilter) {
			const behavior = sessionScopeBehavior(mode);
			return repositoryFilter === "*" ? behavior.empty : behavior.filteredEmpty;
		}
		/** The sidebar tab body; all hooks remain unconditional across review scopes. */
		function FileReviewTab({ ctx, sessionId, cwd, visible, meta }) {
			useReviewLocale();
			const openFile = useReviewFileOpener();
			const sessions = ctx.sessions;
			const [states, setStates] = (0, react.useState)(() => /* @__PURE__ */ new Map());
			const [statusPending, setStatusPending] = (0, react.useState)(false);
			const [busyKey, setBusyKey] = (0, react.useState)(null);
			const [expanded, setExpanded] = (0, react.useState)(() => /* @__PURE__ */ new Set());
			const [collapsedRepositories, setCollapsedRepositories] = (0, react.useState)(() => /* @__PURE__ */ new Set());
			const [notice, setNotice] = (0, react.useState)(null);
			const [guideOpen, setGuideOpen] = (0, react.useState)(false);
			const closeGuide = (0, react.useCallback)(() => setGuideOpen(false), []);
			(0, react.useEffect)(() => {
				if (!visible) closeGuide();
			}, [visible, closeGuide]);
			const [tick, setTick] = (0, react.useState)(0);
			const [workspace, setWorkspace] = (0, react.useState)(null);
			const [repositoryFilter, setRepositoryFilter] = (0, react.useState)("*");
			const [reviewMode, setReviewMode] = (0, react.useState)("last-turn");
			const isGitMode = isGitReviewMode(reviewMode);
			const scopeBehavior = sessionScopeBehavior(reviewMode);
			const confirmationStore = (0, react.useMemo)(() => confirmationStoreFor(sessionId), [sessionId]);
			const confirmationSnapshot = (0, react.useSyncExternalStore)(confirmationStore.subscribe, confirmationStore.getSnapshot, confirmationStore.getSnapshot);
			const [pendingPages, setPendingPages] = (0, react.useState)(1);
			const noticeSeqRef = (0, react.useRef)(0);
			const noticeTimerRef = (0, react.useRef)(null);
			(0, react.useEffect)(() => subscribeRepositories(() => {
				setTick((value) => value + 1);
			}), []);
			(0, react.useEffect)(() => {
				setWorkspace(null);
				setRepositoryFilter("*");
				setReviewMode("last-turn");
				setPendingPages(1);
				setCollapsedRepositories(/* @__PURE__ */ new Set());
				setExpanded(/* @__PURE__ */ new Set());
			}, [sessionId]);
			(0, react.useEffect)(() => {
				if (!visible) return;
				let active = true;
				(sessions.scope(sessionId)?.get("remote.fileReview"))?.workspace().then((result) => {
					if (active && result.ok) {
						setWorkspace(result.value);
						setRepositoryFilter((current) => {
							if (current === "*" || current === "?") return current;
							return result.value.repositories.some((repo) => repo.path === current) ? current : "*";
						});
					}
				}).catch(() => {});
				return () => {
					active = false;
				};
			}, [
				sessions,
				sessionId,
				visible,
				tick
			]);
			const { snapshot, turns, ready } = useFileReviewConversation(ctx, sessions, sessionId, visible, tick);
			const repositories = workspace?.repositories ?? [];
			const scopeTurns = (0, react.useMemo)(() => scopeBehavior.select({
				snapshot,
				turns,
				confirmed: confirmationSnapshot.confirmed
			}), [
				snapshot,
				turns,
				scopeBehavior,
				confirmationSnapshot.confirmed
			]);
			const filteredTurns = (0, react.useMemo)(() => {
				if (repositoryFilter === "*") return scopeTurns;
				return scopeTurns.map((turn) => ({
					...turn,
					files: turn.files.filter((file) => {
						return (fileRepository(resolveSessionPath(cwd, file.path), workspace?.repositories ?? [])?.path ?? "?") === repositoryFilter;
					})
				})).filter((turn) => turn.files.length > 0);
			}, [
				scopeTurns,
				repositoryFilter,
				workspace,
				cwd
			]);
			const { mainTurns, archivedTurns, archivedVisible, renderedTurns, pendingRemaining, archivedRemaining, archiveOpen, setArchiveOpen, setArchivePages } = useFileReviewArchive(sessionId, filteredTurns, reviewMode, pendingPages);
			const flat = (0, react.useMemo)(() => renderedTurns.flatMap((turn) => turn.files.map((file) => ({
				turn: turn.turn,
				path: file.path,
				diffs: file.diffs,
				...file.deleted === true ? { deleted: true } : {}
			}))), [renderedTurns]);
			const inspectable = (0, react.useMemo)(() => flat.filter((item) => item.deleted !== true), [flat]);
			const flatKey = (0, react.useMemo)(() => flat.map((item) => `${item.turn}|${item.path}|${item.diffs.length}`).join(";"), [flat]);
			const showNotice = (0, react.useCallback)((tone, key, details) => {
				noticeSeqRef.current += 1;
				const seq = noticeSeqRef.current;
				if (noticeTimerRef.current !== null) window.clearTimeout(noticeTimerRef.current);
				noticeTimerRef.current = window.setTimeout(() => {
					setNotice((current) => current?.seq === seq ? null : current);
				}, tone === "success" ? SUCCESS_NOTICE_DURATION$1 : ERROR_NOTICE_DURATION$1);
				setNotice({
					seq,
					tone,
					key,
					details
				});
			}, []);
			const { rowRefs, turnRefs, bodyRef } = useFileReviewDeepLink({
				sessionId,
				turns,
				visible,
				ready,
				meta,
				expanded,
				flatKey,
				setReviewMode,
				setRepositoryFilter,
				setArchiveOpen,
				setArchivePages,
				setExpanded,
				setCollapsedRepositories,
				onMissing: (0, react.useCallback)(() => {
					showNotice("error", "sidebarTargetMissing");
				}, [showNotice])
			});
			(0, react.useEffect)(() => () => {
				if (noticeTimerRef.current !== null) window.clearTimeout(noticeTimerRef.current);
			}, []);
			const actions = useFileReviewActions({
				sessions,
				sessionId,
				visible,
				isGitMode,
				flat,
				inspectable,
				flatKey,
				tick,
				showNotice,
				state: {
					states,
					setStates,
					statusPending,
					setStatusPending,
					busyKey,
					setBusyKey
				}
			});
			const toggleExpanded = (0, react.useCallback)((key) => {
				setExpanded((current) => {
					const next = new Set(current);
					if (next.has(key)) next.delete(key);
					else next.add(key);
					return next;
				});
			}, []);
			const openInEditor = (0, react.useCallback)((path) => {
				const absolute = resolveSessionPath(cwd, path);
				try {
					openFile(absolute);
				} catch (error) {
					showNotice("error", "sidebarOpenFailed", error instanceof Error ? error.message : void 0);
				}
			}, [
				openFile,
				cwd,
				showNotice
			]);
			const totalStats = (0, react.useMemo)(() => flat.reduce((total, item) => addStats$1(total, summarizeDiffs(item.diffs)), {
				added: 0,
				removed: 0
			}), [flat]);
			const turnView = {
				sessionId,
				cwd,
				workspace,
				reviewMode,
				expansion: {
					expanded,
					collapsedRepositories,
					setExpanded,
					setCollapsedRepositories
				},
				actions,
				confirmationStore,
				confirmationSnapshot,
				rowRefs,
				turnRefs,
				toggleExpanded,
				openInEditor
			};
			const renderTurn = (turn) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FileReviewTurn, {
				turn,
				fullTurn: turns.find((item) => item.turn === turn.turn) ?? turn,
				view: turnView
			}, turn.turn);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: FileReviewTab_module_css_default.root,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
						className: FileReviewTab_module_css_default.header,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: FileReviewTab_module_css_default.headerTitle,
								children: t("tabTitle")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("select", {
								className: FileReviewTab_module_css_default.scopeSelect,
								"aria-label": t("reviewScope"),
								value: reviewMode,
								onChange: (event) => {
									if (isReviewMode(event.target.value)) setReviewMode(event.target.value);
								},
								children: REVIEW_MODES.map((mode) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
									value: mode,
									children: t(REVIEW_SCOPES[mode].label)
								}, mode))
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: FileReviewTab_module_css_default.guideButton,
								title: t("userGuideHint"),
								onClick: () => setGuideOpen(true),
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
									width: "14",
									height: "14",
									viewBox: "0 0 20 20",
									"aria-hidden": "true",
									fill: "none",
									stroke: "currentColor",
									strokeWidth: "1.5",
									strokeLinecap: "round",
									strokeLinejoin: "round",
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M10 4v13M10 5C7 3 4 3 2 4v12c3-1 5-1 8 1 3-2 5-2 8-1V4c-2-1-5-1-8 1Z" })
								}), t("userGuide")]
							}),
							!isGitMode && flat.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FileReviewStats, { stats: totalStats }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: FileReviewTab_module_css_default.refreshButton,
								disabled: !isGitMode && statusPending,
								title: t("refresh"),
								onClick: () => {
									setTick((value) => value + 1);
								},
								children: "⟳"
							})
						]
					}),
					guideOpen && visible && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(UserGuideDialog, {
						ctx,
						sessionId,
						onClose: closeGuide
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(ReviewCommentsProvider, {
						ctx,
						sessionId,
						controls: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(DiffViewControls, {}),
						children: [
							!isGitMode && workspace?.project !== null && workspace?.project !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: FileReviewTab_module_css_default.repositoryBar,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										title: workspace.project.root,
										children: t("repoScope", {
											name: workspace.project.name || basename$1(workspace.project.root),
											count: repositories.filter((repo) => repo.state === "ready").length
										})
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
										"aria-label": t("repository"),
										value: repositoryFilter,
										onChange: (event) => {
											setRepositoryFilter(event.target.value);
										},
										children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
												value: "*",
												children: t("repoAll")
											}),
											repositories.filter((repo) => repo.state === "ready" || repo.source === "project").map((repo) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
												value: repo.path,
												children: repo.name
											}, repo.path)),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
												value: "?",
												children: t("repoOther")
											})
										]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("small", {
										title: workspace.warnings.map(localizeReviewMessage).join("\n"),
										children: [t("repoSettingsHint"), workspace.warnings.length > 0 ? " ⚠" : ""]
									})
								]
							}),
							!isGitMode && confirmationSnapshot.storageError && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: `${FileReviewTab_module_css_default.notice} ${FileReviewTab_module_css_default.noticeError}`,
								role: "alert",
								children: t("confirmationStorageError")
							}),
							notice !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: `${FileReviewTab_module_css_default.notice} ${notice.tone === "success" ? FileReviewTab_module_css_default.noticeSuccess : FileReviewTab_module_css_default.noticeError}`,
								role: "alert",
								children: [t(notice.key), notice.details ? `: ${localizeReviewMessage(notice.details)}` : ""]
							}),
							isGitMode ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(GitReviewPanel, {
								ctx,
								sessionId,
								mode: reviewMode,
								visible,
								tick
							}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: FileReviewTab_module_css_default.body,
								ref: bodyRef,
								children: [scopeBehavior.pagination === "pending" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: FileReviewTab_module_css_default.pendingHint,
									children: t("reviewPendingHint")
								}), filteredTurns.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: FileReviewTab_module_css_default.empty,
									children: t(emptyStateMessage(reviewMode, repositoryFilter))
								}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
									mainTurns.map(renderTurn),
									pendingRemaining > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: FileReviewTab_module_css_default.archiveLoadMore,
										onClick: () => {
											setPendingPages((current) => current + 1);
										},
										children: t("loadMore", { n: pendingRemaining })
									}),
									archivedTurns.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: FileReviewTab_module_css_default.archiveSection,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
											type: "button",
											className: FileReviewTab_module_css_default.archiveHeader,
											"aria-expanded": archiveOpen,
											"aria-label": archiveOpen ? t("archivedCollapse") : t("archivedExpand"),
											onClick: () => {
												setArchiveOpen((current) => !current);
											},
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(FileReviewChevron, { open: archiveOpen }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: FileReviewTab_module_css_default.archiveTitle,
												children: t("archived", { n: String(archivedTurns.length) })
											})]
										}), archiveOpen && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [archivedVisible.map(renderTurn), archivedRemaining > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: FileReviewTab_module_css_default.archiveLoadMore,
											onClick: () => {
												setArchivePages((current) => current + 1);
											},
											children: t("loadMore", { n: String(archivedRemaining) })
										})] })]
									})
								] })]
							})
						]
					}, sessionId)
				]
			});
		}
		//#endregion
		//#region node_modules/.pnpm/@deepseek-ai+dsh-util-works_3c6cd69dde4d8c1ca446d653d8d41e13/node_modules/@deepseek-ai/dsh-util-workspace-path/lib/index.js
		/**
		* The `dsh-resource://file/…` address grammar: how a file is named across the
		* Sidebar and the resource model, built and parsed without touching a
		* filesystem.
		* @module
		*/
		/** The scheme and type every file address opens with. */
		const FILE_ADDRESS_PREFIX = "dsh-resource://file/";
		/** Component-encode one id or path segment, keeping `:` literal for drive letters. */
		function encodeSegment(segment) {
			return encodeURIComponent(segment).replace(/%3A/gi, ":");
		}
		/** Encode a `/`-separated path segment by segment. */
		function encodePath(path) {
			return path.split("/").map(encodeSegment).join("/");
		}
		/**
		* Build the address of a file read through one Session.
		* @param sessionId - the Session whose Host workspace resolves the path.
		* @param path - absolute or workspace-relative path; backslashes are normalized to `/`, and leading `./` prefixes are dropped.
		* @returns the `dsh-resource://file/session/<sessionId>/<path>` address.
		*/
		function sessionFileAddress(sessionId, path) {
			const normalized = path.replace(/\\/g, "/").replace(/^(?:\.\/)+/, "");
			return `${FILE_ADDRESS_PREFIX}session/${encodeSegment(sessionId)}/${encodePath(normalized)}`;
		}
		/**
		* Browser-safe Workspace path and display helpers.
		* @module @deepseek-ai/dsh-util-workspace-path
		*/
		/** Whether a path uses a Windows drive or UNC prefix. */
		function isWindowsStylePath(value) {
			return /^[A-Za-z]:[/\\]/.test(value) || value.startsWith("\\\\");
		}
		/**
		* Whether a path is absolute in either spelling the Host accepts: POSIX (`/a/b`) or Windows drive or UNC.
		* @param path - the path to classify.
		* @returns `true` for an absolute path; `false` for a Workspace-relative one.
		*/
		function isAbsoluteWorkspacePath(path) {
			return path.startsWith("/") || isWindowsStylePath(path);
		}
		/**
		* The address for a path as a caller holds it: a relative path, or an absolute
		* path inside the Session's workspace, becomes a `session`-scoped address; an
		* absolute path outside it, or one whose workspace root is unknown, keeps its
		* absolute path in that Session's address.
		* @param sessionId - the Session the path is read in.
		* @param cwd - that Session's workspace root, when known.
		* @param path - absolute or workspace-relative path, in either separator spelling.
		* @returns the `dsh-resource://file/…` address.
		*/
		function fileAddressFor(sessionId, cwd, path) {
			const normalized = path.replace(/\\/g, "/");
			if (!isAbsoluteWorkspacePath(normalized)) return sessionFileAddress(sessionId, normalized);
			const root = cwd === void 0 ? "" : cwd.replace(/\\/g, "/").replace(/\/+$/, "");
			if (root !== "" && normalized === root) return sessionFileAddress(sessionId, "");
			if (root !== "" && normalized.startsWith(`${root}/`)) return sessionFileAddress(sessionId, normalized.slice(root.length + 1));
			return sessionFileAddress(sessionId, normalized);
		}
		//#endregion
		//#region src/client/sidebar-navigation.ts
		const REVIEW_KIND = "file-review";
		const REVIEW_IMPLEMENTATION = "dsh-file-review-tab-multi-git-repository:file-review";
		const LEGACY_GUIDE_KIND = "file-review-guide";
		const LEGACY_GUIDE_IMPLEMENTATION = "dsh-file-review-tab-multi-git-repository:legacy-guide";
		/** Chat actions may only navigate the session currently owned by the public controller. */
		function openReviewTab(sidebar, sessionId, paths, turn) {
			if (paths.length === 0) return;
			if (sidebar.mounted.getSnapshot() !== sessionId) throw new Error(t("sidebarSessionNotVisible"));
			const seed = publishFileReviewSeed(sessionId, paths, turn);
			try {
				sidebar.openTab(REVIEW_KIND, { revealIfOpened: true });
			} catch (error) {
				discardFileReviewSeed(sessionId, seed.nonce);
				throw error;
			}
		}
		/** Keep file opens bound to their originating tab, including after asynchronous work. */
		function openReviewResource(actions, sessionId, cwd, path, signal) {
			if (signal.aborted) throw new Error(t("sessionUnavailable"));
			if (!cwd) throw new Error(t("sidebarWorkspaceUnavailable"));
			actions.openResource(fileAddressFor(sessionId, cwd, path), { revealIfOpened: true });
		}
		//#endregion
		//#region src/client/NativeReviewTab.tsx
		function FileReviewIcon({ size = 16 }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 20 20",
				"aria-hidden": "true",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: 1.5,
				strokeLinecap: "round",
				strokeLinejoin: "round",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M5.25 2.75h6l3.5 3.5v10a1 1 0 0 1-1 1h-8.5a1 1 0 0 1-1-1V3.75a1 1 0 0 1 1-1Z" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M11.25 2.75v3.5h3.5M7 10h5M7 13h5" })]
			});
		}
		/** Translate native session/tab information once, outside the review business components. */
		function NativeReviewTab({ ctx, reviewSessionId: sessionId, sessions: controller, useTabInfo }) {
			const { tab } = useTabInfo();
			(0, react.useEffect)(() => {
				const discard = () => discardFileReviewSeed(sessionId);
				tab.signal.addEventListener("abort", discard, { once: true });
				return () => tab.signal.removeEventListener("abort", discard);
			}, [tab.signal, sessionId]);
			const list = controller.list;
			const subscribe = (0, react.useCallback)((notify) => list.subscribe(notify), [list]);
			const getSnapshot = (0, react.useCallback)(() => list.getSnapshot(), [list]);
			const cwd = (0, react.useSyncExternalStore)(subscribe, getSnapshot).byId[sessionId]?.cwd;
			const openFile = (0, react.useCallback)((path) => {
				openReviewResource(tab.actions, sessionId, cwd, path, tab.signal);
			}, [
				tab.actions,
				tab.signal,
				sessionId,
				cwd
			]);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ReviewNavigationProvider, {
				openFile,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FileReviewTab, {
					ctx,
					sessionId,
					cwd,
					visible: tab.visible,
					meta: tab.navigation.params
				}, sessionId)
			});
		}
		/** Titles stay subscribed while the body is hidden; no stored-title mutation is needed. */
		function NativeReviewTitle({ ctx, reviewSessionId: sessionId, sessions }) {
			useReviewLocale();
			const retention = (0, react.useMemo)(() => sessions.retainInfo(sessionId), [sessions, sessionId]);
			const subscribeRetention = (0, react.useCallback)((notify) => retention.subscribe(notify), [retention]);
			const getRetention = (0, react.useCallback)(() => retention.getSnapshot(), [retention]);
			(0, react.useSyncExternalStore)(subscribeRetention, getRetention, getRetention);
			const binding = sessions.binding(sessionId);
			const source = (0, react.useMemo)(() => {
				try {
					return binding ? ctx.uiConversation.binding(binding).snapshot : void 0;
				} catch {
					return;
				}
			}, [ctx, binding]);
			const subscribe = (0, react.useCallback)((notify) => source?.subscribe(notify) ?? (() => {}), [source]);
			const getSnapshot = (0, react.useCallback)(() => source?.getSnapshot() ?? null, [source]);
			const snapshot = (0, react.useSyncExternalStore)(subscribe, getSnapshot, getSnapshot);
			const count = (0, react.useMemo)(() => countChangedFiles(splitArchivedTurns(deriveSessionChanges(snapshot)).main), [snapshot]);
			const title = t("tabTitle");
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
				title,
				"aria-label": title,
				style: {
					display: "inline-flex",
					alignItems: "center",
					gap: 6
				},
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(FileReviewIcon, {}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: title }),
					count > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", {
						"aria-label": t("reviewFiles", { count }),
						children: count
					})
				]
			});
		}
		//#endregion
		//#region src/client/registration-lifetime.ts
		/** Roll back partial registrations and release everything even if one disposer fails. */
		function registrationLifetime(report) {
			const disposers = [];
			let disposed = false;
			const release = () => {
				if (disposed) return;
				disposed = true;
				for (const dispose of disposers.reverse()) try {
					dispose();
				} catch (error) {
					report(error);
				}
				disposers.length = 0;
			};
			const register = (acquire) => {
				if (disposed) return () => {};
				try {
					const dispose = acquire();
					if (disposed) dispose();
					else disposers.push(dispose);
					return dispose;
				} catch (error) {
					release();
					report(error);
					return () => {};
				}
			};
			return {
				register,
				release
			};
		}
		//#endregion
		//#region src/client/native-sidebar.ts
		/** Cordis waits for native services; slot injection also follows late declarations and reloads. */
		function registerNativeSidebar(ctx) {
			const sessions = ctx.get("sessions");
			const injectReview = (sessionId) => ({
				ctx,
				sessions,
				reviewSessionId: sessionId
			});
			const lifetime = registrationLifetime((error) => {
				console.error("[file-review] native sidebar registration failed:", error);
			});
			lifetime.register(() => ctx.sidebarRightTabs.register({
				id: REVIEW_IMPLEMENTATION,
				kind: REVIEW_KIND,
				priority: "extension",
				keepMounted: true,
				title: () => t("tabTitle"),
				guide: [{
					id: "review",
					order: 35,
					title: () => t("tabTitle"),
					description: () => t("sidebarGuideDescription"),
					icon: FileReviewIcon
				}]
			}));
			lifetime.register(() => ctx.sidebarRightTabs.register({
				id: LEGACY_GUIDE_IMPLEMENTATION,
				kind: LEGACY_GUIDE_KIND,
				priority: "extension",
				title: () => t("userGuide")
			}));
			lifetime.register(() => ctx.slots.inject("sidebar.right.pane.tab", () => {
				const seats = registrationLifetime((error) => {
					lifetime.release();
					console.error("[file-review] native body failed:", error);
				});
				seats.register(() => ctx.slots.register({
					name: "sidebar.right.pane.tab",
					key: REVIEW_IMPLEMENTATION,
					inject: injectReview
				}, NativeReviewTab));
				seats.register(() => ctx.slots.register({
					name: "sidebar.right.pane.tab",
					key: LEGACY_GUIDE_IMPLEMENTATION,
					inject: injectReview
				}, LegacyUserGuideTab));
				return seats.release;
			}));
			lifetime.register(() => ctx.slots.inject("sidebar.right.pane.tab.title", () => {
				const seats = registrationLifetime((error) => {
					lifetime.release();
					console.error("[file-review] native title failed:", error);
				});
				seats.register(() => ctx.slots.register({
					name: "sidebar.right.pane.tab.title",
					key: REVIEW_IMPLEMENTATION,
					inject: injectReview
				}, NativeReviewTitle));
				seats.register(() => ctx.slots.register({
					name: "sidebar.right.pane.tab.title",
					key: LEGACY_GUIDE_IMPLEMENTATION
				}, LegacyUserGuideTitle));
				return seats.release;
			}));
			return () => {
				lifetime.release();
				clearFileReviewSeeds();
			};
		}
		//#endregion
		//#region \0dsh-file-review-tab-multi-git-repository-css:D:\projectZJGG\dsh-file-review-tab-Multi-git-repository\src\client\RepositorySettings.module.css.mjs
		const css$1 = ".o8quOa_scroll{height:100%;overflow:auto}.o8quOa_root{max-width:900px;color:var(--dsw-alias-label-primary);font:var(--dsw-font-xs-13);padding:20px 24px}.o8quOa_pageHeader{flex-wrap:wrap;justify-content:space-between;align-items:flex-start;gap:12px;display:flex}.o8quOa_root h2{margin:0 0 12px;font-size:20px}.o8quOa_root h3{margin:20px 0 10px;font-size:14px}.o8quOa_hint{color:var(--dsw-alias-label-secondary);margin:8px 0 16px;line-height:1.7}.o8quOa_actions{flex-wrap:wrap;gap:8px;margin:12px 0 18px;display:flex}.o8quOa_root button{cursor:pointer;color:inherit;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l2);font:inherit;border-radius:7px;padding:7px 14px}.o8quOa_root button:hover:not(:disabled){background:var(--dsw-alias-border-l1)}.o8quOa_root button:disabled{opacity:.5;cursor:default}.o8quOa_root .o8quOa_primary{margin-left:auto;font-weight:600}.o8quOa_field{flex-direction:column;gap:7px;margin:16px 0;font-weight:500;display:flex}.o8quOa_field input,.o8quOa_field textarea,.o8quOa_field select{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);width:100%;color:inherit;background:var(--dsw-alias-bg-layer-1);font:inherit;border-radius:7px;padding:8px 10px;font-weight:400}.o8quOa_field textarea{resize:vertical;font-family:monospace}.o8quOa_field input:read-only{cursor:default;background:var(--dsw-alias-bg-layer-2,var(--dsw-alias-bg-layer-1))}.o8quOa_form{border:0;min-width:0;margin:0;padding:0}.o8quOa_check{align-items:center;gap:8px;display:flex}.o8quOa_activation{margin:20px 0}.o8quOa_repoEditor{gap:8px;margin:12px 0;display:grid}.o8quOa_repoHeader,.o8quOa_repoRow{grid-template-columns:minmax(130px,1fr) minmax(220px,2fr) 156px;align-items:center;gap:10px;display:grid}.o8quOa_repoHeader{font-weight:500}.o8quOa_repoRow input{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);width:100%;min-width:0;color:inherit;background:var(--dsw-alias-bg-layer-1);font:inherit;border-radius:7px;padding:8px 10px}.o8quOa_pathCell{min-width:0;position:relative}.o8quOa_pathCell.o8quOa_temporaryPath input{padding-inline-end:58px}.o8quOa_temporaryBadge{inset-inline-end:10px;color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-2,#f3f4f6);white-space:nowrap;border-radius:4px;padding:2px 5px;font-size:11px;line-height:1.4;position:absolute;top:50%;transform:translateY(-50%)}.o8quOa_repoActions{gap:6px;display:flex}.o8quOa_repoActions button{flex:1;padding-inline:8px}.o8quOa_pickerError{overflow-wrap:anywhere;color:var(--dsw-alias-state-error-primary);grid-column:2/-1;margin:0}@media (width<=620px){.o8quOa_repoHeader,.o8quOa_repoRow{grid-template-columns:minmax(0,1fr) minmax(0,2fr) 132px}}.o8quOa_dialog.o8quOa_dialog{box-sizing:border-box;width:min(480px,100vw - 48px);max-height:calc(100dvh - 80px);color:var(--dsw-alias-label-primary,#222);background:var(--dsw-alias-bg-layer-1,#fff);font:var(--dsw-font-xs-13);border-radius:12px;padding:24px;overflow-y:auto}.o8quOa_dialog h3{margin:0;font-size:16px}.o8quOa_dialog p{overflow-wrap:anywhere;margin:16px 0 0;line-height:1.7}.o8quOa_dialog button{cursor:pointer;color:inherit;background:var(--dsw-alias-bg-layer-1,#fff);border:1px solid var(--dsw-alias-border-l2,#ddd);font:inherit;border-radius:7px;padding:7px 14px}.o8quOa_dialogActions{justify-content:flex-end;gap:8px;margin-top:20px;display:flex}.o8quOa_message{overflow-wrap:anywhere;border:1px solid var(--dsw-alias-border-l2);border-radius:7px;padding:10px}.o8quOa_preview{overflow-x:auto}.o8quOa_preview table{border-collapse:collapse;width:100%;font-size:12px}.o8quOa_preview th,.o8quOa_preview td{text-align:left;vertical-align:top;border-bottom:1px solid var(--dsw-alias-border-l2);overflow-wrap:anywhere;padding:9px 8px}.o8quOa_preview td:nth-child(2){min-width:180px}.o8quOa_preview small{color:var(--dsw-alias-label-secondary);margin-top:4px;font-weight:400;display:block}";
		const styleId$1 = "dsh-file-review-tab-multi-git-repository/RepositorySettings.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(styleId$1) + "]") === null) {
			const style = document.createElement("style");
			style.dataset.plugin = "dsh-file-review-tab-multi-git-repository";
			style.dataset.pluginCss = styleId$1;
			style.textContent = css$1;
			document.head.appendChild(style);
		}
		var RepositorySettings_module_css_default = {
			"root": "o8quOa_root",
			"check": "o8quOa_check",
			"pageHeader": "o8quOa_pageHeader",
			"hint": "o8quOa_hint",
			"repoActions": "o8quOa_repoActions",
			"dialogActions": "o8quOa_dialogActions",
			"primary": "o8quOa_primary",
			"temporaryBadge": "o8quOa_temporaryBadge",
			"repoHeader": "o8quOa_repoHeader",
			"actions": "o8quOa_actions",
			"form": "o8quOa_form",
			"temporaryPath": "o8quOa_temporaryPath",
			"preview": "o8quOa_preview",
			"dialog": "o8quOa_dialog",
			"activation": "o8quOa_activation",
			"pickerError": "o8quOa_pickerError",
			"pathCell": "o8quOa_pathCell",
			"field": "o8quOa_field",
			"message": "o8quOa_message",
			"scroll": "o8quOa_scroll",
			"repoEditor": "o8quOa_repoEditor",
			"repoRow": "o8quOa_repoRow"
		};
		//#endregion
		//#region src/client/repository-settings-components.tsx
		function RepositoryListEditor({ projectRoot, entries, pickerError, onUpdate, onNormalizePath, onChooseDirectory, onRemove }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: RepositorySettings_module_css_default.repoEditor,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: RepositorySettings_module_css_default.repoHeader,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("repository") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("projectPath") })]
				}), entries.map((entry, index) => {
					const isTemporary = absoluteReviewPath(repositoryProjectPath(projectRoot, entry.path));
					return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: RepositorySettings_module_css_default.repoRow,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								"aria-label": `${t("repository")} ${index + 1}`,
								value: entry.name,
								onChange: (event) => {
									onUpdate(index, { name: event.target.value });
								}
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: `${RepositorySettings_module_css_default.pathCell} ${isTemporary ? RepositorySettings_module_css_default.temporaryPath : ""}`,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									"aria-label": `${t("projectPath")} ${index + 1}`,
									value: entry.path,
									placeholder: "project/PluginManager",
									onChange: (event) => {
										onUpdate(index, { path: event.target.value });
									},
									onBlur: () => {
										onNormalizePath(index);
									}
								}), isTemporary && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: RepositorySettings_module_css_default.temporaryBadge,
									title: t("projectTemporaryHint"),
									"aria-label": t("projectTemporary"),
									children: t("projectTemporaryShort")
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: RepositorySettings_module_css_default.repoActions,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => {
										onChooseDirectory(index);
									},
									children: t("projectOpenRepo")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									"aria-label": `${t("projectRemoveRepo")} ${entry.name || index + 1}`,
									onClick: () => {
										onRemove(index);
									},
									children: t("projectRemoveRepo")
								})]
							}),
							pickerError?.index === index && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: RepositorySettings_module_css_default.pickerError,
								role: "alert",
								children: localizeReviewMessage(pickerError.message)
							})
						]
					}, index);
				})]
			});
		}
		function repositorySourceLabel(source) {
			switch (source) {
				case "project": return t("projectRootSource");
				case "manual": return t("projectManual");
				case "temporary": return t("projectTemporary");
				default: return source;
			}
		}
		function repositoryStateLabel(state) {
			switch (state) {
				case "ready": return t("repoReady");
				case "missing": return t("repoMissing");
				case "notGit": return t("repoNotGit");
				default: return t("stateError");
			}
		}
		function RepositoryPreview({ workspace }) {
			const readyCount = workspace.repositories.filter((repo) => repo.state === "ready").length;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: RepositorySettings_module_css_default.preview,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: t("projectResolved", {
						count: readyCount,
						total: workspace.repositories.length
					}) }),
					workspace.warnings.map((warning) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: RepositorySettings_module_css_default.message,
						children: localizeReviewMessage(warning)
					}, warning)),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("table", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: t("repository") }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: t("projectPath") }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("th", { children: t("projectState") })
					] }) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("tbody", { children: workspace.repositories.map((repo) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("td", { children: [repo.name, /* @__PURE__ */ (0, react_jsx_runtime.jsx)("small", { children: repositorySourceLabel(repo.source) })] }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", { children: repo.relativePath }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("td", {
							title: repo.reason ? localizeReviewMessage(repo.reason) : void 0,
							children: repositoryStateLabel(repo.state)
						})
					] }, repo.path)) })] })
				]
			});
		}
		function RepositoryDeleteDialog({ name, onCancel, onConfirm }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
				open: true,
				onClose: onCancel,
				title: t("projectDeleteTitle"),
				className: RepositorySettings_module_css_default.dialog ?? "",
				headless: true,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
						id: "file-review-delete-title",
						children: t("projectDeleteTitle")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("projectDeleteDescription", { name }) }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: RepositorySettings_module_css_default.dialogActions,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							"data-modal-autofocus": true,
							onClick: onCancel,
							children: t("projectCancel")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: onConfirm,
							children: t("projectRemoveRepo")
						})]
					})
				]
			});
		}
		//#endregion
		//#region src/client/directory-picker.ts
		/** Resolve only the picker we use: optional Cordis services require get(). */
		async function pickRepositoryDirectory(ctx, unavailableMessage, defaultPath, desktop = globalThis.__DSH_DIRECTORY_PICKER__) {
			if (desktop?.pick !== void 0) {
				if (desktop.supportsDefaultPath !== true) throw new Error(unavailableMessage);
				return await desktop.pick(defaultPath);
			}
			const picker = ctx.get("remote.directoryPicker");
			if (picker?.pick === void 0) throw new Error(unavailableMessage);
			const result = await picker.pick();
			if (!result.ok) throw new Error(result.error.message);
			return result.value;
		}
		//#endregion
		//#region src/client/repository-settings-model.ts
		/** Trim complete rows and normalize paths before the Host validates and saves them. */
		function prepareProjectForSave(project) {
			return {
				...project,
				name: project.name.trim(),
				enabled: project.enabled ?? true,
				configFiles: [],
				repositories: [],
				namedRepositories: (project.namedRepositories ?? []).filter((entry) => entry.name.trim() !== "" && entry.path.trim() !== "").map((entry) => ({
					name: entry.name.trim(),
					path: repositoryProjectPath(project.root, entry.path)
				}))
			};
		}
		/** Combine resolved repositories and session-only entries in their displayed order. */
		function createRepositoryDraft(project, workspace, temporary) {
			const entries = workspace.repositories.filter((repo) => repo.source !== "project").map((repo) => ({
				name: repo.name,
				path: repo.relativePath
			}));
			for (const entry of temporary) {
				const path = normalizeReviewPath(entry.path).toLowerCase();
				if (!entries.some((current) => normalizeReviewPath(current.path).toLowerCase() === path)) entries.push(entry);
			}
			return {
				...project,
				enabled: project.enabled ?? true,
				configFiles: [],
				repositories: [],
				namedRepositories: entries
			};
		}
		/** Keep external absolute paths in the session instead of the portable project file. */
		function collectTemporaryRepositories(project) {
			return (project.namedRepositories ?? []).map((entry) => ({
				...entry,
				path: repositoryProjectPath(project.root, entry.path)
			})).filter((entry) => entry.name.trim() && absoluteReviewPath(entry.path) && relativeProjectDirectory(project.root, entry.path) === null).map((entry) => ({
				name: entry.name.trim(),
				path: normalizeReviewPath(entry.path.trim())
			}));
		}
		//#endregion
		//#region src/client/use-repository-settings.ts
		async function unwrapProjectResult(promise) {
			const result = await promise;
			if (!result.ok) throw new Error(result.error.message);
			return result.value;
		}
		/** Own the session form, remote requests, directory picker and temporary-repository updates. */
		function useRepositorySettings(ctx, sessionId) {
			const sessions = ctx.sessions;
			const projectService = () => {
				const service = sessions.scope(sessionId)?.get("remote.fileReview");
				if (service === void 0) throw new Error(t("remoteUnavailable"));
				return service;
			};
			const [page, setPage] = (0, react.useState)(null);
			const [draft, setDraft] = (0, react.useState)(null);
			const [preview, setPreview] = (0, react.useState)(null);
			const [busy, setBusy] = (0, react.useState)(false);
			const [dirty, setDirty] = (0, react.useState)(false);
			const [message, setMessage] = (0, react.useState)("");
			const [pendingDelete, setPendingDelete] = (0, react.useState)(null);
			const [pickerError, setPickerError] = (0, react.useState)(null);
			const requestVersion = (0, react.useRef)(0);
			const acceptPage = (result) => {
				setPage(result);
				setDraft(createRepositoryDraft(result.project, result.workspace, result.temporaryRepositories));
				setPreview(result.workspace);
				setDirty(false);
			};
			const load = async () => {
				const version = ++requestVersion.current;
				setBusy(true);
				setMessage("");
				setPickerError(null);
				try {
					const result = await unwrapProjectResult(projectService().project());
					if (requestVersion.current !== version) return;
					acceptPage(result);
				} catch (error) {
					if (requestVersion.current === version) setMessage(error instanceof Error ? error.message : String(error));
				} finally {
					if (requestVersion.current === version) setBusy(false);
				}
			};
			(0, react.useEffect)(() => {
				setPage(null);
				setDraft(null);
				setPreview(null);
				setPendingDelete(null);
				load();
				return () => {
					requestVersion.current += 1;
				};
			}, [sessionId]);
			const edit = (patch) => {
				setDraft((current) => current === null ? null : {
					...current,
					...patch
				});
				setPreview(null);
				setDirty(true);
				setMessage("");
				setPickerError(null);
			};
			(0, react.useEffect)(() => {
				if (!page?.configured || draft === null) return;
				const entries = collectTemporaryRepositories(draft);
				const timer = setTimeout(() => {
					unwrapProjectResult(projectService().setTemporaryRepositories(entries)).then(() => {
						repositoriesChanged();
					}).catch((error) => {
						setMessage(error instanceof Error ? error.message : String(error));
					});
				}, 300);
				return () => {
					clearTimeout(timer);
				};
			}, [
				draft?.namedRepositories,
				page?.configured,
				sessionId
			]);
			const chooseDirectory = async (index) => {
				if (draft === null) return;
				const version = requestVersion.current;
				setBusy(true);
				setMessage("");
				setPickerError(null);
				try {
					const defaultPath = await unwrapProjectResult(projectService().directoryStart(draft.namedRepositories?.[index]?.path ?? ""));
					if (requestVersion.current !== version) return;
					const selected = await pickRepositoryDirectory(ctx, t("projectPickerUnavailable"), defaultPath);
					if (selected === null || requestVersion.current !== version) return;
					if (!absoluteReviewPath(selected)) throw new Error(t("projectPickerInvalid"));
					const normalizedSelected = normalizeReviewPath(selected);
					const path = relativeProjectDirectory(draft.root, normalizedSelected) ?? normalizedSelected;
					const next = [...draft.namedRepositories ?? []];
					const entry = next[index];
					if (entry === void 0) return;
					next[index] = {
						name: entry.name.trim() || normalizedSelected.split("/").filter(Boolean).at(-1) || selected,
						path
					};
					edit({ namedRepositories: next });
				} catch (error) {
					if (requestVersion.current === version) setPickerError({
						index,
						message: error instanceof Error ? error.message : String(error)
					});
				} finally {
					if (requestVersion.current === version) setBusy(false);
				}
			};
			const save = async () => {
				if (draft === null || page === null) return;
				const version = requestVersion.current;
				setBusy(true);
				setMessage("");
				try {
					await unwrapProjectResult(projectService().saveProject({
						project: prepareProjectForSave(draft),
						revision: page.revision,
						fileRevision: page.fileRevision
					}));
					await unwrapProjectResult(projectService().setTemporaryRepositories(collectTemporaryRepositories(draft)));
					const result = await unwrapProjectResult(projectService().project());
					if (requestVersion.current !== version) return;
					acceptPage(result);
					repositoriesChanged();
					setMessage({ key: "projectSaved" });
				} catch (error) {
					if (requestVersion.current === version) setMessage(error instanceof Error ? error.message : String(error));
				} finally {
					if (requestVersion.current === version) setBusy(false);
				}
			};
			const updateRepository = (index, patch) => {
				if (draft === null) return;
				const entries = [...draft.namedRepositories ?? []];
				const entry = entries[index];
				if (entry === void 0) return;
				entries[index] = {
					...entry,
					...patch
				};
				edit({ namedRepositories: entries });
			};
			const normalizeRepositoryPath = (index) => {
				const entry = draft?.namedRepositories?.[index];
				if (draft === null || entry === void 0) return;
				const path = repositoryProjectPath(draft.root, entry.path);
				if (path !== entry.path) updateRepository(index, { path });
			};
			const addRepository = () => {
				if (draft === null) return;
				edit({ namedRepositories: [...draft.namedRepositories ?? [], {
					name: "",
					path: ""
				}] });
			};
			const confirmRepositoryRemoval = () => {
				if (draft === null || pendingDelete === null) return;
				edit({ namedRepositories: (draft.namedRepositories ?? []).filter((_, index) => index !== pendingDelete) });
				setPendingDelete(null);
			};
			return {
				page,
				draft,
				preview,
				busy,
				dirty,
				message,
				pendingDelete,
				pickerError,
				load,
				save,
				edit,
				chooseDirectory,
				updateRepository,
				normalizeRepositoryPath,
				addRepository,
				requestRepositoryRemoval: setPendingDelete,
				cancelRepositoryRemoval: () => {
					setPendingDelete(null);
				},
				confirmRepositoryRemoval
			};
		}
		//#endregion
		//#region src/client/RepositorySettings.tsx
		/** A session-owned editor for the repositories of this conversation's project. */
		function RepositorySettings({ ctx, sessionId }) {
			useReviewLocale();
			const { page, draft, preview, busy, dirty, message, pendingDelete, pickerError, load, save, edit, chooseDirectory, updateRepository, normalizeRepositoryPath, addRepository, requestRepositoryRemoval, cancelRepositoryRemoval, confirmRepositoryRemoval } = useRepositorySettings(ctx, sessionId);
			const saveDisabled = busy || draft === null || !dirty && page?.configured;
			const saveLabel = busy ? t("projectWorking") : page?.configured ? t("projectSave") : t("projectGenerate");
			const showImportHint = page?.fileRevision === "" && page.project.configFiles.length > 0;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: RepositorySettings_module_css_default.scroll,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: RepositorySettings_module_css_default.root,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
							className: RepositorySettings_module_css_default.pageHeader,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: t("projectTab") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: RepositorySettings_module_css_default.hint,
								children: t("projectIntro")
							})] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: RepositorySettings_module_css_default.actions,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									disabled: busy || !page?.configured,
									onClick: () => {
										load();
									},
									children: t("projectReload")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: RepositorySettings_module_css_default.primary,
									disabled: saveDisabled,
									onClick: () => {
										save();
									},
									children: saveLabel
								})]
							})]
						}),
						message && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: RepositorySettings_module_css_default.message,
							role: "status",
							children: typeof message === "string" ? localizeReviewMessage(message) : t(message.key)
						}),
						draft !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("fieldset", {
							disabled: busy,
							className: RepositorySettings_module_css_default.form,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: RepositorySettings_module_css_default.field,
									children: [t("projectCurrentRoot"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										value: draft.root,
										readOnly: true
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: RepositorySettings_module_css_default.field,
									children: [t("projectName"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										value: draft.name,
										readOnly: true
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: RepositorySettings_module_css_default.field,
									children: [t("projectConfigFile"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										value: "dsh-file-review-repositories.json",
										readOnly: true
									})]
								}),
								!page?.configured && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: RepositorySettings_module_css_default.hint,
									children: t("projectInactive")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: RepositorySettings_module_css_default.check,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: draft.enabled ?? true,
										onChange: (event) => {
											edit({ enabled: event.target.checked });
										}
									}), t("projectEnable")]
								}),
								draft.enabled === false && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: RepositorySettings_module_css_default.hint,
									children: t("projectDisabledHint")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: RepositorySettings_module_css_default.check,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: draft.includeProjectRoot,
										onChange: (event) => {
											edit({ includeProjectRoot: event.target.checked });
										}
									}), t("projectIncludeRoot")]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: t("projectRepos") }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: RepositorySettings_module_css_default.hint,
									children: t("projectReposHint")
								}),
								showImportHint && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: RepositorySettings_module_css_default.hint,
									children: t("projectImportHint")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(RepositoryListEditor, {
									projectRoot: draft.root,
									entries: draft.namedRepositories ?? [],
									pickerError,
									onUpdate: updateRepository,
									onNormalizePath: normalizeRepositoryPath,
									onChooseDirectory: chooseDirectory,
									onRemove: requestRepositoryRemoval
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: addRepository,
									children: t("projectAddRepo")
								})
							]
						}),
						preview !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(RepositoryPreview, { workspace: preview }),
						pendingDelete !== null && draft !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(RepositoryDeleteDialog, {
							name: draft.namedRepositories?.[pendingDelete]?.name || String(pendingDelete + 1),
							onCancel: cancelRepositoryRemoval,
							onConfirm: confirmRepositoryRemoval
						})
					]
				})
			});
		}
		//#endregion
		//#region src/client/turn-deliverables.ts
		/** Result payload structurally narrowed for the fields this Definition reads. */
		function toolResultFields(event) {
			const data = event.data;
			if (typeof data !== "object" || data === null) return null;
			const record = data;
			const message = record.message;
			if (typeof message !== "object" || message === null) return null;
			const source = message.source;
			const callId = typeof source === "object" && source !== null ? source.callId : void 0;
			const content = message.content;
			const first = Array.isArray(content) ? content[0] : void 0;
			return typeof callId === "string" ? {
				callId,
				isError: message.isError === true || first?.isError === true,
				meta: record.meta
			} : null;
		}
		/**
		* Files and review hunks available at one closing Assistant boundary.
		* @param data - engine-published Deliverables data for one Turn.
		* @param seq - closing Assistant seq; later Tool settlements are excluded.
		* @returns Produced files in first-seen order with same-path hunks appended in settlement order.
		*/
		function reviewsForClosing(data, seq = Number.POSITIVE_INFINITY) {
			if (data === void 0) return [];
			const reviews = [];
			const byPath = /* @__PURE__ */ new Map();
			for (const produced of data.produced) {
				if (produced.seq > seq) continue;
				const review = byPath.get(produced.path);
				if (review === void 0) {
					const created = {
						path: produced.path,
						diffs: [...produced.diffs],
						...produced.deleted === true ? { deleted: true } : {}
					};
					byPath.set(produced.path, created);
					reviews.push(created);
				} else {
					review.diffs.push(...produced.diffs);
					if (produced.deleted === true) review.deleted = true;
					else delete review.deleted;
				}
			}
			return reviews;
		}
		/**
		* Select this list entry only when its closing turn produced files.
		* @param owner - Turn-tail owner currency for the closing assistant.
		* @returns Produced-file reviews as the component's match, or null to decline before mount.
		*/
		function selectProducedFiles(owner) {
			const reviews = reviewsForClosing(owner.turn.data.get("fileReviewTab"), owner.seq);
			return reviews.length === 0 ? null : reviews;
		}
		/** Whether an event entered the surface at its own log position (append copy). */
		function isAppendSurfaceEvent(event) {
			const record = event;
			if (record.type !== "system/message" && record.type !== "user/message" && record.type !== "assistant/message" && record.type !== "tool/result") return false;
			return record.surfaceOp === "append";
		}
		/** Turn-local successful mutation accumulator; it publishes no view Node. */
		const deliverablesDefinition = {
			kind: "fileReviewTab",
			match: (event) => {
				const record = event;
				if (record.type === "turn/start") return {
					id: String(record.data?.turn),
					role: "start"
				};
				if (record.type === "tool/call") return {
					id: String(record.data?.turn),
					role: "update"
				};
				if (record.type === "tool/result" && isAppendSurfaceEvent(event)) return {
					id: String(record.data?.turn),
					role: "update"
				};
				return null;
			},
			start: (_context, match) => {
				const record = match.event;
				if (record.type !== "turn/start") throw new Error("deliverables start requires turn/start");
				return {
					turn: Number(record.data?.turn),
					calls: /* @__PURE__ */ new Map(),
					produced: []
				};
			},
			update: (context, match) => {
				const record = match.event;
				if (record.type === "tool/call") {
					const data = record.data;
					if (typeof data.callId !== "string" || typeof data.name !== "string") return context.state;
					const calls = new Map(context.state.calls);
					calls.set(data.callId, callIntent(data.name, data.arguments));
					return {
						...context.state,
						calls
					};
				}
				if (record.type !== "tool/result") return context.state;
				const result = toolResultFields(match.event);
				if (result === null || result.isError) return context.state;
				const intent = context.state.calls.get(result.callId);
				if (intent === void 0 || intent === null) return context.state;
				const applied = appliedDiffs(result.meta);
				const seq = typeof record.seq === "number" ? record.seq : Number.POSITIVE_INFINITY;
				const additions = [];
				if (intent.path !== null) {
					const own = applied === null ? intent.diffs : applied.filter((diff) => diff.path === intent.path);
					additions.push({
						seq,
						path: intent.path,
						diffs: own.length > 0 ? own : intent.diffs
					});
				}
				for (const path of intent.deletions) additions.push({
					seq,
					path,
					diffs: [],
					deleted: true
				});
				return additions.length === 0 ? context.state : {
					...context.state,
					produced: [...context.state.produced, ...additions]
				};
			},
			buildLocationData: (context, scope) => {
				if (scope !== "turn" || context.state === void 0) return null;
				return {
					kind: "turn",
					turn: context.state.turn,
					key: "fileReviewTab",
					value: { produced: context.state.produced }
				};
			}
		};
		/**
		* Trailing path segment, the part that identifies the file at a glance.
		* @param path - Slash- or backslash-separated path.
		* @returns The final segment, or the whole string when separator-free.
		*/
		function basename(path) {
			const at = Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\"));
			return at === -1 ? path : path.slice(at + 1);
		}
		//#endregion
		//#region \0dsh-file-review-tab-multi-git-repository-css:D:\projectZJGG\dsh-file-review-tab-Multi-git-repository\src\client\ProducedFiles.module.css.mjs
		const css = ".Og49Qq_card{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-container,Canvas);color:var(--dsw-alias-label-primary);border-radius:12px;margin-top:16px;font-size:13px;overflow:hidden}.Og49Qq_cardHeader{align-items:center;gap:10px;min-height:56px;padding:0 12px;display:flex}.Og49Qq_fileIconWrap{background:var(--dsw-alias-interactive-bg-hover);width:30px;height:30px;color:var(--dsw-alias-label-secondary);border-radius:8px;flex:none;place-items:center;display:grid}.Og49Qq_icon,.Og49Qq_buttonIcon,.Og49Qq_closeIcon{fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.4px}.Og49Qq_icon{width:18px;height:18px}.Og49Qq_buttonIcon{width:16px;height:16px}.Og49Qq_closeIcon{width:20px;height:20px}.Og49Qq_cardTitleBlock{flex:auto;align-items:baseline;gap:10px;min-width:0;display:flex}.Og49Qq_cardTitle{text-overflow:ellipsis;white-space:nowrap;font-weight:600;overflow:hidden}.Og49Qq_stats{font-variant-numeric:tabular-nums;white-space:nowrap;flex:none;gap:5px;display:inline-flex}.Og49Qq_added{color:var(--dsw-alias-state-success-primary)}.Og49Qq_removed{color:var(--dsw-alias-state-error-primary)}.Og49Qq_reviewButton,.Og49Qq_toggleButton,.Og49Qq_toolbarButton,.Og49Qq_openButton,.Og49Qq_closeButton{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-container,Canvas);color:var(--dsw-alias-label-primary);cursor:pointer;font:inherit}.Og49Qq_reviewButton,.Og49Qq_toggleButton,.Og49Qq_toolbarButton{border-radius:8px;flex:none;align-items:center;gap:6px;min-height:30px;padding:0 10px;display:inline-flex}.Og49Qq_reviewButton:hover,.Og49Qq_toggleButton:hover:not(:disabled),.Og49Qq_toolbarButton:hover:not(:disabled),.Og49Qq_openButton:hover,.Og49Qq_closeButton:hover{background:var(--dsw-alias-interactive-bg-hover)}.Og49Qq_reviewButton:focus-visible,.Og49Qq_toggleButton:focus-visible,.Og49Qq_toolbarButton:focus-visible,.Og49Qq_openButton:focus-visible,.Og49Qq_closeButton:focus-visible,.Og49Qq_fileRow:focus-visible{box-shadow:inset 0 0 0 2px var(--dsw-alias-border-l3);outline:none}.Og49Qq_fileList{border-top:1px solid var(--dsw-alias-border-l1)}.Og49Qq_fileRow{border:0;border-bottom:1px solid var(--dsw-alias-border-l1);width:100%;min-height:38px;color:var(--dsw-alias-label-primary);cursor:pointer;font:inherit;text-align:left;background:0 0;align-items:center;gap:12px;margin:0;padding:0 12px;display:flex}.Og49Qq_fileRow:hover{background:var(--dsw-alias-interactive-bg-hover)}.Og49Qq_fileName{text-overflow:ellipsis;white-space:nowrap;flex:auto;min-width:0;overflow:hidden}.Og49Qq_moreFiles{min-height:34px;color:var(--dsw-alias-label-tertiary);padding:0 12px;line-height:34px}.Og49Qq_drawer{z-index:1000;width:var(--review-drawer-width,36vw);border-left:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-container,Canvas);max-width:100vw;color:var(--dsw-alias-label-primary);flex-direction:column;display:flex;position:fixed;inset:0 0 0 auto;box-shadow:-12px 0 32px #0000001f}.Og49Qq_drawerSplit{z-index:1;box-shadow:none}.Og49Qq_drawerResizing,.Og49Qq_drawerResizing *{cursor:col-resize;user-select:none}.Og49Qq_resizeHandle{z-index:5;cursor:col-resize;touch-action:none;background:0 0;border:0;width:12px;margin:0;padding:0;position:absolute;inset:0 auto 0 -6px}.Og49Qq_resizeHandle:after{content:\"\";background:0 0;width:2px;transition:background .12s;position:absolute;inset:0 auto 0 5px}.Og49Qq_resizeHandle:hover:after,.Og49Qq_resizeHandle:focus-visible:after,.Og49Qq_drawerResizing .Og49Qq_resizeHandle:after{background:var(--dsw-alias-border-l3)}.Og49Qq_resizeHandle:focus-visible{outline:none}.Og49Qq_drawerHeader{border-bottom:1px solid var(--dsw-alias-border-l2);flex:none;align-items:center;gap:12px;min-height:64px;padding:0 14px 0 18px;display:flex}.Og49Qq_drawerHeading{flex-direction:column;flex:auto;gap:2px;min-width:0;display:flex}.Og49Qq_drawerTitle{font-size:15px;font-weight:600;line-height:20px}.Og49Qq_drawerSubtitle{color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;white-space:nowrap;font-size:12px;line-height:16px;overflow:hidden}.Og49Qq_toolbarButton:disabled,.Og49Qq_toggleButton:disabled{cursor:default;opacity:.45}.Og49Qq_toast{z-index:1200;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-container,Canvas);width:min(430px,100vw - 32px);color:var(--dsw-alias-label-primary);border-radius:14px;padding:14px;position:fixed;top:120px;left:50%;transform:translate(-50%);box-shadow:0 8px 24px #00000029}.Og49Qq_toastSuccess{border-color:color-mix(in srgb, var(--dsw-alias-state-success-primary) 28%, transparent);width:auto;min-width:220px;max-width:min(430px,100vw - 32px);padding:8px 10px}.Og49Qq_toastError{border-color:color-mix(in srgb, var(--dsw-alias-state-error-primary) 28%, transparent)}.Og49Qq_toastHeader{align-items:flex-start;gap:10px;display:flex}.Og49Qq_noticeIcon{border-radius:9px;flex:none;place-items:center;width:30px;height:30px;display:grid}.Og49Qq_toastSuccess .Og49Qq_noticeIcon{background:color-mix(in srgb, var(--dsw-alias-state-success-primary) 12%, transparent);color:var(--dsw-alias-state-success-primary)}.Og49Qq_toastError .Og49Qq_noticeIcon{background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 10%, transparent);color:var(--dsw-alias-state-error-primary)}.Og49Qq_noticeIconSvg{fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.7px;width:18px;height:18px}.Og49Qq_toastCopy{flex-direction:column;flex:auto;gap:3px;min-width:0;padding-top:3px;display:flex}.Og49Qq_toastTitle{font-size:14px;font-weight:600;line-height:20px}.Og49Qq_toastDescription{overflow-wrap:anywhere;color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}.Og49Qq_toastCloseButton{width:28px;height:28px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:0;border-radius:7px;flex:none;place-items:center;padding:0;display:grid}.Og49Qq_toastCloseButton:hover,.Og49Qq_toastCloseButton:focus-visible,.Og49Qq_noticeFileButton:hover,.Og49Qq_noticeFileButton:focus-visible{background:var(--dsw-alias-interactive-bg-hover)}.Og49Qq_toastCloseButton:focus-visible,.Og49Qq_noticeFileButton:focus-visible{box-shadow:inset 0 0 0 2px var(--dsw-alias-border-l3);outline:none}.Og49Qq_noticeFiles{margin:12px 0 0 40px}.Og49Qq_noticeFileListLabel{color:var(--dsw-alias-label-secondary);margin:0 8px 4px;font-size:12px;line-height:18px;display:block}.Og49Qq_noticeFileList{flex-direction:column;gap:2px;max-height:220px;margin:0;padding:0;list-style:none;display:flex;overflow:auto}.Og49Qq_noticeFileButton{width:100%;min-height:34px;color:var(--dsw-alias-label-primary);cursor:pointer;font:inherit;text-align:left;background:0 0;border:0;border-radius:7px;align-items:center;gap:12px;padding:5px 8px;display:flex}.Og49Qq_noticeFilePath{min-width:0;font:var(--dsw-font-markdown-code-block);text-overflow:ellipsis;white-space:nowrap;flex:auto;overflow:hidden}.Og49Qq_noticeFileArrow{color:var(--dsw-alias-label-secondary);white-space:nowrap;flex:none;font-size:14px}.Og49Qq_noticeDismissButton{background:var(--dsw-alias-label-primary);width:100%;min-height:34px;color:var(--dsw-alias-bg-container,Canvas);cursor:pointer;font:inherit;border:0;border-radius:8px;margin-top:12px;padding:0 12px;font-weight:600}.Og49Qq_noticeDismissButton:hover{opacity:.9}.Og49Qq_noticeDismissButton:focus-visible{outline:2px solid var(--dsw-alias-border-l3);outline-offset:2px}.Og49Qq_closeButton{background:0 0;border-color:#0000;border-radius:8px;flex:none;place-items:center;width:32px;height:32px;padding:0;display:grid}.Og49Qq_drawerBody{flex:auto;min-height:0;overflow:auto}.Og49Qq_reviewFile+.Og49Qq_reviewFile{border-top:8px solid var(--dsw-alias-border-l1)}.Og49Qq_reviewFileHeader{z-index:2;border-bottom:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-container,Canvas);min-height:44px;font:var(--dsw-font-markdown-code-block);align-items:center;gap:8px;padding:0 12px;display:flex;position:sticky;top:0}.Og49Qq_reviewStatus{color:var(--dsw-alias-state-success-primary);font-weight:700}.Og49Qq_reviewPath{text-overflow:ellipsis;white-space:nowrap;flex:auto;min-width:0;overflow:hidden}.Og49Qq_openButton{min-height:28px;font:var(--dsw-font-xs-13);border-radius:7px;flex:none;padding:0 9px}.Og49Qq_reviewDiff{color:var(--dsw-alias-label-primary)}.Og49Qq_reviewUnavailable{background:var(--dsw-alias-markdown-code-block);color:var(--dsw-alias-label-secondary);margin:0;padding:22px 16px;font-size:13px;line-height:20px}@media (width<=760px){.Og49Qq_cardHeader{flex-wrap:wrap;padding-block:10px}.Og49Qq_cardTitleBlock{flex-direction:column;gap:1px}.Og49Qq_drawer{border-left:0;width:100vw}.Og49Qq_resizeHandle{display:none}.Og49Qq_drawerHeader{gap:8px;padding-left:12px}.Og49Qq_toolbarButton{color:#0000;justify-content:center;width:32px;padding:0;overflow:hidden}.Og49Qq_toolbarButton .Og49Qq_buttonIcon{color:var(--dsw-alias-label-primary)}.Og49Qq_reviewFileHeader{flex-wrap:wrap;padding-block:8px}.Og49Qq_reviewPath{flex-basis:calc(100% - 30px)}.Og49Qq_openButton{margin-left:auto}}@media (prefers-reduced-motion:no-preference){.Og49Qq_drawer{animation:.16s ease-out Og49Qq_drawer-enter}}@keyframes Og49Qq_drawer-enter{0%{opacity:0;transform:translate(20px)}to{opacity:1;transform:translate(0)}}.Og49Qq_deletedBadge{color:var(--dsw-alias-state-error-primary);background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 12%, transparent);white-space:nowrap;border-radius:999px;padding:1px 6px;font-size:11px}";
		const styleId = "dsh-file-review-tab-multi-git-repository/ProducedFiles.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(styleId) + "]") === null) {
			const style = document.createElement("style");
			style.dataset.plugin = "dsh-file-review-tab-multi-git-repository";
			style.dataset.pluginCss = styleId;
			style.textContent = css;
			document.head.appendChild(style);
		}
		var ProducedFiles_module_css_default = {
			"card": "Og49Qq_card",
			"stats": "Og49Qq_stats",
			"closeIcon": "Og49Qq_closeIcon",
			"drawerSubtitle": "Og49Qq_drawerSubtitle",
			"resizeHandle": "Og49Qq_resizeHandle",
			"fileName": "Og49Qq_fileName",
			"drawerTitle": "Og49Qq_drawerTitle",
			"icon": "Og49Qq_icon",
			"fileRow": "Og49Qq_fileRow",
			"drawerHeader": "Og49Qq_drawerHeader",
			"fileIconWrap": "Og49Qq_fileIconWrap",
			"fileList": "Og49Qq_fileList",
			"drawerHeading": "Og49Qq_drawerHeading",
			"cardTitle": "Og49Qq_cardTitle",
			"added": "Og49Qq_added",
			"toastSuccess": "Og49Qq_toastSuccess",
			"toastCopy": "Og49Qq_toastCopy",
			"noticeFileButton": "Og49Qq_noticeFileButton",
			"openButton": "Og49Qq_openButton",
			"noticeFileArrow": "Og49Qq_noticeFileArrow",
			"drawerSplit": "Og49Qq_drawerSplit",
			"toastHeader": "Og49Qq_toastHeader",
			"noticeDismissButton": "Og49Qq_noticeDismissButton",
			"noticeFiles": "Og49Qq_noticeFiles",
			"buttonIcon": "Og49Qq_buttonIcon",
			"reviewFileHeader": "Og49Qq_reviewFileHeader",
			"reviewPath": "Og49Qq_reviewPath",
			"drawerResizing": "Og49Qq_drawerResizing",
			"toolbarButton": "Og49Qq_toolbarButton",
			"reviewDiff": "Og49Qq_reviewDiff",
			"moreFiles": "Og49Qq_moreFiles",
			"toastDescription": "Og49Qq_toastDescription",
			"drawer-enter": "Og49Qq_drawer-enter",
			"deletedBadge": "Og49Qq_deletedBadge",
			"cardTitleBlock": "Og49Qq_cardTitleBlock",
			"drawer": "Og49Qq_drawer",
			"noticeIconSvg": "Og49Qq_noticeIconSvg",
			"toastCloseButton": "Og49Qq_toastCloseButton",
			"reviewFile": "Og49Qq_reviewFile",
			"removed": "Og49Qq_removed",
			"closeButton": "Og49Qq_closeButton",
			"noticeFilePath": "Og49Qq_noticeFilePath",
			"toastTitle": "Og49Qq_toastTitle",
			"reviewButton": "Og49Qq_reviewButton",
			"toastError": "Og49Qq_toastError",
			"drawerBody": "Og49Qq_drawerBody",
			"cardHeader": "Og49Qq_cardHeader",
			"noticeFileList": "Og49Qq_noticeFileList",
			"noticeFileListLabel": "Og49Qq_noticeFileListLabel",
			"toggleButton": "Og49Qq_toggleButton",
			"toast": "Og49Qq_toast",
			"noticeIcon": "Og49Qq_noticeIcon",
			"reviewUnavailable": "Og49Qq_reviewUnavailable",
			"reviewStatus": "Og49Qq_reviewStatus"
		};
		//#endregion
		//#region src/client/produced-files-summary.tsx
		/** Keep the turn-tail card compact; the sidebar tab always lists every file. */
		const SHOWN_LIMIT = 6;
		function summaryTitle(count, allDeleted, t) {
			if (allDeleted) return count === 1 ? t("produced.deletedOne") : t("produced.deletedAll", { count: String(count) });
			return count === 1 ? t("produced.editedOne") : t("produced.edited", { count: String(count) });
		}
		function FileIcon() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				viewBox: "0 0 20 20",
				"aria-hidden": "true",
				className: ProducedFiles_module_css_default.icon,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M5.25 2.75h6l3.5 3.5v10a1 1 0 0 1-1 1h-8.5a1 1 0 0 1-1-1V3.75a1 1 0 0 1 1-1Z" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M11.25 2.75v3.5h3.5M7 10h5M7 13h5" })]
			});
		}
		function ReviewIcon() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				viewBox: "0 0 20 20",
				"aria-hidden": "true",
				className: ProducedFiles_module_css_default.buttonIcon,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M4.5 3.5h8a1 1 0 0 1 1 1v3M6.5 6.5h4M6.5 9.5h2.25" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m10.5 13 1.5 1.5 3.5-4" })]
			});
		}
		function Stats({ stats, label }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
				className: ProducedFiles_module_css_default.stats,
				"aria-label": label,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
					className: ProducedFiles_module_css_default.added,
					children: ["+", stats.added]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
					className: ProducedFiles_module_css_default.removed,
					children: ["-", stats.removed]
				})]
			});
		}
		function ProducedFilesSummary({ reviews, totalStats, allPaths, hasReversibleFiles, toggleDisabled, togglePending, toggleAction, onToggle, onReview, t }) {
			const shown = reviews.slice(0, SHOWN_LIMIT);
			const hidden = reviews.length - shown.length;
			const allDeleted = reviews.length > 0 && reviews.every(({ review }) => review.deleted === true);
			const statsMatter = totalStats.added > 0 || totalStats.removed > 0;
			const actionLabel = toggleAction === "undo" ? "produced.undo" : "produced.redo";
			const pendingLabel = toggleAction === "undo" ? "produced.undoing" : "produced.redoing";
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: ProducedFiles_module_css_default.card,
				"aria-label": t("produced.summary"),
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
					className: ProducedFiles_module_css_default.cardHeader,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: ProducedFiles_module_css_default.fileIconWrap,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FileIcon, {})
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: ProducedFiles_module_css_default.cardTitleBlock,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: ProducedFiles_module_css_default.cardTitle,
								children: summaryTitle(reviews.length, allDeleted, t)
							}), statsMatter && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Stats, {
								stats: totalStats,
								label: t("review.stats", {
									added: String(totalStats.added),
									removed: String(totalStats.removed)
								})
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: ProducedFiles_module_css_default.toggleButton,
							disabled: toggleDisabled,
							title: !hasReversibleFiles ? t("produced.toggleUnavailable") : void 0,
							"aria-label": t(actionLabel),
							onClick: onToggle,
							children: t(togglePending ? pendingLabel : actionLabel)
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: ProducedFiles_module_css_default.reviewButton,
							"aria-label": t("produced.reviewAll"),
							onClick: () => {
								onReview(allPaths);
							},
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ReviewIcon, {}), t("review.title")]
						})
					]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: ProducedFiles_module_css_default.fileList,
					children: [shown.map(({ review, stats }) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: ProducedFiles_module_css_default.fileRow,
						title: review.path,
						"aria-label": t("produced.review", { name: review.path }),
						onClick: () => {
							onReview([review.path]);
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: ProducedFiles_module_css_default.fileName,
							children: basename(review.path)
						}), review.deleted === true ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: ProducedFiles_module_css_default.deletedBadge,
							children: t("produced.deleted")
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Stats, {
							stats,
							label: t("review.stats", {
								added: String(stats.added),
								removed: String(stats.removed)
							})
						})]
					}, review.path)), hidden > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: ProducedFiles_module_css_default.moreFiles,
						children: hidden === 1 ? t("produced.moreOne") : t("produced.more", { count: String(hidden) })
					})]
				})]
			});
		}
		//#endregion
		//#region src/client/produced-files-toast.tsx
		/** Feedback for a completed undo/redo request, including skipped-file actions. */
		const SUCCESS_NOTICE_DURATION = 2e3;
		const ERROR_NOTICE_DURATION = 5e3;
		function CloseIcon() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				viewBox: "0 0 20 20",
				"aria-hidden": "true",
				className: ProducedFiles_module_css_default.closeIcon,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m5.5 5.5 9 9m0-9-9 9" })
			});
		}
		function SuccessIcon() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				viewBox: "0 0 20 20",
				"aria-hidden": "true",
				className: ProducedFiles_module_css_default.noticeIconSvg,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m5 10 3.25 3.25L15 6.5" })
			});
		}
		function ErrorIcon() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				viewBox: "0 0 20 20",
				"aria-hidden": "true",
				className: ProducedFiles_module_css_default.noticeIconSvg,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
					cx: "10",
					cy: "10",
					r: "6.5"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "m7.5 7.5 5 5m0-5-5 5" })]
			});
		}
		function ResultToast({ notice, closeLabel, dismissLabel, fileListLabel, fileOpenLabel, openFile, onDone }) {
			(0, react.useEffect)(() => {
				const duration = notice.tone === "success" ? SUCCESS_NOTICE_DURATION : ERROR_NOTICE_DURATION;
				const timer = window.setTimeout(onDone, duration);
				return () => {
					window.clearTimeout(timer);
				};
			}, [notice.tone, onDone]);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: `${ProducedFiles_module_css_default.toast} ${notice.tone === "success" ? ProducedFiles_module_css_default.toastSuccess : ProducedFiles_module_css_default.toastError}`,
				role: "alert",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: ProducedFiles_module_css_default.toastHeader,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: ProducedFiles_module_css_default.noticeIcon,
								children: notice.tone === "success" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SuccessIcon, {}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ErrorIcon, {})
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: ProducedFiles_module_css_default.toastCopy,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", {
									className: ProducedFiles_module_css_default.toastTitle,
									children: notice.title
								}), notice.description !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: ProducedFiles_module_css_default.toastDescription,
									children: notice.description
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: ProducedFiles_module_css_default.toastCloseButton,
								"aria-label": closeLabel,
								onClick: onDone,
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CloseIcon, {})
							})
						]
					}),
					notice.files.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: ProducedFiles_module_css_default.noticeFiles,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: ProducedFiles_module_css_default.noticeFileListLabel,
							children: fileListLabel
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
							className: ProducedFiles_module_css_default.noticeFileList,
							children: notice.files.map((file) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: ProducedFiles_module_css_default.noticeFileButton,
								"aria-label": fileOpenLabel(file.path),
								onClick: () => {
									openFile(file.path);
								},
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: ProducedFiles_module_css_default.noticeFilePath,
									children: basename(file.path)
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: ProducedFiles_module_css_default.noticeFileArrow,
									"aria-hidden": "true",
									children: "↗"
								})]
							}) }, file.path))
						})]
					}),
					notice.tone === "error" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: ProducedFiles_module_css_default.noticeDismissButton,
						onClick: onDone,
						children: dismissLabel
					})
				]
			});
		}
		//#endregion
		//#region src/client/ProducedFiles.tsx
		/**
		* Turn-tail summary of paths and hunks from mutation-tool results.
		* Sidebar navigation passes the selected paths and owning turn to the opener;
		* inspection and undo/redo requests keep the original reversible diff data.
		*/
		const unavailableChanges = async (request) => ({ files: request.files.map((file) => ({
			path: file.path,
			state: "unsupported",
			changed: false,
			reason: "Host file toggle is unavailable"
		})) });
		function addStats(left, right) {
			return {
				added: left.added + right.added,
				removed: left.removed + right.removed
			};
		}
		function noticeDescription(notice, t) {
			if (notice.descriptionKey) return t(notice.descriptionKey);
			if (notice.description === void 0) return void 0;
			return localizeReviewMessage(notice.description);
		}
		/** Render one turn's produced files as a summary card opening the sidebar tab. */
		function ProducedFiles({ matched: reviews, openFile, turn: turnLocation, inspectChanges = unavailableChanges, applyChanges = unavailableChanges, openInSidebarTab, t: t$1 }) {
			useReviewLocale();
			const turnNumber = turnLocation.turn;
			const [toggleAction, setToggleAction] = (0, react.useState)("undo");
			const [statusPending, setStatusPending] = (0, react.useState)(true);
			const [togglePending, setTogglePending] = (0, react.useState)(false);
			const [toast, setToast] = (0, react.useState)(null);
			const [navigationError, setNavigationError] = (0, react.useState)(null);
			const toastSeqRef = (0, react.useRef)(0);
			const reviewsWithStats = (0, react.useMemo)(() => reviews.map((review) => ({
				review,
				stats: summarizeDiffs(review.diffs)
			})), [reviews]);
			const totalStats = (0, react.useMemo)(() => reviewsWithStats.reduce((total, item) => addStats(total, item.stats), {
				added: 0,
				removed: 0
			}), [reviewsWithStats]);
			const toggleFiles = (0, react.useMemo)(() => reviews.filter((review) => review.deleted !== true).map((review) => ({
				path: review.path,
				diffs: review.diffs
			})), [reviews]);
			const reversiblePaths = (0, react.useMemo)(() => new Set(reviews.filter((review) => review.diffs.length > 0 && review.diffs.every((diff) => diff.path === review.path && diff.oldText !== null && diff.oldText !== diff.newText && (diff.oldText !== "" || diff.oldStart !== void 0) && (diff.newText !== "" || diff.newStart !== void 0))).map((review) => review.path)), [reviews]);
			const hasReversibleFiles = reversiblePaths.size > 0;
			const allPaths = (0, react.useMemo)(() => reviews.map((review) => review.path), [reviews]);
			const showToast = (0, react.useCallback)((notice) => {
				toastSeqRef.current += 1;
				setToast({
					seq: toastSeqRef.current,
					...notice
				});
			}, []);
			const phaseForResult = (0, react.useCallback)((result, currentAction) => {
				if (reversiblePaths.size === 0) return "undo";
				const byPath = new Map(result.files.map((file) => [file.path, file]));
				const target = currentAction === "undo" ? "undone" : "applied";
				return [...reversiblePaths].every((path) => byPath.get(path)?.state === target) ? currentAction === "undo" ? "redo" : "undo" : currentAction;
			}, [reversiblePaths]);
			(0, react.useEffect)(() => {
				let active = true;
				setStatusPending(true);
				inspectChanges({
					action: "undo",
					files: toggleFiles
				}).then((result) => {
					if (!active) return;
					const allUndone = reversiblePaths.size > 0 && [...reversiblePaths].every((path) => result.files.find((file) => file.path === path)?.state === "undone");
					setToggleAction(allUndone ? "redo" : "undo");
				}).catch(() => {}).finally(() => {
					if (active) setStatusPending(false);
				});
				return () => {
					active = false;
				};
			}, [
				inspectChanges,
				reversiblePaths,
				toggleFiles
			]);
			const runToggle = (0, react.useCallback)(() => {
				if (statusPending || togglePending || !hasReversibleFiles) return;
				const action = toggleAction;
				setTogglePending(true);
				applyChanges({
					action,
					files: toggleFiles
				}).then((result) => {
					setToggleAction(phaseForResult(result, action));
					const targetState = action === "undo" ? "undone" : "applied";
					const byPath = new Map(result.files.map((file) => [file.path, file]));
					const failures = toggleFiles.flatMap((file) => {
						if (byPath.get(file.path)?.state === targetState) return [];
						return [{ path: file.path }];
					});
					if (failures.length === 0) {
						showToast({
							tone: "success",
							title: action === "undo" ? "produced.undoSuccess" : "produced.redoSuccess",
							files: []
						});
						return;
					}
					showToast({
						tone: "error",
						title: action === "undo" ? "produced.undoPartial" : "produced.redoPartial",
						descriptionKey: action === "undo" ? "produced.undoPartialDescription" : "produced.redoPartialDescription",
						files: failures
					});
				}).catch((error) => {
					showToast({
						tone: "error",
						title: action === "undo" ? "produced.undoError" : "produced.redoError",
						description: error instanceof Error ? error.message : String(error),
						files: []
					});
				}).finally(() => {
					setTogglePending(false);
				});
			}, [
				applyChanges,
				hasReversibleFiles,
				phaseForResult,
				showToast,
				t$1,
				statusPending,
				toggleAction,
				toggleFiles,
				togglePending
			]);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ProducedFilesSummary, {
					reviews: reviewsWithStats,
					totalStats,
					allPaths,
					hasReversibleFiles,
					toggleDisabled: statusPending || togglePending || !hasReversibleFiles,
					togglePending,
					toggleAction,
					onToggle: runToggle,
					onReview: (paths) => {
						setNavigationError(null);
						try {
							openInSidebarTab?.(paths, turnNumber);
						} catch (error) {
							console.error("[file-review] review navigation failed:", error);
							setNavigationError(error instanceof Error ? error.message : t("sidebarUnavailable"));
						}
					},
					t: t$1
				}),
				navigationError && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					role: "alert",
					children: navigationError
				}),
				toast !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ResultToast, {
					notice: {
						...toast,
						title: t$1(toast.title),
						description: noticeDescription(toast, t$1)
					},
					closeLabel: t$1("produced.noticeClose"),
					dismissLabel: t$1("produced.noticeDismiss"),
					fileListLabel: t$1("produced.skippedFiles", { count: String(toast.files.length) }),
					fileOpenLabel: (path) => t$1("produced.open", { name: basename(path) }),
					openFile,
					onDone: () => {
						setToast((current) => current?.seq === toast.seq ? null : current);
					}
				}, toast.seq)
			] });
		}
		//#endregion
		//#region src/client/chat-locales.ts
		/** `file-review` namespace dictionaries. */
		/** Dictionary namespace owned by this plugin. */
		const NS = "file-review";
		/** English dictionary (the key-set source of truth). */
		const en = {
			"produced.summary": "Edited files",
			"produced.editedOne": "Edited 1 file",
			"produced.edited": "Edited {count} files",
			"produced.moreOne": "1 more file",
			"produced.more": "{count} more files",
			"produced.open": "Open {name}",
			"produced.review": "Review {name}",
			"produced.reviewAll": "Review all produced files",
			"produced.undo": "Undo",
			"produced.redo": "Reapply",
			"produced.undoing": "Undoing…",
			"produced.redoing": "Reapplying…",
			"produced.toggleUnavailable": "No safely reversible files are available in this change",
			"produced.undoSuccess": "Changes undone",
			"produced.redoSuccess": "Changes reapplied",
			"produced.undoPartial": "Not all changes were restored",
			"produced.redoPartial": "Not all changes were reapplied",
			"produced.undoPartialDescription": "An error occurred while restoring some files",
			"produced.redoPartialDescription": "An error occurred while reapplying some files",
			"produced.skippedFiles": "Skipped ({count})",
			"produced.undoError": "Could not undo changes",
			"produced.redoError": "Could not reapply changes",
			"produced.noticeClose": "Dismiss notification",
			"produced.noticeDismiss": "Close",
			"produced.deleted": "deleted",
			"produced.deletedOne": "Deleted 1 file",
			"produced.deletedAll": "Deleted {count} files",
			"review.title": "Review",
			"review.fileOne": "1 file",
			"review.files": "{count} files",
			"review.close": "Close",
			"review.resize": "Resize review panel",
			"review.resizeHint": "Drag to resize. Double-click to reset.",
			"review.openInEditor": "Open in editor",
			"review.copy": "Copy diff",
			"review.copied": "Copied",
			"review.showUnchanged": "{count} unchanged lines",
			"review.hideUnchanged": "Hide {count} unchanged lines",
			"review.stats": "{added} lines added, {removed} lines removed",
			"review.unavailable": "No reconstructable diff is available for this change. You can still open the current file."
		};
		/** Simplified Chinese dictionary. */
		const zh = {
			"produced.summary": "已编辑文件",
			"produced.editedOne": "已编辑 1 个文件",
			"produced.edited": "已编辑 {count} 个文件",
			"produced.moreOne": "另有 1 个文件",
			"produced.more": "另有 {count} 个文件",
			"produced.open": "打开 {name}",
			"produced.review": "审查 {name}",
			"produced.reviewAll": "审查所有产出文件",
			"produced.undo": "撤销",
			"produced.redo": "重新应用",
			"produced.undoing": "正在撤销…",
			"produced.redoing": "正在重新应用…",
			"produced.toggleUnavailable": "本次更改中没有可安全还原的文件",
			"produced.undoSuccess": "已成功撤销更改",
			"produced.redoSuccess": "已成功重新应用更改",
			"produced.undoPartial": "未还原全部更改",
			"produced.redoPartial": "未重新应用全部更改",
			"produced.undoPartialDescription": "还原部分文件时出错",
			"produced.redoPartialDescription": "重新应用部分文件时出错",
			"produced.skippedFiles": "已跳过（{count} 个）",
			"produced.undoError": "未能撤销更改",
			"produced.redoError": "未能重新应用更改",
			"produced.noticeClose": "关闭提示",
			"produced.noticeDismiss": "关闭",
			"produced.deleted": "已删除",
			"produced.deletedOne": "已删除 1 个文件",
			"produced.deletedAll": "已删除 {count} 个文件",
			"review.title": "审查",
			"review.fileOne": "1 个文件",
			"review.files": "{count} 个文件",
			"review.close": "关闭",
			"review.resize": "调整审查面板大小",
			"review.resizeHint": "拖动以调整大小。双击恢复默认大小。",
			"review.openInEditor": "在编辑器中打开",
			"review.copy": "复制差异",
			"review.copied": "已复制",
			"review.showUnchanged": "显示 {count} 行未更改内容",
			"review.hideUnchanged": "隐藏 {count} 行未更改内容",
			"review.stats": "新增 {added} 行，删除 {removed} 行",
			"review.unavailable": "无法为此更改还原可审查的差异。你仍可打开当前文件。"
		};
		//#endregion
		//#region src/client/index.tsx
		/**
		* Required services: the sidebar registry, session snapshots, locale, remote,
		* and the slot registry (turn-tail list). The plugin-owned Conversation
		* Definition uses its own key so it can coexist with DSH 0.2's built-in
		* `deliverables` definition and `chatFileMentions` service.
		*/
		const inject = [
			"sidebarRight",
			"sidebarRightTabs",
			"sessions",
			"locale",
			"remote",
			"slots",
			"uiConversation",
			"conversation"
		];
		/**
		* Client plugin body: attach locale, mount the Typert remote, register the
		* chat turn-tail row AND the sidebar tab.
		* @param ctx - client root context.
		*/
		function apply(ctx) {
			ctx.effect(() => attachLocale(ctx.locale), "file-review-tab: follow host language");
			ctx.effect(() => {
				const offZh = ctx.locale.register(LOCALE_NS, "zh", zh$1);
				const offEn = ctx.locale.register(LOCALE_NS, "en", en$1);
				return () => {
					offZh();
					offEn();
				};
			}, "file-review-tab: tab dictionaries");
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "file-review-tab: chat dictionaries");
			ctx.effect(() => {
				let disposed = false;
				let disposeRemote;
				ctx.remote.$mount(TYPERT_REMOTE).then((dispose) => {
					if (disposed) dispose();
					else disposeRemote = dispose;
				}).catch((error) => {
					console.error("[dsh-file-review-tab-multi-git-repository] remote mount error:", error);
				});
				return () => {
					disposed = true;
					if (disposeRemote !== void 0) disposeRemote();
				};
			}, "file-review-tab: typert remote");
			ctx.effect(() => ctx.slots.inject("conversation.view", () => ctx.slots.register({
				name: "conversation.view",
				id: "repositories",
				order: 200,
				label: () => t("projectTab"),
				inject: (sessionId) => ({
					ctx,
					sessionId
				})
			}, RepositorySettings)), "file-review-tab: repository conversation view");
			ctx.effect(() => ctx.uiConversation.events.register(deliverablesDefinition), "file-review-tab: deliverables definition");
			ctx.effect(() => ctx.slots.inject("conversation.chat.turnTail", () => ctx.slots.register({
				name: "conversation.chat.turnTail",
				id: "dsh-file-review-tab-multi-git-repository",
				order: 110,
				locale: NS,
				registrant: "dsh-file-review-tab-multi-git-repository",
				inject: (sessionId) => {
					const sessions = ctx.sessions;
					const projectRoot = sessions.list.getSnapshot().byId[sessionId]?.cwd;
					const invoke = async (method, request) => {
						const scope = sessions.scope(sessionId);
						if (scope === void 0) throw new Error("Session is unavailable");
						const fileReview = scope.get("remote.fileReview");
						if (fileReview === void 0) throw new Error("File review Remote is unavailable");
						const result = await fileReview[method](request);
						if (!result.ok) throw new Error(result.error.message);
						return result.value;
					};
					return {
						projectRoot,
						inspectChanges: (request) => invoke("status", request),
						applyChanges: (request) => invoke("apply", request),
						openInSidebarTab: (paths, turn) => {
							openReviewTab(ctx.sidebarRight, sessionId, paths, turn);
						}
					};
				}
			}, ({ turn, seq, openFile, projectRoot, inspectChanges, applyChanges, openInSidebarTab, t }) => {
				const matched = selectProducedFiles({
					turn,
					seq,
					openFile
				});
				return matched === null ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ProducedFiles, {
					matched,
					turn,
					openFile,
					projectRoot,
					inspectChanges,
					applyChanges,
					openInSidebarTab,
					t
				});
			})), "file-review-tab: turn-tail row");
			ctx.effect(() => registerNativeSidebar(ctx), "file-review-tab: native sidebar");
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map