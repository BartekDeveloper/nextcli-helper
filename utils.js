import fs, {
    copyFile as fsCopyFile,
    mkdir,
    writeFile as fsWriteFile,
} from 'fs/promises';

import {
    copyFileSync,
    renameSync as fsRenameSync
} from "fs";

import path from 'path';
import { exec, spawn } from "child_process"
import { cpSync, existsSync, mkdirSync, readFile, readFileSync } from 'fs';
import { fileURLToPath } from 'url';

export async function createFromTemplate(templateName, outFile, vars = {}) {
    const localPath = path.resolve(`.nextcli/templates/${templateName}.tpl`);
    let content;
    
    try {
        content = await fs.readFile(localPath, 'utf8');
    } catch {
        const builtInPath = new URL(`./templates/${templateName}.tpl`, import.meta.url);
        content = await fs.readFile(builtInPath, 'utf8');
    }
    
    const filled = content.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? '');
    await fs.mkdir(path.dirname(outFile), { recursive: true });
    await fs.writeFile(outFile, filled);
    console.log(`✅ Created: ${outFile}`);
}

export async function removeFile(filePath) {
    try {
        await fs.rm(filePath);
        console.log(`🗑️ Removed: ${filePath}`);
    } catch {
        console.error(`❌ Could not remove ${filePath}`);
    }
}

export async function loadToolConfig() {
    try {
        const data = await fs.readFile('./nextcli.config.json', 'utf8');
        return JSON.parse(data);
    } catch {
        return {
            componentPath: 'src/components/{{type}}',
            pagePath: 'src/app/{{route}}',
            actionPath: 'src/actions',
            style: 'css-module',
            packageManager: 'pnpm'
        };
    }
}

export async function saveToolConfig(config) {
    await fs.writeFile('./nextcli.config.json', JSON.stringify(config, null, 2));
    console.log('✅ Saved config to nextcli.config.json');
}

export function runCommand(command, args) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            stdio: 'inherit',
            shell: true,
        });
        
        child.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Command exited with code ${code}`));
            }
        });
        
        child.on('error', (err) => {
            console.error('Failed to start command:', err);
            reject(err);
        });
    });
}

export function recopyTemplates() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const src = path.join(__dirname, 'templates');
    const dest = path.join(process.cwd(), '.nextcli/templates');
    
    console.log(`Copying from: ${src}`);
    try {
        mkdirSync(dest, { recursive: true });
        console.log(`Created destination directory: ${dest}`);
        
        cpSync(src, dest, { recursive: true });
        
        console.log("Templates copied successfully!");
    } catch (error) {
        console.error(`Error copying templates: ${error.message}`);
    }
}

export function addBetterAuth_ClientAndSever() {
    createFromTemplate("auth", "auth.ts");
    createFromTemplate("auth-client", "auth-client.ts");
}

export function move(src, dst) {
    try {
        // Ensure dst is a directory path (ends with a slash)
        if (!dst.endsWith('/')) {
            dst += '/';
        }
        
        // Create destination directory if it doesn't exist
        const dir = dst;
        if (dir !== './') {
            mkdirSync(dir, { recursive: true });
        }
        
        // Get the filename from the source path
        const filename = path.basename(src);
        
        // Construct the final destination path
        const finalDst = path.join(dir, filename);
        
        fsRenameSync(src, finalDst);
        console.log(`✅ Moved: ${src} to ${finalDst}`);
    } catch (err) {
        console.error(err);
    }
} 

export async function writeFile(dst, data) {
    try {
        // If data is an object, stringify it first
        if (typeof data === 'object' && data !== null) {
            data = JSON.stringify(data, null, 2);
        }
        
        // Create parent directories if they don't exist
        const dir = path.dirname(dst);
        if (dir !== '.') {
            await fs.mkdir(dir, { recursive: true });
        }
        
        await fsWriteFile(dst, data);
        console.log(`✅ Created: ${dst}`);
    } catch (err) {
        console.error(err);
    }
}

export function copyFile(src, dst) {
    try {
        copyFileSync(src, dst);
        console.log(`✅ Copied: ${src} to ${dst}`);
    } catch (err) {
        console.error(err);
    }
}

let cachedConfig = null;
let originalConfigPath = null;

export function cacheConfigFile() {
    if (!cachedConfig) {
        try {
            originalConfigPath = process.cwd();
            cachedConfig = readFileSync("./nextcli.config.json").toString();
        } catch (e) {
            // File may not exist, return default config
            cachedConfig = JSON.stringify({
                componentPath: "src/components/{{type}}",
                pagePath: "src/app/{{route}}",
                actionPath: "src/actions",
                style: "css-module",
                packageManager: "pnpm"
            }, null, 2);
        }
    }
    return cachedConfig;
}

export function restoreConfigFile() {
    if (cachedConfig && originalConfigPath) {
        try {
            process.chdir(originalConfigPath);
            fs.writeFileSync("./nextcli.config.json", cachedConfig);
            console.log("✅ Restored original nextcli.config.json");
        } catch (e) {
            console.error("❌ Error restoring original config:", e);
        }
    }
}

export function exists(file) {
    return existsSync(file)
}