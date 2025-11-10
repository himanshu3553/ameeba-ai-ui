# Ameba UI

A ReactJS web application for managing projects, prompts, and prompt versions with a Bootstrap 5 interface.

## Features

- **Project Management**: Create, view, edit, and delete projects
- **Prompt Management**: Manage prompts under projects
- **Version Management**: Create and manage multiple versions of prompts with active version tracking
- **Modern UI**: Clean Bootstrap 5 interface with responsive design
- **Error Handling**: Comprehensive error handling and user feedback
- **Loading States**: Visual feedback during API operations

## Technology Stack

- React 18.2.0 (Functional components with hooks)
- React Router 6.20.0 (Client-side routing)
- Bootstrap 5.3.2 (Styling and responsive design)
- Axios 1.6.2 (HTTP client for API calls)
- Vite 5.0.8 (Build tool and dev server)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running on `http://localhost:3000`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
  components/
    Project/
      ProjectList.jsx      # List all projects
      ProjectCard.jsx       # Project card component
      ProjectForm.jsx       # Create/Edit project form
      ProjectDetail.jsx     # Project detail page
    Prompt/
      PromptList.jsx        # List prompts for a project
      PromptCard.jsx        # Prompt card component
      PromptForm.jsx        # Create/Edit prompt form
      PromptDetail.jsx      # Prompt detail page
    PromptVersion/
      VersionList.jsx       # List versions for a prompt
      VersionCard.jsx       # Version card component
      VersionForm.jsx       # Create/Edit version form
      VersionDetail.jsx     # Version detail page
    Common/
      Loading.jsx           # Loading spinner component
      ErrorMessage.jsx      # Error message component
      Breadcrumb.jsx        # Breadcrumb navigation
  services/
    api.js                  # API service layer
  utils/
    formatDate.js           # Date formatting utilities
    toast.js                # Toast notification system
  App.jsx                   # Main app component with routing
  index.jsx                 # Application entry point
```

## API Configuration

The API base URL is configured in `src/services/api.js`. By default, it's set to `http://localhost:3000`.

To change the API URL, update the `API_BASE_URL` constant in `src/services/api.js`.

## Features Overview

### Projects
- View all projects in a grid layout
- Create new projects with name and active status
- Edit project details
- Soft delete projects (sets isActive to false)
- Navigate to project detail page to manage prompts

### Prompts
- View all prompts for a project
- Create new prompts under a project
- Edit prompt details
- Soft delete prompts
- Navigate to prompt detail page to manage versions

### Prompt Versions
- View all versions for a prompt
- See active version highlighted
- Create new versions with prompt text
- Set active prompt version (automatically deactivates others)
- Edit version details including prompt text and active status
- Soft delete versions

## UI/UX Features

- **Breadcrumb Navigation**: Easy navigation between projects, prompts, and versions
- **Loading States**: Spinner indicators during API calls
- **Error Handling**: User-friendly error messages with retry options
- **Toast Notifications**: Success and error notifications
- **Confirmation Dialogs**: Delete confirmation modals
- **Responsive Design**: Mobile-friendly Bootstrap layout
- **Empty States**: Helpful messages when no data is available
- **Form Validation**: Client-side validation with error messages
- **Status Badges**: Visual indicators for active/inactive status

## API Endpoints

The application uses the following API endpoints (see `API_DOCUMENTATION.txt` for details):

### Projects
- `GET /api/project/getProjects` - List all projects
- `GET /api/project/:id` - Get project by ID
- `POST /api/project/create` - Create new project
- `PUT /api/project/:id` - Update project
- `DELETE /api/project/:id` - Delete project (soft delete)

### Prompts
- `GET /api/projects/:projectId/prompts` - List prompts for a project
- `GET /api/prompt/:id` - Get prompt by ID
- `POST /api/projects/:projectId/prompt/create` - Create new prompt
- `PUT /api/prompt/:id` - Update prompt
- `DELETE /api/prompt/:id` - Delete prompt (soft delete)

### Prompt Versions
- `GET /api/prompts/:promptId/versions` - List versions for a prompt
- `GET /api/prompts/:promptId/active` - Get active version
- `GET /api/prompt-versions/:id` - Get version by ID
- `POST /api/prompts/:promptId/version/create` - Create new version
- `PUT /api/prompt-versions/:id` - Update version
- `DELETE /api/prompt-versions/:id` - Delete version (soft delete)

## License

This project is private and proprietary.

