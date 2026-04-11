import { supabase } from './supabase'

export async function seedAllQuizzes() {
  console.log('Clearing existing quiz data...')

  const { error: delAttempts } = await supabase.from('quiz_attempts').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (delAttempts) { console.error('Error deleting quiz_attempts:', delAttempts); throw delAttempts }

  const { error: delQuestions } = await supabase.from('quiz_questions').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (delQuestions) { console.error('Error deleting quiz_questions:', delQuestions); throw delQuestions }

  console.log('Fetching modules...')
  const { data: modules } = await supabase.from('modules').select('id, title').order('sort_order')

  if (!modules || modules.length === 0) {
    throw new Error('No modules found. Seed courses first.')
  }

  // Build a lookup by module title
  const modByTitle = {}
  for (const m of modules) {
    modByTitle[m.title] = m.id
  }

  const quizData = [
    // === COURSE: Prompt Engineering Fundamentals ===
    {
      moduleTitle: 'Understanding Claude',
      questions: [
        { question: 'What company created Claude?', options: ['OpenAI', 'Anthropic', 'Google DeepMind', 'Meta AI'], correct_index: 1, explanation: 'Claude is built by Anthropic, a company focused on AI safety.' },
        { question: 'What does Claude NOT have between separate conversations?', options: ['Language ability', 'Memory', 'Processing power', 'Access to its training'], correct_index: 1, explanation: "Claude doesn't retain memory between conversations. Each conversation starts fresh unless context is provided." },
        { question: 'Which best describes how Claude generates responses?', options: ['It searches the internet for answers', 'It copies from a database', 'It generates text based on patterns learned during training', 'It asks other AI models'], correct_index: 2, explanation: 'Claude generates responses based on patterns in its training data, not by searching the web or copying from a database.' },
        { question: 'What is Claude designed to be?', options: ['Fast, cheap, and viral', 'Helpful, harmless, and honest', 'Creative, autonomous, and independent', 'Simple, basic, and limited'], correct_index: 1, explanation: 'Anthropic designed Claude around three core principles: helpful, harmless, and honest.' },
        { question: 'Which is something Claude CAN do?', options: ['Browse the internet in its base form', 'Remember your last conversation', 'Analyze and summarize documents', 'Access your computer files'], correct_index: 2, explanation: "Claude can analyze text, summarize documents, write code, and reason through problems, but it can't browse the web or access files in its base form." },
      ],
    },
    {
      moduleTitle: 'Writing Your First Prompts',
      questions: [
        { question: 'What are the three parts of a good prompt?', options: ['Subject, verb, object', 'Context, instruction, format', 'Input, process, output', 'Who, what, where'], correct_index: 1, explanation: 'A good prompt provides context (background), instruction (what you want), and format (how you want the output).' },
        { question: 'What is the single biggest improvement most people can make to their prompts?', options: ['Making them longer', 'Using technical language', 'Being more specific', 'Adding more questions'], correct_index: 2, explanation: 'Specificity is the most impactful improvement. Vague prompts get vague results.' },
        { question: "What does 'providing context' mean in prompting?", options: ['Giving Claude your password', "Sharing background information Claude doesn't know about your situation", 'Telling Claude what model it is', 'Repeating the question multiple times'], correct_index: 1, explanation: "Context is everything Claude doesn't know about you, your goal, your audience, and your situation." },
        { question: 'Why should you specify output format in your prompt?', options: ['It makes Claude work faster', 'It reduces costs', 'It gives you consistent, usable results', "It's required by the API"], correct_index: 2, explanation: 'When you tell Claude exactly how to format the output (bullets, table, JSON, word count), you get predictable, usable results.' },
        { question: 'Which is a better prompt?', options: ['"Write about marketing"', '"Help me with business stuff"', '"Do something creative"', '"Write a 300-word LinkedIn post about 3 email marketing tips for small businesses, in a conversational tone"'], correct_index: 3, explanation: 'The best prompt is specific about the task, format, length, topic, and tone.' },
      ],
    },
    {
      moduleTitle: 'Common Prompting Mistakes',
      questions: [
        { question: "What is the 'Just Do It' trap?", options: ['Asking Claude to exercise', 'Jumping straight to a request without providing any context', 'Giving too much context', 'Using Claude for simple tasks'], correct_index: 1, explanation: "The 'Just Do It' trap is when you make a big request without any setup or context, leading to generic output." },
        { question: 'What happens when you overload a single prompt with too many tasks?', options: ['Claude gets faster', 'You save money', 'None of the tasks get done well', 'Claude automatically splits them up'], correct_index: 2, explanation: 'Asking Claude to do too many things at once means each task gets less attention. Break complex work into steps.' },
        { question: "What should you do when your first prompt doesn't give a perfect result?", options: ['Give up and try a different AI', 'Report it as a bug', 'Start a brand new conversation', 'Iterate — ask Claude to revise, adjust, or try a different approach'], correct_index: 3, explanation: 'The magic is in the follow-up. Treat prompting as a conversation and iterate toward what you want.' },
        { question: 'Which approach is better for writing a business plan with Claude?', options: ['Ask for an outline first, then draft each section separately', 'Paste the entire request in one massive prompt', 'Only give Claude the company name', 'Ask Claude to guess what kind of business you have'], correct_index: 0, explanation: "Breaking complex tasks into steps (outline → draft → refine) gives Claude focused attention on each part." },
        { question: 'Why is iteration important in prompting?', options: ['It costs less per message', 'Claude requires exactly 3 messages', 'Your first prompt rarely gives the perfect result', "It's the only way Claude works"], correct_index: 2, explanation: "First prompts are starting points. Follow-up prompts let you refine tone, add detail, and steer toward exactly what you need." },
      ],
    },

    // === COURSE: Advanced Prompt Techniques ===
    {
      moduleTitle: 'Structured Prompting',
      questions: [
        { question: 'What do XML tags like <context> and <instructions> help Claude do?', options: ['Run faster', 'Access the internet', 'Parse complex prompts more accurately', 'Remember previous conversations'], correct_index: 2, explanation: 'XML tags organize your prompt into clear sections, helping Claude understand the structure and respond more accurately.' },
        { question: 'What is role prompting?', options: ['Asking Claude to play a video game character', 'Telling Claude to respond as a specific professional role', 'Assigning Claude a username', 'Giving Claude admin access'], correct_index: 1, explanation: "Role prompting (e.g., 'You are a senior code reviewer') frames Claude's tone, expertise, and perspective for the entire response." },
        { question: 'What is a system prompt?', options: ['An error message', 'A prompt that fixes bugs', "Instructions that set Claude's behavior for an entire conversation", 'A prompt that only system administrators can use'], correct_index: 2, explanation: "System prompts define personality, rules, and boundaries before any user interaction — like a job description for Claude." },
        { question: 'When are system prompts essential?', options: ['When chatting casually', 'When building applications on Claude', 'Only when using Haiku', 'Only for free tier users'], correct_index: 1, explanation: 'System prompts are critical for applications because they ensure consistent behavior across all user interactions.' },
        { question: 'Which XML tag structure is correct for organizing a prompt?', options: ['Using hashtags like Twitter', 'Using [brackets] like Wikipedia', 'Using tags like <context>info here</context>', 'Using {curly braces} like JSON'], correct_index: 2, explanation: 'Claude is trained to recognize XML-style tags like <context>, <instructions>, and <format> for organizing prompts.' },
      ],
    },
    {
      moduleTitle: 'Advanced Techniques',
      questions: [
        { question: 'What does chain-of-thought prompting ask Claude to do?', options: ['Write in a chain of emails', 'Link to external sources', 'Think through problems step by step', 'Chain multiple models together'], correct_index: 2, explanation: 'Chain-of-thought prompting asks Claude to show its reasoning step by step, which dramatically improves accuracy on complex problems.' },
        { question: 'What is few-shot prompting?', options: ['Using as few words as possible', 'Only sending one message', 'Providing 2-3 examples of the input/output pattern you want', 'Asking Claude to guess what you want'], correct_index: 2, explanation: "Few-shot prompting means showing Claude examples of what you want. It's one of the most reliable techniques for consistent output." },
        { question: 'What is prompt chaining?', options: ['Using the same prompt repeatedly', 'Breaking a big task into a sequence of smaller prompts where each feeds into the next', 'Connecting multiple AI models', 'Sending prompts in multiple languages'], correct_index: 1, explanation: "Prompt chaining breaks big tasks into focused steps: research → outline → draft. Each step gets Claude's full attention." },
        { question: 'What does self-reflection prompting ask Claude to do?', options: ['Write about its feelings', 'Restart the conversation', 'Review and critique its own output before giving a final answer', 'Reflect user input back as a question'], correct_index: 2, explanation: "Asking Claude to review its own work ('check for accuracy and completeness, then improve') significantly boosts output quality." },
        { question: 'Why does chain-of-thought improve accuracy?', options: ['It uses more computing power', 'It accesses better training data', 'It forces Claude to process each logical step rather than jumping to conclusions', 'It enables internet access'], correct_index: 2, explanation: 'Step-by-step reasoning prevents Claude from skipping logical steps, which is where most errors happen.' },
      ],
    },
    {
      moduleTitle: 'Prompting for Different Tasks',
      questions: [
        { question: 'When prompting Claude to write code, what should you always request?', options: ['That it writes as fast as possible', 'That it uses the newest language', 'Error handling', 'That it avoids comments'], correct_index: 2, explanation: 'Always request error handling when asking Claude for code. Robust code handles edge cases and unexpected inputs.' },
        { question: 'What should you define when prompting for writing tasks?', options: ['Audience, tone, length, and purpose', 'Only the topic', 'Just the word count', 'The programming language'], correct_index: 0, explanation: 'Good writing prompts define who will read it, what tone to use, how long it should be, and what it needs to accomplish.' },
        { question: 'Which is a strong analysis prompt?', options: ['"Analyze this data"', '"Look at these numbers"', '"What do you think?"', '"Identify the top 3 trends, any outliers, and summarize for my team"'], correct_index: 3, explanation: 'Specific analysis prompts tell Claude exactly what to look for and who the output is for, producing much more useful results.' },
        { question: 'How can Claude be used as a tutor?', options: ['It can grade official exams', 'It can issue diplomas', 'It can explain concepts at your level, create practice problems, and quiz you', 'It can replace classroom teachers'], correct_index: 2, explanation: "Claude is an excellent tutor — it adapts explanations to your level, creates practice problems, and helps identify knowledge gaps." },
        { question: 'What should you ask for before having Claude write a long piece?', options: ['A bibliography', 'An outline', 'A disclaimer', 'Permission'], correct_index: 1, explanation: "Asking for an outline first lets you review the structure before Claude invests in a full draft, saving time and improving quality." },
      ],
    },

    // === COURSE: Claude API & Tool Use ===
    {
      moduleTitle: 'Getting Started with the API',
      questions: [
        { question: 'What type of interface does the Anthropic API use?', options: ['GraphQL', 'SOAP', 'REST with JSON', 'WebSocket only'], correct_index: 2, explanation: 'The Anthropic API uses a REST interface with JSON payloads — send a POST request, get a JSON response.' },
        { question: 'What do you need from the Anthropic console to make API calls?', options: ['A social media account', 'A university email', 'An API key', 'A government ID'], correct_index: 2, explanation: 'You need an API key from the Anthropic console to authenticate your API calls.' },
        { question: 'Which Claude model is the best balance of capability and cost for most apps?', options: ['Opus', 'Sonnet', 'Haiku', "They're all the same price"], correct_index: 1, explanation: 'Sonnet offers the best balance of capability and cost. Opus is most capable but pricier, Haiku is fastest and cheapest.' },
        { question: "What does the 'temperature' parameter control?", options: ['How fast Claude responds', 'Creativity vs consistency in responses', 'The length of the response', 'Which language Claude uses'], correct_index: 1, explanation: 'Temperature controls randomness — lower values give more consistent responses, higher values give more creative/varied ones.' },
        { question: 'What is the simplest way to get started with the API?', options: ['Write raw HTTP requests from scratch', 'Use a command line tool', 'Use the Python or JavaScript SDK', 'Build a custom protocol'], correct_index: 2, explanation: 'The Python and JavaScript SDKs handle authentication, error handling, and request formatting, making them the simplest starting point.' },
      ],
    },
    {
      moduleTitle: 'Building with the API',
      questions: [
        { question: 'Why do you need to send full message history with each API call?', options: ["It's a billing requirement", 'It makes responses faster', "Claude doesn't remember previous API calls", "It's needed for authentication"], correct_index: 2, explanation: 'Claude has no memory between API calls. You must send the entire conversation history so Claude has context for its response.' },
        { question: 'What does streaming do for the user experience?', options: ['Makes responses more accurate', 'Reduces costs', 'Delivers responses token by token in real-time instead of waiting for the full response', 'Enables file uploads'], correct_index: 2, explanation: 'Streaming shows the response as it\'s generated, creating a much better user experience for chat interfaces.' },
        { question: "What HTTP status code indicates you've hit a rate limit?", options: ['200', '400', '429', '500'], correct_index: 2, explanation: "A 429 status code means 'Too Many Requests' — you've hit the API rate limit and need to slow down or implement backoff." },
        { question: 'Which is NOT a strategy for reducing API costs?', options: ['Using smaller models when possible', 'Limiting max_tokens', 'Truncating unnecessary conversation history', 'Sending every request twice to verify accuracy'], correct_index: 3, explanation: 'Sending requests twice doubles your costs. Instead, optimize by using appropriate models, limiting tokens, and caching common responses.' },
        { question: 'What retry strategy should you implement for API errors?', options: ['Retry immediately as fast as possible', 'Exponential backoff', 'Wait exactly 60 seconds', 'Never retry, just show an error'], correct_index: 1, explanation: "Exponential backoff increases the wait time between retries, preventing you from overwhelming the API when it's under load." },
      ],
    },
    {
      moduleTitle: 'Tool Use & Function Calling',
      questions: [
        { question: 'What does tool use allow Claude to do beyond generating text?', options: ['Browse any website', 'Call functions you define to interact with external systems', 'Modify its own training', 'Create its own tools automatically'], correct_index: 1, explanation: 'Tool use lets Claude call functions you define — like searching databases or calling APIs — bridging AI reasoning with real-world actions.' },
        { question: 'How do you define tools for Claude?', options: ['In natural language paragraphs', 'As Python functions', 'As JSON schemas describing name, description, and parameters', 'As SQL queries'], correct_index: 2, explanation: 'Tools are defined as JSON schemas that describe what the function does and what parameters it accepts.' },
        { question: 'What happens after Claude decides to use a tool?', options: ['Claude executes the function itself', 'The conversation ends', 'Your application executes the function and sends the result back to Claude', 'The tool runs automatically in the cloud'], correct_index: 2, explanation: 'Your application is responsible for executing the actual function. You send the result back to Claude, which then generates a final response.' },
        { question: 'What makes good tool descriptions critical?', options: ['They affect API pricing', 'They change the model being used', "They help Claude decide when to use each tool — they're like prompts for tool selection", "They're displayed to the end user"], correct_index: 2, explanation: 'Tool descriptions are how Claude understands what each tool does. Clear descriptions lead to better tool selection decisions.' },
        { question: 'What can Claude do with multiple tools?', options: ['Only use one per conversation', 'Chain tool calls together to complete complex workflows', 'Create new tools on its own', 'Share tools with other AI models'], correct_index: 1, explanation: 'Claude can chain multiple tools — search a database, then send an email, then update a record — orchestrating complex multi-step workflows.' },
      ],
    },

    // === COURSE: Building Agentic Applications ===
    {
      moduleTitle: 'Agentic Fundamentals',
      questions: [
        { question: 'What makes an AI agent different from a simple chatbot?', options: ["It's more expensive", 'It uses a bigger model', 'It operates in a loop: observe, think, act, repeat — working toward a goal', 'It has a better user interface'], correct_index: 2, explanation: 'Agents work in loops toward goals, using tools and handling errors autonomously, unlike simple one-shot question-answer interactions.' },
        { question: 'Which is a common agent architecture pattern?', options: ['Copy-Paste', 'ReAct (Reason + Act)', 'Waterfall', 'Monolith'], correct_index: 1, explanation: 'ReAct (Reason + Act) is a common pattern where the agent reasons about what to do, takes an action, observes the result, and repeats.' },
        { question: 'What should an effective agent do before executing a complex task?', options: ['Ask the user for the answer', 'Skip ahead to the final step', 'Break the task into a plan of smaller steps', 'Switch to a different AI model'], correct_index: 2, explanation: 'Good agents plan first — breaking big tasks into steps with checkpoints to evaluate progress and adjust as needed.' },
        { question: 'What should agents include at key points during execution?', options: ['Advertisements', 'Random delays', 'Checkpoints to evaluate progress and adjust the plan', 'Password prompts'], correct_index: 2, explanation: "Checkpoints let the agent evaluate whether it's on track and adjust its approach if something isn't working." },
        { question: 'Which pattern should beginners start with when building agents?', options: ['Multi-agent systems', 'Simple tool-use loops', 'Fully autonomous agents', 'The most complex architecture available'], correct_index: 1, explanation: 'Start with simple tool-use loops and graduate to more complex patterns as you gain experience and understand the tradeoffs.' },
      ],
    },
    {
      moduleTitle: 'Model Context Protocol (MCP)',
      questions: [
        { question: 'What is the Model Context Protocol?', options: ['A new programming language', 'A chatbot framework', 'An open standard for connecting AI models to external data sources and tools', 'A security encryption method'], correct_index: 2, explanation: 'MCP is an open standard created by Anthropic that provides a universal way to connect Claude to databases, APIs, file systems, and more.' },
        { question: 'What architecture does MCP use?', options: ['Peer-to-peer', 'Client-server', 'Monolithic', 'Blockchain'], correct_index: 1, explanation: 'MCP uses a client-server model where your AI application is the client and each data source runs an MCP server.' },
        { question: 'What languages can MCP servers be built in?', options: ['Only Java', 'Only Rust', 'Python or TypeScript', 'Only C++'], correct_index: 2, explanation: "MCP servers can be built in Python or TypeScript using Anthropic's SDK, and each server typically wraps one external service." },
        { question: 'What does MCP standardize?', options: ["The AI model's training process", 'User interface design', 'How tools are discovered, called, and how results are returned', 'Database schema design'], correct_index: 2, explanation: 'MCP standardizes the protocol for tool discovery, invocation, and result handling, making integrations modular and reusable.' },
        { question: 'What do production MCP deployments need?', options: ['Only a good internet connection', 'Authentication, error handling, logging, and security boundaries', 'A dedicated server room', 'Only unit tests'], correct_index: 1, explanation: 'Production MCP needs proper auth, error handling, logging, and security to ensure safe and reliable operation.' },
      ],
    },
    {
      moduleTitle: 'Advanced Agent Patterns',
      questions: [
        { question: 'What separates toy agents from production agents?', options: ['The programming language used', 'The size of the AI model', 'Robust error handling and recovery', 'Having a better user interface'], correct_index: 2, explanation: 'Production agents need retry logic, fallback strategies, and the ability to recognize and recover from mistakes.' },
        { question: "What is 'human-in-the-loop' in agent design?", options: ['Replacing AI with humans', 'Adding confirmation steps for high-risk actions before the agent executes them', "Having humans write the agent's code", 'Training the AI with human data'], correct_index: 1, explanation: 'Human-in-the-loop means keeping humans in control of critical decisions like sending emails, making purchases, or deleting data.' },
        { question: 'How do multi-agent systems work?', options: ['Multiple users share one agent', 'One agent pretends to be multiple', 'Multiple specialized agents handle different parts of a task and communicate through structured outputs', 'Agents compete against each other'], correct_index: 2, explanation: 'Multi-agent systems split work across specialists — one researches, one writes, one reviews — similar to how human teams operate.' },
        { question: 'What should you measure to evaluate agent performance?', options: ['Only how fast it responds', 'Task completion rate, accuracy, efficiency, cost per task, and error rate', 'Only the number of tool calls', 'Only user satisfaction'], correct_index: 1, explanation: 'Comprehensive evaluation covers completion rate, accuracy, efficiency (steps taken), cost, and error rate — all measured against evaluation datasets.' },
        { question: 'Why should you build evaluation datasets for your agents?', options: ["It's a legal requirement", "They're needed for billing", 'To regularly test and improve agent reliability', 'To train new AI models'], correct_index: 2, explanation: 'Evaluation datasets let you run your agent against known test cases regularly, which is how you systematically improve reliability over time.' },
      ],
    },

    // === COURSE: Safety & Responsible AI ===
    {
      moduleTitle: "Anthropic's Approach to Safety",
      questions: [
        { question: 'Why was Anthropic founded?', options: ['To compete with Google', 'To build the fastest AI', 'To build AI that is safe and beneficial for humanity', 'To create video games'], correct_index: 2, explanation: 'Anthropic was founded specifically with the mission of building AI systems that are safe and beneficial.' },
        { question: 'What is Constitutional AI (CAI)?', options: ['AI that follows government laws', 'An approach where Claude is trained with a set of guiding principles instead of only human feedback', 'AI for constitutional lawyers', 'An AI voting system'], correct_index: 1, explanation: "Constitutional AI trains Claude using a set of principles (a 'constitution') that guides behavior, making values more transparent and consistent." },
        { question: "What are Claude's three core design principles?", options: ['Fast, free, and fun', 'Smart, strong, and silent', 'Helpful, harmless, and honest', 'Creative, autonomous, and powerful'], correct_index: 2, explanation: "Claude is designed to be helpful (useful), harmless (avoids damage), and honest (truthful about what it knows and doesn't know)." },
        { question: "What does 'honest' mean for Claude?", options: ['It never makes mistakes', 'It always agrees with the user', "It's truthful about what it knows and doesn't know, including its limitations", "It shares all of Anthropic's internal data"], correct_index: 2, explanation: "Honesty means Claude is transparent about its capabilities and limitations, including when it's uncertain." },
        { question: 'Why does AI safety become more important as AI systems become more capable?', options: ['More capable AI costs more money', 'More capable AI can cause more harm if not properly designed', 'Safety only matters for consumer products', "It doesn't — safety is always the same priority level"], correct_index: 1, explanation: 'As AI becomes more powerful, the potential for both benefit and harm increases, making safety engineering critical.' },
      ],
    },
    {
      moduleTitle: 'Responsible Development',
      questions: [
        { question: 'How can AI models reflect bias?', options: ['They intentionally discriminate', "They learn bias from their creators' opinions", 'They can reflect biases present in their training data', 'Bias is not possible in AI'], correct_index: 2, explanation: 'AI models learn patterns from training data, which can include historical biases. Testing with diverse inputs helps catch potential bias.' },
        { question: 'What should you NEVER send to Claude without proper security?', options: ['Code snippets', 'Sensitive personal information like SSNs, passwords, and medical records', 'Public news articles', 'Recipe ingredients'], correct_index: 1, explanation: 'Sensitive personal data should never be sent to any AI without proper security measures and understanding of data retention policies.' },
        { question: 'What should you do when building AI-powered apps for users?', options: ['Hide that AI is involved', 'Claim the AI is human', 'Be transparent that AI is involved and share its limitations', 'Only disclose if legally required'], correct_index: 2, explanation: 'Transparency builds trust. Users should know when AI is involved and understand the limitations of AI-powered features.' },
        { question: "What does 'privacy by default' mean?", options: ['Everything is encrypted', "Users can't see their data", 'Only collect the data you actually need', 'Privacy settings are hidden'], correct_index: 2, explanation: "Privacy by default means designing applications to collect only what's necessary, reducing risk and respecting user privacy." },
        { question: 'Why implement content moderation even though Claude has safety guardrails?', options: ['Guardrails never work', 'Application-level moderation adds another safety layer for edge cases', "It's only needed for social media", 'Claude requires it to function'], correct_index: 1, explanation: "Claude's guardrails handle many cases, but application-level moderation catches edge cases and provides safety tailored to your specific use case." },
      ],
    },
    {
      moduleTitle: 'Practical Safety Guidelines',
      questions: [
        { question: 'What is prompt injection?', options: ['Adding more text to make prompts better', 'When malicious input tries to override your system prompt', "Injecting code into Claude's training", 'A way to make Claude faster'], correct_index: 1, explanation: "Prompt injection is an attack where users try to override system instructions with inputs like 'Ignore all previous instructions and...'" },
        { question: "Why shouldn't you blindly trust Claude's output in production?", options: ['Claude is always wrong', 'Claude can sometimes generate incorrect information or insecure code', 'Output validation is free', "It's a legal requirement in all countries"], correct_index: 1, explanation: 'Claude can produce errors. Production apps should validate code for security issues, verify facts before publishing, and sanitize outputs.' },
        { question: 'What should system prompts clearly define?', options: ["Claude's favorite topics", "What the application should and shouldn't do", "The user's personal preferences", 'Marketing messages'], correct_index: 1, explanation: "System prompts should explicitly define boundaries — allowed actions, off-limits topics, and expected behavior — to keep the application safe." },
        { question: 'What should you create for when your AI application produces harmful output?', options: ['A press release', 'An incident response plan with monitoring, user feedback, and ability to quickly update system prompts', 'A new AI model', 'An apology template'], correct_index: 1, explanation: 'Having a plan for failures — monitoring, feedback mechanisms, and quick update capabilities — is essential for responsible AI deployment.' },
        { question: 'How should you test system prompt boundaries?', options: ['Only test with normal inputs', 'Ask Claude if the boundaries are good', 'Test edge cases and creative inputs to make sure boundaries hold', "Don't test — just deploy and see"], correct_index: 2, explanation: 'Users will try creative and unexpected inputs. Testing edge cases ensures your safety boundaries hold under real-world conditions.' },
      ],
    },

    // === COURSE: Real-World Claude Applications ===
    {
      moduleTitle: 'Content & Writing Applications',
      questions: [
        { question: 'What is the recommended workflow for content generation with Claude?', options: ['Write everything in one prompt', 'Research → Outline → Draft → Refine, with human review between steps', 'Let Claude decide the workflow', 'Copy content from the internet'], correct_index: 1, explanation: 'A step-by-step pipeline with human review between stages produces consistent, high-quality content at scale.' },
        { question: 'What context should you provide when having Claude draft emails?', options: ["Only the recipient's name", 'The relationship, goal, and desired tone', 'Your entire email history', "Just say 'write an email'"], correct_index: 1, explanation: 'Providing relationship context, the goal of the communication, and desired tone helps Claude produce ready-to-send emails.' },
        { question: 'What can Claude maintain across large documentation sets?', options: ["Nothing — each doc is separate", 'Consistent formatting and style', 'Real-time updates', 'Version control'], correct_index: 1, explanation: 'By providing documentation standards as context, Claude can maintain consistent formatting, terminology, and style across large doc sets.' },
        { question: 'What should you provide as context when generating technical docs from code?', options: ['Just the file names', 'The source code and the desired documentation style', 'Only the programming language', 'A link to the repository'], correct_index: 1, explanation: 'Providing the actual source code plus your documentation style guidelines gives Claude everything needed to generate accurate, well-formatted docs.' },
        { question: 'Why add human review between content pipeline steps?', options: ["It's legally required", 'Claude refuses to continue without it', 'It ensures quality and catches issues before they compound in later steps', 'It reduces API costs'], correct_index: 2, explanation: 'Human review between steps catches problems early — a bad outline leads to a bad draft, so reviewing at each stage prevents compounding errors.' },
      ],
    },
    {
      moduleTitle: 'Code & Development Applications',
      questions: [
        { question: 'What should you provide when using Claude as a code reviewer?', options: ['Only the file that changed', "The code plus your team's coding standards", 'Just the error messages', 'A list of all employees'], correct_index: 1, explanation: "Providing your team's coding standards as context lets Claude give tailored reviews that match your team's style and quality expectations." },
        { question: 'What is one thing Claude often catches that humans miss in test generation?', options: ['Typos in variable names', 'Edge cases', 'Missing semicolons', 'File naming conventions'], correct_index: 1, explanation: 'Claude is good at identifying edge cases — unusual inputs, boundary conditions, and error scenarios that developers often overlook.' },
        { question: 'How should you feed legacy code to Claude for modernization?', options: ['Send the entire codebase at once', 'In chunks with clear instructions on what you need', 'Only send the newest files', 'Just describe the code verbally'], correct_index: 1, explanation: 'Feeding legacy code in manageable chunks with specific instructions (explain, document, suggest alternatives) gets the best results.' },
        { question: 'What can Claude help plan for legacy codebases?', options: ['Migration strategies to modern technologies', 'Server hardware purchases', 'Team hiring plans', 'Office layout changes'], correct_index: 0, explanation: 'Claude can analyze legacy code, suggest modern alternatives, and help plan step-by-step migration strategies.' },
        { question: 'What should you specify when asking Claude to generate tests?', options: ['Only the function name', 'The function to test and your testing framework', 'The test deadline', 'How many tests you want'], correct_index: 1, explanation: 'Specifying the function and testing framework (Jest, pytest, etc.) ensures Claude generates tests you can actually run in your project.' },
      ],
    },
    {
      moduleTitle: 'Data & Analysis Applications',
      questions: [
        { question: 'What format should you provide data in when asking Claude to analyze it?', options: ['Screenshots only', 'Structured formats like CSV or JSON', 'As a paragraph description', 'As a PDF chart'], correct_index: 1, explanation: 'Structured formats (CSV, JSON) let Claude parse and analyze data accurately. Unstructured descriptions lead to guesswork.' },
        { question: 'What does Claude excel at when analyzing data?', options: ['Creating live dashboards', 'Connecting to databases directly', 'Finding trends and explaining them in plain language', 'Processing real-time streaming data'], correct_index: 2, explanation: "Claude's strength is pattern recognition in data and translating findings into clear, plain-language insights anyone can understand." },
        { question: 'What should you define when building automated reporting with Claude?', options: ['A report template and the target audience', 'Only the data source', 'The color scheme', 'The printer settings'], correct_index: 0, explanation: "Defining your report template and audience lets Claude populate it with analysis that's tailored to who will read it." },
        { question: 'What should a Claude-powered support system do with complex cases?', options: ['Make them up', 'Ignore them', 'Tell users to call back later', 'Escalate them to human agents'], correct_index: 3, explanation: 'Good support automation handles common questions but escalates complex or sensitive cases to human agents who can provide specialized help.' },
        { question: 'What should you define in the system prompt for a customer support bot?', options: ['Product knowledge base, support policies, and escalation rules', 'Only the company name', 'Competitor information', 'Employee salaries'], correct_index: 0, explanation: 'A comprehensive system prompt with product knowledge, policies, and clear escalation rules ensures consistent, helpful support responses.' },
      ],
    },
  ]

  // --- INSERT QUESTIONS ---
  console.log('Inserting quiz questions...')
  const allRows = []

  for (const entry of quizData) {
    const moduleId = modByTitle[entry.moduleTitle]
    if (!moduleId) {
      console.warn(`Module not found: "${entry.moduleTitle}" — skipping`)
      continue
    }
    for (let i = 0; i < entry.questions.length; i++) {
      const q = entry.questions[i]
      allRows.push({
        id: crypto.randomUUID(),
        module_id: moduleId,
        question: q.question,
        options: q.options,
        correct_index: q.correct_index,
        explanation: q.explanation,
        sort_order: i + 1,
      })
    }
  }

  const { error: insertError } = await supabase.from('quiz_questions').insert(allRows)
  if (insertError) { console.error('Error inserting quiz questions:', insertError); throw insertError }

  const modulesWithQuestions = new Set(allRows.map((r) => r.module_id)).size
  const summary = { modules: modulesWithQuestions, questions: allRows.length }
  console.log('Quiz seeding complete!', summary)
  return summary
}
