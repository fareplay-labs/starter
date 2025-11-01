"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaRegistryService = void 0;
const common_1 = require("@nestjs/common");
const schemaRegistry_1 = require("./registry/schemaRegistry");
let SchemaRegistryService = class SchemaRegistryService {
    getSchema(gameType) {
        return schemaRegistry_1.schemaRegistry.getSchema(gameType);
    }
    getJsonSchema(gameType) {
        return schemaRegistry_1.schemaRegistry.getJsonSchema(gameType);
    }
    getGameMetadata(gameType) {
        return schemaRegistry_1.schemaRegistry.getGameMetadata(gameType);
    }
    extractCustomInstructions(gameType) {
        return schemaRegistry_1.schemaRegistry.extractCustomInstructions(gameType);
    }
    getFieldInfo(gameType) {
        return schemaRegistry_1.schemaRegistry.getFieldInfo(gameType);
    }
    validateParams(gameType, params) {
        return schemaRegistry_1.schemaRegistry.validateParams(gameType, params);
    }
    getSupportedGames() {
        return schemaRegistry_1.schemaRegistry.getSupportedGames();
    }
    isGameSupported(gameType) {
        return schemaRegistry_1.schemaRegistry.isGameSupported(gameType);
    }
    getSupportedTypesMetadata(gameType) {
        return schemaRegistry_1.schemaRegistry.getSupportedTypesMetadata(gameType);
    }
};
exports.SchemaRegistryService = SchemaRegistryService;
exports.SchemaRegistryService = SchemaRegistryService = __decorate([
    (0, common_1.Injectable)()
], SchemaRegistryService);
//# sourceMappingURL=schema-registry.service.js.map