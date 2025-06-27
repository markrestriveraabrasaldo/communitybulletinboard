# How to Use This Project Memory with Claude

To get the best results from Claude for our project, follow this process:

1.  **Identify your task.** (e.g., "I need to build the component for creating a new post.")
2.  **Gather the necessary context.** Open the relevant files from this folder. For the example task, you would need `01_PROJECT_OVERVIEW.md`, `03_DATABASE_SCHEMA.md` (specifically the 'posts' table), and maybe `02_FEATURES_ROADMAP.md` (to see the requirements for the post creation form).
3.  **Construct your prompt.** Start your message to Claude by providing the context first, clearly labeled.
4.  **Ask your question.** After the context, write your specific request.

**Example Prompt Structure:**

"Hello Claude. I'm working on our community bulletin board app. Here is the relevant context from our project memory files.

--- CONTEXT FROM 01_PROJECT_OVERVIEW.md ---
[...copy-paste the content of the overview file...]

--- CONTEXT FROM 03_DATABASE_SCHEMA.md ---
[...copy-paste the SQL for the 'posts' and 'categories' tables...]

--- MY QUESTION ---
Based on the context above, please write the Next.js code for a React component named `CreatePostForm.js`. It should be a form that allows a user to create a new post. The form needs fields for a title, a description (textarea), and a dropdown to select a category. When submitted, it should call a function to save this data to our Supabase `posts` table."
