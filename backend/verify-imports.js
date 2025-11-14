#!/usr/bin/env node
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

console.log('Testing server startup...\n');

try {
    const { stdout, stderr } = await execAsync('node src/index.js', {
        cwd: '/workspaces/TPC/backend',
        timeout: 3000
    });
    
    console.log('✅ Server started successfully!');
    console.log(stdout);
} catch (error) {
    if (error.killed) {
        console.log('✅ Server started (killed after 3s timeout)');
    } else {
        console.error('❌ Server failed to start:');
        console.error(error.stderr || error.message);
        process.exit(1);
    }
}
