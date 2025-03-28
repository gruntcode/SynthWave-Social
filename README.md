# SynthWave Social

A lightweight social media platform with a synthwave theme and modern dark mode UI.

## Features

- User registration and login system
- Dark mode UI with synthwave theme and color scheme
- Ability to post pictures, files, videos, and audio
- Built-in MP3 player for listening to music while scrolling
- YouTube playlist integration for streaming content
- Recently played YouTube videos and playlists tracking
- Mini music player component for continuous playback
- Post likes and comments functionality
- Real-time notifications system
- User profiles with customizable images
- Responsive design for mobile and desktop

## Components

- **Sidebar Component**: Displays user profile, music list, and recently played YouTube content
- **Mini Player**: Allows users to listen to music while browsing
- **YouTube Player**: Floating player for YouTube videos and playlists
- **Notifications System**: Provides feedback for user actions
- **Post Creation**: Intuitive interface for creating posts with media
- **Dark Mode Toggle**: Easily switch between light and dark themes

## Installation

1. Clone this repository

2. Create a virtual environment:

   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

4. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

5. Set up environment variables:

   ```bash
   copy .env.example .env
   ```

   Then edit the `.env` file with your configuration.

6. Initialize the database:

   ```bash
   flask db init
   flask db migrate -m "Initial migration"
   flask db upgrade
   ```

7. Run the post_likes migration:

   ```bash
   python migrations/create_post_likes.py
   ```

8. Run the application:

   ```bash
   flask run
   ```

9. Open your browser and navigate to `http://localhost:5000`

## Project Structure

- `/app` - Main application package
  - `/static` - Static files (CSS, JS, images)
    - `/css` - Stylesheets including synthwave.css and dark-mode.css
    - `/js` - JavaScript files for functionality
    - `/uploads` - User uploaded content
  - `/templates` - HTML templates
    - `/components` - Reusable UI components
    - `/posts` - Post-related templates
  - `/models.py` - Database models
  - `/main` - Main route handlers
  - `/posts` - Post-related routes
  - `/api` - API endpoints
  - `/auth` - Authentication routes
- `/migrations` - Database migrations
- `config.py` - Application configuration
- `run.py` - Application entry point

## Technologies Used

- **Flask**: Web framework
- **SQLAlchemy**: ORM for database operations
- **Flask-Login**: User authentication
- **Bootstrap 5**: Frontend framework
- **Font Awesome**: Icons
- **JavaScript**: Client-side interactivity
- **YouTube API**: For video and playlist integration

## YouTube Integration

The platform features a built-in YouTube player that allows users to:

- Add and play YouTube playlists directly from the sidebar
- Watch individual YouTube videos without leaving the site
- Track recently played YouTube content for quick access
- Minimize the player while browsing to continue listening
- Control playback with a floating player interface

This integration enhances the user experience by providing seamless access to YouTube content within the SynthWave Social environment.
