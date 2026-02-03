# TeamSync

A full-stack team meeting management platform for tracking objectives, agenda items, and meeting history. Built for collaborative teams to maintain alignment and accountability.

## Features

- **JWT Authentication** with role-based access control (Admin/Coach/Member)
- **Team & Member Management** with role assignments
- **Meeting Objectives** with visual status tracking (Red/Yellow/Green)
  - Defining objectives
  - Standard operating objectives
  - Rich text descriptions
- **Agenda Items** with completion tracking and decision notes
- **Rich Text Editing** for strategic topics, cascading communications, and whiteboard notes
- **Meeting History** with navigation between past and current meetings
- **Read-Only Historical Meetings** to preserve data integrity
- **Real-Time Polling** to sync updates across users (5-second interval)
- **PDF Export** for meeting documentation
- **HTML Sanitization** to prevent XSS vulnerabilities

## Tech Stack

### Backend
- **Ruby on Rails 8.1** (API mode)
- **PostgreSQL** database
- **JWT** for authentication
- **BCrypt** for password hashing
- **Prawn** for PDF generation
- **RSpec** for testing

### Frontend
- **React 19** with TypeScript
- **Vite** build tool
- **Tailwind CSS** for styling
- **TipTap** rich text editor
- **Axios** for API calls
- **React Router** for navigation
- **React Hot Toast** for notifications
- **DOMPurify** for HTML sanitization

## Project Structure

```
TeamSync/
├── teamsync-api/          # Rails API backend
│   ├── app/
│   │   ├── controllers/   # API controllers
│   │   ├── models/        # ActiveRecord models
│   │   └── services/      # Business logic services
│   ├── db/
│   │   ├── migrate/       # Database migrations
│   │   └── seeds.rb       # Seed data
│   └── spec/              # RSpec tests
└── teamsync-ui/           # React frontend
    ├── src/
    │   ├── api/           # API client
    │   ├── components/    # React components
    │   ├── contexts/      # React contexts
    │   ├── pages/         # Page components
    │   └── types/         # TypeScript types
    └── public/            # Static assets
```

## Local Development Setup

### Prerequisites

- **Ruby** 3.2 or higher
- **Node.js** 18 or higher
- **PostgreSQL** 14 or higher
- **Git**

### Backend Setup

1. Navigate to the backend directory:
```bash
cd teamsync-api
```

2. Install Ruby dependencies:
```bash
bundle install
```

3. Create and configure the database:
```bash
rails db:create
rails db:migrate
rails db:seed
```

4. Start the Rails server:
```bash
rails server
```

The API will be available at `http://localhost:3000/api/v1`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd teamsync-ui
```

2. Install Node dependencies:
```bash
npm install
```

3. Create a `.env` file with the API URL:
```bash
echo "VITE_API_URL=http://localhost:3000/api/v1" > .env
```

4. Start the development server:
```bash
npm run dev
```

The UI will be available at `http://localhost:5173`

## Environment Variables

### Backend (`teamsync-api/.env`)

```bash
DATABASE_URL=postgresql://localhost/teamsync_development
JWT_SECRET=your_secret_key_here
RAILS_ENV=development
```

### Frontend (`teamsync-ui/.env`)

```bash
VITE_API_URL=http://localhost:3000/api/v1
```

## Database Seeding

The seed file creates demo data including:

- **Admin user**: `admin@example.com` / `password123`
- **Coach user**: `coach@example.com` / `password123`
- **Member user**: `member@example.com` / `password123`
- Sample teams with members
- Historical and current meetings
- Objectives and agenda items

After seeding, you can log in with any of these credentials.

## Running Tests

### Backend Tests

```bash
cd teamsync-api
bundle exec rspec
```

Run specific test files:
```bash
bundle exec rspec spec/models/
bundle exec rspec spec/requests/
```

### Frontend Tests

```bash
cd teamsync-ui
npm run test
```

## API Documentation

### Authentication

**POST** `/api/v1/auth/login`
- Login with email and password
- Returns JWT token and user info

**POST** `/api/v1/auth/refresh`
- Refresh JWT token
- Returns new token

### Teams

**GET** `/api/v1/teams`
- List all teams for current user

**GET** `/api/v1/teams/:id`
- Get team details with members

**POST** `/api/v1/teams`
- Create a new team (admin/coach only)

**PATCH** `/api/v1/teams/:id`
- Update team details

### Meetings

**GET** `/api/v1/teams/:team_id/meetings/current`
- Get current or most recent meeting for a team

**GET** `/api/v1/meetings/:id`
- Get meeting details

**POST** `/api/v1/teams/:team_id/meetings`
- Create a new meeting

**PATCH** `/api/v1/meetings/:id`
- Update meeting fields

**GET** `/api/v1/meetings/:id/poll`
- Get meeting update timestamps (for polling)

**GET** `/api/v1/meetings/:id/export`
- Export meeting as PDF

### Objectives

**POST** `/api/v1/meetings/:meeting_id/objectives`
- Create a new objective

**PATCH** `/api/v1/objectives/:id`
- Update objective

**DELETE** `/api/v1/objectives/:id`
- Delete objective

**POST** `/api/v1/objectives/reorder`
- Reorder objectives

### Agenda Items

**POST** `/api/v1/meetings/:meeting_id/agenda_items`
- Create a new agenda item

**PATCH** `/api/v1/agenda_items/:id`
- Update agenda item

**DELETE** `/api/v1/agenda_items/:id`
- Delete agenda item

**POST** `/api/v1/agenda_items/reorder`
- Reorder agenda items

## Deployment

### Backend (Render)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the following:
   - **Build Command**: `bundle install`
   - **Start Command**: `bundle exec puma -C config/puma.rb`
   - **Root Directory**: `teamsync-api`
4. Add environment variables:
   - `DATABASE_URL` (auto-generated by Render PostgreSQL)
   - `JWT_SECRET` (generate a secure random string)
   - `RAILS_ENV=production`
   - `RAILS_MASTER_KEY` (from `config/master.key`)
5. Add a PostgreSQL database
6. Deploy

### Frontend (Vercel)

1. Import your GitHub repository to Vercel
2. Set the following:
   - **Framework Preset**: Vite
   - **Root Directory**: `teamsync-ui`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add environment variables:
   - `VITE_API_URL=https://your-api-url.onrender.com/api/v1`
4. Deploy

## Security

- All passwords are hashed with BCrypt
- JWT tokens expire after 24 hours
- HTML content is sanitized on both client and server
- Historical meetings are read-only to prevent data tampering
- CORS configured for specific origins only
- Role-based authorization for sensitive operations

## Architecture Decisions

### Meeting History

- Each meeting is a snapshot in time
- Strategic topics are copied forward to new meetings
- Objectives are NOT copied (must be explicitly added)
- Historical meetings are immutable (read-only mode)

### Polling Strategy

- Frontend polls every 5 seconds for updates
- Uses timestamp comparison to minimize data transfer
- Only fetches full meeting data when changes detected

### State Management

- React Context API for global state (auth, meeting)
- No Redux/MobX to keep complexity low
- Local state for component-specific concerns

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary and confidential.

## Support

For issues or questions, please open an issue on the GitHub repository.
