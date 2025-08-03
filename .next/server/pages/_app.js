/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/_app";
exports.ids = ["pages/_app"];
exports.modules = {

/***/ "./lib/ProjectContext.tsx":
/*!********************************!*\
  !*** ./lib/ProjectContext.tsx ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   ProjectProvider: () => (/* binding */ ProjectProvider),\n/* harmony export */   useProject: () => (/* binding */ useProject)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"react\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n\n\nconst ProjectContext = /*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_1__.createContext)(undefined);\nfunction ProjectProvider({ children }) {\n    const [scheduleData, setScheduleData] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)([]);\n    const [handovers, setHandovers] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)([]);\n    const [scurve, setSCurve] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)([]);\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(ProjectContext.Provider, {\n        value: {\n            scheduleData,\n            setScheduleData,\n            handovers,\n            setHandovers,\n            scurve,\n            setSCurve\n        },\n        children: children\n    }, void 0, false, {\n        fileName: \"/Users/michaelfurry/taktr-app/lib/ProjectContext.tsx\",\n        lineNumber: 42,\n        columnNumber: 5\n    }, this);\n}\nfunction useProject() {\n    const context = (0,react__WEBPACK_IMPORTED_MODULE_1__.useContext)(ProjectContext);\n    if (!context) throw new Error(\"useProject must be used within a ProjectProvider\");\n    return context;\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9saWIvUHJvamVjdENvbnRleHQudHN4IiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBOEU7QUFpQzlFLE1BQU1JLCtCQUFpQkgsb0RBQWFBLENBQWlDSTtBQUU5RCxTQUFTQyxnQkFBZ0IsRUFBRUMsUUFBUSxFQUEyQjtJQUNuRSxNQUFNLENBQUNDLGNBQWNDLGdCQUFnQixHQUFHTiwrQ0FBUUEsQ0FBUyxFQUFFO0lBQzNELE1BQU0sQ0FBQ08sV0FBV0MsYUFBYSxHQUFHUiwrQ0FBUUEsQ0FBYSxFQUFFO0lBQ3pELE1BQU0sQ0FBQ1MsUUFBUUMsVUFBVSxHQUFHViwrQ0FBUUEsQ0FBZ0IsRUFBRTtJQUV0RCxxQkFDRSw4REFBQ0MsZUFBZVUsUUFBUTtRQUFDQyxPQUFPO1lBQUVQO1lBQWNDO1lBQWlCQztZQUFXQztZQUFjQztZQUFRQztRQUFVO2tCQUN6R047Ozs7OztBQUdQO0FBRU8sU0FBU1M7SUFDZCxNQUFNQyxVQUFVZixpREFBVUEsQ0FBQ0U7SUFDM0IsSUFBSSxDQUFDYSxTQUFTLE1BQU0sSUFBSUMsTUFBTTtJQUM5QixPQUFPRDtBQUNUIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vdGFrdHItYXBwLy4vbGliL1Byb2plY3RDb250ZXh0LnRzeD9kZTNjIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCwgeyBjcmVhdGVDb250ZXh0LCB1c2VDb250ZXh0LCB1c2VTdGF0ZSwgUmVhY3ROb2RlIH0gZnJvbSAncmVhY3QnO1xuXG4vLyDwn5S5IFR5cGVzXG5leHBvcnQgaW50ZXJmYWNlIFRhc2sge1xuICBsYWJlbDogc3RyaW5nO1xuICB0cmFkZTogc3RyaW5nO1xuICBzdGFydDogc3RyaW5nIHwgRGF0ZTtcbiAgZmluaXNoOiBzdHJpbmcgfCBEYXRlO1xuICBkdXJhdGlvbjogbnVtYmVyO1xuICBzdGFydERheT86IG51bWJlcjtcbiAgbmFtZT86IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBIYW5kb3ZlciB7XG4gIGZyb206IHN0cmluZztcbiAgdG86IHN0cmluZztcbiAgZGF5OiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU0N1cnZlUG9pbnQge1xuICBkYXk6IG51bWJlcjtcbiAgcHJvZ3Jlc3M6IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQcm9qZWN0Q29udGV4dFR5cGUge1xuICBzY2hlZHVsZURhdGE6IFRhc2tbXTtcbiAgc2V0U2NoZWR1bGVEYXRhOiAodGFza3M6IFRhc2tbXSkgPT4gdm9pZDtcbiAgaGFuZG92ZXJzOiBIYW5kb3ZlcltdO1xuICBzZXRIYW5kb3ZlcnM6IChoYW5kb3ZlcnM6IEhhbmRvdmVyW10pID0+IHZvaWQ7XG4gIHNjdXJ2ZTogU0N1cnZlUG9pbnRbXTtcbiAgc2V0U0N1cnZlOiAocG9pbnRzOiBTQ3VydmVQb2ludFtdKSA9PiB2b2lkO1xufVxuXG5jb25zdCBQcm9qZWN0Q29udGV4dCA9IGNyZWF0ZUNvbnRleHQ8UHJvamVjdENvbnRleHRUeXBlIHwgdW5kZWZpbmVkPih1bmRlZmluZWQpO1xuXG5leHBvcnQgZnVuY3Rpb24gUHJvamVjdFByb3ZpZGVyKHsgY2hpbGRyZW4gfTogeyBjaGlsZHJlbjogUmVhY3ROb2RlIH0pIHtcbiAgY29uc3QgW3NjaGVkdWxlRGF0YSwgc2V0U2NoZWR1bGVEYXRhXSA9IHVzZVN0YXRlPFRhc2tbXT4oW10pO1xuICBjb25zdCBbaGFuZG92ZXJzLCBzZXRIYW5kb3ZlcnNdID0gdXNlU3RhdGU8SGFuZG92ZXJbXT4oW10pO1xuICBjb25zdCBbc2N1cnZlLCBzZXRTQ3VydmVdID0gdXNlU3RhdGU8U0N1cnZlUG9pbnRbXT4oW10pO1xuXG4gIHJldHVybiAoXG4gICAgPFByb2plY3RDb250ZXh0LlByb3ZpZGVyIHZhbHVlPXt7IHNjaGVkdWxlRGF0YSwgc2V0U2NoZWR1bGVEYXRhLCBoYW5kb3ZlcnMsIHNldEhhbmRvdmVycywgc2N1cnZlLCBzZXRTQ3VydmUgfX0+XG4gICAgICB7Y2hpbGRyZW59XG4gICAgPC9Qcm9qZWN0Q29udGV4dC5Qcm92aWRlcj5cbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVzZVByb2plY3QoKTogUHJvamVjdENvbnRleHRUeXBlIHtcbiAgY29uc3QgY29udGV4dCA9IHVzZUNvbnRleHQoUHJvamVjdENvbnRleHQpO1xuICBpZiAoIWNvbnRleHQpIHRocm93IG5ldyBFcnJvcigndXNlUHJvamVjdCBtdXN0IGJlIHVzZWQgd2l0aGluIGEgUHJvamVjdFByb3ZpZGVyJyk7XG4gIHJldHVybiBjb250ZXh0O1xufSJdLCJuYW1lcyI6WyJSZWFjdCIsImNyZWF0ZUNvbnRleHQiLCJ1c2VDb250ZXh0IiwidXNlU3RhdGUiLCJQcm9qZWN0Q29udGV4dCIsInVuZGVmaW5lZCIsIlByb2plY3RQcm92aWRlciIsImNoaWxkcmVuIiwic2NoZWR1bGVEYXRhIiwic2V0U2NoZWR1bGVEYXRhIiwiaGFuZG92ZXJzIiwic2V0SGFuZG92ZXJzIiwic2N1cnZlIiwic2V0U0N1cnZlIiwiUHJvdmlkZXIiLCJ2YWx1ZSIsInVzZVByb2plY3QiLCJjb250ZXh0IiwiRXJyb3IiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./lib/ProjectContext.tsx\n");

