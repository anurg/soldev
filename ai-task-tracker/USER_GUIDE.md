# AI Task Tracker - User Guide

## How to Use the Application

### 1. **Dashboard** (Home Page)
- View metrics: Total Projects, Pending Tasks, Completed Tasks
- See Recent Projects and Recent Tasks
- Click "New Project" button to go to Projects page

### 2. **Creating Projects**

**Step 1:** Go to **Projects** page (from sidebar or Dashboard button)

**Step 2:** Click **"New Project"** button (green button with + icon)

**Step 3:** Fill in the form:
- **Name**: Enter project name (required)
- **Description**: Enter project description (optional)

**Step 4:** Click **"Create Project"**

**Result:** Project is created and appears in the projects list

### 3. **Viewing Project Tasks (Kanban Board)**

**Step 1:** Click on any project card (the entire card is clickable)

**Step 2:** You'll see the Kanban board with 3 columns:
- **To Do** - Tasks that haven't started
- **In Progress** - Tasks being worked on
- **Done** - Completed tasks

### 4. **Creating Tasks**

**Step 1:** Open a project (click on project card)

**Step 2:** Click **"New Task"** button (green button with + icon)

**Step 3:** Fill in the form:
- **Title**: Task name (required)
- **Description**: Task details (optional)
- **Priority**: Select priority level (low, medium, high, urgent)
- **Status**: Select initial status (todo, in_progress, done)

**Step 4:** Click **"Create Task"**

**Result:** Task appears in the appropriate Kanban column based on its status

### 5. **Managing Tasks**

#### Subtasks
- You can add subtasks to any task using the **New Task** button in the Subtasks section.
- Subtasks are now fully featured tasks with their own description, priority, assignee, and status.
- Click on a subtask to view its full details.

#### Edit Task
- Click the **Edit** button (pencil icon) next to the task title.
- Update the Title and Description in the dialog.
- Click **Save Changes**.

#### Track Progress
- Use the **Progress Slider** to update task completion percentage (0-100%)
- Progress is saved automatically

#### Assign Tasks
- Use the **Assignee Dropdown** to assign the task to a team member
- Select "Unassigned" to remove assignment

#### Change Task Status
- On task detail page, use the status dropdown to change status
- Task will move to the appropriate Kanban column

#### Add Subtasks
- On task detail page, type subtask name in the input field
- Click "Add" button
- Click on subtask to mark as complete/incomplete

### 6. **Teams Management**

**Step 1:** Go to **Teams** page from sidebar

**Step 2:** Click **"New Team"** button to create a team

**Step 3:** Manage Members:
- **Add Member**: Click "Add Member" button on the team card, enter email, and click Add.
- **Remove Member**: Click the trash icon (red) next to a member's name.

**Note:** Projects are automatically associated with teams. When you create a project, it uses your first team or creates a default "My Team" if none exists.

### 7. **My Tasks Page**

- View all tasks assigned to you
- Filter by status
- Quick access to your work items

## Quick Workflow Summary

```
1. Create Team & Add Members (Teams page)
   ↓
2. Create Project (Projects page)
   ↓
3. Create Tasks (Inside Project)
   ↓
4. Assign Tasks & Set Progress (Task Details)
   ↓
5. Track Work (Dashboard)
```

## Tips

- **Projects are clickable**: Click anywhere on a project card to open it
- **Task status changes**: Use the dropdown on task detail page to move tasks between columns
- **Subtasks**: Break down complex tasks into smaller subtasks
- **Dashboard**: Quick overview of all your work
- **Teams**: Organize projects by team for better collaboration

## Common Actions

| Action | Where to Go | What to Click |
|--------|-------------|---------------|
| Create Project | Projects page | "New Project" button |
| View Tasks | Projects page | Click on any project card |
| Create Task | Inside a project | "New Task" button |
| Change Task Status | Task detail page | Status dropdown |
| Set Progress | Task detail page | Progress slider |
| Assign Member | Task detail page | Assignee dropdown |
| Add Team Member | Teams page | "Add Member" button |
| View Metrics | Dashboard | Automatic display |

## Navigation

- **Sidebar**: Main navigation menu
  - Dashboard
  - Projects
  - Tasks (My Tasks)
  - Teams
- **Breadcrumbs**: Use browser back button or sidebar to navigate
- **Cards**: Most cards are clickable to view details
