import fs, { copyFile, mkdir } from 'fs/promises';
import path from 'path';
import { exec, spawn } from "child_process"
import { cpSync, mkdirSync } from 'fs';
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