/***/ }),

/***/ "./pages/_app.tsx":
/*!************************!*\
  !*** ./pages/_app.tsx ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ App)\n/* harmony export */ });\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"react/jsx-dev-runtime\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/styles/globals.css */ \"./styles/globals.css\");\n/* harmony import */ var _styles_globals_css__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_styles_globals_css__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var _lib_ProjectContext__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/lib/ProjectContext */ \"./lib/ProjectContext.tsx\");\n\n\n\nfunction App({ Component, pageProps }) {\n    return /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(_lib_ProjectContext__WEBPACK_IMPORTED_MODULE_2__.ProjectProvider, {\n        children: /*#__PURE__*/ (0,react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxDEV)(Component, {\n            ...pageProps\n        }, void 0, false, {\n            fileName: \"/Users/michaelfurry/taktr-app/pages/_app.tsx\",\n            lineNumber: 8,\n            columnNumber: 7\n        }, this)\n    }, void 0, false, {\n        fileName: \"/Users/michaelfurry/taktr-app/pages/_app.tsx\",\n        lineNumber: 7,\n        columnNumber: 5\n    }, this);\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi9wYWdlcy9fYXBwLnRzeCIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQThCO0FBRXlCO0FBRXhDLFNBQVNDLElBQUksRUFBRUMsU0FBUyxFQUFFQyxTQUFTLEVBQVk7SUFDNUQscUJBQ0UsOERBQUNILGdFQUFlQTtrQkFDZCw0RUFBQ0U7WUFBVyxHQUFHQyxTQUFTOzs7Ozs7Ozs7OztBQUc5QiIsInNvdXJjZXMiOlsid2VicGFjazovL3Rha3RyLWFwcC8uL3BhZ2VzL19hcHAudHN4PzJmYmUiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICdAL3N0eWxlcy9nbG9iYWxzLmNzcyc7XG5pbXBvcnQgdHlwZSB7IEFwcFByb3BzIH0gZnJvbSAnbmV4dC9hcHAnO1xuaW1wb3J0IHsgUHJvamVjdFByb3ZpZGVyIH0gZnJvbSAnQC9saWIvUHJvamVjdENvbnRleHQnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBBcHAoeyBDb21wb25lbnQsIHBhZ2VQcm9wcyB9OiBBcHBQcm9wcykge1xuICByZXR1cm4gKFxuICAgIDxQcm9qZWN0UHJvdmlkZXI+XG4gICAgICA8Q29tcG9uZW50IHsuLi5wYWdlUHJvcHN9IC8+XG4gICAgPC9Qcm9qZWN0UHJvdmlkZXI+XG4gICk7XG59Il0sIm5hbWVzIjpbIlByb2plY3RQcm92aWRlciIsIkFwcCIsIkNvbXBvbmVudCIsInBhZ2VQcm9wcyJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./pages/_app.tsx\n");

/***/ }),

/***/ "./styles/globals.css":
/*!****************************!*\
  !*** ./styles/globals.css ***!
  \****************************/
/***/ (() => {



/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("react");

/***/ }),

/***/ "react/jsx-dev-runtime":
/*!****************************************!*\
  !*** external "react/jsx-dev-runtime" ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = require("react/jsx-dev-runtime");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__("./pages/_app.tsx"));
module.exports = __webpack_exports__;

})();