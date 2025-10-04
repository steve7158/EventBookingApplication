# Event Booking Application

A modern Angular frontend application with Angular Material for managing event bookings.

## Features

### 📅 Calendar View (Main)
- View all available event time slots for selected categories
- Filter events based on user preferences
- Register for events with real-time availability updates
- Unregister from events
- Responsive design with Material Design components

### ⚙️ User Preferences
- Select event categories of interest (Cat 1, Cat 2, Cat 3)
- Preferences are automatically saved to local storage
- Real-time filtering of calendar events based on preferences

### 👨‍💼 Admin View
- Create new event time slots
- Specify event details (title, description, category, date, time, max attendees)
- View all existing events in a data table
- Real-time attendee tracking

## Technology Stack

- **Angular 19** - Modern web framework
- **Angular Material** - UI component library
- **TypeScript** - Type-safe development
- **SCSS** - Advanced styling
- **RxJS** - Reactive programming

## Getting Started

### Prerequisites
- Node.js (v20.10.0 or higher)
- npm (v10.2.3 or higher)

### Installation

1. Navigate to the project directory:
   ```bash
   cd "c:\Work\personal\EventBookingApplication\Frontend\event-booking-app"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   ng serve
   ```

4. Open your browser and navigate to `http://localhost:4200`

### Building for Production

```bash
ng build
```

The build artifacts will be stored in the `dist/` directory.

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
