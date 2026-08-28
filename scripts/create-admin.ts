import 'dotenv/config';
import { connectDB } from '../lib/mongodb';
import { hashPassword } from '../lib/password';
import Admin from '../lib/models/Admin';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

async function readSecret(label: string, prompt: readline.Interface) {
    output.write(label);
    if (!process.stdin.isTTY) return (await prompt.question(''));
    process.stdin.setRawMode(true);
    process.stdin.resume();
    return new Promise<string>((resolve) => {
        let value = '';
        const onData = (chunk: Buffer) => {
            const key = chunk.toString();
            if (key === '\u0003') process.exit(130);
            if (key === '\r' || key === '\n') {
                process.stdin.setRawMode(false);
                process.stdin.pause();
                process.stdin.off('data', onData);
                output.write('\n');
                resolve(value);
            } else if (key === '\u007f') {
                value = value.slice(0, -1);
            } else if (key.length === 1) {
                value += key;
            }
        };
        process.stdin.on('data', onData);
    });
}

const prompt = readline.createInterface({ input, output });
async function main() {
    try {
        const email = (await prompt.question('Admin email: ')).trim().toLowerCase();
        const password = await readSecret('Admin password (min 12 characters): ', prompt);
        if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 12) throw new Error('Use a valid email and a password of at least 12 characters.');
        await connectDB();
        if (await Admin.exists({ email })) throw new Error('An admin with that email already exists.');
        const admin = await Admin.create({ email, passwordHash: await hashPassword(password), role: 'superadmin' });
        console.log(`Created superadmin ${admin.email}`);
    } finally {
        prompt.close();
    }
}

main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : 'Failed to create admin');
    process.exitCode = 1;
});