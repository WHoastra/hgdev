import { supabase } from './supabase'

export async function seedAllCourses() {
  // --- DELETE EXISTING DATA ---
  console.log('Clearing existing data...')

  const { error: delProgress } = await supabase.from('progress').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (delProgress) { console.error('Error deleting progress:', delProgress); throw delProgress }

  const { error: delLessons } = await supabase.from('lessons').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (delLessons) { console.error('Error deleting lessons:', delLessons); throw delLessons }

  const { error: delModules } = await supabase.from('modules').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (delModules) { console.error('Error deleting modules:', delModules); throw delModules }

  const { error: delCourses } = await supabase.from('courses').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (delCourses) { console.error('Error deleting courses:', delCourses); throw delCourses }

  console.log('Existing data cleared.')

  // --- COURSE DATA ---
  const coursesData = [
    {
      id: crypto.randomUUID(),
      title: 'Prompt Engineering Fundamentals',
      category: 'Prompt Engineering',
      difficulty: 'beginner',
      description: 'Master the basics of writing effective prompts for Claude. Learn how to communicate clearly with AI to get the results you need.',
      modules: [
        {
          title: 'Understanding Claude',
          description: null,
          sort_order: 1,
          lessons: [
            { title: 'What is Claude?', sort_order: 1, content: 'Claude is an AI assistant built by Anthropic. It\'s designed to be helpful, harmless, and honest. Unlike simple chatbots, Claude can understand complex instructions, maintain context across long conversations, and help with tasks ranging from writing to coding to analysis. Claude comes in different model sizes optimized for different use cases.' },
            { title: 'How Claude Thinks', sort_order: 2, content: 'Claude processes your input as a sequence of tokens and generates responses based on patterns learned during training. It doesn\'t have memory between conversations unless given context. Understanding this helps you write better prompts — Claude only knows what you tell it in the current conversation.' },
            { title: 'Claude\'s Capabilities and Limits', sort_order: 3, content: 'Claude can write, analyze, code, summarize, translate, brainstorm, and reason through problems. However, it can\'t browse the internet in its base form, doesn\'t retain memory between sessions, and can sometimes generate incorrect information confidently. Knowing the boundaries helps you use it effectively.' },
          ],
        },
        {
          title: 'Writing Your First Prompts',
          description: null,
          sort_order: 2,
          lessons: [
            { title: 'Anatomy of a Good Prompt', sort_order: 1, content: 'A good prompt has three parts: context (background info), instruction (what you want), and format (how you want the output). Example: Instead of \'Write about dogs\' try \'Write a 200-word blog post about the top 3 benefits of adopting a rescue dog, using a friendly tone.\'' },
            { title: 'Being Specific vs. Being Vague', sort_order: 2, content: 'Vague prompts get vague results. Compare \'Help me with my resume\' vs \'Review my resume for a junior React developer position. Check for: relevant skills, clear formatting, and any grammar issues. Suggest 3 specific improvements.\' Specificity is the single biggest improvement most people can make.' },
            { title: 'Providing Context', sort_order: 3, content: 'Context is everything Claude doesn\'t know about your situation. Who are you? What\'s the goal? Who\'s the audience? What\'s been tried before? The more relevant context you provide, the better Claude can tailor its response to your exact needs.' },
            { title: 'Specifying Output Format', sort_order: 4, content: 'Tell Claude exactly how you want the answer delivered. Want bullet points? A table? JSON? A numbered list? A specific word count? Don\'t make Claude guess — state the format explicitly and you\'ll get consistent, usable results every time.' },
          ],
        },
        {
          title: 'Common Prompting Mistakes',
          description: null,
          sort_order: 3,
          lessons: [
            { title: 'The "Just Do It" Trap', sort_order: 1, content: 'Jumping straight to \'Write me a business plan\' without any context leads to generic output. Always invest a few sentences setting up who you are, what the business is, and what you need the plan for. A little setup goes a long way.' },
            { title: 'Overloading a Single Prompt', sort_order: 2, content: 'Asking Claude to do 10 things in one prompt usually means none of them get done well. Break complex tasks into steps. First outline, then draft, then refine. Each step gets Claude\'s full attention.' },
            { title: 'Not Iterating', sort_order: 3, content: 'Your first prompt rarely gives the perfect result. Treat it as a conversation. Ask Claude to revise, adjust tone, add detail, or try a different approach. The magic is in the follow-up.' },
          ],
        },
      ],
    },
    {
      id: crypto.randomUUID(),
      title: 'Advanced Prompt Techniques',
      category: 'Prompt Engineering',
      difficulty: 'intermediate',
      description: 'Take your prompting skills to the next level with proven techniques used by professional AI engineers.',
      modules: [
        {
          title: 'Structured Prompting',
          description: null,
          sort_order: 1,
          lessons: [
            { title: 'Using XML Tags', sort_order: 1, content: 'XML tags like <context>, <instructions>, and <format> help organize complex prompts. Claude is trained to recognize these structures. Wrapping sections in tags makes long prompts clearer and helps Claude parse your intent accurately.' },
            { title: 'Role Prompting', sort_order: 2, content: 'Telling Claude to act as a specific role (e.g., \'You are a senior code reviewer\') frames its entire response. The role sets the tone, expertise level, and perspective. Combine roles with specific tasks for powerful results.' },
            { title: 'System Prompts', sort_order: 3, content: 'System prompts set the overall behavior for Claude across an entire conversation. They\'re like a job description — defining personality, rules, and boundaries before any user interaction begins. Essential for building apps on Claude.' },
          ],
        },
        {
          title: 'Advanced Techniques',
          description: null,
          sort_order: 2,
          lessons: [
            { title: 'Chain-of-Thought Prompting', sort_order: 1, content: 'Asking Claude to \'think step by step\' or \'show your reasoning\' dramatically improves accuracy on complex problems. This works because it forces Claude to process each logical step rather than jumping to a conclusion.' },
            { title: 'Few-Shot Prompting', sort_order: 2, content: 'Providing 2-3 examples of the input/output pattern you want teaches Claude exactly what you expect. Instead of describing the format, show it. Few-shot examples are one of the most reliable techniques for consistent output.' },
            { title: 'Prompt Chaining', sort_order: 3, content: 'Breaking a big task into a sequence of smaller prompts where each step feeds into the next. Example: Step 1 — research a topic, Step 2 — create an outline from that research, Step 3 — write a draft from that outline. Each step gets focused attention.' },
            { title: 'Self-Reflection Prompting', sort_order: 4, content: 'Asking Claude to review and critique its own output before giving you the final answer. Prompts like \'Now review your answer for accuracy and completeness, then give me an improved version\' can significantly boost quality.' },
          ],
        },
        {
          title: 'Prompting for Different Tasks',
          description: null,
          sort_order: 3,
          lessons: [
            { title: 'Prompting for Code', sort_order: 1, content: 'When asking Claude to write code, specify the language, framework, coding style, and whether you want comments. Provide existing code as context. Ask Claude to explain its approach before writing. Always request error handling.' },
            { title: 'Prompting for Writing', sort_order: 2, content: 'For writing tasks, define the audience, tone, length, and purpose. Provide examples of the style you like. Ask for outlines first on long pieces. Use follow-ups to refine voice and adjust specific sections.' },
            { title: 'Prompting for Analysis', sort_order: 3, content: 'When giving Claude data or documents to analyze, be specific about what you\'re looking for. \'Analyze this data\' is weak. \'Identify the top 3 trends, any outliers, and give me a summary I can present to my team\' is strong.' },
            { title: 'Prompting for Learning', sort_order: 4, content: 'Claude is an incredible tutor. Ask it to explain concepts at your level, give analogies, create practice problems, quiz you, and identify gaps in your understanding. Use \'Explain like I\'m a beginner\' or \'I understand X but not Y\' for tailored explanations.' },
          ],
        },
      ],
    },
    {
      id: crypto.randomUUID(),
      title: 'Claude API & Tool Use',
      category: 'Development',
      difficulty: 'intermediate',
      description: 'Learn to build applications powered by Claude using the Anthropic API. From your first API call to advanced tool use and function calling.',
      modules: [
        {
          title: 'Getting Started with the API',
          description: null,
          sort_order: 1,
          lessons: [
            { title: 'API Overview', sort_order: 1, content: 'The Anthropic API lets you integrate Claude into your own applications. You send messages to Claude programmatically and receive responses. It uses a simple REST interface with JSON payloads. You\'ll need an API key from the Anthropic console to get started.' },
            { title: 'Your First API Call', sort_order: 2, content: 'A basic API call sends a POST request to the messages endpoint with your model choice, max tokens, and a messages array. The response contains Claude\'s reply in a structured format. Start with the Python or JavaScript SDK for the simplest setup.' },
            { title: 'Understanding Models', sort_order: 3, content: 'Anthropic offers different Claude models: Opus (most capable), Sonnet (balanced), and Haiku (fastest and cheapest). Choose based on your task complexity, speed needs, and budget. Most applications work great with Sonnet.' },
            { title: 'API Parameters', sort_order: 4, content: 'Key parameters include: model (which Claude), max_tokens (response length limit), temperature (creativity vs consistency), system (system prompt), and messages (the conversation). Understanding these gives you fine control over Claude\'s behavior.' },
          ],
        },
        {
          title: 'Building with the API',
          description: null,
          sort_order: 2,
          lessons: [
            { title: 'Conversation Management', sort_order: 1, content: 'Claude doesn\'t remember previous API calls. To maintain a conversation, you send the full message history with each request. This means managing a messages array in your application that grows as the conversation continues.' },
            { title: 'Streaming Responses', sort_order: 2, content: 'Instead of waiting for Claude\'s full response, streaming delivers it token by token in real-time. This creates a much better user experience for chat interfaces. Both the Python and JavaScript SDKs support streaming with simple configuration.' },
            { title: 'Error Handling & Rate Limits', sort_order: 3, content: 'Production apps need to handle API errors gracefully: rate limits (429), overloaded errors (529), and invalid requests (400). Implement retry logic with exponential backoff. Monitor your usage in the Anthropic console.' },
            { title: 'Cost Optimization', sort_order: 4, content: 'API costs are based on input and output tokens. Strategies to reduce costs: use smaller models when possible, limit max_tokens, cache common responses, truncate unnecessary conversation history, and batch related queries.' },
          ],
        },
        {
          title: 'Tool Use & Function Calling',
          description: null,
          sort_order: 3,
          lessons: [
            { title: 'What is Tool Use?', sort_order: 1, content: 'Tool use lets Claude call functions you define. Instead of just generating text, Claude can decide to use a tool (like searching a database or calling an API), receive the result, and incorporate it into its response. This bridges AI and real-world actions.' },
            { title: 'Defining Tools', sort_order: 2, content: 'You define tools as JSON schemas describing the function name, description, and parameters. Claude reads these definitions and decides when to use them based on the conversation. Good tool descriptions are critical — they\'re like prompts for tool selection.' },
            { title: 'Handling Tool Results', sort_order: 3, content: 'When Claude decides to use a tool, your application executes the actual function, then sends the result back to Claude. Claude processes the result and generates a final response. This creates a powerful loop of AI reasoning plus real-world data.' },
            { title: 'Multi-Tool Workflows', sort_order: 4, content: 'Advanced applications give Claude access to multiple tools. Claude can chain tool calls together — search a database, then send an email, then update a record. Careful tool design and clear descriptions help Claude orchestrate complex workflows.' },
          ],
        },
      ],
    },
    {
      id: crypto.randomUUID(),
      title: 'Building Agentic Applications',
      category: 'Development',
      difficulty: 'advanced',
      description: 'Build autonomous AI agents that can plan, reason, and execute multi-step tasks using Claude. Learn agentic design patterns and the Model Context Protocol.',
      modules: [
        {
          title: 'Agentic Fundamentals',
          description: null,
          sort_order: 1,
          lessons: [
            { title: 'What are AI Agents?', sort_order: 1, content: 'An AI agent is a system where Claude operates in a loop: it observes, thinks, acts, and repeats. Unlike simple question-answer interactions, agents can plan multi-step tasks, use tools, handle errors, and work toward a goal autonomously.' },
            { title: 'Agent Architecture Patterns', sort_order: 2, content: 'Common patterns include: simple tool-use loops, ReAct (Reason + Act), plan-then-execute, and multi-agent systems. Each pattern suits different complexity levels. Start with simple loops and graduate to more complex architectures as needed.' },
            { title: 'Planning and Reasoning', sort_order: 3, content: 'Effective agents break big tasks into smaller steps before executing. Prompt Claude to create a plan first, then execute each step. Include checkpoints where Claude evaluates progress and adjusts the plan if needed.' },
          ],
        },
        {
          title: 'Model Context Protocol (MCP)',
          description: null,
          sort_order: 2,
          lessons: [
            { title: 'What is MCP?', sort_order: 1, content: 'The Model Context Protocol is an open standard created by Anthropic for connecting AI models to external data sources and tools. Think of it as a universal adapter — one protocol that lets Claude connect to any compatible service: databases, APIs, file systems, and more.' },
            { title: 'MCP Architecture', sort_order: 2, content: 'MCP uses a client-server model. Your AI application is the client, and each data source or tool runs an MCP server. The protocol standardizes how tools are discovered, called, and how results are returned. This makes integrations modular and reusable.' },
            { title: 'Building MCP Servers', sort_order: 3, content: 'An MCP server exposes tools and resources that Claude can use. You define what operations are available, their parameters, and what they return. Servers can be built in Python or TypeScript using Anthropic\'s SDK. Each server typically wraps one external service.' },
            { title: 'MCP in Production', sort_order: 4, content: 'Production MCP deployments need authentication, error handling, logging, and security boundaries. Consider which tools an agent should have access to and implement proper permissions. MCP servers can be shared across multiple applications.' },
          ],
        },
        {
          title: 'Advanced Agent Patterns',
          description: null,
          sort_order: 3,
          lessons: [
            { title: 'Error Recovery', sort_order: 1, content: 'Agents will encounter failures: API errors, unexpected data, wrong tool choices. Build in retry logic, fallback strategies, and the ability for Claude to recognize and recover from mistakes. Robust error handling separates toy agents from production ones.' },
            { title: 'Human-in-the-Loop', sort_order: 2, content: 'Not every action should be autonomous. Design agents with confirmation steps for high-risk actions (sending emails, making purchases, deleting data). Let Claude handle the thinking and preparation, but keep humans in control of critical decisions.' },
            { title: 'Multi-Agent Systems', sort_order: 3, content: 'Complex tasks can be split across multiple specialized agents. One agent researches, another writes, another reviews. They communicate through structured outputs. This mirrors how human teams work and can produce higher quality results.' },
            { title: 'Evaluating Agent Performance', sort_order: 4, content: 'Measure your agents on: task completion rate, accuracy, efficiency (steps taken), cost per task, and error rate. Build evaluation datasets and run your agent against them regularly. Continuous evaluation is how you improve agent reliability.' },
          ],
        },
      ],
    },
    {
      id: crypto.randomUUID(),
      title: 'Safety & Responsible AI',
      category: 'AI Safety',
      difficulty: 'beginner',
      description: 'Understand Anthropic\'s approach to AI safety and learn how to use Claude responsibly. Essential knowledge for every developer building with AI.',
      modules: [
        {
          title: 'Anthropic\'s Approach to Safety',
          description: null,
          sort_order: 1,
          lessons: [
            { title: 'Why AI Safety Matters', sort_order: 1, content: 'As AI systems become more capable, ensuring they\'re safe and beneficial becomes critical. Poorly designed AI can amplify biases, spread misinformation, or be used for harm. Anthropic was founded specifically to build AI that\'s safe and beneficial for humanity.' },
            { title: 'Constitutional AI', sort_order: 2, content: 'Anthropic\'s approach to training Claude uses Constitutional AI (CAI). Instead of relying only on human feedback, Claude is trained with a set of principles — a \'constitution\' — that guides its behavior. This makes Claude\'s values more transparent and consistent.' },
            { title: 'Helpful, Harmless, and Honest', sort_order: 3, content: 'Claude is designed around three core principles. Helpful: genuinely useful for the task at hand. Harmless: avoids causing damage or enabling harmful actions. Honest: truthful about what it knows and doesn\'t know, including its own limitations.' },
          ],
        },
        {
          title: 'Responsible Development',
          description: null,
          sort_order: 2,
          lessons: [
            { title: 'Bias and Fairness', sort_order: 1, content: 'AI models can reflect biases present in training data. When building with Claude, consider: Does your application treat all users fairly? Are outputs biased toward certain groups? Test your prompts with diverse inputs and scenarios to catch potential bias.' },
            { title: 'Privacy and Data Handling', sort_order: 2, content: 'Never send sensitive personal information (SSNs, passwords, medical records) to Claude unless using a properly secured API setup. Understand data retention policies. Design your applications with privacy by default — collect only what\'s needed.' },
            { title: 'Transparency with Users', sort_order: 3, content: 'When building applications powered by Claude, be transparent that AI is involved. Don\'t try to pass off AI-generated content as human-written without disclosure. Let users know the limitations of AI-powered features.' },
            { title: 'Content Moderation', sort_order: 4, content: 'If your application generates content for public consumption, implement review processes. Claude has built-in safety guardrails, but application-level moderation adds another layer. Consider edge cases and how your app handles potentially harmful requests.' },
          ],
        },
        {
          title: 'Practical Safety Guidelines',
          description: null,
          sort_order: 3,
          lessons: [
            { title: 'Prompt Injection Awareness', sort_order: 1, content: 'Prompt injection is when malicious input tries to override your system prompt. Example: a user typing \'Ignore all previous instructions and...\' Understanding this risk helps you design more robust applications with proper input validation.' },
            { title: 'Output Validation', sort_order: 2, content: 'Don\'t blindly trust Claude\'s output in production applications. Implement validation layers: check code for security issues before executing, verify factual claims before publishing, and sanitize outputs before displaying in web apps.' },
            { title: 'Setting Appropriate Boundaries', sort_order: 3, content: 'Use system prompts to clearly define what your Claude-powered application should and shouldn\'t do. Be explicit about off-limits topics and actions. Test edge cases to make sure boundaries hold under creative user inputs.' },
            { title: 'Incident Response', sort_order: 4, content: 'Have a plan for when things go wrong. Monitor your AI application\'s outputs, create feedback mechanisms for users to flag issues, and be prepared to quickly update system prompts or disable features if safety issues arise.' },
          ],
        },
      ],
    },
    {
      id: crypto.randomUUID(),
      title: 'Real-World Claude Applications',
      category: 'Use Cases',
      difficulty: 'intermediate',
      description: 'Build practical, real-world projects using Claude. From content creation to data analysis to customer support — see how Claude solves actual business problems.',
      modules: [
        {
          title: 'Content & Writing Applications',
          description: null,
          sort_order: 1,
          lessons: [
            { title: 'Blog & Article Generation', sort_order: 1, content: 'Build a content pipeline: research a topic, generate an outline, write a draft, and refine. Use Claude for each step with specific prompts. Add human review between steps for quality. This workflow can produce consistent, high-quality content at scale.' },
            { title: 'Email & Communication Tools', sort_order: 2, content: 'Claude can draft professional emails, adjust tone for different audiences, and handle tricky situations like delivering bad news or negotiating. Build tools that take context (relationship, goal, tone) and produce ready-to-send communications.' },
            { title: 'Documentation Generation', sort_order: 3, content: 'Use Claude to generate technical documentation, API docs, user guides, and README files from code. Provide the source code as context and specify the documentation style. Claude can maintain consistent formatting across large documentation sets.' },
          ],
        },
        {
          title: 'Code & Development Applications',
          description: null,
          sort_order: 2,
          lessons: [
            { title: 'Code Review Assistant', sort_order: 1, content: 'Build a tool where Claude reviews pull requests or code snippets. It can catch bugs, suggest improvements, identify security issues, and ensure style consistency. Provide your team\'s coding standards as context for tailored reviews.' },
            { title: 'Test Generation', sort_order: 2, content: 'Claude can generate unit tests, integration tests, and edge case scenarios from your source code. Provide the function to test and specify your testing framework. Claude identifies edge cases humans often miss.' },
            { title: 'Legacy Code Modernization', sort_order: 3, content: 'Use Claude to understand, document, and modernize legacy codebases. It can explain unfamiliar code, suggest modern alternatives, and help plan migration strategies. Feed it code in chunks with clear instructions on what you need.' },
          ],
        },
        {
          title: 'Data & Analysis Applications',
          description: null,
          sort_order: 3,
          lessons: [
            { title: 'Data Analysis Workflows', sort_order: 1, content: 'Claude can analyze datasets, identify patterns, generate insights, and create summaries. Provide data in structured formats (CSV, JSON) with clear analysis questions. Claude excels at finding trends and explaining them in plain language.' },
            { title: 'Report Generation', sort_order: 2, content: 'Build automated reporting that takes raw data and produces formatted reports with insights, charts recommendations, and executive summaries. Define your report template and let Claude populate it with analysis tailored to your audience.' },
            { title: 'Customer Support Automation', sort_order: 3, content: 'Build support systems where Claude handles common questions, troubleshoots issues, and escalates complex cases to humans. Use system prompts to define your product knowledge base, support policies, and escalation rules.' },
          ],
        },
      ],
    },
  ]

  // --- INSERT COURSES ---
  console.log('Seeding courses...')
  const courseRows = coursesData.map(({ id, title, category, difficulty, description }) => ({
    id, title, category, difficulty, description,
  }))

  const { error: courseError } = await supabase.from('courses').insert(courseRows)
  if (courseError) { console.error('Error inserting courses:', courseError); throw courseError }

  // --- INSERT MODULES ---
  console.log('Inserting modules...')
  const moduleRows = []
  const moduleLookup = []

  for (const course of coursesData) {
    for (const mod of course.modules) {
      const moduleId = crypto.randomUUID()
      moduleRows.push({
        id: moduleId,
        course_id: course.id,
        title: mod.title,
        description: mod.description,
        sort_order: mod.sort_order,
      })
      moduleLookup.push({ moduleId, lessons: mod.lessons })
    }
  }

  const { error: moduleError } = await supabase.from('modules').insert(moduleRows)
  if (moduleError) { console.error('Error inserting modules:', moduleError); throw moduleError }

  // --- INSERT LESSONS ---
  console.log('Inserting lessons...')
  const lessonRows = []

  for (const { moduleId, lessons } of moduleLookup) {
    for (const lesson of lessons) {
      lessonRows.push({
        id: crypto.randomUUID(),
        module_id: moduleId,
        title: lesson.title,
        content: lesson.content,
        sort_order: lesson.sort_order,
      })
    }
  }

  const { error: lessonError } = await supabase.from('lessons').insert(lessonRows)
  if (lessonError) { console.error('Error inserting lessons:', lessonError); throw lessonError }

  // --- INSERT PROGRESS ---
  console.log('Creating progress records...')
  const progressRows = lessonRows.map((lesson) => ({
    id: crypto.randomUUID(),
    lesson_id: lesson.id,
    status: 'not_started',
  }))

  const { error: progressError } = await supabase.from('progress').insert(progressRows)
  if (progressError) { console.error('Error inserting progress:', progressError); throw progressError }

  const summary = {
    courses: courseRows.length,
    modules: moduleRows.length,
    lessons: lessonRows.length,
  }

  console.log('Seeding complete!', summary)
  return summary
}
