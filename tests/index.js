const fs = require('fs');
const path = require('path');
const glob = require("glob");

const sourcesDirectory = path.resolve(__dirname, '../node_modules/antd/lib');
const targetsDirectory = path.resolve(__dirname, '../tmp');

function buildTargetPath(sourcePath) {
    const relativePath = path.relative(sourcesDirectory, sourcePath);
    return path.resolve(targetsDirectory, relativePath);
}

function resetLog() {
    console.log('\x1b[36m\x1b[0m');
}

function log(message, link, plus) {
    const format = plus ? '\x1b[36m\x1b[32m [+] %s' : '\x1b[36m\x1b[31m [-] %s';
    console.log(format, `${link}: ${message}`);
}

function clearLine(line) {
    let result = line.trim();

    if (result.substr(0, 2) === '//') {
        result = '';
    } else if (result.substr(0, 2) === '/*' && result.substr(-2) === '*/') {
        // TODO: add multilines
        result = '';
    } else if (result === '}') {
        result = '';
    }

    return result;
}

const MAX_COMPARE_FILES = 2;
const SKIP_FILES = 64;

glob(sourcesDirectory + '/**/*.css', {}, (err, sourcesPaths) => {
    try {
        if (err) {
            throw err;
        }
    
        let comparedFiles = 0;
        for (const sourcePath of sourcesPaths) {
            const targetPath = buildTargetPath(sourcePath);
        
            resetLog();
            console.log("\nCompare files:\n %s\n %s", sourcePath, targetPath);

            if (comparedFiles < SKIP_FILES) {
                console.log(" Skipped");
                comparedFiles++;
                continue;
            }
            
            const targetStat = fs.statSync(targetPath);
            if (!targetStat.isFile()) {
                throw new Error(`Target file should be file: ${targetPath}`);
            }
    
            const sourceData = fs.readFileSync(sourcePath, 'utf8');
            const targetData = fs.readFileSync(targetPath, 'utf8');
    
            const sourceLines = sourceData.replace(/"/g, "'").split(/\r?\n/);
            const targetLines = targetData.replace(/"/g, "'").split(/\r?\n/);
            
            let targetIndex = 0;
            for (let sourceIndex = 0; sourceIndex < sourceLines.length; sourceIndex++) {
                const sourceLine = sourceLines[sourceIndex];
                const cleanSourceLine = clearLine(sourceLine);

                if (!cleanSourceLine) {
                    continue;
                }
                
                let foundSourceLine = false;
                let lastTargetIndex = targetIndex;
                for (; targetIndex < targetLines.length; targetIndex++) {
                    const targetLine = targetLines[targetIndex];
                    const cleanTargetLine = clearLine(targetLine);

                    if (!cleanTargetLine) {
                        continue;
                    }
    
                    if (cleanSourceLine === cleanTargetLine) {
                        foundSourceLine = true;
                        targetIndex++;
                        break;
                    }
                }

                if (!foundSourceLine) {
                    targetIndex = lastTargetIndex;
                    log(sourceLine, `${sourcePath}:${sourceIndex + 1}`, true);
                } else {
                    for (let subTargetIndex = lastTargetIndex; subTargetIndex < targetIndex - 1; subTargetIndex++) {
                        const targetLine = targetLines[subTargetIndex];
                        const cleanTargetLine = clearLine(targetLine);
        
                        if (!cleanTargetLine) {
                            continue;
                        }
        
                        log(targetLine, `${targetPath}:${subTargetIndex + 1}`, false);
                    }
                }
            }

            for (; targetIndex < targetLines.length; targetIndex++) {
                const targetLine = targetLines[targetIndex];
                const cleanTargetLine = clearLine(targetLine);

                if (!cleanTargetLine) {
                    continue;
                }

                log(targetLine, `${targetPath}:${targetIndex + 1}`, false);
            }

            comparedFiles++;
            if (comparedFiles >= MAX_COMPARE_FILES + SKIP_FILES) {
                break;
            }
        }
    } finally {
        resetLog();
    }
});
