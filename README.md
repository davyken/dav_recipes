# React Native Recipe App

A full-stack mobile application for recipe discovery, restaurant discovery, and food ordering.

---

## Problem Statement

**Who has the problem?**

Home cooks, food enthusiasts, and anyone looking for meal ideas face fragmented experiences when trying to find recipes, discover local restaurants, or order food. They must use multiple apps for different purposes - one for recipes, another for restaurant discovery, and yet another for food delivery.

**Why it matters?**

- Users want an all-in-one solution for their culinary needs
- Recipe apps often lack integration with local restaurant options
- Food ordering should be seamless with recipe inspiration
- Accessibility to diverse cuisines (including local/regional dishes) is important

**Why this solution exists?**

This app unifies recipe discovery, restaurant finding, and food ordering into a single, intuitive mobile experience. Users can browse recipes, watch YouTube tutorials, save favorites, discover nearby restaurants, and even order food - all from one app.

---

## Technical Architecture

### Frontend Structure (`/mobile`)

```
mobile/
├── app/                    # Expo Router file-based routing
│   ├── (auth)/            # Authentication screens
│   │   ├── sign-in.jsx
│   │   ├── sign-up.jsx
│   │   ├── verify-email.jsx
│   │   └── verify-second-factor.jsx
│   ├── (tabs)/            # Main tab navigation
│   │   ├── index.jsx      # Home (recipes)
│   │   ├── favorites.jsx
│   │   ├── restaurants.jsx
│   │   ├── search.jsx
│   │   ├── my-recipes.jsx
│   │   └── profile.jsx
│   └── recipe/            # Recipe detail & edit screens
├── components/            # Reusable UI components
├── services/              # API integrations
│   ├── api.js             # Backend API client
│   ├── mealAPI.js         # MealDB external API
│   └── cloudinary.js      # Image upload service
├── constants/             # App constants & config
├── hooks/                  # Custom React hooks
└── assets/                 # Styles, images, fonts
```

### Backend Structure (`/backend`)

```
backend/
├── src/
│   ├── server.js           # Express app entry point
│   ├── config/
│   │   ├── env.js          # Environment variables
│   │   ├── db.js           # Drizzle database connection
│   │   └── cron.js         # Scheduled jobs
│   └── db/
│       ├── schema.js       # Database schema definitions
│       └── migrations/     # Drizzle migrations
└── drizzle.config.js       # Drizzle ORM configuration
```

### Database Schema

- **favoritesTable**: User's saved favorite recipes
- **restaurantsTable**: Local restaurant data
- **menuItemsTable**: Restaurant menu items
- **ordersTable**: Food orders with status tracking
- **orderItemsTable**: Individual items in orders
- **userRecipesTable**: User-created recipes
- **addressesTable**: User delivery addresses

### API Communication

- **Clerk**: Authentication (signup, login, email verification, 2FA)
- **MealDB API**: External recipe data source
- **Google Places API**: Restaurant discovery based on user location
- **Cloudinary**: Image upload and storage for user recipes
- **Express REST API**: Internal communication between mobile app and backend

---

## Features

### Authentication & Security
- Email/password signup and login via Clerk
- 6-digit email verification code
- Two-factor authentication (2FA) support
- Protected routes with session management

### Recipe Management
- Browse featured recipes from MealDB API
- Filter recipes by category (Beef, Chicken, Seafood, etc.)
- Search recipes by name
- View detailed recipe pages with:
  - Ingredients list
  - Step-by-step cooking instructions
  - Embedded YouTube video tutorials
  - Cook time and servings info
- Create, edit, and delete personal recipes
- Upload recipe images via Cloudinary
- Set recipes as public or private
- Mark recipes as favorites

### Restaurant Discovery
- Google Places API integration for nearby restaurants
- Location-based search with configurable radius
- Search by cuisine or restaurant name
- Display restaurant details (rating, address, hours, pricing)
- Distance calculation from user location

### Food Ordering
- Browse restaurant menus
- Add items to cart
- Place orders with delivery address
- Order status tracking (pending, confirmed, preparing, delivering, delivered)
- Order history management

### User Profile
- View and edit profile information
- Manage saved delivery addresses
- Switch between 8 color themes
- Sign out functionality

### Additional Features
- Pull-to-refresh on lists
- Loading states and error handling
- Responsive design
- Image caching for performance

---

## Screenshots

![App Screenshot](/mobile/assets/images/screenshot-for-readme.png)

---

## Tech Stack

