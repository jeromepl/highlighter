/* eslint-disable */

const readline = require('readline-sync');
const { execSync } = require('child_process');
const { replaceInFileSync } = require('replace-in-file');

const { version } = require('../package.json');


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

// Stash and checkout main
const stashOutput = exec("git stash save --include-untracked");
const stashed = !stashOutput.match(/No local changes to save/);
const branch = exec("git rev-parse --abbrev-ref HEAD").trim();
exec("git checkout main");

try {
    // Bump version
    const newVersion = bumpVersion(version, releaseType);
    replaceInFileSync({
        files: ["manifest.json", "package.json", "package-lock.json"],
        from: `"version": "${version}"`,
        to: `"version": "${newVersion}"`,
    });

    // Commit and tag
    exec("git add -A");
    exec(`git commit -m \"Release version ${newVersion}"`);
    const tag = `v${newVersion}`;
    exec(`git tag -a ${tag} -m "Version ${newVersion}" -f`);
    exec("git push --follow-tags");

    // Create a draft release (to give a chance to write a description from the Github interface)
    // NOTE: This requires having `gh` installed locally and authenticated with GitHub
    exec(`gh release create ${tag} --title "Highlighter ${newVersion}" --notes "" --draft`);
} catch (e) {
    console.log('Error! Reverting changes and returning to original git state');
    exec('git reset --hard');
    throw e;
} finally {
    // Return back to the original state
    exec(`git checkout ${branch}`);
    if (stashed) exec("git stash pop");
}
