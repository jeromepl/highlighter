/* eslint-disable */

const readline = require('readline-sync');
const { execSync } = require('child_process');
const { createWriteStream } = require('fs');
const { replaceInFileSync } = require('replace-in-file');
const archiver = require('archiver');

const { version } = require('./package.json');


function exec(command) {
    console.log(`\nRunning \`${command}\``);
    return execSync(command).toString();
}

function bumpVersion(version, releaseType) {
    let [major, minor, patch] = version.split('.');
    switch (releaseType) {
        case "major":
            major = (parseInt(major, 10) + 1).toString();
            minor = "0";
            patch = "0";
            break;
        case "minor":
            minor = (parseInt(minor, 10) + 1).toString();
            patch = "0";
            break;
        case "patch":
            patch = (parseInt(patch, 10) + 1).toString();
            break;
    }
    return [major, minor, patch].join('.');
}


// Ask how to increment version (major, minor or patch)
const releaseType = readline.question("What type of release is this? (major | minor | patch) ").toLowerCase();

if (!["major", "minor", "patch"].includes(releaseType)) {
    console.log(`\nInvalid release type '${releaseType}'`);
    process.exit(1);
}

// Stash and checkout master
const stashOutput = exec("git stash save --include-untracked");
const stashed = !stashOutput.match(/No local changes to save/);
const branch = exec("git rev-parse --abbrev-ref HEAD").trim();
exec("git checkout master");

try {
    // Bump version
    const newVersion = bumpVersion(version, releaseType);
    replaceInFileSync({
        files: ["manifest.json", "package.json"],
        from: `"version": "${version}"`,
        to: `"version": "${newVersion}"`,
    });

    // Commit and tag
    exec("git add -A");
    exec(`git commit -m \"Release version ${newVersion}"`);
    const tag = `v${newVersion}`;
    exec(`git tag -a ${tag} -m "Version ${newVersion}" -f`);
    exec("git push --follow-tags");

    // Package necessary files into a zip file
    const packageFile = `releases/Package-${newVersion.replace(/\./g, '_')}.zip`;
    const output = createWriteStream(packageFile);
    const archive = archiver('zip');

    output.on('close', function () {
        console.log(`\nPackage file zipped and saved at '${packageFile}'`);
    })

    archive.on('warning', (err) => { throw err; });
    archive.on('error', (err) => { throw err; });

    archive.pipe(output);
    archive.directory('src/', 'Package/src');
    archive.directory('lib/', 'Package/lib');
    archive.directory('images/', 'Package/images');
    archive.file('config/secrets.production.js', { name: 'Package/config/secrets.js' }); // NOTE: Replace the test analytics with the production one
    archive.file('manifest.json', { name: 'Package/manifest.json' });
    archive.file('LICENSE', { name: 'Package/LICENSE' });
    archive.finalize();

    // Create a draft release (to give a chance to write a description from the Github interface)
    // NOTE: This requires having `gh` installed locally
    exec(`gh release create ${tag} ${packageFile} --title "Highlighter ${newVersion}" --draft`);
} catch (e) {
    console.log('Error! Reverting changes and returning to original git state');
    exec('git reset --hard');
    throw e;
} finally {
    // Return back to the original state
    exec(`git checkout ${branch}`);
    if (stashed) exec("git stash pop");
}
