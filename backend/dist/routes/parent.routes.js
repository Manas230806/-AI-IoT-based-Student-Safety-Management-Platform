"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const parent_controller_1 = require("../controllers/parent.controller");
const router = (0, express_1.Router)();
router.get('/:userId', parent_controller_1.getParentProfile);
exports.default = router;
//# sourceMappingURL=parent.routes.js.map