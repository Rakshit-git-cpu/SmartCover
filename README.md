# SmartCover - Warranties Secured, Worries Covered

A comprehensive warranty management platform that helps users track, manage, and claim warranties for their products with AI-powered invoice scanning.

## 🚀 Features

- **AI-Powered Invoice Scanning**: Upload invoices and automatically extract product details using OCR
- **Product Registration**: Register products with warranty information
- **Warranty Tracking**: Monitor warranty status and expiration dates
- **Smart Notifications**: Get alerts for expiring warranties
- **Warranty Claims**: Submit and track warranty claims
- **Responsive Design**: Beautiful dark theme with mobile support
- **Real-time Updates**: Live notifications and status updates

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **OCR**: Tesseract.js for invoice text extraction
- **Icons**: Lucide React
- **Deployment**: Render

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Rakshit-git-cpu/SmartCover.git
   cd SmartCover
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase**
   - Create a new Supabase project
   - Run the database migrations from `supabase/migrations/`
   - Enable Row Level Security (RLS)
   - Set up storage bucket for invoice uploads

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🗄️ Database Setup

The project includes comprehensive database migrations:

- **Users**: Extended user profiles
- **Products**: Product registration with warranty details
- **Warranty Claims**: Claim submissions and status tracking
- **Notifications**: In-app notification system
- **Storage**: Secure file uploads for invoices

Run migrations in order:
1. `20250911210526_blue_wood.sql` - Initial schema
2. `20250912101653_tender_lab.sql` - Additional features
3. `20250912130826_blue_wave.sql` - Updates
4. `20250912140000_fix_user_profiles.sql` - User profile fixes
5. `20250912150000_expiry_notifications.sql` - Notification system
6. `20250912160000_warranty_renewals.sql` - Warranty renewals
7. `20250912170000_disable_email_confirmation.sql` - Auth settings

## 🚀 Deployment on Render

1. **Connect GitHub Repository**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub account
   - Select the SmartCover repository

2. **Configure Build Settings**
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run preview`
   - **Node Version**: 18.x

3. **Set Environment Variables**
   - `NODE_ENV`: production
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

4. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy your app

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Project Structure

```
src/
├── components/
│   ├── Auth/           # Authentication components
│   ├── Dashboard/      # Dashboard and product management
│   └── Layout/         # Layout components
├── hooks/              # Custom React hooks
├── lib/                # External library configurations
├── types/              # TypeScript type definitions
└── main.tsx           # Application entry point
```

## 🤖 AI Features

### Invoice Processing
- **OCR Engine**: Tesseract.js for text extraction
- **Smart Pattern Matching**: Intelligent product detail extraction
- **Brand Recognition**: Automatic brand detection from 25+ major brands
- **Date Parsing**: Multiple date format support
- **Model Detection**: SKU and model number extraction

### Supported File Types
- PDF documents
- JPG/JPEG images
- PNG images

## 🔐 Security

- **Row Level Security (RLS)**: Database-level access control
- **User Authentication**: Secure Supabase auth
- **File Upload Security**: Protected storage with user-specific paths
- **Environment Variables**: Secure configuration management

## 📱 Mobile Support

- Fully responsive design
- Touch-friendly interface
- Mobile-optimized forms
- Progressive Web App ready

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for backend services
- [Tesseract.js](https://tesseract.projectnaptha.com/) for OCR capabilities
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Lucide React](https://lucide.dev/) for icons

## 📞 Support

For support, email support@smartcover.com or create an issue in this repository.

---

**SmartCover** - *Warranties Secured, Worries Covered* 🛡️
