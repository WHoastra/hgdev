import { supabase } from './supabase'

export async function seedDatabase() {
  // Check if data already exists
  const { data: existing } = await supabase
    .from('courses')
    .select('id')
    .eq('title', 'Intro to Prompt Engineering with Claude')
    .limit(1)

  if (existing && existing.length > 0) {
    return { success: false, message: 'Seed data already exists.' }
  }

  // Insert course
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .insert({
      title: 'Intro to Prompt Engineering with Claude',
      description:
        'Learn the fundamentals of prompt engineering using Claude AI. This beginner-friendly course covers everything from writing your first prompt to advanced techniques like chain-of-thought reasoning.',
      category: 'Prompt Engineering',
      difficulty: 'beginner',
    })
    .select()
    .single()

  if (courseError) throw courseError

  // Insert modules
  const { data: modules, error: modulesError } = await supabase
    .from('modules')
    .insert([
      {
        course_id: course.id,
        title: 'Getting Started with Claude',
        description:
          'An introduction to Claude AI and the basics of interacting with it.',
        sort_order: 1,
      },
      {
        course_id: course.id,
        title: 'Prompt Techniques',
        description:
          'Learn specific techniques to get better results from your prompts.',
        sort_order: 2,
      },
    ])
    .select()
    .order('sort_order')

  if (modulesError) throw modulesError

  const [module1, module2] = modules

  // Insert lessons
  const { data: lessons, error: lessonsError } = await supabase
    .from('lessons')
    .insert([
      {
        module_id: module1.id,
        title: 'What is Claude?',
        content:
          'Claude is an AI assistant built by Anthropic. It is designed to be helpful, harmless, and honest. Claude can assist with writing, analysis, coding, math, and much more. In this lesson, we explore what makes Claude different from other AI models and how it can be used as a learning tool.',
        sort_order: 1,
      },
      {
        module_id: module1.id,
        title: 'Your First Prompt',
        content:
          'A prompt is the text you send to Claude to get a response. Writing a good prompt is like giving clear directions — the more specific you are, the better the result. In this lesson, you will write your first prompt and observe how Claude responds to different levels of detail.',
        sort_order: 2,
      },
      {
        module_id: module1.id,
        title: 'Understanding Responses',
        content:
          'Not all AI responses are created equal. Learning to evaluate Claude\'s output is a critical skill. In this lesson, we cover how to judge whether a response is accurate, complete, and useful — and what to do when it falls short.',
        sort_order: 3,
      },
      {
        module_id: module2.id,
        title: 'Clear Instructions',
        content:
          'Vague prompts produce vague answers. This lesson focuses on writing prompts with clear, specific instructions. You will learn techniques like stating the desired format, specifying the audience, and breaking complex requests into smaller parts.',
        sort_order: 1,
      },
      {
        module_id: module2.id,
        title: 'Using Examples',
        content:
          'Few-shot prompting is a technique where you provide examples of the input and output you expect. This helps Claude understand the pattern you want it to follow. In this lesson, we practice crafting prompts with one, two, and several examples.',
        sort_order: 2,
      },
      {
        module_id: module2.id,
        title: 'Step-by-Step Reasoning',
        content:
          'Chain-of-thought prompting asks Claude to show its reasoning step by step before giving a final answer. This technique improves accuracy on complex tasks like math, logic, and multi-part questions. In this lesson, you will learn when and how to use it effectively.',
        sort_order: 3,
      },
    ])
    .select()

  if (lessonsError) throw lessonsError

  // Insert progress records for each lesson
  const progressRecords = lessons.map((lesson) => ({
    lesson_id: lesson.id,
    status: 'not_started',
  }))

  const { error: progressError } = await supabase
    .from('progress')
    .insert(progressRecords)

  if (progressError) throw progressError

  return { success: true, message: 'Seed data inserted successfully!' }
}
