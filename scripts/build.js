/* eslint-disable */

const { execSync } = require('child_process');
const fs = require('fs');
const archiver = require('archiver');

const { version } = require('../package.json');


function exec(command) {
    console.log(`\nRunning \`${command}\``);
    return execSync(command).toString();
}

// Stash and checkout master
const stashOutput = exec("git stash save --include-untracked");
const stashed = !stashOutput.match(/No local changes to save/);
const branch = exec("git rev-parse --abbrev-ref HEAD").trim();
exec("git checkout master");

try {
    // Create the 'releases' directory if it does not already exist:
    const releasesDir = "releases";
    if (!fs.existsSync(releasesDir)){
        fs.mkdirSync(releasesDir);
    }

    // Package necessary files into a zip file
    const packageFile = `${releasesDir}/Package-${version.replace(/\./g, '_')}.zip`;
    const output = fs.createWriteStream(packageFile);
    const archive = archiver('zip');

    output.on('close', function () {
        console.log(`\nPackage file zipped and saved at '${packageFile}'`);
    });

    archive.on('warning', (err) => { throw err; });
    archive.on('error', (err) => { throw err; });

    archive.pipe(output);
    archive.directory('src/', 'Package/src');
    archive.directory('lib/', 'Package/lib');
    archive.directory('images/', 'Package/images');
    archive.file('config/secrets.production.js', { name: 'Package/config/secrets.js' }); // NOTE: Replace the test analytics with the production one
    archive.file('manifest.json', { name: 'Package/manifest.json' });
    archive.file('background.js', { name: 'Package/background.js' });
    archive.file('contentScript.js', { name: 'Package/contentScript.js' });
    archive.file('LICENSE', { name: 'Package/LICENSE' });
    archive.finalize();
} finally {
    // Return back to the original state
    exec(`git checkout ${branch}`);
    if (stashed) exec("git stash pop");
}
