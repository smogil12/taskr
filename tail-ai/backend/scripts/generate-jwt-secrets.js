#!/usr/bin/env node

/**
 * JWT Secret Generation Script
 * Generates cryptographically strong JWT secrets for different environments
 */

const crypto = require('crypto');

function generateJwtSecret(prefix = '') {
  const randomBytes = crypto.randomBytes(32);
  const secret = randomBytes.toString('hex');
  return prefix + secret;
}

function main() {
  console.log('🔐 JWT Secret Generator');
  console.log('======================\n');

  const environments = [
    { name: 'Development', prefix: 'dev_' },
    { name: 'Staging', prefix: 'staging_' },
    { name: 'Production', prefix: 'prod_' }
  ];

  console.log('Generated JWT secrets for all environments:\n');

  environments.forEach(env => {
    const secret = generateJwtSecret(env.prefix);
    console.log(`${env.name}:`);
    console.log(`JWT_SECRET="${secret}"`);
    console.log('');
  });

  console.log('📋 Instructions:');
  console.log('1. Copy the appropriate secret to your .env file');
  console.log('2. Never commit these secrets to version control');
  console.log('3. Use different secrets for each environment');
  console.log('4. Restart your server after updating the secret');
  console.log('5. All users will need to re-login after secret change\n');

  console.log('⚠️  Security Notes:');
  console.log('- These secrets are 64 characters long (256 bits of entropy)');
  console.log('- They contain only hexadecimal characters for maximum compatibility');
  console.log('- Each secret is unique and cryptographically random');
  console.log('- Store them securely and rotate them regularly in production');
}

if (require.main === module) {
  main();
}

module.exports = { generateJwtSecret };
