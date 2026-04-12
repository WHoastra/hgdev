import { supabase } from './supabase'

export async function seedGitCourse(userId) {
  const courseTitle = 'Git & GitHub Essentials'

  // Check if course already exists and delete it
  console.log('Checking for existing Git course...')
  const { data: existing } = await supabase
    .from('courses')
    .select('id')
    .eq('title', courseTitle)
    .limit(1)

  if (existing && existing.length > 0) {
    const courseId = existing[0].id
    console.log('Found existing course, cleaning up...')

    const { data: mods } = await supabase.from('modules').select('id').eq('course_id', courseId)
    const modIds = (mods || []).map((m) => m.id)

    if (modIds.length > 0) {
      const { data: lessons } = await supabase.from('lessons').select('id').in('module_id', modIds)
      const lessonIds = (lessons || []).map((l) => l.id)
      if (lessonIds.length > 0) {
        await supabase.from('progress').delete().in('lesson_id', lessonIds)
      }

      const { data: cards } = await supabase.from('flashcards').select('id').in('module_id', modIds)
      const cardIds = (cards || []).map((c) => c.id)
      if (cardIds.length > 0) {
        await supabase.from('flashcard_progress').delete().in('flashcard_id', cardIds)
      }

      await supabase.from('flashcard_sessions').delete().in('module_id', modIds)
      await supabase.from('flashcards').delete().in('module_id', modIds)
      await supabase.from('quiz_attempts').delete().in('module_id', modIds)
      await supabase.from('quiz_questions').delete().in('module_id', modIds)
      await supabase.from('lessons').delete().in('module_id', modIds)
      await supabase.from('modules').delete().eq('course_id', courseId)
    }
    await supabase.from('courses').delete().eq('id', courseId)
    console.log('Old Git course removed.')
  }

  // --- UPDATE SORT ORDERS ---
  console.log('Updating course sort orders...')
  await supabase.from('courses').update({ sort_order: 1 }).eq('title', 'Prompt Engineering Fundamentals')
  await supabase.from('courses').update({ sort_order: 2 }).eq('title', 'Safety & Responsible AI')
  await supabase.from('courses').update({ sort_order: 3 }).eq('title', 'Terminal & Command Line Basics')
  // Git & GitHub Essentials will be 4
  await supabase.from('courses').update({ sort_order: 5 }).eq('title', 'Advanced Prompt Techniques')
  await supabase.from('courses').update({ sort_order: 6 }).eq('title', 'Claude API & Tool Use')
  await supabase.from('courses').update({ sort_order: 7 }).eq('title', 'Real-World Claude Applications')
  await supabase.from('courses').update({ sort_order: 8 }).eq('title', 'Building Agentic Applications')

  // --- INSERT COURSE ---
  console.log('Inserting Git course...')
  const courseId = crypto.randomUUID()
  const { error: cErr } = await supabase.from('courses').insert({
    id: courseId,
    title: courseTitle,
    category: 'Development',
    difficulty: 'beginner',
    sort_order: 4,
    description: 'Learn to track your code, collaborate with others, and build your developer identity. Git and GitHub are tools every developer uses every single day — this course makes them second nature.',
  })
  if (cErr) throw cErr

  // --- MODULES, LESSONS, PROGRESS ---
  const modulesData = [
    {
      title: 'What is Version Control?', sort_order: 1,
      lessons: [
        {
          title: 'Why Version Control Exists', sort_order: 1,
          content: "Imagine you're writing a research paper. You make changes, save it, make more changes. Then you realize yesterday's version was better — but you saved over it. Gone. Now imagine that happening with code, where one wrong change can break an entire application. That's the problem version control solves. Version control is a system that records every change you make to your files over time. You can go back to any previous version, see who changed what, and even work on different versions of the same project at the same time. Before version control, developers would make copies of their entire project folder: project-v1, project-v2, project-final, project-FINAL-REAL. It was chaos. Version control replaced that chaos with a clean, reliable history of every change ever made. Every professional software team on the planet uses version control. It's not optional — it's as fundamental as knowing how to type.",
        },
        {
          title: 'Git vs GitHub', sort_order: 2,
          content: "People often confuse Git and GitHub, but they're different things that work together. Git is a version control tool that runs on your computer. It tracks changes to your files locally. You don't need the internet to use Git — it works entirely on your machine. Linus Torvalds (the creator of Linux) built Git in 2005 because he needed a fast, reliable way to manage the Linux source code. GitHub is a website that hosts Git repositories online. Think of Git as the engine and GitHub as the garage where you park your car so others can see it. GitHub adds collaboration features on top of Git: pull requests, issues, project boards, and a social profile for developers. There are alternatives to GitHub — GitLab and Bitbucket are popular ones — but GitHub is by far the most widely used. When someone says 'put it on GitHub,' they mean upload your Git repository to GitHub's servers so others can access it. You'll use Git commands in your terminal and GitHub in your browser. Together, they form the backbone of modern software development.",
        },
        {
          title: 'How Developers Use Git Daily', sort_order: 3,
          content: "Here's what a typical day looks like for a developer using Git. Morning: you pull the latest code from GitHub to make sure you have everyone's recent changes. You create a new branch for the feature you're working on — this gives you a safe space to code without affecting anyone else's work. Throughout the day: as you write code, you make small commits — snapshots of your progress. Each commit has a message explaining what you changed: 'Add login form validation' or 'Fix navigation bar on mobile.' These commits create a timeline of your work. When you're done: you push your branch to GitHub and create a pull request — a formal request for your team to review your code. Teammates leave comments, suggest improvements, and eventually approve it. Once approved, your code gets merged into the main project. This workflow happens millions of times every day at companies large and small. Understanding it isn't just useful — it's required for any developer job. The good news: once you learn it, it becomes automatic. You'll commit and push without even thinking about it.",
        },
        {
          title: 'Key Concepts Overview', sort_order: 4,
          content: "Before we start using Git, let's understand the key vocabulary. A repository (or 'repo') is a project tracked by Git. It's just a folder with a hidden .git directory inside that stores the history. A commit is a snapshot of your project at a specific point in time. Think of it like a save point in a video game. A branch is an independent line of development. The main branch (called 'main') is the official version. You create new branches to work on features without affecting main. A merge is when you combine changes from one branch into another. Merging your feature branch into main adds your new code to the official version. A remote is a version of your repository hosted somewhere else — usually on GitHub. 'Origin' is the default name for your GitHub remote. Pushing sends your local commits to the remote. Pulling downloads remote changes to your local machine. Cloning creates a local copy of a remote repository. These terms will come up constantly. You don't need to memorize them right now — they'll become natural as you use them.",
        },
      ],
    },
    {
      title: 'Git Basics', sort_order: 2,
      lessons: [
        {
          title: 'Installing and Configuring Git', sort_order: 1,
          content: "Let's get Git set up on your machine. On Mac: open Terminal and type git --version. If Git isn't installed, your Mac will prompt you to install the Xcode Command Line Tools, which includes Git. Click install and wait. On Windows: download Git from git-scm.com. Run the installer and accept the defaults. This also installs Git Bash, a terminal that understands Git commands. On Linux: run sudo apt install git (Ubuntu/Debian) or sudo yum install git (CentOS/Fedora). After installing, you need to tell Git who you are. This information gets attached to every commit you make. Run these two commands: git config --global user.name 'Your Name' — and git config --global user.email 'your@email.com'. Use the same email you'll use for GitHub. To verify: git config --list shows your settings. One more useful setting: git config --global init.defaultBranch main — this makes 'main' the default branch name for new repositories, which is the modern standard.",
        },
        {
          title: 'Creating Your First Repository', sort_order: 2,
          content: "A repository is just a folder that Git is tracking. Let's create one. First, make a new folder and move into it: mkdir my-first-repo — then cd my-first-repo. Now initialize Git: git init. That's it. Git is now tracking this folder. You'll see a message like 'Initialized empty Git repository.' If you run ls -la, you'll see a hidden .git folder. That folder is where Git stores the entire history of your project. Don't touch it — Git manages it automatically. Let's add a file: echo '# My First Project' > README.md. Now run git status. You'll see README.md listed as an 'untracked file.' Git sees the file but isn't tracking it yet. That's important — Git doesn't automatically track everything. You choose what to track. This is your first repo. It's empty except for one untracked file. In the next lesson, you'll learn how to start tracking files and making commits.",
        },
        {
          title: 'The Staging Area', sort_order: 3,
          content: "Git has a concept that confuses beginners but is actually brilliant: the staging area. Here's how it works. Your project has three zones. The working directory is your actual files — what you see in your file manager. The staging area (also called the 'index') is a preparation zone where you decide which changes to include in your next commit. The repository is the committed history — saved snapshots. The flow goes: working directory → staging area → repository. Why not just save everything directly? Because sometimes you change 10 files but only want to commit 3 of them. The staging area lets you be intentional about what goes into each commit. To stage a file: git add README.md — this moves your changes to the staging area. To stage everything: git add . — the dot means 'everything in the current directory.' To see what's staged: git status — staged files appear in green, unstaged in red. To unstage a file: git restore --staged filename. Think of the staging area like packing a box. You choose what goes in, check the contents, and when you're satisfied, you seal it (commit). This gives you control over your project's history.",
        },
        {
          title: 'Making Commits', sort_order: 4,
          content: "A commit is a snapshot of your project. It records exactly what your files look like at that moment. Let's make your first one. First, make sure something is staged: git add README.md. Now commit: git commit -m 'Initial commit: add README'. The -m flag lets you add a message describing what this commit does. Every commit must have a message. Your message should be clear and specific. Good messages: 'Add user login form,' 'Fix broken link on homepage,' 'Update pricing to reflect new plans.' Bad messages: 'update,' 'fix stuff,' 'asdfasdf.' Why good messages matter: six months from now, when something breaks, you'll search through your commit history to find where the problem started. Clear messages make that search possible. To see your commit history: git log. Each commit shows: a unique ID (a long hash like a8f3b2c...), the author, the date, and the message. A shorter view: git log --oneline shows just the hash and message. The rhythm of development is: make changes → stage them → commit with a clear message → repeat. Small, frequent commits are better than rare, massive ones. Each commit should represent one logical change.",
        },
        {
          title: 'Viewing Changes and History', sort_order: 5,
          content: "Git gives you powerful tools to see what's changed and what's happened. git status is your most-used command. It shows: which files are modified, which are staged, which are untracked, and which branch you're on. Run it constantly — before adding, before committing, whenever you're unsure. git diff shows exactly what changed in your files — line by line. Red lines were removed, green lines were added. git diff --staged shows changes that are already staged (what will go into your next commit). git log shows the commit history. Useful variations: git log --oneline for a compact view. git log --graph for a visual branch diagram. git log -5 to show only the last 5 commits. git log --author='Your Name' to see only your commits. git show a8f3b2c shows the details of a specific commit (use the hash from git log). git blame filename shows who last modified each line of a file — useful for understanding why code was written a certain way. These commands are your detective tools. When something breaks, this is how you investigate. When you're reviewing your work before pushing, this is how you double-check. Learn to read git status and git diff instinctively.",
        },
        {
          title: 'Undoing Mistakes', sort_order: 6,
          content: "Everyone makes mistakes. Git makes them fixable. Here are the most common 'undo' scenarios. Scenario 1 — you modified a file but want to throw away the changes: git restore filename — this reverts the file to the last committed version. Your changes are gone. Scenario 2 — you staged a file but want to unstage it: git restore --staged filename — this removes it from the staging area but keeps your changes in the working directory. Scenario 3 — you committed but the message was wrong: git commit --amend -m 'New message' — this replaces the last commit's message. Only do this before pushing. Scenario 4 — you committed a file that shouldn't be tracked: add it to .gitignore (we'll cover this later), then git rm --cached filename — this removes it from Git's tracking without deleting the actual file. Scenario 5 — you need to go back to a previous commit to see what changed: git checkout a8f3b2c — this puts you in 'detached HEAD' state where you can look around. Run git checkout main to go back. The golden rule: if you haven't pushed yet, almost anything can be undone. Once you push to GitHub, undoing gets more complicated because others might have your code. This is why committing frequently and pushing when ready is the safest workflow.",
        },
      ],
    },
    {
      title: 'Branching and Merging', sort_order: 3,
      lessons: [
        {
          title: 'Understanding Branches', sort_order: 1,
          content: "Branches are one of Git's most powerful features, and they're simpler than you think. A branch is an independent line of development. Imagine your project is a tree trunk — that's the main branch. When you create a new branch, it's like growing a new limb from the trunk. You can work on that limb without affecting the trunk. When your work is ready, you merge the limb back into the trunk. Why use branches? Without them, every change you make affects the main version of your project immediately. If you break something, it's broken for everyone. With branches: you experiment on your own branch, get everything working, then merge. If your experiment fails, you just delete the branch — main is untouched. The main branch (called 'main') is the official version of your project. It should always be stable and working. New features, bug fixes, and experiments each get their own branch. This is how every professional development team works. You'll create dozens — sometimes hundreds — of branches over the life of a project. To see your current branch: git branch. The one with an asterisk (*) is where you are right now.",
        },
        {
          title: 'Creating and Switching Branches', sort_order: 2,
          content: "Creating and switching branches is fast and easy. To create a new branch: git branch feature-login — this creates a branch called 'feature-login' but doesn't switch to it. To switch to it: git checkout feature-login — or the newer command: git switch feature-login. To create and switch in one step: git checkout -b feature-login — or: git switch -c feature-login. The -b and -c flags mean 'create.' Now you're on the feature-login branch. Any commits you make will only exist on this branch. Main remains untouched. Branch naming conventions: use descriptive names with hyphens. Common patterns: feature/login-form, bugfix/navbar-overflow, hotfix/security-patch. The prefix tells others what kind of work this branch contains. To see all branches: git branch — local branches are listed, the current one has an asterisk. To see remote branches too: git branch -a. To delete a branch you're done with: git branch -d feature-login. Git will warn you if the branch has unmerged changes. To force delete: git branch -D feature-login. A good habit: create a new branch before starting any new work. Even if you think it's a small change, having it on a branch gives you the freedom to abandon it if needed.",
        },
        {
          title: 'Merging Branches', sort_order: 3,
          content: "Merging combines the changes from one branch into another. The most common merge: bringing a feature branch back into main. Here's the process. First, switch to the branch you want to merge INTO: git checkout main — you're now on main. Then merge the other branch: git merge feature-login — Git takes all the commits from feature-login and applies them to main. If the changes don't overlap with anything on main, Git does a 'fast-forward' merge — it simply moves main forward to include the new commits. Clean and simple. If both branches changed different parts of the same files, Git does a 'three-way merge' — it combines both sets of changes automatically. You'll see a merge commit in your history. After merging, your feature branch still exists but is no longer needed. Delete it to keep things tidy: git branch -d feature-login. The typical workflow: main → create branch → make commits on branch → merge back to main → delete branch → repeat. This cycle happens over and over. Each feature gets its own branch, gets merged when ready, and gets cleaned up. It's organized, safe, and professional.",
        },
        {
          title: 'Resolving Merge Conflicts', sort_order: 4,
          content: "Merge conflicts happen when two branches change the same lines of the same file. Git doesn't know which version to keep, so it asks you to decide. Don't panic — conflicts look scary but they're straightforward to fix. When a conflict occurs, Git marks the conflicting sections in the file like this: <<<<<<< HEAD — this shows your current branch's version. ======= — this separates the two versions. >>>>>>> feature-login — this shows the incoming branch's version. To resolve: open the file, decide which version to keep (or combine both), and remove the conflict markers (<<<, ===, >>>). Then stage and commit: git add filename — then git commit -m 'Resolve merge conflict in filename.' Tips for avoiding conflicts: pull from main frequently to stay up to date. Keep branches focused and short-lived. Communicate with your team about who's working on what. Conflicts happen most when two people edit the same function or component. Tips for resolving: read both versions carefully. Sometimes you want one, sometimes the other, sometimes a combination. Use git diff to see the full picture. If you're unsure, talk to the person who wrote the other version. The more you practice, the less intimidating conflicts become. They're just a normal part of collaboration.",
        },
      ],
    },
    {
      title: 'GitHub Fundamentals', sort_order: 4,
      lessons: [
        {
          title: 'Setting Up GitHub', sort_order: 1,
          content: "GitHub is where your code lives online. Let's set it up. Go to github.com and create a free account. Choose a username that's professional — this becomes part of your developer identity. Your GitHub profile is public and employers will look at it. After signing up, you need to connect your local Git to GitHub securely. There are two methods: HTTPS and SSH. HTTPS is simpler to set up. When you push for the first time, GitHub asks for your username and a personal access token (not your password — GitHub disabled password authentication). Create a token at github.com → Settings → Developer Settings → Personal Access Tokens → Generate New Token. Give it repo access. Save this token somewhere safe. SSH is more secure and convenient long-term. Generate an SSH key: ssh-keygen -t ed25519 -C 'your@email.com' — press Enter through the prompts. Copy your public key: cat ~/.ssh/id_ed25519.pub — and add it to GitHub at Settings → SSH and GPG Keys → New SSH Key. With SSH set up, you never need to enter credentials again. Choose either method — both work. SSH is the professional standard. Once connected, you're ready to push your code to the world.",
        },
        {
          title: 'Your First Push to GitHub', sort_order: 2,
          content: "Let's put your local repository on GitHub. First, create a new repository on GitHub: click the '+' icon in the top right, select 'New Repository.' Give it a name (match your local folder name), add a description, and leave it empty — don't add a README since you already have one locally. GitHub will show you setup instructions. Since you already have a local repo, use the 'push an existing repository' commands. In your terminal: git remote add origin https://github.com/yourusername/your-repo.git — this tells Git where the remote repository is. 'Origin' is the standard name for your main remote. Then push: git push -u origin main — the -u flag sets origin/main as the default upstream, so future pushes only need git push. Refresh your GitHub page — your code is now online. Your README.md appears on the repository's main page. Congratulations — you've published code. Every time you make new commits locally, run git push to send them to GitHub. This is the basic cycle: code locally, commit, push to GitHub. Your GitHub repository is always available at github.com/yourusername/reponame. Anyone can see it (for public repos), clone it, or contribute to it.",
        },
        {
          title: 'Cloning and Pulling', sort_order: 3,
          content: "Cloning creates a local copy of a repository from GitHub. This is how you download someone else's project — or get your own project onto a new computer. To clone: find the repository on GitHub, click the green 'Code' button, copy the URL. Then in your terminal: git clone https://github.com/username/repo.git — Git downloads the entire repository including all its history. You now have a fully functional local copy. Git automatically sets up the remote connection (origin points back to GitHub). Pulling is how you download updates after you've already cloned. If someone else pushed changes, or you pushed from another computer: git pull — this downloads and merges the latest changes from GitHub into your local copy. git pull is actually two commands in one: git fetch (download changes) and git merge (apply them). A common workflow when collaborating: before starting work, always git pull to make sure you have the latest code. Then make your changes, commit, and push. If someone pushed while you were working, you might need to pull again before you can push. Git will tell you. The mantra: pull before you work, push when you're done.",
        },
        {
          title: 'The README File', sort_order: 4,
          content: "The README.md file is the front page of your project. When someone visits your repository on GitHub, the README is the first thing they see. A good README makes people want to use or contribute to your project. A bad README (or no README) makes people leave. What to include: Project name and a one-line description of what it does. Why it exists — what problem does it solve? How to install and set it up — step by step, assume nothing. How to use it — basic examples or commands. Screenshots or demos if it's visual. Technologies used — what's under the hood. How to contribute — if you want help from others. License — how others can use your code. The file uses Markdown formatting (.md extension). Markdown lets you add headings (#), bold (**text**), code blocks (```), links, images, and lists. It's simple to learn and you'll use it everywhere in development — GitHub, documentation, this very platform. A strong README is a sign of a professional developer. It shows you can communicate, not just code. Every project you push to GitHub should have a README. Even personal projects — you'll thank yourself when you come back to them six months later and forgot what the code does.",
        },
      ],
    },
    {
      title: 'Collaboration on GitHub', sort_order: 5,
      lessons: [
        {
          title: 'Forking Repositories', sort_order: 1,
          content: "Forking is how you create your own copy of someone else's repository on GitHub. Unlike cloning (which downloads to your computer), forking copies the entire repository to YOUR GitHub account. You now have your own version to modify freely. Why fork? You can't push changes directly to repositories you don't own. Forking gives you your own copy where you have full control. To fork: go to any repository on GitHub, click the 'Fork' button in the top right. GitHub creates a copy under your account. Then clone YOUR fork to your local machine: git clone https://github.com/YOUR-username/repo.git. Now you can make changes, commit, and push to YOUR fork. The original repository is untouched. The typical open-source workflow: Fork the project → Clone your fork → Create a branch → Make changes → Push to your fork → Create a pull request to the original repo. This is how thousands of people contribute to projects they don't own. It's the foundation of open-source collaboration. You'll also want to keep your fork updated with the original. Add the original as an upstream remote: git remote add upstream https://github.com/ORIGINAL-owner/repo.git — then periodically: git pull upstream main to get their latest changes.",
        },
        {
          title: 'Pull Requests', sort_order: 2,
          content: "A pull request (PR) is a formal proposal to merge your changes into a project. It's how code gets reviewed and approved before becoming part of the official codebase. To create a pull request: push your branch to GitHub, then go to the repository on GitHub. You'll see a prompt to create a pull request, or go to the Pull Requests tab and click 'New Pull Request.' Select your branch and the branch you want to merge into (usually main). Write a clear title and description: what did you change, why, and how should reviewers test it. A good PR description saves reviewers time and gets your code merged faster. After creating: your team reviews the code. They can leave comments on specific lines, ask questions, suggest changes, or approve it. You can push additional commits to the same branch to address feedback — the PR updates automatically. When approved: someone (you or a maintainer) clicks 'Merge Pull Request.' Your code is now part of the project. The branch can be deleted. Pull requests are more than just a merge mechanism — they're a conversation about code quality. They teach you to write better code because someone is always watching. They're also how you learn — reviewing other people's PRs teaches you different approaches and patterns.",
        },
        {
          title: 'Code Reviews', sort_order: 3,
          content: "Code review is the practice of having other developers read and evaluate your code before it's merged. It happens through pull requests on GitHub. Why code reviews matter: they catch bugs before they reach users. They share knowledge across the team — everyone learns from seeing each other's code. They maintain consistency — the codebase stays clean and follows agreed-upon standards. They make you a better developer — getting feedback is the fastest way to improve. How to give a good code review: be respectful and constructive. Focus on the code, not the person. Explain WHY something should change, not just that it should. Suggest alternatives instead of just criticizing. Acknowledge what's done well — positive feedback matters. How to receive a code review: don't take feedback personally. The reviewer is trying to help the project, not attack you. Ask questions if you don't understand a suggestion. If you disagree, explain your reasoning — it's a discussion, not a decree. Common things reviewers look for: bugs and edge cases, security issues, performance concerns, readability and naming, test coverage, and whether the code follows the team's style guide. Code reviews feel uncomfortable at first. That's normal. They quickly become one of the most valuable parts of your development process.",
        },
        {
          title: 'Issues and Project Management', sort_order: 4,
          content: "GitHub Issues are how teams track bugs, features, and tasks. Think of them as a shared to-do list for your project. To create an issue: go to the Issues tab in your repository, click 'New Issue.' Give it a clear title: 'Login button doesn't work on mobile' is better than 'bug.' Add a description with: what's happening, what should happen, steps to reproduce (for bugs), and screenshots if helpful. Issues can be tagged with labels: 'bug,' 'feature,' 'enhancement,' 'good first issue' (great for newcomers to open source). They can be assigned to specific people and organized into milestones (groups of issues that make up a release). GitHub Projects takes this further with kanban boards — columns like 'To Do,' 'In Progress,' and 'Done' where you drag issues between columns as work progresses. This is how real teams manage their work. When you make a commit that fixes an issue, include the issue number in your commit message: 'Fix mobile login button #42' — GitHub automatically links the commit to the issue. Using 'Closes #42' or 'Fixes #42' in a pull request description automatically closes the issue when the PR is merged. This connects your code changes to the problems they solve, creating a clear paper trail of your project's evolution.",
        },
      ],
    },
    {
      title: 'Your Developer Identity', sort_order: 6,
      lessons: [
        {
          title: 'GitHub as Your Portfolio', sort_order: 1,
          content: "Your GitHub profile is your developer resume. Employers look at it. Collaborators evaluate it. It tells the world: here's what I can build. Your profile page shows: your bio, location, pinned repositories, contribution graph (the green squares), and activity. Make it count. Write a bio that says who you are and what you build: 'Building AI-powered tools in Southern Louisiana' is better than leaving it blank. Pin your 3-6 best repositories — the ones you're most proud of. These appear at the top of your profile. Make sure each one has a good README with a description, tech stack, and screenshots or a demo link. Create a special profile README: make a repository named exactly your username (e.g., github.com/yourname/yourname). Add a README.md to it and GitHub displays it on your profile page. Use this to introduce yourself, list your skills, link to your portfolio, or share what you're currently learning. The green contribution graph shows how consistently you code. Regular activity — even small commits — shows you're actively building. It's not about going green every single day, but consistent activity over months tells a story of dedication. Your GitHub profile is often the first technical impression you make. Invest time in making it reflect who you are as a developer.",
        },
        {
          title: 'Writing Good Commit Messages', sort_order: 2,
          content: "Commit messages are your project's diary. They explain what changed and why. Good messages make your project maintainable; bad messages make it a mystery. The format: a short summary line (50 characters or less), then optionally a blank line followed by a more detailed explanation. The summary should complete the sentence: 'This commit will...' — 'Add user authentication,' 'Fix typo in homepage header,' 'Refactor database connection logic.' Rules for great messages: use the imperative mood ('Add feature' not 'Added feature'). Be specific ('Fix login redirect on Safari' not 'Fix bug'). Keep the first line short — it appears in git log --oneline and GitHub's commit list. Don't describe WHAT changed (the code diff shows that) — describe WHY. If the commit closes an issue, reference it: 'Fix mobile nav overflow. Closes #23.' Bad messages to avoid: 'update' (update what?), 'fix' (fix what?), 'WIP' (don't commit work-in-progress to main), 'misc changes' (there's no such thing as miscellaneous in a codebase). Think of future you. Six months from now, you're searching for when the payment system broke. Would you rather scroll through 'Fix payment validation for zero-dollar orders' or 'fix stuff'? Write messages for the person debugging at 2am — because that person might be you.",
        },
        {
          title: 'Organizing Your Repositories', sort_order: 3,
          content: "A well-organized GitHub profile tells employers you think clearly and care about quality. Here's how to keep yours sharp. Repository naming: use lowercase with hyphens. 'personal-portfolio,' 'weather-app,' 'claude-chatbot' — not 'MyApp2' or 'test123.' The name should tell someone what the project is without clicking into it. Every repository should have: a README.md (always), a .gitignore file (tells Git which files to ignore — like node_modules, .env files, build output), and a license file if it's open source (MIT is the most common). Use GitHub's repository topics: add tags like 'react,' 'python,' 'ai,' 'portfolio.' These help people discover your projects through search. Pin your best work: you can pin up to 6 repositories on your profile. Choose projects that show range — maybe a web app, a CLI tool, and an AI project. Quality over quantity. Archive old projects: if a repository is outdated or you're no longer maintaining it, archive it instead of deleting it. It stays visible but shows it's no longer active. Don't be afraid to delete truly bad repositories — having 5 polished projects looks better than 50 messy ones. Your GitHub is a curated gallery of your work, not a dumping ground.",
        },
        {
          title: 'Contributing to Open Source', sort_order: 4,
          content: "Open source is software that anyone can view, use, and contribute to. Contributing to open source is one of the fastest ways to grow as a developer and build your reputation. Start by finding projects that interest you. GitHub's Explore page, trending repositories, and the 'good first issue' label are great starting points. Look for projects with: clear contribution guidelines (usually CONTRIBUTING.md), active maintainers who respond to issues and PRs, welcoming community (check how maintainers respond to newcomers), and issues labeled 'good first issue' or 'help wanted.' Your first contribution doesn't have to be code. Documentation improvements, typo fixes, bug reports, and translations are all valuable contributions that maintainers appreciate. The contribution process: fork the repo → clone your fork → create a branch → make your changes → push to your fork → open a pull request → respond to feedback. Read the project's contribution guidelines first — every project has its own standards. Open source contributions show employers that you can work with other developers, follow coding standards, and navigate existing codebases. They also connect you to a global community of developers who share your interests. Some of the best developers in the world maintain open source projects. Contributing is how you learn from them directly.",
        },
      ],
    },
  ]

  console.log('Inserting modules and lessons...')
  const moduleRows = []
  const lessonRows = []
  const moduleIdMap = {}

  for (const mod of modulesData) {
    const moduleId = crypto.randomUUID()
    moduleIdMap[mod.title] = moduleId
    moduleRows.push({ id: moduleId, course_id: courseId, title: mod.title, sort_order: mod.sort_order })
    for (const lesson of mod.lessons) {
      const lessonId = crypto.randomUUID()
      lessonRows.push({ id: lessonId, module_id: moduleId, title: lesson.title, content: lesson.content, sort_order: lesson.sort_order })
    }
  }

  const { error: mErr } = await supabase.from('modules').insert(moduleRows)
  if (mErr) throw mErr
  const { error: lErr } = await supabase.from('lessons').insert(lessonRows)
  if (lErr) throw lErr

  // --- PROGRESS RECORDS ---
  if (userId) {
    console.log('Creating progress records...')
    const progressRows = lessonRows.map((l) => ({
      id: crypto.randomUUID(),
      lesson_id: l.id,
      user_id: userId,
      status: 'not_started',
    }))
    const { error: pErr } = await supabase.from('progress').insert(progressRows)
    if (pErr) throw pErr
  }

  // --- QUIZ QUESTIONS ---
  console.log('Inserting quiz questions...')
  const quizzes = {
    'What is Version Control?': [
      { question: 'What problem does version control solve?', options: ['Slow internet', 'Losing track of file changes over time', 'Computer viruses', 'Running out of storage'], correct_index: 1, explanation: 'Version control records every change to your files so you can go back to any previous version.' },
      { question: 'Who created Git?', options: ['Bill Gates', 'Linus Torvalds', 'Steve Jobs', 'Mark Zuckerberg'], correct_index: 1, explanation: 'Linus Torvalds, the creator of Linux, built Git in 2005.' },
      { question: 'What is the difference between Git and GitHub?', options: ['They are the same thing', 'Git is local, GitHub is online hosting', 'GitHub is local, Git is online', 'Git is for Mac, GitHub is for Windows'], correct_index: 1, explanation: 'Git runs on your computer locally. GitHub hosts Git repositories online for collaboration.' },
      { question: 'What is a commit?', options: ['A promise to finish code', 'A snapshot of your project at a point in time', 'A message to your team', 'A type of branch'], correct_index: 1, explanation: 'A commit is a saved snapshot of your project — like a save point in a video game.' },
      { question: 'What does "pushing" mean in Git?', options: ['Deleting files', 'Sending local commits to a remote repository', 'Creating a new branch', 'Merging two branches'], correct_index: 1, explanation: 'Pushing sends your local commits to the remote (usually GitHub) so others can access them.' },
    ],
    'Git Basics': [
      { question: 'What command initializes a new Git repository?', options: ['git start', 'git new', 'git init', 'git create'], correct_index: 2, explanation: 'git init creates a new Git repository in the current directory.' },
      { question: 'What does the staging area do?', options: ['Runs your code', 'Lets you choose which changes to include in your next commit', 'Deletes unwanted files', 'Connects to GitHub'], correct_index: 1, explanation: 'The staging area is where you prepare changes before committing them.' },
      { question: 'Which command shows the status of your working directory?', options: ['git check', 'git info', 'git status', 'git show'], correct_index: 2, explanation: 'git status shows modified, staged, and untracked files.' },
      { question: 'What does git diff show?', options: ['A list of branches', 'Line-by-line changes in your files', 'Your commit history', 'Remote repository URLs'], correct_index: 1, explanation: 'git diff shows exactly what lines were added or removed in your files.' },
      { question: 'How do you undo changes to a file before committing?', options: ['git undo', 'git restore filename', 'git reset filename', 'git revert filename'], correct_index: 1, explanation: 'git restore filename reverts the file to the last committed version.' },
    ],
    'Branching and Merging': [
      { question: 'What is a branch in Git?', options: ['A copy of the repository', 'An independent line of development', 'A type of commit', 'A remote server'], correct_index: 1, explanation: 'A branch is an independent line of development that lets you work without affecting main.' },
      { question: 'How do you create and switch to a new branch in one command?', options: ['git branch new-branch', 'git checkout -b new-branch', 'git merge new-branch', 'git switch new-branch'], correct_index: 1, explanation: 'git checkout -b creates a new branch and switches to it immediately.' },
      { question: 'What happens during a merge conflict?', options: ['Git crashes', 'Two branches changed the same lines and Git needs you to decide', 'Your files are deleted', 'The merge is automatically cancelled'], correct_index: 1, explanation: 'Conflicts occur when two branches modify the same lines. You resolve them manually.' },
      { question: 'Which branch should always be stable and working?', options: ['feature', 'develop', 'main', 'hotfix'], correct_index: 2, explanation: 'The main branch is the official version and should always be in a working state.' },
      { question: 'How do you delete a branch after merging?', options: ['git remove branch-name', 'git branch -d branch-name', 'git delete branch-name', 'git cut branch-name'], correct_index: 1, explanation: 'git branch -d deletes a branch. Git warns you if it has unmerged changes.' },
    ],
    'GitHub Fundamentals': [
      { question: 'What is the most secure way to connect to GitHub?', options: ['Password', 'SSH keys', 'Email verification', 'Phone number'], correct_index: 1, explanation: 'SSH keys provide secure, passwordless authentication to GitHub.' },
      { question: 'What does git push -u origin main do?', options: ['Deletes the main branch', 'Pushes to main and sets it as the default upstream', 'Creates a new repository', 'Pulls from GitHub'], correct_index: 1, explanation: 'The -u flag sets origin/main as the default upstream so future pushes only need git push.' },
      { question: 'What is the difference between cloning and pulling?', options: ['They are the same', 'Cloning downloads the full repo, pulling updates an existing one', 'Pulling downloads the full repo, cloning updates it', 'Cloning is for GitHub, pulling is for GitLab'], correct_index: 1, explanation: 'Cloning creates a new local copy. Pulling updates an existing local copy with remote changes.' },
      { question: 'What file format does GitHub use to display project documentation?', options: ['.txt', '.doc', '.md (Markdown)', '.html'], correct_index: 2, explanation: 'GitHub renders Markdown (.md) files with formatting like headings, bold, code blocks, and links.' },
      { question: 'What should a good README include?', options: ['Only the project name', 'Description, install instructions, usage, and tech stack', 'Your personal phone number', 'A list of all files'], correct_index: 1, explanation: 'A good README explains what the project does, how to set it up, and how to use it.' },
    ],
    'Collaboration on GitHub': [
      { question: 'What does forking a repository do?', options: ['Deletes it', 'Creates your own copy on your GitHub account', 'Merges two repos together', 'Downloads it to your computer'], correct_index: 1, explanation: 'Forking creates a copy of someone else\'s repository under your own GitHub account.' },
      { question: 'What is a pull request?', options: ['A request to download code', 'A formal proposal to merge your changes into a project', 'A way to delete a branch', 'A type of issue'], correct_index: 1, explanation: 'A pull request proposes merging your branch into the project and enables code review.' },
      { question: 'Why are code reviews important?', options: ['They slow down development', 'They catch bugs, share knowledge, and maintain code quality', 'They are only for beginners', 'They replace testing'], correct_index: 1, explanation: 'Code reviews catch bugs early, spread knowledge across the team, and maintain standards.' },
      { question: 'What does "Closes #42" in a PR description do?', options: ['Deletes issue 42', 'Automatically closes issue 42 when the PR is merged', 'Assigns issue 42 to you', 'Comments on issue 42'], correct_index: 1, explanation: 'Using "Closes #42" in a PR description automatically closes the linked issue when merged.' },
      { question: 'What is a "good first issue" label for?', options: ['Issues that are bugs', 'Issues suitable for newcomers to contribute to', 'Issues that need urgent fixing', 'Issues with no description'], correct_index: 1, explanation: 'The "good first issue" label marks issues that are approachable for first-time contributors.' },
    ],
    'Your Developer Identity': [
      { question: 'How many repositories can you pin on your GitHub profile?', options: ['3', '6', '10', 'Unlimited'], correct_index: 1, explanation: 'You can pin up to 6 repositories on your GitHub profile to showcase your best work.' },
      { question: 'What is the imperative mood for commit messages?', options: ['"Added feature"', '"Adding feature"', '"Add feature"', '"Feature added"'], correct_index: 2, explanation: 'The imperative mood completes "This commit will..." — "Add feature" is correct.' },
      { question: 'What file tells Git which files to ignore?', options: ['.gitconfig', '.gitignore', '.gitkeep', '.gitmodules'], correct_index: 1, explanation: '.gitignore lists files and patterns that Git should not track (like node_modules, .env).' },
      { question: 'What is the first step to contributing to an open source project?', options: ['Push directly to their main branch', 'Fork the repository', 'Delete their code', 'Create an issue demanding changes'], correct_index: 1, explanation: 'Fork the repository first to create your own copy, then make changes and open a pull request.' },
      { question: 'Why should you create a profile README on GitHub?', options: ['It is required by GitHub', 'It introduces you and your skills on your profile page', 'It hides your repositories', 'It gives you more storage'], correct_index: 1, explanation: 'A profile README (repo named your username) displays on your profile page to introduce yourself.' },
    ],
  }

  const quizRows = []
  for (const [modTitle, questions] of Object.entries(quizzes)) {
    const modId = moduleIdMap[modTitle]
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      quizRows.push({ id: crypto.randomUUID(), module_id: modId, question: q.question, options: q.options, correct_index: q.correct_index, explanation: q.explanation, sort_order: i + 1 })
    }
  }
  const { error: qErr } = await supabase.from('quiz_questions').insert(quizRows)
  if (qErr) throw qErr

  // --- FLASHCARDS ---
  console.log('Inserting flashcards...')
  const flashcardData = {
    'What is Version Control?': [
      { d: 1, q: 'What is version control?', a: 'A system that records every change to your files over time, letting you go back to any previous version.' },
      { d: 1, q: 'What is a repository?', a: "A project tracked by Git — a folder with a hidden .git directory that stores the history." },
      { d: 1, q: 'What is a commit?', a: 'A snapshot of your project at a specific point in time, like a save point in a video game.' },
      { d: 1, q: 'What is a branch?', a: "An independent line of development. The main branch is the official version; you create branches to work on features." },
      { d: 2, q: 'What is the difference between Git and GitHub?', a: 'Git is a local version control tool. GitHub is a website that hosts Git repositories online with collaboration features.' },
      { d: 2, q: 'What is a remote in Git?', a: "A version of your repository hosted elsewhere (usually GitHub). 'Origin' is the default name." },
      { d: 2, q: 'What is the difference between pushing and pulling?', a: 'Pushing sends local commits to the remote. Pulling downloads remote changes to your local machine.' },
      { d: 2, q: 'What is cloning?', a: 'Creating a local copy of a remote repository, including its full history.' },
      { d: 3, q: 'What is a merge?', a: 'Combining changes from one branch into another. Merging feature into main adds your new code to the official version.' },
      { d: 3, q: 'Why did Linus Torvalds create Git?', a: 'He needed a fast, reliable way to manage the Linux source code. Git was built in 2005 for distributed development.' },
    ],
    'Git Basics': [
      { d: 1, q: 'How do you initialize a Git repository?', a: "git init — creates a new Git repository in the current folder." },
      { d: 1, q: 'How do you stage a file?', a: "git add filename — moves changes to the staging area. git add . stages everything." },
      { d: 1, q: 'How do you make a commit?', a: "git commit -m 'Your message' — saves a snapshot with a descriptive message." },
      { d: 1, q: 'How do you check the status of your repo?', a: "git status — shows modified, staged, and untracked files." },
      { d: 2, q: 'What are the three zones in Git?', a: 'Working directory (your files), staging area (preparation zone), and repository (committed history).' },
      { d: 2, q: 'How do you view your commit history?', a: "git log — shows all commits. git log --oneline for compact view." },
      { d: 2, q: 'How do you see line-by-line changes?', a: "git diff shows unstaged changes. git diff --staged shows staged changes." },
      { d: 2, q: 'How do you unstage a file?', a: "git restore --staged filename — removes from staging but keeps your changes." },
      { d: 3, q: 'How do you undo a commit message?', a: "git commit --amend -m 'New message' — only before pushing." },
      { d: 3, q: 'How do you stop tracking a file without deleting it?', a: "Add to .gitignore, then git rm --cached filename." },
      { d: 3, q: 'What does git blame do?', a: 'Shows who last modified each line of a file — useful for understanding code history.' },
    ],
    'Branching and Merging': [
      { d: 1, q: 'How do you create a new branch?', a: "git branch branch-name — creates it. git checkout -b branch-name creates and switches." },
      { d: 1, q: 'How do you switch branches?', a: "git checkout branch-name or git switch branch-name." },
      { d: 1, q: 'How do you merge a branch into main?', a: "Switch to main (git checkout main), then git merge branch-name." },
      { d: 2, q: 'What is a fast-forward merge?', a: "When changes don't overlap, Git simply moves main forward to include the new commits." },
      { d: 2, q: 'How do you delete a branch?', a: "git branch -d branch-name. Use -D to force delete unmerged branches." },
      { d: 2, q: 'What are good branch naming conventions?', a: "Use prefixes: feature/login-form, bugfix/navbar-overflow, hotfix/security-patch." },
      { d: 3, q: 'What do merge conflict markers look like?', a: "<<<<<<< HEAD (your version), ======= (separator), >>>>>>> branch-name (incoming version)." },
      { d: 3, q: 'How do you resolve a merge conflict?', a: "Edit the file to choose the right version, remove conflict markers, then git add and git commit." },
      { d: 3, q: 'How do you avoid merge conflicts?', a: "Pull from main frequently, keep branches short-lived, and communicate with your team." },
    ],
    'GitHub Fundamentals': [
      { d: 1, q: 'How do you push code to GitHub for the first time?', a: "git remote add origin URL, then git push -u origin main." },
      { d: 1, q: 'How do you clone a repository?', a: "git clone URL — downloads the full repo including history." },
      { d: 1, q: 'How do you get the latest changes from GitHub?', a: "git pull — downloads and merges remote changes into your local copy." },
      { d: 2, q: 'What is the difference between HTTPS and SSH for GitHub?', a: "HTTPS uses tokens for auth. SSH uses key pairs — more secure, no credentials needed after setup." },
      { d: 2, q: 'How do you generate an SSH key?', a: "ssh-keygen -t ed25519 -C 'email@example.com', then add the public key to GitHub." },
      { d: 2, q: 'What does the -u flag do in git push?', a: "Sets the upstream so future pushes only need 'git push' without specifying remote and branch." },
      { d: 3, q: 'What should a README include?', a: 'Project name, description, install steps, usage examples, tech stack, contribution guide, and license.' },
      { d: 3, q: 'What is Markdown?', a: 'A lightweight formatting language (.md) for headings, bold, code blocks, links, and lists.' },
    ],
    'Collaboration on GitHub': [
      { d: 1, q: 'What is a fork?', a: "A copy of someone else's repository on YOUR GitHub account that you can modify freely." },
      { d: 1, q: 'What is a pull request?', a: 'A formal proposal to merge your changes into a project, enabling code review before merging.' },
      { d: 2, q: 'What is the open source contribution workflow?', a: 'Fork → Clone → Branch → Make changes → Push to fork → Open pull request → Address feedback.' },
      { d: 2, q: 'How do you keep a fork updated?', a: "git remote add upstream ORIGINAL-URL, then git pull upstream main." },
      { d: 2, q: 'What are GitHub Issues?', a: "A tracking system for bugs, features, and tasks — a shared to-do list for your project." },
      { d: 3, q: 'How does "Closes #42" work?', a: "Including it in a PR description automatically closes issue #42 when the PR is merged." },
      { d: 3, q: 'What makes a good code review?', a: 'Be respectful, explain WHY changes are needed, suggest alternatives, and acknowledge good work.' },
    ],
    'Your Developer Identity': [
      { d: 1, q: 'What is a GitHub profile README?', a: "A repo named your username with a README.md that displays on your profile page." },
      { d: 1, q: 'How many repos can you pin on your profile?', a: "Up to 6 — choose your best work that shows range." },
      { d: 2, q: 'What is the imperative mood for commits?', a: "'Add feature' not 'Added feature' — the message completes 'This commit will...'" },
      { d: 2, q: 'What is a .gitignore file?', a: 'A file listing patterns Git should not track — like node_modules, .env, and build output.' },
      { d: 2, q: 'What does the green contribution graph show?', a: 'How consistently you code over time. Regular activity shows dedication to employers.' },
      { d: 3, q: 'What is the "good first issue" label?', a: 'Labels issues that are approachable for newcomers — the best way to start contributing to open source.' },
      { d: 3, q: 'Why does repository organization matter?', a: 'Clean repos with READMEs, .gitignore, and good names show employers you think clearly and care about quality.' },
    ],
  }

  const cardRows = []
  for (const [modTitle, cards] of Object.entries(flashcardData)) {
    const modId = moduleIdMap[modTitle]
    for (let i = 0; i < cards.length; i++) {
      const c = cards[i]
      cardRows.push({ id: crypto.randomUUID(), module_id: modId, question: c.q, answer: c.a, difficulty: c.d, sort_order: i + 1 })
    }
  }

  const { error: fcErr } = await supabase.from('flashcards').insert(cardRows)
  if (fcErr) throw fcErr

  const summary = {
    course: 1,
    modules: moduleRows.length,
    lessons: lessonRows.length,
    progressRecords: lessonRows.length,
    quizQuestions: quizRows.length,
    flashcards: cardRows.length,
  }
  console.log('Git & GitHub course seeding complete!', summary)
  return summary
}
