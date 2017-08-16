---
layout: post
title:  "Github Pull Request Review"
date:   2015-12-22 14:53
---

Reviews are part of software development process, every task or issues should go through Peer review and Lead review so that we make sure to catch all possible bugs before merging to the upstream repository. Github provides a nice feature called as Pull Requests so that the developer can send a PR when he has done with all the changes required for the task/issue. The pull request that was sent by the developer will be available in Github repository under pull request section.

Once a pull request is opened, GitHub stores all of the changes online for you. In other words, commits in a pull request are available in a repository even before the PR is merged. That means you can fetch an open pull request and recreate it as your own.

As a Review process, it is important to test the code locally so that we avoid unforeseeable mistakes in the PR. Here are the steps followed to fetch the pull request locally for testing and review of PR.

1. Under your repository name, click Pull requests link.

2. In the "Pull Requests" list, click the pull request you'd like to review/test.

3. Find the ID number of the inactive pull request. This is the sequence of digits right after the pull request's title. 

4. Open Terminal

5. Fetch the reference to the pull request based on its ID number, creating a new branch in the process.

	```bash
	git fetch upstream pull/<ID>/head:BRANCHNAME
	```

6. Switch to the new branch that's based on this pull request:

	```bash
	[master] $ git checkout BRANCHNAME
	Switched to a new branch 'BRANCHNAME'
	```

7. After switching to the new branch you can run local tests and review the code to make sure if everything is fine.

8. Make use of Pull request comments to log the failed test cases and any review changes required.


Once all the review changes are done we can merge the pull request to the upstream repository to have bug free codebase.
