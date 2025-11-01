import { Keypair } from '@solana/web3.js';
import * as bs58 from 'bs58';

// Generate a new keypair for the heartbeat service
const keypair = Keypair.generate();

// Encode the private key as base58
const privateKeyBase58 = bs58.encode(keypair.secretKey);

console.log('\n=== Heartbeat Service Keypair ===\n');
console.log('Public Key (Casino ID):', keypair.publicKey.toBase58());
console.log('Private Key (for .env):', privateKeyBase58);
console.log('\nAdd this to your apps/api/.env file:');
console.log(`HEARTBEAT_PRIVATE_KEY=${privateKeyBase58}`);
console.log('\n');

