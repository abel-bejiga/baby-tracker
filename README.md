# Baby Tracker App

A beautiful, minimal baby tracking application built with Next.js 15, TypeScript, and Firebase. Track your baby's feeding, sleep, diaper changes, doctor appointments, and more.

## Features

### 🍼 Baby Tracking
- **Feeding Tracking**: Log feeding times and amounts (oz)
- **Sleep Monitoring**: Track sleep patterns and duration
- **Diaper Changes**: Record wet, dirty, or mixed diaper changes
- **Poop Time**: Monitor bowel movements with consistency tracking
- **Doctor Appointments**: Manage appointments, notes, and questions for doctors

### 🎨 Design & UX
- **Apple-inspired Design**: Clean, minimal, and professional interface
- **Theme Support**: Light, dark, and system theme modes (system as default)
- **Framer Motion Animations**: Smooth slide-in animations with gradient backgrounds
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Updates**: Live activity tracking and history view

### 🔐 Security & Authentication
- **Google Sign-in**: Secure Firebase authentication
- **User Data Isolation**: Each user's data is securely separated
- **Firestore Database**: Scalable NoSQL database for data storage

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **Authentication**: Firebase Auth with Google provider
- **Database**: Firestore for data storage
- **Animations**: Framer Motion for smooth transitions
- **Theme**: next-themes for light/dark mode support
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18+ 
- A Firebase project (for authentication and database)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd baby-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Setup**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Google Authentication in the Authentication section
   - Create a Firestore database
   - Copy your Firebase configuration and update `src/lib/firebase.ts`:

   ```typescript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "your-sender-id",
     appId: "your-app-id"
   };

   **Even easier -- edit .env.local values and there wouldnt be a need to change the code**
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

1. **Sign In**: Click "Sign in with Google" to authenticate
2. **Track Activities**: Click on any activity card to log a new entry
3. **View History**: See all your tracked activities in the recent activities section
4. **Monitor Stats**: Check today's summary and upcoming appointments

### Activity Types

#### Feeding
- Amount in ounces (oz)
- Optional notes about the feeding session

#### Sleep
- Duration in hours
- Optional notes about sleep quality

#### Diaper Changes
- Type: Wet, Dirty, or Mixed
- Optional notes

#### Poop Time
- Consistency: Hard, Normal, Soft, or Watery
- Optional notes

#### Doctor Appointments
- Appointment type: Regular Checkup, Vaccination, Sick Visit, or Emergency
- Date and time
- Doctor's notes and recommendations
- Questions to ask for next visit

## Project Structure

```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/           # shadcn/ui components
│   └── theme-provider.tsx
├── hooks/
│   ├── use-mobile.ts
│   ├── use-toast.ts
│   └── ...
└── lib/
    ├── firebase.ts   # Firebase configuration
    ├── utils.ts
    └── ...
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the repository or contact the development team.

## Acknowledgments

- Built with modern web technologies and best practices
- Special thanks to the Firebase team for authentication and database solutions