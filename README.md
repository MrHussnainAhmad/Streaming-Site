# StreamMe - Netflix-Style Video Streaming Platform

A modern video streaming platform built with Next.js 14 that uses CDN streaming, Low CDN costs while providing smooth 4K streaming.

## 🚀 Features

### Frontend
- **Netflix-style UI** with hero banner and category rows
- **Advanced Video Player** with:
  - Quality selector (480p, 720p, 1080p, 4K)
  - Multi-audio track support
  - Subtitle support
  - Fullscreen, volume, playback speed controls
  - Keyboard shortcuts (space, arrows, f, m)
  - Smart buffering with WebTorrent
- **Browse page** with genre, year, and language filters
- **Search functionality** with full-text search
- **Responsive design** for all devices
- **Smooth animations** and hover effects

### Admin Panel (`/admin`)
- Password-protected access
- **Content Management**:
  - Add videos via magnet link
  - Edit metadata (title, description, cast, genres, etc.)
  - Upload thumbnails/posters to Cloudinary
  - Mark as trending/featured
  - Delete videos
- Simple and intuitive interface

### Tech Stack
- **Next.js 14** with App Router and TypeScript
- **WebTorrent** for P2P streaming (no CDN costs)
- **MongoDB Atlas** free tier with Mongoose
- **Cloudinary** free tier for images
- **Tailwind CSS** for styling
- **Vercel** for deployment

## 📦 Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd streamme
```

2. Install dependencies:
```bash
npm install
```

3. Setup environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your credentials:

### MongoDB Atlas Setup (Free Tier)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string
4. Add it to `MONGODB_URI`

### Cloudinary Setup (Free Tier)
1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for free account
3. Get your cloud name, API key, and API secret
4. Add them to the environment variables

### Admin Password
- Set `ADMIN_PASSWORD` to your desired password
- Default is `admin123`

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Configuration

### Environment Variables

```env
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://...

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Admin Password
ADMIN_PASSWORD=your_secure_password

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📱 Usage

### Adding Content (Admin)

1. Go to `/admin` and login with your password
2. Click "Add Video"
3. Fill in the details:
   - **Magnet Link**: WebTorrent magnet link
   - **Thumbnail & Poster**: Upload to Cloudinary or provide URLs
   - **Metadata**: Title, description, year, genres, etc.
   - **Flags**: Mark as trending or featured
4. Click "Create"

### Uploading Images to Cloudinary

You can upload images directly to Cloudinary:
- Go to your Cloudinary dashboard
- Upload thumbnail (portrait, 2:3 ratio recommended)
- Upload poster (landscape, 16:9 ratio recommended)
- Copy the URLs and paste them in the admin form

## 🚀 Deployment (Vercel Free Tier)

1. Push your code to GitHub

2. Go to [Vercel](https://vercel.com)

3. Import your repository

4. Add environment variables in Vercel dashboard:
   - `MONGODB_URI`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `ADMIN_PASSWORD`
   - `NEXT_PUBLIC_APP_URL` (your Vercel URL)

5. Deploy

## 💰 Cost Breakdown

- **Hosting**: Free (Vercel free tier)
- **Database**: Free (MongoDB Atlas free tier - 512MB)
- **Images**: Free (Cloudinary free tier - 25GB storage)
- **CDN**: $0 (P2P streaming with WebTorrent)
- **Total**: **$0/month** 🎉

## ⚡ Performance Optimizations

- MongoDB connection pooling
- Indexed database fields for fast queries
- Cloudinary WebP auto-format
- ISR for static pages
- Client-side caching with localStorage
- Sequential piece selection for smooth playback
- Lazy loading with blur-up placeholders

## 🎮 Keyboard Shortcuts

While watching:
- **Space**: Play/Pause
- **← →**: Skip backward/forward 10s
- **↑ ↓**: Volume up/down
- **F**: Toggle fullscreen
- **M**: Mute/unmute

## 📝 API Routes

- `GET /api/videos` - List videos with filters
- `GET /api/search?q=query` - Search videos
- `GET /api/stream/[id]` - Get stream info
- `POST /api/admin/auth` - Admin login
- `GET /api/admin/videos` - List all videos (admin)
- `POST /api/admin/videos` - Create video (admin)
- `PUT /api/admin/videos/[id]` - Update video (admin)
- `DELETE /api/admin/videos/[id]` - Delete video (admin)

## 🔒 Security

- Admin routes protected with httpOnly cookies
- Password authentication for admin panel
- Environment variable validation
- CORS and XSS protection via Next.js

## 🐛 Troubleshooting

### WebTorrent not loading
- Ensure the magnet link is valid
- Check browser console for errors
- Some ISPs block P2P connections

### Images not loading
- Verify Cloudinary credentials
- Check image URLs are accessible
- Enable Cloudinary transformations

### Database connection failed
- Verify MongoDB URI is correct
- Check IP whitelist in MongoDB Atlas
- Ensure network access is configured

## 📄 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## ⚠️ Legal Notice

This platform is for educational purposes. Ensure you have the rights to distribute any content you add to the platform. Respect copyright laws in your jurisdiction.
