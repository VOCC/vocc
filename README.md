# VOCC: a Game Boy Advance Image Editor/Converter

VOCC is a web-based image editor focused on Game Boy Advance Development.

## Usage

Visit the [website](https://vocc.github.io/vocc) to use the application. You won't need to download anything or install any dependencies, all you need is a web browser.

Please view the [release notes](release_notes.md) for a summary of the most recent changes and known issues.

### Installation for offline use

By default, the VOCC website should be able to be used while offline. In some certain cases, you can "install" a shortcut to the application to your operating system.

If you are using a modern web browser that supports progressive web applications (PWAs), then when you visit the website you should see a button that says "Install" in the title bar. Clicking this button installs the application locally and you can use it offline. Tested on Chrome, Chromium, and Brave. Firefox does not support installing PWAs.

If you're using a different browser that supports service workers, offline use should still work but you won't be able to install the application.

## Setting up the development environment

### Windows

The recommended way to develop on Windows is to use the Windows Subsystem for Linux and then develop as if you were on a Linux machine.

1. [Install WSL](https://docs.microsoft.com/en-us/windows/wsl/install-win10 "WSL installation instructions")
2. Follow the Linux instructions inside WSL

I also recommend that you use [Visual Studio Code](https://code.visualstudio.com/ "VS Code website") as your text editor on Windows, as it provides first-class support for TypeScript and has the super handy [Remote - WSL](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-wsl "Remote WSL extension webpage") extension.

### macOS

Coming soon (mostly the same as Linux though, just install Node without the package manager, or use [Homebrew](https://brew.sh/ "Homebrew website")).

### Linux

First, make sure your Linux installation is fully up to date (on Ubuntu, run `sudo apt update && upgrade`). Then, complete the following steps:

1. [Install Node and NPM using the Ubuntu package manager](https://github.com/nodesource/distributions/blob/master/README.md#debinstall "Node github repository readme")  
   Verify that they are properly installed by checking the versions using `node -v` and `npm -v`. If NPM isn't working, try starting a new terminal window/tab after installing Node.
2. Install Yarn  
   `npm i -g yarn` (you may need to use `sudo`)
3. Clone the source code and move to the directory  
   `git clone https://github.com/lbussell/vocc`  
   `cd vocc`
4. Install dependencies  
   `yarn`
5. Start the application
   `yarn start`

## Contributing

If you notice a bug, please create an issue!

If you're looking to contribute code, please look at the Projects tab to see some of the ongoing development for this project and find an issue to look at.

See https://help.github.com/en/articles/configuring-a-remote-for-a-fork to configure your own fork of this repo.

**To make changes:**

1. Update your fork's `master` branch  
   The following sequence of commands will switch to your `master` branch, fetch the newest changes from this repo's `master` branch, and then uploads it to your fork's `master` branch.

```
git checkout master
git fetch upstream
git pull upstream master
git push origin master
```

2. Always make changes on a development branch, not on the master branch.  
   To make changes, create a new branch and then tell git to use your fork and the development branch whenever you push or pull.  
   Note that git checkout -b bases the new branch on the branch that is currently checked out. You can base your new branch on an existing branch, or the master branch.

```
git checkout -b [branch name]
git push -u origin [branch name]
```

3. Commit your changes  
   Once you have made changes and they work, you can move the modified files to
   the staging area with `git add`, and then commit your changes with git commit. git add path/to/updated/file
   git commit -m "change file"
   Note: `git add .` adds all changed files in the current directory (including all
   children directories).
   Another note: When committing files, use present tense verbs. Ex. “add player class” “implement basic GUI” etc.

4. Publish your changes  
   To push your changes to your fork, use `git push`. From there, you can create a pull request to this repository to get your changes reviewed and potentially merged.

**Authors**: Logan Bussell, Bennett Hillier, Rosie Blair, Jacob Lambert, John Beckner
