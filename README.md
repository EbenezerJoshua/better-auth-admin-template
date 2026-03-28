# 🚀 Premium Better Auth Admin Template

A sophisticated, production-ready authentication and administration foundation for Next.js applications, powered by [Better Auth](https://better-auth.com/). This template provides a sleek, modern UI with a focus on security, user experience, and full-featured administrative control.

---

## ✨ Features

### 🔐 Core Authentication
- **Multi-Provider Support**: Seamless sign-in with Google, GitHub, and Discord.
- **Email & Password**: Secure credential-based authentication with password hashing.
- **Magic Links / One Tap**: Frictionless login experience with Google One Tap integrated.
- **Email Verification**: Mandatory verification flow to ensure high-quality user data and security.
- **Automated Verification Flow**: Intelligent redirection for unverified users, automatically firing verification emails upon login attempts to ensure a smooth onboarding experience.

### 🛡️ Powerful Admin Dashboard
- **User Management**: 
  - **Comprehensive List**: View all registered users with their roles, status, and join dates.
  - **Create New Users**: Directly add new user accounts with initial passwords and role assignments.
  - **Account Actions**: Ban or unban users instantly to maintain platform integrity.
  - **Password Management**: Securely set or reset user passwords through a dedicated administrative interface.
  - **Profile & Role Updates**: Effortlessly update user names and toggle administrative permissions.
  - **Granular Session Management**: View active sessions with device/browser info and revoke specific sessions or all sessions at once.
  - **User Deletion**: Securely remove user accounts and all associated data.
- **Impersonation**: Securely log in as any user to troubleshoot issues or provide direct support.
- **Role-Based Access Control (RBAC)**: Fine-grained permissions for Admin and User roles.

### 👤 Advanced Profile Management
- **Centralized Dashboard**: A clean overview of account status and connected services.
- **Profile Customization**: Update display name and profile picture (Avatar support).
- **Security Hub**:
  - **Change Password**: Securely update credentials with verification.
  - **Two-Factor Authentication (2FA)**: Add an extra layer of protection via TOTP (Authenticator apps like Google Authenticator).
  - **Passkeys (WebAuthn)**: Go passwordless with modern biometric (TouchID/FaceID) or hardware keys.
- **Session Control**: View and manage your own active sessions; revoke access to specific devices.
- **Linked Accounts**: Connect multiple social providers to a single account.
- **Danger Zone**: Secure account self-deletion process with email-based verification.

### 📧 Intelligent Communication
- **Personalized Emails**: Fully styled, responsive email templates for:
  - Welcome messages upon registration.
  - Email verification codes.
  - Password reset links.
  - Change email verification.
  - Account deletion confirmation.
- **SMTP Ready**: Pre-configured for Mailtrap, easily adaptable for SendGrid, Resend, or Amazon SES.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router, React 19)
- **Authentication**: [Better Auth](https://better-auth.com/) (Plugins: Admin, 2FA, Passkey, One Tap)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Drizzle ORM](https://orm.drizzle.team/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) & [Shadcn/UI](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Email**: [Nodemailer](https://nodemailer.com/)

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18 or higher recommended.
- **PostgreSQL**: A running instance (local or hosted like Neon/Supabase).

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone <repository-url>
cd better-auth-admin-template
npm install
```

### 3. Environment Configuration
Copy the example environment file:
```bash
cp env.example .env
```
Open `.env` and fill in the following:

#### **Database**
- `DATABASE_URL`: Your PostgreSQL connection string.

#### **App & Branding**
- `NEXT_PUBLIC_APP_NAME`: Your application's name used for emails and UI (e.g., "Better Auth Admin Template").

#### **Better Auth**
- `BETTER_AUTH_SECRET`: A random 32+ character string.
- `BETTER_AUTH_URL`: Your app's base URL (e.g., `http://localhost:3000`).

#### **Social Providers (OAuth)**
Generate these in the respective developer consoles (Google, GitHub, Discord):
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`
- `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: Required for Google One Tap.

#### **Email (SMTP)**
- `MAILTRAP_USER` / `MAILTRAP_PASS`: Your SMTP credentials.
- `MAILTRAP_HOST`: e.g., `sandbox.smtp.mailtrap.io`.
- `MAILTRAP_PORT`: Default is `2525`.
- `MAILTRAP_FROM_EMAIL`: Sender address for your emails.

### 4. Database Setup
Initialize your schema and sync with Better Auth:
```bash
# Push schema to database
npm run db:push

# Generate Better Auth typescript types/schema
npm run auth:generate
```

### 5. Start Developing
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000).

---

## 🔑 Role Management & Admin Access

### Elevating a User to Admin
To access the `/admin` dashboard, a user must have the `admin` role. Since this is a template, you can set the first admin manually in your database:

1. Open **Drizzle Studio**:
   ```bash
   npm run db:studio
   ```
2. Find your user in the `user` table.
3. Change the `role` column value to `admin`.

Alternatively, you can modify the `auth.ts` configuration to assign roles during the sign-up process if needed.

---

## 📧 Email Setup Made Simple

Sending emails to real people is easy! Follow one of these paths:

### 📥 Path A: Mailtrap (Real Sending)
*By default, the template uses Mailtrap **Sandbox** which only "traps" emails for testing. To send to real addresses:*

1.  **Sign in** to [Mailtrap](https://mailtrap.io/).
2.  Click **Sending Domains** on the left.
3.  Add your domain (like `mysite.com`) and follow the steps to verify it.
4.  Once verified, go to **SMTP Settings**.
5.  Copy your new **Host**, **Port**, **Username**, and **Password** into your `.env` file.
6.  **That's it!** Now emails will go to real people.

### 📤 Path B: Google / Gmail Account
*If you want to use your personal or business Gmail account:*

1.  Open your [Google Account Settings](https://myaccount.google.com/).
2.  Go to **Security** and make sure **2-Step Verification** is turned **ON**.
3.  In the search bar at the top, type **"App Passwords"** and click on it.
4.  Give it a name like "My Auth App" and click **Create**.
5.  **Important:** Copy the yellow-highlighted **16-character code**.
6.  Update your `.env` like this:
    ```bash
    MAILTRAP_HOST=smtp.gmail.com
    MAILTRAP_PORT=465
    MAILTRAP_USER=your-email@gmail.com
    MAILTRAP_PASS=xxxx-xxxx-xxxx-xxxx  # Paste your 16-character code here
    MAILTRAP_FROM_EMAIL=your-email@gmail.com
    ```
7.  **Done!** Your app will now send emails using your Gmail account.

---

## 🛡️ Security & Best Practices

- **CSRF & Session Security**: Leverages Better Auth's secure-by-default session management.
- **Input Validation**: Strictly enforced with [Zod](https://zod.dev/).
- **Component Focused**: Built using reusable, accessible components from Shadcn/UI.
- **Production Ready**: Optimized for performance and scalability.

---

## 🤝 Contributing
Feel free to open issues or submit pull requests. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License
This project is licensed under the MIT License.