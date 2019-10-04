# Game Boy Advance Image Editor/Converter
This is the repository for the Game Boy Advance Image Editor/Converter intended for use in Georgia Tech's CS 2261

### Making changes

See https://help.github.com/en/articles/configuring-a-remote-for-a-fork to configure your own fork of this repo.

**To make changes:**
1. Update your fork's master branch

```
git checkout master
git fetch upstream
git pull upstream master
git push origin master
```

This switches to your master branch, fetches the newest changes from the master branch on this repo, and then uploads it to your fork's master branch.

2. Always make changes on a development branch, not on the master branch.

To make changes, create a new branch and then tell git to use your fork and the development branch whenever you push or pull.

```
git checkout -b [branch name]
git push -u origin [branch name]
```

Note that git checkout -b bases the new branch on the branch that is currently checked out. You can base your new branch on an existing branch, or the master branch.

3. Commit your changes

Once you have made changes and they work, you can move the modified files to
the staging area with `git add`, and then commit your changes with git commit. git add path/to/updated/file
git commit -m "change file"
Note: `git add .` adds all changed files in the current directory (including all
children directories).
Another note: When committing files, use present tense verbs. Ex. “add player class” “implement basic GUI” etc.

4. Publish your changes

To push your changes to your fork, use `git push`. You can have multiple commits per push (use this to be more descriptive with the work you’ve done or the features you’ve added).
To merge your changes into the master project, submit a pull request on `github.gatech.edu` to pull your development branch into your team leader’s master branch. After your pull request is approved, you can update your fork’s master branch again with the instructions outlined at the top of this file and start the process over again.
