# GroupSave Mobile

A React Native mobile application for collaborative group savings. GroupSave enables users to create and manage savings groups, invite members, track contributions, and achieve financial goals together.

## Features

- **User Authentication** - Secure sign-up and sign-in with session management
- **Dashboard** - View savings statistics, group memberships, and suggested groups
- **Group Management** - Create savings groups with customizable targets and schedules
- **Member Invitations** - Invite members via email to join your savings groups
- **Notifications** - Stay updated on group activities and important events
- **Payment Scheduling** - Set payment out days and expected start dates for groups

## Tech Stack

- **Framework**: React Native with Expo SDK 54
- **Language**: TypeScript
- **Navigation**: React Navigation (Stack Navigator)
- **State Management**: React Hooks + AsyncStorage
- **HTTP Client**: Axios
- **Form Handling**: Formik + Yup validation
- **UI Components**:
  - Expo Linear Gradient
  - React Native Vector Icons
  - React Native Actions Sheet
  - React Native Toast Message
  - React Native Alert Notification

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- Expo CLI
- iOS Simulator (macOS) or Android Emulator

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/OtomewoOluwatobi/GroupSave_Mobile.git
   cd GroupSave_Mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory with your API configuration:
   ```env
   API_BASE_URL=your_api_base_url
   ```

## Running the App

### Development

```bash
# Start the Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run in web browser
npm run web
```

### Using Expo Go

1. Install [Expo Go](https://expo.dev/client) on your mobile device
2. Run `npm start`
3. Scan the QR code with your device camera (iOS) or Expo Go app (Android)

## Project Structure

```
GroupSave_Mobile/
├── App.tsx                 # Main app component with navigation setup
├── index.ts                # Entry point
├── app.json                # Expo configuration
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── assets/
│   └── fonts/              # Custom fonts
├── components/
│   ├── FormInput.tsx       # Reusable form input component
│   ├── FormTextArea.tsx    # Reusable textarea component
│   └── MenuActionSheet.tsx # Action sheet menu component
├── screens/
│   ├── HomeScreen.tsx      # Splash/landing screen
│   ├── SigninScreen.tsx    # User login
│   ├── SignupScreen.tsx    # User registration
│   └── auth/
│       └── user/
│           ├── DashboardScreen.tsx          # User dashboard
│           ├── NotificationsScreen.tsx      # Notifications list
│           ├── NotificationDetailScreen.tsx # Notification details
│           └── groups/
│               ├── CreateGroupScreen.tsx    # Multi-step group creation
│               └── GroupDetailsScreen.tsx   # Group information
└── theme/
    ├── colors.ts           # Color palette
    └── semanticColors.ts   # Semantic color tokens
```

## Key Screens

| Screen | Description |
|--------|-------------|
| Home | Splash screen with app branding |
| Sign In | User authentication |
| Sign Up | New user registration |
| Dashboard | Overview of groups, stats, and suggestions |
| Create Group | Multi-step wizard for creating savings groups |
| Group Details | View and manage a specific group |
| Notifications | List of user notifications |

## API Integration

The app communicates with a backend API for:
- User authentication and session management
- CRUD operations for savings groups
- Member management and invitations
- Notification delivery

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Author

**Otomewo Oluwatobi**

---

Built with React Native and Expo