### Mobile (Frontend)
- **Framework**: React Native with Expo SDK 54
- **Language**: TypeScript
- **Navigation**: Expo Router (file-based routing)
- **Authentication**: Clerk
- **State Management**: React hooks (useState, useEffect)
- **UI Components**: Custom components with React Native core
- **Icons**: @expo/vector-icons (Ionicons)
- **Location**: expo-location
- **Image Handling**: expo-image, expo-image-picker

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (Neon)
- **ORM**: Drizzle ORM
- **External APIs**: Google Places API, MealDB API
- **Image Storage**: Cloudinary

### Tools
- **Version Control**: Git
- **Package Manager**: npm
- **Development**: VS Code, Expo Dev Tools
- **API Testing**: Postman
- **Database Migrations**: Drizzle Kit

---

## Installation

### Prerequisites
- Node.js (v18+)
- npm or yarn
- PostgreSQL database (Neon recommended)
- Clerk account (free tier)
- Google Cloud Platform account (for Places API)
- Cloudinary account (free tier)

### Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in `/backend`:

```env
PORT=5001
DATABASE_URL=your_neon_db_url
NODE_ENV=development
GOOGLE_PLACES_API_KEY=your_google_api_key
```

Run the backend:

```bash
npm run dev
```

### Mobile App Setup

```bash
cd mobile
npm install
```

Create `.env` file in `/mobile`:

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
EXPO_PUBLIC_API_URL=http://localhost:5001
```

Run the app:

```bash
npx expo start
```

---

## Live Demo

The app can be run locally using the instructions above. For production deployment:

- **Backend**: Deploy to Render, Railway, or similar platform
- **Mobile**: Build using EAS Build for APK/IPA distribution

---

## Challenges Faced

### Frontend Challenge: Implementing Protected Routes

Managing protected routes in React Native with Expo Router required implementing a custom authentication wrapper. The challenge was ensuring users couldn't access certain screens without being logged in while maintaining smooth navigation transitions. I created a protected route component that checks Clerk authentication state and redirects unauthenticated users to the sign-in page.

### Frontend Challenge: Managing Complex Form State

Creating and editing recipes required handling dynamic form fields (ingredients list, instructions). Managing the state of add/remove operations for these fields while maintaining data integrity was challenging. I solved this using React's useState with proper array manipulation methods.

### Backend Challenge: Google Places API Integration

Integrating Google Places API to find nearby restaurants required handling location permissions and properly formatting API requests. The challenge included managing API rate limits, handling different response statuses, and transforming the external API data into a consistent format for the mobile app.

### Backend Challenge: Database Schema Design

Designing a normalized database schema that supports recipes, restaurants, orders, and user addresses while maintaining referential integrity was complex. I used Drizzle ORM to define relationships between tables and ensure data consistency across the application.

### Debugging Experience: Image Upload Issues

Users reported issues uploading recipe images. After investigation, the problem was Cloudinary signature generation in the frontend. I resolved this by implementing a proper upload preset configuration and adding error handling to provide better user feedback during upload failures.

---

## What I Learned

### Technical Lesson

Working with multiple external APIs (Clerk, MealDB, Google Places, Cloudinary) taught me how to handle different authentication mechanisms, rate limiting, and error responses. Each API had its own quirks, and learning to integrate them all into a cohesive application was invaluable.

### Workflow Lesson

Building a full-stack application required careful planning of the development workflow. I learned to:
- Use environment variables for sensitive configuration
- Implement proper error handling at both frontend and backend
- Structure the project for scalability
- Use TypeScript for better code maintainability

### Code Organization Lesson

Separating concerns between presentation (screens), business logic (services), and data (API clients) made the codebase more maintainable. Using Expo Router's file-based routing convention helped organize screens logically while keeping the navigation configuration minimal.

---

## Future Improvements

1. **Offline Support**: Implement offline data caching using AsyncStorage for better UX in areas with poor connectivity

2. **Push Notifications**: Add push notifications for order status updates and recipe recommendations

3. **Social Features**: Allow users to share recipes and see what friends are cooking

4. **Shopping List**: Generate shopping lists from recipe ingredients

5. **Meal Planning**: Weekly meal planning feature with grocery list generation

6. **Recipe Reviews**: Allow users to rate and review recipes

7. **Admin Dashboard**: Restaurant owner portal for menu management

8. **Real-time Updates**: WebSocket integration for live order tracking

9. **Dark Mode**: System-wide dark theme support

10. **Internationalization**: Multi-language support for broader accessibility

---

## Contact

- Email: [davykennang552@gmail.com]
- LinkedIn: [(https://www.linkedin.com/in/davy-kennang-788047298/)]

---

## License

MIT License - feel free to use this project for learning purposes.
