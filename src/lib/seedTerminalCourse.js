import { supabase } from './supabase'

export async function seedTerminalCourse() {
  const courseTitle = 'Terminal & Command Line Basics'

  // Check if course already exists and delete it
  console.log('Checking for existing Terminal course...')
  const { data: existing } = await supabase
    .from('courses')
    .select('id')
    .eq('title', courseTitle)
    .limit(1)

  if (existing && existing.length > 0) {
    const courseId = existing[0].id
    console.log('Found existing course, cleaning up...')

    // Get modules for this course
    const { data: mods } = await supabase.from('modules').select('id').eq('course_id', courseId)
    const modIds = (mods || []).map((m) => m.id)

    if (modIds.length > 0) {
      // Get lessons
      const { data: lessons } = await supabase.from('lessons').select('id').in('module_id', modIds)
      const lessonIds = (lessons || []).map((l) => l.id)
      if (lessonIds.length > 0) {
        await supabase.from('progress').delete().in('lesson_id', lessonIds)
      }

      // Get flashcards
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
    console.log('Old Terminal course removed.')
  }

  // --- INSERT COURSE ---
  console.log('Inserting Terminal course...')
  const courseId = crypto.randomUUID()
  const { error: cErr } = await supabase.from('courses').insert({
    id: courseId,
    title: courseTitle,
    category: 'Development',
    difficulty: 'beginner',
    description: "The terminal is your superpower. Learn to navigate your computer, manage files, and run programs like a real developer. Every coding journey starts here.",
  })
  if (cErr) throw cErr

  // --- MODULES, LESSONS, PROGRESS ---
  const modulesData = [
    {
      title: 'Welcome to the Terminal', sort_order: 1,
      lessons: [
        { title: 'What is the Terminal?', sort_order: 1, content: "The terminal (also called the command line, console, or shell) is a text-based interface to your computer. Instead of clicking icons and buttons, you type commands. It might look intimidating at first — a blinking cursor on a dark screen — but it's one of the most powerful tools a developer can learn. Every server in the world runs on command-line tools. When you deploy a website, install software, or manage code with Git, you'll use the terminal. Graphical interfaces are built for casual users. The terminal is built for builders. On Mac, the terminal app is called 'Terminal.' On Windows, you can use 'PowerShell' or install 'Windows Terminal.' On Linux, it's usually called 'Terminal' or 'Console.' They all work on the same basic principle: you type a command, press Enter, and the computer responds." },
        { title: 'Your First Commands', sort_order: 2, content: "Let's start with the basics. Open your terminal and try these commands. The 'echo' command prints text to the screen. Type: echo Hello World — and press Enter. You should see 'Hello World' printed back. The 'date' command shows the current date and time. Type: date — and see what comes back. The 'whoami' command tells you which user you're logged in as. Type: whoami — it will print your username. The 'clear' command cleans up your screen when it gets cluttered. Type: clear — and your terminal is fresh again. Every command follows the same pattern: you type the command name, sometimes followed by options or arguments, and press Enter. If you make a typo, no worries — just press the up arrow to bring back your last command and fix it." },
        { title: 'Understanding the Prompt', sort_order: 3, content: "The prompt is the text that appears before your cursor, waiting for you to type. It usually shows useful information like your username, computer name, and current directory. For example: user@laptop:~/projects$ — This tells you: 'user' is your username, 'laptop' is your computer name, '~/projects' is where you currently are in the file system, and the '$' means it's ready for your command. The tilde ~ is a shortcut that means your home directory. Don't worry about memorizing all of this — it becomes second nature. The key thing to know is that the prompt tells you WHERE you are, and that matters because commands often act on files in your current location." },
      ],
    },
    {
      title: 'Navigating the File System', sort_order: 2,
      lessons: [
        { title: 'Where Am I? (pwd)', sort_order: 1, content: "Your computer's files are organized in a tree of folders (called directories). At any time, you're 'standing' in one directory. The command 'pwd' stands for 'print working directory' — it tells you exactly where you are. Type: pwd — and you'll see something like /home/yourname or /Users/yourname. Think of it like a GPS for your file system. When you first open the terminal, you usually start in your home directory. Every command you run happens relative to where you currently are, so knowing your location is fundamental." },
        { title: 'Looking Around (ls)', sort_order: 2, content: "The 'ls' command lists what's in your current directory — files and folders. Type: ls — and you'll see the contents. But ls has useful options. 'ls -l' shows a detailed list with file sizes, dates, and permissions. 'ls -a' shows hidden files (files starting with a dot, like .gitconfig). 'ls -la' combines both — detailed view including hidden files. This is probably the most common variation developers use. You can also list a specific directory without going there: ls /home or ls Documents. Think of 'ls' as opening a folder in your file manager — but faster." },
        { title: 'Moving Around (cd)', sort_order: 3, content: "The 'cd' command stands for 'change directory' — it moves you to a different folder. Type: cd Documents — to move into your Documents folder. Type: cd .. — to go up one level (back to the parent folder). Type: cd ~ — to jump straight to your home directory from anywhere. Type: cd / — to go to the root of your entire file system. You can chain directories: cd Documents/projects/myapp moves you through multiple levels at once. A pro tip: start typing a folder name and press Tab — the terminal will auto-complete it for you. This saves tons of typing and prevents typos. If cd ever feels confusing, just run pwd to see where you ended up." },
        { title: 'Paths: Absolute vs Relative', sort_order: 4, content: "There are two ways to describe a file's location. An absolute path starts from the root of the file system and gives the full address: /home/user/Documents/report.txt — This works no matter where you currently are. A relative path starts from where you currently are: if you're in /home/user, then Documents/report.txt points to the same file. Special path shortcuts: '.' means the current directory, '..' means the parent directory (one level up), '~' means your home directory. Understanding paths is crucial because almost every command uses them. When someone says 'run this from the project root,' they mean cd into the project folder first so your relative paths work correctly." },
      ],
    },
    {
      title: 'Working with Files and Folders', sort_order: 3,
      lessons: [
        { title: 'Creating Files and Folders', sort_order: 1, content: "To create a new folder, use 'mkdir' (make directory): mkdir my-project — creates a folder called my-project. You can create nested folders with the -p flag: mkdir -p projects/webapp/src — creates all three levels at once. To create a new empty file, use 'touch': touch index.html — creates an empty file called index.html. You can create multiple files at once: touch style.css script.js README.md — creates three files. These are the commands you'll use every time you start a new project. A typical workflow: mkdir my-app, cd my-app, touch index.html style.css script.js. Just like that, you've set up a project structure." },
        { title: 'Viewing File Contents', sort_order: 2, content: "There are several ways to look at what's inside a file without opening an editor. 'cat' prints the entire file contents to your screen: cat README.md — good for short files. 'head' shows the first 10 lines: head -n 20 logfile.txt — shows the first 20 lines. 'tail' shows the last lines: tail -n 10 server.log — great for checking recent log entries. 'less' opens the file in a scrollable viewer: less bigfile.txt — press q to quit, arrow keys to scroll, / to search. For developers, 'cat' and 'less' are the most common. Cat for quick peeks, less for reading longer files. When debugging, 'tail -f server.log' follows a log file in real-time — showing new lines as they appear. This is incredibly useful when running servers." },
        { title: 'Copying, Moving, and Renaming', sort_order: 3, content: "The 'cp' command copies files: cp original.txt backup.txt — creates a copy. To copy a folder and everything inside it, add -r (recursive): cp -r my-project my-project-backup. The 'mv' command moves files — and also renames them: mv old-name.txt new-name.txt — renames a file. mv report.txt Documents/ — moves the file into the Documents folder. mv file.txt ../ — moves the file up one directory. The key difference: cp leaves the original in place, mv removes it from the original location. Think of cp as 'duplicate' and mv as 'cut and paste.' A common use: mv is the only way to rename files in the terminal. There's no separate 'rename' command." },
        { title: 'Deleting Files and Folders', sort_order: 4, content: "The 'rm' command removes files: rm unwanted-file.txt — deletes it permanently. Important: there is no trash can in the terminal. rm is permanent. The file is gone. To remove a folder and everything inside it: rm -r old-project — the -r means recursive (delete the folder and all its contents). The most dangerous command you'll learn: rm -rf — the f means 'force' (don't ask for confirmation). Never run rm -rf on directories you're not sure about. Always double-check with ls first. A safer approach: use rm -ri which asks for confirmation on each file. The rule: look before you delete, especially with -r." },
      ],
    },
    {
      title: 'Essential Developer Commands', sort_order: 4,
      lessons: [
        { title: 'Finding Things (grep and find)', sort_order: 1, content: "When your projects get bigger, you need to find things quickly. 'grep' searches inside files for text: grep 'error' logfile.txt — finds every line containing 'error.' grep -r 'TODO' src/ — searches all files in the src folder recursively. grep -i 'hello' file.txt — case-insensitive search. grep -n 'function' app.js — shows line numbers with matches. 'find' searches for files by name: find . -name '*.js' — finds all JavaScript files in the current directory and below. find . -name 'README*' — finds all files starting with README. find . -type d -name 'node_modules' — finds directories named node_modules. Grep searches INSIDE files. Find searches FOR files. Together, they let you locate anything in any project, no matter how large." },
        { title: 'Redirects and Pipes', sort_order: 2, content: "This is where the terminal gets really powerful. Redirects send command output somewhere other than the screen. The > symbol writes output to a file: echo 'Hello' > greeting.txt — creates the file with 'Hello' inside. ls -la > filelist.txt — saves the directory listing to a file. The >> symbol appends to a file instead of overwriting: echo 'Another line' >> greeting.txt — adds to the end. Pipes connect commands together using the | symbol. The output of one command becomes the input of the next: ls | grep '.js' — lists files then filters to only show JavaScript files. cat log.txt | grep 'error' | wc -l — counts the number of lines containing 'error.' history | grep 'git' — searches your command history for git commands. Pipes are the secret to terminal mastery. They let you chain simple commands into powerful workflows." },
        { title: 'Permissions Basics', sort_order: 3, content: "Every file in Linux and Mac has permissions that control who can read, write, or execute it. When you run 'ls -l' you see something like: -rw-r--r-- — This breaks down into three groups. The first group (rw-) is the owner's permissions: r = read, w = write, - = no execute. The second group (r--) is the group permissions. The third group (r--) is everyone else. The 'chmod' command changes permissions. The most common use for developers: chmod +x script.sh — makes a file executable so you can run it as a program. You'll need this when writing scripts or setting up project tools. If you see 'Permission denied' when trying to run something, chmod +x is usually the fix. For sensitive files like SSH keys, you'll use chmod 600 to make them readable only by you." },
        { title: 'Package Managers and Installing Software', sort_order: 4, content: "Package managers let you install software from the terminal. They're like an app store but faster and more powerful. On Mac: Homebrew is the go-to. Install it, then: brew install node — installs Node.js. brew install git — installs Git. On Ubuntu/Debian Linux: apt is built in. sudo apt update — refreshes available packages. sudo apt install nodejs — installs Node.js. For Node.js projects: npm is the package manager. npm install express — installs a package. npm init — starts a new project. For Python: pip installs packages. pip install requests — installs the requests library. Every programming language has its own package manager, but they all work the same way: you type a command, it downloads and installs the software. No searching the web for download links, no clicking through installers. One command, done." },
      ],
    },
  ]

  console.log('Inserting modules and lessons...')
  const moduleRows = []
  const lessonRows = []
  const progressRows = []
  const moduleIdMap = {}

  for (const mod of modulesData) {
    const moduleId = crypto.randomUUID()
    moduleIdMap[mod.title] = moduleId
    moduleRows.push({ id: moduleId, course_id: courseId, title: mod.title, sort_order: mod.sort_order })
    for (const lesson of mod.lessons) {
      const lessonId = crypto.randomUUID()
      lessonRows.push({ id: lessonId, module_id: moduleId, title: lesson.title, content: lesson.content, sort_order: lesson.sort_order })
      progressRows.push({ id: crypto.randomUUID(), lesson_id: lessonId, status: 'not_started' })
    }
  }

  const { error: mErr } = await supabase.from('modules').insert(moduleRows)
  if (mErr) throw mErr
  const { error: lErr } = await supabase.from('lessons').insert(lessonRows)
  if (lErr) throw lErr
  const { error: pErr } = await supabase.from('progress').insert(progressRows)
  if (pErr) throw pErr

  // --- QUIZ QUESTIONS ---
  console.log('Inserting quiz questions...')
  const quizzes = {
    'Welcome to the Terminal': [
      { question: 'What is another name for the terminal?', options: ['Desktop', 'Command line', 'Browser', 'File manager'], correct_index: 1, explanation: 'The terminal is also called the command line, console, or shell.' },
      { question: 'Which command prints text to the screen?', options: ['print', 'say', 'echo', 'display'], correct_index: 2, explanation: "The echo command outputs text to the terminal." },
      { question: "What does the 'clear' command do?", options: ['Deletes all files', 'Closes the terminal', 'Cleans up the screen', 'Resets your computer'], correct_index: 2, explanation: 'The clear command cleans up your terminal screen. It doesn\'t delete anything.' },
      { question: "What does 'whoami' tell you?", options: ["Your computer's name", "Today's date", 'Your username', 'Your IP address'], correct_index: 2, explanation: 'The whoami command prints the username of the currently logged-in user.' },
      { question: 'How do you bring back your last command?', options: ["Type 'redo'", 'Press the up arrow key', 'Press Ctrl+Z', "Type 'last'"], correct_index: 1, explanation: 'Pressing the up arrow key cycles through your command history.' },
    ],
    'Navigating the File System': [
      { question: "What does 'pwd' stand for?", options: ['Password', 'Print working directory', 'Previous working directory', 'Path with details'], correct_index: 1, explanation: "pwd stands for 'print working directory' — it shows where you are in the file system." },
      { question: 'Which command lists directory contents?', options: ['dir', 'show', 'ls', 'list'], correct_index: 2, explanation: 'The ls command lists files and folders in your current directory.' },
      { question: "What does 'cd ..' do?", options: ['Goes to home directory', 'Goes up one directory level', 'Lists parent directory', 'Creates a new directory'], correct_index: 1, explanation: "The .. refers to the parent directory. 'cd ..' moves you up one level." },
      { question: 'What does ~ represent?', options: ['The root directory', 'The current directory', 'Your home directory', 'The parent directory'], correct_index: 2, explanation: "The tilde ~ is a shortcut for your home directory." },
      { question: 'What is an absolute path?', options: ['A path relative to your current location', 'A path starting from the root of the file system', 'A path that only works on Mac', 'A path to a protected file'], correct_index: 1, explanation: 'An absolute path starts from the root (/) and gives the complete address.' },
    ],
    'Working with Files and Folders': [
      { question: 'Which command creates a new folder?', options: ['newfolder', 'create', 'touch', 'mkdir'], correct_index: 3, explanation: "mkdir stands for 'make directory.'" },
      { question: 'Which command creates a new empty file?', options: ['touch', 'mkdir', 'new', 'create'], correct_index: 0, explanation: "The touch command creates a new empty file." },
      { question: "What does 'rm' do?", options: ['Renames a file', 'Permanently deletes a file', 'Moves a file to trash', 'Restores a file'], correct_index: 1, explanation: 'rm removes files permanently. There is no trash can.' },
      { question: 'How do you copy an entire folder?', options: ['cp folder', 'copy folder', 'cp -r folder destination', 'mv folder destination'], correct_index: 2, explanation: 'The -r flag means recursive — copy the folder and everything inside it.' },
      { question: 'How do you rename a file in the terminal?', options: ['rename old new', 'rn old new', 'mv old new', 'cp old new'], correct_index: 2, explanation: 'The mv command doubles as a rename command.' },
    ],
    'Essential Developer Commands': [
      { question: "What does 'grep' search for?", options: ['Files by name', 'Text patterns inside files', 'Folders by size', 'Programs to install'], correct_index: 1, explanation: 'grep searches for text patterns inside files.' },
      { question: 'What does the pipe | do?', options: ['Writes output to a file', 'Deletes output', "Sends one command's output to another", 'Repeats a command'], correct_index: 2, explanation: 'The pipe connects commands — output of the first becomes input of the next.' },
      { question: 'What does > do in a command?', options: ['Compares two files', 'Redirects output to a file', 'Runs a command as admin', 'Goes to a directory'], correct_index: 1, explanation: 'The > symbol redirects output to a file instead of the screen.' },
      { question: "What does 'chmod +x script.sh' do?", options: ['Deletes the script', 'Compresses the script', 'Makes the script executable', 'Copies the script'], correct_index: 2, explanation: 'chmod +x adds execute permission, allowing you to run the file as a program.' },
      { question: 'What is a package manager?', options: ['A file organizer', 'A type of terminal', 'A tool that installs software from the command line', 'A zip/unzip tool'], correct_index: 2, explanation: 'Package managers like Homebrew, apt, npm, and pip install software with a single command.' },
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
    'Welcome to the Terminal': [
      { d: 1, q: 'What is the terminal?', a: 'A text-based interface to your computer where you type commands instead of clicking icons. Also called the command line, console, or shell.' },
      { d: 1, q: 'What command prints text to the screen?', a: "echo — for example, 'echo Hello World' prints Hello World." },
      { d: 1, q: 'How do you clear a messy terminal screen?', a: "Type 'clear' and press Enter. Your screen resets but nothing is deleted." },
      { d: 1, q: "What does the 'date' command do?", a: 'Shows the current date and time on your system.' },
      { d: 1, q: 'How do you bring back a previous command?', a: 'Press the up arrow key. Keep pressing to go further back in your command history.' },
      { d: 2, q: 'What is the terminal app called on Mac vs Windows vs Linux?', a: 'Mac: Terminal. Windows: PowerShell or Windows Terminal. Linux: Terminal or Console.' },
      { d: 2, q: 'What is the basic pattern for every terminal command?', a: "Command name, followed by options (flags), followed by arguments, then press Enter. Example: ls -la Documents." },
      { d: 2, q: "What happens when you type a command that doesn't exist?", a: 'The terminal shows "command not found" — the command is misspelled or the program isn\'t installed.' },
      { d: 2, q: 'Why do developers use the terminal instead of graphical file managers?', a: 'Speed, power, and automation. Terminal commands can be scripted, work on remote servers, and handle operations graphical tools cannot.' },
      { d: 2, q: 'What is the difference between a terminal and a shell?', a: 'The terminal is the window/application you see. The shell (like bash or zsh) is the program inside that interprets your commands.' },
      { d: 3, q: 'What is the difference between bash, zsh, and fish?', a: "Different shells. Bash is traditional Linux default. Zsh is Mac default with better auto-completion. Fish is user-friendly with syntax highlighting. All run the same basic commands." },
      { d: 3, q: 'What is a shell configuration file?', a: 'Files like .bashrc or .zshrc that run automatically when you open a terminal. They set up aliases, PATH, and preferences.' },
      { d: 3, q: 'What is the PATH environment variable?', a: "A list of directories where the system looks for programs. When you type 'git', it searches PATH until it finds the program." },
      { d: 3, q: 'What does it mean that the terminal is "built for builders"?', a: 'It gives direct, precise control. You can automate tasks, manage servers remotely, chain commands, and do things impossible through graphical interfaces.' },
      { d: 3, q: 'How does understanding the terminal connect to AI development?', a: 'AI tools like Claude Code run from the terminal. Deploying apps, managing servers, installing dependencies, and version control all happen in the terminal.' },
    ],
    'Navigating the File System': [
      { d: 1, q: 'What does pwd do?', a: 'Prints your current location (working directory) in the file system.' },
      { d: 1, q: 'What does ls show you?', a: 'Lists the files and folders in your current directory.' },
      { d: 1, q: 'How do you move into a folder?', a: "Use 'cd foldername' — for example, 'cd Documents'." },
      { d: 1, q: 'How do you go back up one folder level?', a: "Type 'cd ..' — the double dots mean parent directory." },
      { d: 1, q: 'What does ~ mean?', a: "Your home directory. 'cd ~' takes you home from anywhere." },
      { d: 2, q: "What is the difference between 'ls' and 'ls -la'?", a: "'ls' shows basic names. 'ls -la' shows detailed list including sizes, permissions, dates, and hidden files." },
      { d: 2, q: 'What does Tab auto-completion do?', a: 'When you start typing and press Tab, the terminal finishes the name for you. Saves time and prevents typos.' },
      { d: 2, q: 'What is the difference between absolute and relative paths?', a: 'Absolute starts from root (/) and works anywhere. Relative starts from current location and depends on where you are.' },
      { d: 2, q: "What does 'cd -' do?", a: "Takes you back to the previous directory — like an undo for navigation." },
      { d: 2, q: "What does '.' (single dot) represent?", a: "The current directory. Used in commands like './script.sh' meaning 'run this script right here.'" },
      { d: 3, q: 'Explain this path: ../../src/components/App.jsx', a: 'Go up two levels, then into src, then components, then reference App.jsx.' },
      { d: 3, q: 'What is the difference between /home and ~?', a: '/home contains ALL users\' home directories. ~ is YOUR specific home directory (like /home/yourname).' },
      { d: 3, q: 'What is the root directory /?', a: 'The very top of the file system tree. Every file lives somewhere under /. You usually need admin privileges to modify it.' },
      { d: 3, q: 'What happens when you cd into a symbolic link?', a: "You enter the target directory. pwd may show the link's path or real path depending on shell settings. 'cd -P' forces the real path." },
      { d: 3, q: 'Why does understanding the file system matter for development?', a: 'Projects depend on relative paths for imports and builds. Wrong paths break builds and cause "module not found" errors.' },
    ],
    'Working with Files and Folders': [
      { d: 1, q: 'How do you create a new folder?', a: "mkdir foldername — for example, 'mkdir my-project'." },
      { d: 1, q: 'How do you create a new empty file?', a: "touch filename — for example, 'touch index.html'." },
      { d: 1, q: "How do you view a file's contents quickly?", a: "cat filename — prints the entire file to your screen." },
      { d: 1, q: 'What does rm do?', a: 'Removes (permanently deletes) files. No trash can — once gone, it\'s gone.' },
      { d: 1, q: 'What is the difference between cp and mv?', a: 'cp copies (original stays). mv moves (original removed). mv also renames.' },
      { d: 2, q: 'What does the -r flag mean?', a: "Recursive — apply the command to the folder AND everything inside it." },
      { d: 2, q: 'What is the difference between > and >>?', a: '> overwrites the file. >> appends to the end without erasing existing contents.' },
      { d: 2, q: "What does 'head -n 20 file.txt' do?", a: "Shows only the first 20 lines. 'tail -n 20' shows the last 20 lines." },
      { d: 2, q: "What does 'mkdir -p projects/web/src' do?", a: 'Creates the entire nested folder structure at once. The -p flag means "create parent directories as needed."' },
      { d: 2, q: "Why is 'rm -rf' dangerous?", a: "It permanently deletes a folder and everything in it instantly with no confirmation and no undo." },
      { d: 3, q: "When do you use cat, less, head, and tail?", a: 'cat: quick peek at short files. less: scrollable long files. head: first N lines. tail: last N lines. tail -f: follow live logs.' },
      { d: 3, q: 'How would you safely delete a large project folder?', a: "First ls to verify contents. Use 'rm -ri' for confirmation on each file. Or mv to /tmp first as a safety net." },
      { d: 3, q: 'Explain wildcards: *, ?, and **.', a: '* matches any characters (*.js = all JS files). ? matches one character. ** matches recursively across directories.' },
      { d: 3, q: 'What are dotfiles?', a: "Files starting with . are hidden by default. Used for configuration: .gitignore, .env, .bashrc. 'ls -a' reveals them." },
      { d: 3, q: 'How do file permissions relate to security?', a: 'Wrong permissions can expose secrets or prevent scripts from running. Key: chmod 600 for SSH keys, never chmod 777 in production.' },
    ],
    'Essential Developer Commands': [
      { d: 1, q: 'What does grep do?', a: "Searches for text patterns inside files. Example: 'grep error log.txt'." },
      { d: 1, q: 'What does the pipe | do?', a: "Sends output of one command as input to another. Chains commands into workflows." },
      { d: 1, q: 'What is a package manager?', a: 'A tool that installs software from the command line. Examples: Homebrew, apt, npm, pip.' },
      { d: 1, q: 'What does find do?', a: 'Searches for files and folders by name or attributes. Example: find . -name "*.js".' },
      { d: 1, q: 'What does chmod +x do?', a: 'Adds execute permission so you can run the file as a program.' },
      { d: 2, q: 'What is the difference between grep and find?', a: 'grep searches INSIDE files for text. find searches FOR files by name/type. Different questions, different tools.' },
      { d: 2, q: "Explain: cat log.txt | grep 'error' | wc -l", a: 'Three chained commands: output file contents → filter to error lines → count those lines. Result: number of errors.' },
      { d: 2, q: "What does 'grep -r \"TODO\" src/' do?", a: 'Recursively searches all files in src/ for "TODO". Great for finding all TODO comments in a project.' },
      { d: 2, q: "What's the difference between 'brew install' and 'npm install'?", a: 'brew installs system-level software (Node.js, Git). npm installs JavaScript packages for a project.' },
      { d: 2, q: "What does 'sudo' mean?", a: "'Superuser do' — runs a command with administrator privileges. Use with caution." },
      { d: 3, q: 'Design a pipeline to find the 5 largest JS files in a project.', a: 'find . -name "*.js" | xargs du -h | sort -rh | head -5. Find files, get sizes, sort largest first, show top 5.' },
      { d: 3, q: 'What is the difference between >> and |?', a: '>> appends output to a FILE for storage. | sends output to another COMMAND for processing.' },
      { d: 3, q: 'What does -rwxr-xr-- mean?', a: 'Owner: read/write/execute. Group: read/execute. Others: read only. Numeric: 754.' },
      { d: 3, q: 'How would you set up a React project from the terminal?', a: 'mkdir my-app && cd my-app, npm init -y, npm install react react-dom, npm install -D vite, touch index.html src/App.jsx src/main.jsx.' },
      { d: 3, q: 'Why are package managers essential for modern development?', a: 'They handle dependencies, versioning, scripts, and reproducibility. You cannot build modern applications without them.' },
    ],
  }

  const cardRows = []
  const cardProgressRows = []
  for (const [modTitle, cards] of Object.entries(flashcardData)) {
    const modId = moduleIdMap[modTitle]
    for (let i = 0; i < cards.length; i++) {
      const c = cards[i]
      const cardId = crypto.randomUUID()
      cardRows.push({ id: cardId, module_id: modId, question: c.q, answer: c.a, difficulty: c.d, sort_order: i + 1 })
      cardProgressRows.push({ id: crypto.randomUUID(), flashcard_id: cardId, times_seen: 0, times_correct: 0, comfort_level: 1 })
    }
  }

  const { error: fcErr } = await supabase.from('flashcards').insert(cardRows)
  if (fcErr) throw fcErr
  const { error: fpErr } = await supabase.from('flashcard_progress').insert(cardProgressRows)
  if (fpErr) throw fpErr

  const summary = {
    course: 1,
    modules: moduleRows.length,
    lessons: lessonRows.length,
    quizQuestions: quizRows.length,
    flashcards: cardRows.length,
  }
  console.log('Terminal course seeding complete!', summary)
  return summary
}
