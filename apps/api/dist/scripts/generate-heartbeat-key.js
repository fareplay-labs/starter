"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const bs58 = require("bs58");
const keypair = web3_js_1.Keypair.generate();
const privateKeyBase58 = bs58.encode(keypair.secretKey);
console.log('\n=== Heartbeat Service Keypair ===\n');
console.log('Public Key (Casino ID):', keypair.publicKey.toBase58());
console.log('Private Key (for .env):', privateKeyBase58);
console.log('\nAdd this to your apps/api/.env file:');
console.log(`HEARTBEAT_PRIVATE_KEY=${privateKeyBase58}`);
console.log('\n');
//# sourceMappingURL=generate-heartbeat-key.js.map