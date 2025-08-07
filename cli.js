#!/usr/bin/env node
import inquirer from 'inquirer';
import {
    createFromTemplate, removeFile,
    loadToolConfig, saveToolConfig,
    runCommand, recopyTemplates,
    move, cacheConfigFile, restoreConfigFile,
    writeFile, copyFile,
    exists
} from './utils.js';

var currentDir = ".";

const main = async () => {
    const config = await loadToolConfig();
    
    const { action } = await inquirer.prompt([{
        type: 'list',
        name: 'action',
        message: 'What do you want to do?',
        choices: [
            'Init Nextjs',
            'Run Nextjs',
            'Add Page',
            'Add Component',
            'Add Better-Auth',
            'Add Server Action',
            'Edit Config',
            'Make Templates Local',
            'Exit'
        ]
    }]);
    
    if (action === 'Init Nextjs') {
        const { path } = await inquirer.prompt([
            {
                type: "input",
                name: "path",
                message: "Where?",
                default: "."
            }
        ]);
        


        let content = "";
        if(path == "." || path == "./.") {
            if(exists("./nextcli.config.json")) {
                content = cacheConfigFile();
                console.log(content);
                removeFile("./nextcli.config.json")
            }
        }

        const { packageManager } = await loadToolConfig();
        
        if(process.stdin.isTTY) {
            process.stdin.setRawMode(false);
        }
        try {
            await runCommand(packageManager, ['create', 'next-app@latest', path]);
        } catch (error) {
            console.error('An error occurred:', error);
        }

        console.log("Current Dir:\t", currentDir);
        let toWrite = (content != "") ? content : await loadToolConfig();
        await writeFile(currentDir + "/nextcli.config.json", toWrite);
        
        if(path != ".") {
            move("nextcli.config.json", path);
            // Change to the newly created directory
            process.chdir(path);
            console.log(`✅ Changed directory to: ${path}`);
        }

    } else if (action === 'Run Nextjs') {
        const { packageManager } = await loadToolConfig();
        await runCommand(packageManager, ['run', 'dev']);
        
    } else if (action === 'Add Component') {
        const { name, type } = await inquirer.prompt([
            { type: 'input', name: 'name', message: 'Component name:' },
            {
                type: 'list',
                name: 'type',
                message: 'Component type:',
                choices: ['client', 'server']
            }
        ]);
        
        const dir = config.componentPath.replace('{{type}}', type);
        const outPath = `${dir}/${name}.tsx`;
        
        if(type == "server") {
            await createFromTemplate('server_component', outPath, { name });
        } else {
            await createFromTemplate('client_component', outPath, { name });
        }

    } else if (action === 'Add Page') {
        const { route } = await inquirer.prompt([
            { type: 'input', name: 'route', message: 'Route path (e.g. /about):' }
        ]);
        const routeName = route.replace(/^\//, '') || 'index';
        const dir = config.pagePath.replace('{{route}}', routeName);
        const outPath = `${dir}/page.tsx`;
        await createFromTemplate('page', outPath, { route });
    
    } else if (action === "Add Better-Auth") {
        addBetterAuth_ClientAndSever()

    } else if (action === 'Add Server Action') {
        const { name } = await inquirer.prompt([
            { type: 'input', name: 'name', message: 'Action name:' }
        ]);
        const outPath = `${config.actionPath}/${name}.ts`;
        await createFromTemplate('action', outPath, { name });

    } else if (action === 'Make Templates Local') {
        recopyTemplates();
        
    } else if (action === 'Edit Config') {
        const answers = await inquirer.prompt([
            { type: 'input', name: 'componentPath', message: 'Component path:', default: config.componentPath },
            { type: 'input', name: 'pagePath', message: 'Page path:', default: config.pagePath },
            { type: 'input', name: 'actionPath', message: 'Server Action path:', default: config.actionPath },
            { type: 'list', name: 'style', message: 'Style system:', choices: ['css-module', 'tailwind', 'none'], default: config.style },
            { type: 'list', name: 'packageManager', message: 'Package manager:', choices: ['npm', 'yarn', 'pnpm', 'bun', 'deno'], default: config.packageManager }
        ]);
        await saveToolConfig(answers);
    }
    
    process.exit(0);
};

main();
