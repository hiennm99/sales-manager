# Authentication Setup Guide

## Overview
The Sales Manager application now includes complete Supabase authentication with:
- Email/password login and signup
- Protected routes
- Session management
- Logout functionality

## Setup Instructions

### 1. Configure Supabase

#### Create a Supabase Project
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project or select an existing one
3. Navigate to **Settings** → **API**
4. Copy your:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **Anon/Public Key** (starts with `eyJ...`)

#### Configure Environment Variables
1. Create a `.env` file in the project root (copy from `.env.example`):
   ```bash
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

2. Replace the placeholder values with your actual Supabase credentials

### 2. Configure Supabase Authentication

#### Enable Email Authentication
1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Ensure **Email** provider is enabled
3. Configure email settings:
   - **Enable email confirmations** (optional, recommended for production)
   - **Customize email templates** (optional)

#### Create Test User (Optional)
1. Go to **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter email and password
4. Optionally skip email confirmation for development

### 3. Run the Application

```bash
# Install dependencies (if needed)
npm install

# Start development server
npm run dev
```

### 4. Test Authentication

1. **Visit the login page**: Navigate to `http://localhost:5173/login`

2. **Sign Up**:
   - Click "Don't have an account? Sign up"
   - Enter email and password (minimum 6 characters)
   - If email confirmation is enabled, check your email
   - Otherwise, you'll be logged in immediately

3. **Sign In**:
   - Enter your registered email and password
   - Click "Sign In"
   - You'll be redirected to the dashboard

4. **Sign Out**:
   - Click on your profile avatar in the navbar
   - Click "Đăng xuất" (Logout)
   - You'll be redirected to the login page

## Features

### Protected Routes
All application routes are protected and require authentication:
- `/dashboard`
- `/shops`
- `/products`
- `/orders`
- `/employees`
- `/statuses`
- `/salaries`
- `/financial-reports`
- `/settings`

Unauthenticated users will be automatically redirected to `/login`.

### Login Page Features
- **Modern UI** with animated background
- **Email/Password authentication**
- **Toggle between Sign In and Sign Up**
- **Form validation** (email format, password length)
- **Error handling** with user-friendly messages
- **Loading states** during authentication
- **Auto-redirect** if already logged in

### Session Management
- **Automatic session initialization** on app load
- **Session persistence** across browser refreshes
- **Auth state listener** for real-time updates
- **Secure token storage** handled by Supabase

### Navbar Integration
- **User email display** in the navbar
- **Logout button** with confirmation
- **Automatic navigation** to login after logout

## Security Best Practices

1. **Never commit `.env` file** - Add it to `.gitignore`
2. **Use environment variables** for all sensitive data
3. **Enable email confirmation** in production
4. **Use strong password policies** in Supabase settings
5. **Consider adding 2FA** for admin users
6. **Set up Row Level Security (RLS)** in Supabase for data protection

## Troubleshooting

### "Missing Supabase environment variables" error
- Ensure `.env` file exists in project root
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
- Restart the dev server after adding environment variables

### "Invalid login credentials" error
- Verify the user exists in Supabase Authentication
- Check if email confirmation is required
- Ensure password meets minimum requirements (6+ characters)

### Not redirected to dashboard after login
- Check browser console for errors
- Verify router is properly configured
- Ensure `ProtectedRoute` component is working

### Logout doesn't work
- Check browser console for errors
- Verify Supabase connection
- Clear browser cache and cookies

## Advanced Configuration

### Custom Email Templates
1. Go to **Authentication** → **Email Templates** in Supabase
2. Customize confirmation, recovery, and magic link emails
3. Add your brand logo and colors

### Password Policies
1. Go to **Authentication** → **Policies** in Supabase
2. Set minimum password length
3. Require special characters, numbers, etc.

### Social Authentication (Optional)
1. Go to **Authentication** → **Providers**
2. Enable providers (Google, GitHub, etc.)
3. Update `LoginForm.tsx` to add social login buttons

## Next Steps

Consider adding:
- [ ] Password reset functionality
- [ ] Email verification flow
- [ ] Social authentication providers
- [ ] User profile management
- [ ] Role-based access control (RBAC)
- [ ] Multi-factor authentication (MFA)
- [ ] Session timeout handling
