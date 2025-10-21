'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Video {
  _id: string;
  title: string;
  year: number;
  thumbnail: string;
  poster: string;
  isTrending: boolean;
  isFeatured: boolean;
  views: number;
  genres: string[];
  languages?: string[];
  categories?: string[];
}

export default function AdminDashboard() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingVideo, setEditingVideo] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [siteSettings, setSiteSettings] = useState({ 
    siteName: 'STREAMME', 
    logo: '',
    favicon: '', 
    enableUserAuth: false,
    enableSecondaryFooter: false,
    secondaryFooterContent: '',
    enableAds: false,
    adType: 'google' as 'google' | 'custom',
    googleAdSenseId: '',
    customAdImage: '',
    customAdLink: ''
  });
  const [passwordChange, setPasswordChange] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordChangeStatus, setPasswordChangeStatus] = useState('');
  const [dynamicSiteName, setDynamicSiteName] = useState('STREAMME');
  const router = useRouter();

  const thumbnailRef = useRef<HTMLInputElement>(null);
  const posterRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);
  const faviconRef = useRef<HTMLInputElement>(null);
  
  const [customGenre, setCustomGenre] = useState('');
  const [customLanguage, setCustomLanguage] = useState('');
  const [customCategory, setCustomCategory] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    thumbnail: '',
    poster: '',
    duration: 0,
    year: new Date().getFullYear(),
    genres: [] as string[],
    languages: [] as string[],
    categories: [] as string[],
    cast: '',
    director: '',
    rating: 0,
    isTrending: false,
    isFeatured: false,
    quality: '1080p',
    universe: '',
  });

  const [filters, setFilters] = useState({
    language: 'all',
    category: 'all',
    genre: 'all',
    sortBy: 'latest',
  });

  // Available options
  const availableGenres = ['Action', 'Drama', 'Comedy', 'Thriller', 'Horror', 'Romance', 'Sci-Fi', 'Fantasy', 'Documentary', 'Animation'];
  const availableLanguages = ['English', 'Spanish', 'Hindi', 'French', 'German', 'Japanese', 'Korean', 'Chinese'];
  const availableCategories = ['Movies', 'Series', 'Documentaries', 'Shorts'];

  useEffect(() => {
    fetchVideos();
    fetchSettings();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/admin/videos');
      if (response.status === 401) {
        router.push('/admin');
        return;
      }
      const data = await response.json();
      setVideos(data.videos || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSiteSettings({
          siteName: data.settings.siteName || 'STREAMME',
          logo: data.settings.logo || '',
          favicon: data.settings.favicon || '',
          enableUserAuth: data.settings.enableUserAuth || false,
          enableSecondaryFooter: data.settings.enableSecondaryFooter || false,
          secondaryFooterContent: data.settings.secondaryFooterContent || '',
          enableAds: data.settings.enableAds || false,
          adType: data.settings.adType || 'google',
          googleAdSenseId: data.settings.googleAdSenseId || '',
          customAdImage: data.settings.customAdImage || '',
          customAdLink: data.settings.customAdLink || ''
        });
        setDynamicSiteName(data.settings.siteName || 'STREAMME');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const updateSettings = async () => {
    try {
      console.log('Updating settings:', siteSettings);
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteSettings),
      });
      
      const result = await response.json();
      console.log('Settings update result:', result);
      
      if (response.ok) {
        alert('✅ Settings updated successfully! Changes will appear on the site within 5 seconds.');
        setShowSettings(false);
        // Trigger a manual refresh of settings to verify the update
        await fetchSettings();
      } else {
        const errorMsg = result.error || 'Unknown error';
        const details = result.details ? JSON.stringify(result.details, null, 2) : '';
        console.error('Settings update failed:', { error: errorMsg, details, response: result });
        alert(`❌ Failed to update settings: ${errorMsg}${details ? '\n\nDetails (check console for more info)' : ''}`);
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      alert(`❌ Failed to update settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const changePassword = async () => {
    if (passwordChange.newPassword !== passwordChange.confirmPassword) {
      setPasswordChangeStatus('New passwords do not match');
      return;
    }

    if (passwordChange.newPassword.length < 6) {
      setPasswordChangeStatus('New password must be at least 6 characters');
      return;
    }

    try {
      setPasswordChangeStatus('Changing password...');
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordChange.currentPassword,
          newPassword: passwordChange.newPassword
        })
      });

      if (response.ok) {
        setPasswordChangeStatus('✅ Password changed successfully!');
        setPasswordChange({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setPasswordChangeStatus(''), 3000);
      } else {
        const error = await response.json();
        setPasswordChangeStatus(error.error || '❌ Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordChangeStatus('❌ Failed to change password');
    }
  };

  const loadVideoForEdit = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/videos/${id}`);
      if (response.ok) {
        const { video } = await response.json();
        setFormData({
          title: video.title,
          description: video.description,
          videoUrl: video.videoUrl,
          thumbnail: video.thumbnail,
          poster: video.poster,
          duration: video.duration,
          year: video.year,
          genres: video.genres || [],
          languages: video.languages || [],
          categories: video.categories || [],
          cast: video.cast?.join(', ') || '',
          director: video.director || '',
          rating: video.rating || 0,
          isTrending: video.isTrending,
          isFeatured: video.isFeatured,
          quality: video.quality?.[0] || '1080p',
          universe: video.universe || '',
        });
        setEditingVideo(id);
        setShowForm(true);
      }
    } catch (error) {
      console.error('Error loading video:', error);
      alert('❌ Failed to load video');
    }
  };

  const uploadToCloudinary = async (file: File, type: 'thumbnail' | 'poster') => {
    setUploading(true);

    try {
      const sigResponse = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: 'streamme' }),
      });

      if (!sigResponse.ok) throw new Error('Failed to get upload signature');
      
      const { signature, timestamp, cloudName, apiKey } = await sigResponse.json();

      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('signature', signature);
      uploadFormData.append('timestamp', timestamp.toString());
      uploadFormData.append('api_key', apiKey);
      uploadFormData.append('folder', 'streamme');

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: uploadFormData,
        }
      );

      const data = await uploadResponse.json();
      
      if (!uploadResponse.ok) {
        console.error('Cloudinary upload error:', data);
        throw new Error(data.error?.message || 'Upload failed');
      }

      return data.secure_url;
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'thumbnail' | 'poster') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    const url = await uploadToCloudinary(file, type);
    if (url) {
      setFormData({ ...formData, [type]: url });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.thumbnail || !formData.poster) {
      alert('Please upload both thumbnail and poster images');
      return;
    }

    if (formData.genres.length === 0) {
      alert('Please select at least one genre');
      return;
    }

    if (formData.languages.length === 0) {
      alert('Please select at least one language');
      return;
    }

    if (formData.categories.length === 0) {
      alert('Please select at least one category');
      return;
    }

    const payload = {
      ...formData,
      cast: formData.cast.split(',').map(s => s.trim()).filter(Boolean),
      quality: [formData.quality],
    };

    try {
      const url = editingVideo ? `/api/admin/videos/${editingVideo}` : '/api/admin/videos';
      const method = editingVideo ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setShowForm(false);
        resetForm();
        setEditingVideo(null);
        fetchVideos();
        alert(editingVideo ? '✅ Video updated successfully!' : '✅ Video added successfully!');
      } else {
        const error = await response.json();
        alert(`❌ Error: ${error.error || 'Failed to save video'}`);
      }
    } catch (error) {
      console.error('Error saving video:', error);
      alert('❌ Failed to save video');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('⚠️ Delete this video permanently?')) return;

    try {
      const response = await fetch(`/api/admin/videos/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchVideos();
        alert('✅ Video deleted');
      }
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('❌ Failed to delete video');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.push('/admin');
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      videoUrl: '',
      thumbnail: '',
      poster: '',
      duration: 0,
      year: new Date().getFullYear(),
      genres: [],
      languages: [],
      categories: [],
      cast: '',
      director: '',
      rating: 0,
      isTrending: false,
      isFeatured: false,
      quality: '1080p',
      universe: '',
    });
  };

  const toggleArrayField = (field: 'genres' | 'languages' | 'categories', value: string) => {
    const current = formData[field];
    if (current.includes(value)) {
      setFormData({ ...formData, [field]: current.filter(v => v !== value) });
    } else {
      setFormData({ ...formData, [field]: [...current, value] });
    }
  };

  // Filter and sort videos
  const filteredVideos = videos
    .filter(video => {
      if (filters.language !== 'all' && !video.languages?.includes(filters.language)) return false;
      if (filters.category !== 'all' && !video.categories?.includes(filters.category)) return false;
      if (filters.genre !== 'all' && !video.genres?.includes(filters.genre)) return false;
      return true;
    })
    .sort((a, b) => {
      if (filters.sortBy === 'latest') return b.year - a.year;
      if (filters.sortBy === 'oldest') return a.year - b.year;
      if (filters.sortBy === 'views') return b.views - a.views;
      if (filters.sortBy === 'title') return a.title.localeCompare(b.title);
      return 0;
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-lg border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
                {dynamicSiteName} Admin
              </h1>
              <p className="text-gray-400 text-sm mt-1">Content Management Dashboard</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowSettings(!showSettings);
                  setShowForm(false);
                  setEditingVideo(null);
                }}
                className="px-6 py-2.5 bg-blue-600 rounded-lg hover:bg-blue-700 transition-all font-semibold"
              >
                ⚙️ Settings
              </button>
              <button
                onClick={() => {
                  setShowForm(!showForm);
                  setShowSettings(false);
                  if (!showForm) {
                    resetForm();
                    setEditingVideo(null);
                  }
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-500 rounded-lg hover:from-red-700 hover:to-red-600 transition-all font-semibold shadow-lg shadow-red-600/30"
              >
                {showForm ? '✕ Cancel' : '+ Add Video'}
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-2.5 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all font-semibold"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-red-600/20 to-red-600/5 border border-red-600/30 rounded-xl p-6">
            <div className="text-3xl font-bold mb-2">{videos.length}</div>
            <div className="text-gray-400 text-sm">Total Videos</div>
          </div>
          <div className="bg-gradient-to-br from-green-600/20 to-green-600/5 border border-green-600/30 rounded-xl p-6">
            <div className="text-3xl font-bold mb-2">{videos.filter(v => v.isFeatured).length}</div>
            <div className="text-gray-400 text-sm">Featured</div>
          </div>
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-600/5 border border-blue-600/30 rounded-xl p-6">
            <div className="text-3xl font-bold mb-2">{videos.filter(v => v.isTrending).length}</div>
            <div className="text-gray-400 text-sm">Trending</div>
          </div>
          <div className="bg-gradient-to-br from-purple-600/20 to-purple-600/5 border border-purple-600/30 rounded-xl p-6">
            <div className="text-3xl font-bold mb-2">{videos.reduce((sum, v) => sum + v.views, 0).toLocaleString()}</div>
            <div className="text-gray-400 text-sm">Total Views</div>
          </div>
        </div>

        {/* Site Settings */}
        {showSettings && (
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 mb-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <span className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-2xl">⚙️</span>
              Site Settings
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-300">
                  Site Name *
                </label>
                <input
                  type="text"
                  value={siteSettings.siteName}
                  onChange={(e) => setSiteSettings({...siteSettings, siteName: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all"
                  placeholder="STREAMME"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-300">
                  Logo URL (optional)
                </label>
                <button
                  type="button"
                  onClick={() => logoRef.current?.click()}
                  disabled={uploading}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:border-blue-600 transition-all disabled:opacity-50 text-left flex items-center justify-between mb-2"
                >
                  <span className="text-sm truncate">{siteSettings.logo ? '✓ Logo Uploaded' : 'Upload Logo'}</span>
                  <span className="text-lg">📤</span>
                </button>
                {siteSettings.logo && (
                  <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                    <img src={siteSettings.logo} alt="Logo preview" className="h-12 w-12 object-contain rounded" />
                    <p className="text-xs text-green-400 flex-1">✓ Logo set</p>
                    <button
                      onClick={() => {
                        setSiteSettings({...siteSettings, logo: ''});
                        // Also clear the file input
                        if (logoRef.current) {
                          logoRef.current.value = '';
                        }
                      }}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                )}
                <input
                  ref={logoRef}
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = await uploadToCloudinary(file, 'thumbnail');
                      if (url) setSiteSettings({...siteSettings, logo: url});
                    }
                  }}
                  className="hidden"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-300">
                  Favicon URL (optional)
                </label>
                <button
                  type="button"
                  onClick={() => faviconRef.current?.click()}
                  disabled={uploading}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:border-blue-600 transition-all disabled:opacity-50 text-left flex items-center justify-between mb-2"
                >
                  <span className="text-sm truncate">{siteSettings.favicon ? '✓ Favicon Uploaded' : 'Upload Favicon'}</span>
                  <span className="text-lg">📤</span>
                </button>
                {siteSettings.favicon && (
                  <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                    <img src={siteSettings.favicon} alt="Favicon preview" className="h-8 w-8 object-contain rounded" />
                    <p className="text-xs text-green-400 flex-1">✓ Favicon set</p>
                    <button
                      onClick={() => {
                        setSiteSettings({...siteSettings, favicon: ''});
                        if (faviconRef.current) {
                          faviconRef.current.value = '';
                        }
                      }}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                )}
                <input
                  ref={faviconRef}
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = await uploadToCloudinary(file, 'thumbnail');
                      if (url) setSiteSettings({...siteSettings, favicon: url});
                    }
                  }}
                  className="hidden"
                />
                <p className="text-xs text-gray-500 mt-2">Recommended: .ico, .png, or .svg file (32x32px or 64x64px)</p>
              </div>

              {/* User Authentication Section */}
              <div>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={siteSettings.enableUserAuth || false}
                    onChange={(e) => setSiteSettings({...siteSettings, enableUserAuth: e.target.checked})}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-700 bg-gray-800 rounded"
                  />
                  <div>
                    <span className="text-sm font-semibold text-gray-300">Enable User Authentication</span>
                    <p className="text-xs text-gray-500 mt-1">Show login/signup buttons on the site for users</p>
                  </div>
                </label>
              </div>

              {/* Footer Settings */}
              <div className="space-y-4 p-6 bg-gray-800/30 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
                  🦶 Footer Settings
                </h3>
                
                <div>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={siteSettings.enableSecondaryFooter || false}
                      onChange={(e) => setSiteSettings({...siteSettings, enableSecondaryFooter: e.target.checked})}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-700 bg-gray-800 rounded"
                    />
                    <div>
                      <span className="text-sm font-semibold text-gray-300">Enable Secondary Footer</span>
                      <p className="text-xs text-gray-500 mt-1">Add custom content above the main footer</p>
                    </div>
                  </label>
                </div>

                {siteSettings.enableSecondaryFooter && (
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-300">
                      Secondary Footer Content
                    </label>
                    <textarea
                      value={siteSettings.secondaryFooterContent}
                      onChange={(e) => setSiteSettings({...siteSettings, secondaryFooterContent: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all min-h-[120px] resize-y"
                      placeholder="Enter your custom footer content here...\n\nExample:\nContact us: info@example.com\nAddress: 123 Main St, City, State\nPhone: (555) 123-4567"
                    />
                    <p className="text-xs text-gray-500 mt-1">This content will appear above the main developer footer</p>
                  </div>
                )}
              </div>

              {/* Advertising Settings */}
              <div className="space-y-4 p-6 bg-gray-800/30 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
                  💰 Advertising Settings
                </h3>
                
                <div>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={siteSettings.enableAds || false}
                      onChange={(e) => setSiteSettings({...siteSettings, enableAds: e.target.checked})}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-700 bg-gray-800 rounded"
                    />
                    <div>
                      <span className="text-sm font-semibold text-gray-300">Enable Advertisements</span>
                      <p className="text-xs text-gray-500 mt-1">Show ad banners throughout the site</p>
                    </div>
                  </label>
                </div>

                {siteSettings.enableAds && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-300">
                        Advertisement Type
                      </label>
                      <select
                        value={siteSettings.adType}
                        onChange={(e) => setSiteSettings({...siteSettings, adType: e.target.value as 'google' | 'custom'})}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all"
                      >
                        <option value="google">Google AdSense</option>
                        <option value="custom">Custom Banner Ads</option>
                      </select>
                    </div>

                    {siteSettings.adType === 'google' ? (
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-300">
                          Google AdSense Client ID
                        </label>
                        <input
                          type="text"
                          value={siteSettings.googleAdSenseId}
                          onChange={(e) => setSiteSettings({...siteSettings, googleAdSenseId: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all"
                          placeholder="ca-pub-xxxxxxxxxxxxxxxxx"
                        />
                        <p className="text-xs text-gray-500 mt-1">Enter your Google AdSense publisher ID</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-300">
                            Custom Ad Banner Image URL
                          </label>
                          <input
                            type="url"
                            value={siteSettings.customAdImage}
                            onChange={(e) => setSiteSettings({...siteSettings, customAdImage: e.target.value})}
                            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all"
                            placeholder="https://example.com/ad-banner.jpg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-300">
                            Custom Ad Click URL (optional)
                          </label>
                          <input
                            type="url"
                            value={siteSettings.customAdLink}
                            onChange={(e) => setSiteSettings({...siteSettings, customAdLink: e.target.value})}
                            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all"
                            placeholder="https://advertiser-website.com"
                          />
                          <p className="text-xs text-gray-500 mt-1">Leave empty if ad should not be clickable</p>
                        </div>
                        {siteSettings.customAdImage && (
                          <div className="p-3 bg-gray-800/50 rounded-lg">
                            <p className="text-xs text-gray-400 mb-2">Ad Preview:</p>
                            <img 
                              src={siteSettings.customAdImage} 
                              alt="Ad preview" 
                              className="max-h-20 rounded border border-gray-600"
                              onError={(e) => {
                                e.currentTarget.src = 'https://via.placeholder.com/400x100/374151/9ca3af?text=Invalid+Image';
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Password Change Section */}
              <div className="space-y-4 p-6 bg-gray-800/30 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
                  🔐 Change Admin Password
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <input
                    type="password"
                    placeholder="Current Password"
                    value={passwordChange.currentPassword}
                    onChange={(e) => setPasswordChange({...passwordChange, currentPassword: e.target.value})}
                    className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all"
                  />
                  <input
                    type="password"
                    placeholder="New Password (min 6 characters)"
                    value={passwordChange.newPassword}
                    onChange={(e) => setPasswordChange({...passwordChange, newPassword: e.target.value})}
                    className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all"
                  />
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={passwordChange.confirmPassword}
                    onChange={(e) => setPasswordChange({...passwordChange, confirmPassword: e.target.value})}
                    className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all"
                  />
                </div>

                {passwordChangeStatus && (
                  <div className={`p-3 rounded-lg text-sm ${
                    passwordChangeStatus.includes('✅') 
                      ? 'bg-green-900/50 border border-green-600 text-green-200' 
                      : passwordChangeStatus.includes('❌')
                      ? 'bg-red-900/50 border border-red-600 text-red-200'
                      : 'bg-yellow-900/50 border border-yellow-600 text-yellow-200'
                  }`}>
                    {passwordChangeStatus}
                  </div>
                )}

                <button
                  onClick={changePassword}
                  disabled={!passwordChange.currentPassword || !passwordChange.newPassword || !passwordChange.confirmPassword}
                  className="w-full py-3 bg-red-600 rounded-lg hover:bg-red-700 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🔐 Change Password
                </button>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={updateSettings}
                  disabled={uploading}
                  className="flex-1 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-all font-bold disabled:opacity-50"
                >
                  ✅ Save Settings
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-6 py-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all font-bold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Video Form */}
        {showForm && (
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 mb-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <span className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-2xl">🎬</span>
              {editingVideo ? 'Edit Video' : 'Add New Video'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Uploads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Thumbnail */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-300">
                    📸 Thumbnail (Portrait 2:3 ratio) *
                  </label>
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => thumbnailRef.current?.click()}
                      disabled={uploading}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:border-red-600 transition-all disabled:opacity-50 text-left flex items-center justify-between"
                    >
                      <span className="text-sm truncate">Upload Image File</span>
                      <span className="text-lg">📤</span>
                    </button>
                    <div className="text-center text-gray-400 text-sm">OR</div>
                    <input
                      type="url"
                      placeholder="Enter image URL (https://...)"
                      value={formData.thumbnail}
                      onChange={(e) => setFormData({...formData, thumbnail: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/20 transition-all"
                    />
                    {formData.thumbnail && (
                      <div className="flex items-center gap-2">
                        <img 
                          src={formData.thumbnail} 
                          alt="Thumbnail preview" 
                          className="h-16 w-10 object-cover rounded border border-gray-600" 
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/150x225/374151/9ca3af?text=Invalid';
                          }}
                        />
                        <div className="text-xs text-green-400 flex-1">✓ Thumbnail set</div>
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, thumbnail: ''})}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                  <input
                    ref={thumbnailRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'thumbnail')}
                    className="hidden"
                  />
                </div>

                {/* Poster */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-300">
                    🖼️ Poster (Landscape 16:9 ratio) *
                  </label>
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => posterRef.current?.click()}
                      disabled={uploading}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 hover:border-red-600 transition-all disabled:opacity-50 text-left flex items-center justify-between"
                    >
                      <span className="text-sm truncate">Upload Image File</span>
                      <span className="text-lg">📤</span>
                    </button>
                    <div className="text-center text-gray-400 text-sm">OR</div>
                    <input
                      type="url"
                      placeholder="Enter image URL (https://...)"
                      value={formData.poster}
                      onChange={(e) => setFormData({...formData, poster: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/20 transition-all"
                    />
                    {formData.poster && (
                      <div className="flex items-center gap-2">
                        <img 
                          src={formData.poster} 
                          alt="Poster preview" 
                          className="h-12 w-20 object-cover rounded border border-gray-600" 
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/320x180/374151/9ca3af?text=Invalid';
                          }}
                        />
                        <div className="text-xs text-green-400 flex-1">✓ Poster set</div>
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, poster: ''})}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                  <input
                    ref={posterRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'poster')}
                    className="hidden"
                  />
                </div>
              </div>
              
              {uploading && (
                <div className="flex items-center gap-3 p-3 bg-yellow-600/20 border border-yellow-600/50 rounded-lg">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-yellow-600"></div>
                  <span className="text-sm text-yellow-200">Uploading image to Cloudinary...</span>
                </div>
              )}

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input
                  type="text"
                  placeholder="Title *"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/20 transition-all"
                  required
                />
                <input
                  type="number"
                  placeholder="Year *"
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: Number(e.target.value)})}
                  className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/20 transition-all"
                  required
                />
              </div>

              <textarea
                placeholder="Description *"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/20 transition-all resize-none"
                rows={4}
                required
              />

              <input
                type="text"
                placeholder="Video URL (Bunny.net or direct MP4 link) *"
                value={formData.videoUrl}
                onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/20 transition-all font-mono text-sm"
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <input
                  type="number"
                  placeholder="Duration (minutes) *"
                  value={formData.duration || ''}
                  onChange={(e) => setFormData({...formData, duration: Number(e.target.value)})}
                  className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/20 transition-all"
                  required
                />
                <input
                  type="number"
                  step="0.1"
                  placeholder="Rating (0-10)"
                  value={formData.rating || ''}
                  onChange={(e) => setFormData({...formData, rating: Number(e.target.value)})}
                  className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/20 transition-all"
                />
                <select
                  value={formData.quality}
                  onChange={(e) => setFormData({...formData, quality: e.target.value})}
                  className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/20 transition-all"
                >
                  <option value="480p">480p</option>
                  <option value="720p">720p</option>
                  <option value="1080p">1080p</option>
                  <option value="4K">4K</option>
                </select>
              </div>

              {/* Genres */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-300">
                  🎭 Genres * <span className="text-gray-500 text-xs">({formData.genres.length} selected)</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {availableGenres.map(genre => (
                    <label key={genre} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.genres.includes(genre)}
                        onChange={() => toggleArrayField('genres', genre)}
                        className="w-4 h-4 rounded border-gray-600 text-red-600 focus:ring-red-600/20 cursor-pointer"
                      />
                      <span className="text-sm group-hover:text-red-400 transition-colors">{genre}</span>
                    </label>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add custom genre..."
                    value={customGenre}
                    onChange={(e) => setCustomGenre(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm focus:border-red-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customGenre.trim() && !formData.genres.includes(customGenre.trim())) {
                        setFormData({...formData, genres: [...formData.genres, customGenre.trim()]});
                        setCustomGenre('');
                      }
                    }}
                    className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 text-sm font-medium"
                  >
                    + Add
                  </button>
                </div>
                {formData.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.genres.map(genre => (
                      <span key={genre} className="px-3 py-1 bg-red-600/20 border border-red-600/50 rounded-full text-xs flex items-center gap-2">
                        {genre}
                        <button
                          type="button"
                          onClick={() => toggleArrayField('genres', genre)}
                          className="hover:text-red-400"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Languages */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-300">
                  🌍 Languages * <span className="text-gray-500 text-xs">({formData.languages.length} selected)</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {availableLanguages.map(language => (
                    <label key={language} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.languages.includes(language)}
                        onChange={() => toggleArrayField('languages', language)}
                        className="w-4 h-4 rounded border-gray-600 text-red-600 focus:ring-red-600/20 cursor-pointer"
                      />
                      <span className="text-sm group-hover:text-red-400 transition-colors">{language}</span>
                    </label>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add custom language..."
                    value={customLanguage}
                    onChange={(e) => setCustomLanguage(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm focus:border-red-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customLanguage.trim() && !formData.languages.includes(customLanguage.trim())) {
                        setFormData({...formData, languages: [...formData.languages, customLanguage.trim()]});
                        setCustomLanguage('');
                      }
                    }}
                    className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 text-sm font-medium"
                  >
                    + Add
                  </button>
                </div>
                {formData.languages.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.languages.map(language => (
                      <span key={language} className="px-3 py-1 bg-blue-600/20 border border-blue-600/50 rounded-full text-xs flex items-center gap-2">
                        {language}
                        <button
                          type="button"
                          onClick={() => toggleArrayField('languages', language)}
                          className="hover:text-blue-400"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Categories */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-300">
                  📂 Categories * <span className="text-gray-500 text-xs">({formData.categories.length} selected)</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {availableCategories.map(category => (
                    <label key={category} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.categories.includes(category)}
                        onChange={() => toggleArrayField('categories', category)}
                        className="w-4 h-4 rounded border-gray-600 text-red-600 focus:ring-red-600/20 cursor-pointer"
                      />
                      <span className="text-sm group-hover:text-red-400 transition-colors">{category}</span>
                    </label>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add custom category..."
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-sm focus:border-red-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customCategory.trim() && !formData.categories.includes(customCategory.trim())) {
                        setFormData({...formData, categories: [...formData.categories, customCategory.trim()]});
                        setCustomCategory('');
                      }
                    }}
                    className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 text-sm font-medium"
                  >
                    + Add
                  </button>
                </div>
                {formData.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.categories.map(category => (
                      <span key={category} className="px-3 py-1 bg-green-600/20 border border-green-600/50 rounded-full text-xs flex items-center gap-2">
                        {category}
                        <button
                          type="button"
                          onClick={() => toggleArrayField('categories', category)}
                          className="hover:text-green-400"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Universe */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-300">
                  🌌 Universe (optional)
                </label>
                <select
                  value={formData.universe}
                  onChange={(e) => setFormData({...formData, universe: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/20 transition-all mb-2"
                >
                  <option value="">No Universe</option>
                  <option value="MCU">Marvel Cinematic Universe (MCU)</option>
                  <option value="DCU">DC Universe (DCU)</option>
                  <option value="DCEU">DC Extended Universe (DCEU)</option>
                  <option value="Arrowverse">Arrowverse</option>
                  <option value="Star Wars">Star Wars</option>
                  <option value="Star Trek">Star Trek</option>
                  <option value="Fast & Furious">Fast & Furious</option>
                  <option value="John Wick">John Wick Universe</option>
                  <option value="Monsterverse">Monsterverse</option>
                  <option value="Middle-earth">Middle-earth</option>
                  <option value="custom">Custom Universe</option>
                </select>
                {formData.universe === 'custom' && (
                  <input
                    type="text"
                    placeholder="Enter custom universe name..."
                    onChange={(e) => setFormData({...formData, universe: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/20 transition-all"
                  />
                )}
                {formData.universe && formData.universe !== 'custom' && (
                  <p className="text-xs text-purple-400 mt-1">🌟 Videos with universe tags get special sections on the user side</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input
                  type="text"
                  placeholder="Cast (Actor 1, Actor 2)"
                  value={formData.cast}
                  onChange={(e) => setFormData({...formData, cast: e.target.value})}
                  className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/20 transition-all"
                />
                <input
                  type="text"
                  placeholder="Director"
                  value={formData.director}
                  onChange={(e) => setFormData({...formData, director: e.target.value})}
                  className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/20 transition-all"
                />
              </div>

              <div className="flex gap-8 p-4 bg-gray-800/30 rounded-lg">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isTrending}
                    onChange={(e) => setFormData({...formData, isTrending: e.target.checked})}
                    className="w-5 h-5 rounded border-gray-700 text-red-600 focus:ring-red-600/20"
                  />
                  <span className="text-sm font-medium">🔥 Trending</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                    className="w-5 h-5 rounded border-gray-700 text-red-600 focus:ring-red-600/20"
                  />
                  <span className="text-sm font-medium">⭐ Featured (Hero Banner)</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full py-4 bg-gradient-to-r from-red-600 to-red-500 rounded-lg hover:from-red-700 hover:to-red-600 transition-all font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-600/30"
              >
                {uploading ? '⏳ Uploading Images...' : editingVideo ? '✅ Update Video' : '✨ Add Video to Platform'}
              </button>
            </form>
          </div>
        )}

        {/* Videos Grid - Hide when adding video */}
        {!showForm && (
          <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-gray-700/50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <h2 className="text-xl font-bold">📚 All Videos ({filteredVideos.length} of {videos.length})</h2>
              
              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:border-red-600 focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  {availableCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <select
                  value={filters.language}
                  onChange={(e) => setFilters({...filters, language: e.target.value})}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:border-red-600 focus:outline-none"
                >
                  <option value="all">All Languages</option>
                  {availableLanguages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>

                <select
                  value={filters.genre}
                  onChange={(e) => setFilters({...filters, genre: e.target.value})}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:border-red-600 focus:outline-none"
                >
                  <option value="all">All Genres</option>
                  {availableGenres.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>

                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:border-red-600 focus:outline-none"
                >
                  <option value="latest">Latest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="views">Most Views</option>
                  <option value="title">Alphabetical</option>
                </select>
              </div>
            </div>
          </div>
          
          {videos.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                🎬
              </div>
              <h3 className="text-2xl font-bold mb-3">No videos yet</h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">Start building your streaming library by adding your first video</p>
              <button
                onClick={() => setShowForm(true)}
                className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-500 rounded-lg hover:from-red-700 hover:to-red-600 transition-all font-bold text-lg shadow-lg shadow-red-600/30"
              >
                + Add First Video
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
              {filteredVideos.map((video) => {
                // Validate URL
                const isValidUrl = (url: string) => {
                  try {
                    new URL(url);
                    return true;
                  } catch {
                    return false;
                  }
                };
                const thumbnailUrl = video.thumbnail && isValidUrl(video.thumbnail) 
                  ? video.thumbnail 
                  : 'https://via.placeholder.com/300x450/1f2937/9ca3af?text=No+Image';
                
                return (
                <div key={video._id} className="group relative bg-gray-800/50 rounded-xl overflow-hidden hover:scale-105 transition-all duration-300 border border-gray-700/50 hover:border-red-600/50 hover:shadow-2xl hover:shadow-red-600/20">
                  <div className="relative aspect-[2/3]">
                    <Image
                      src={thumbnailUrl}
                      alt={video.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 left-2 right-2 flex justify-between">
                      {video.isFeatured && (
                        <span className="px-2 py-1 bg-yellow-500 rounded text-xs font-bold text-black">
                          ⭐ FEATURED
                        </span>
                      )}
                      {video.isTrending && (
                        <span className="px-2 py-1 bg-green-500 rounded text-xs font-bold text-black ml-auto">
                          🔥 TRENDING
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold mb-1 truncate text-lg">{video.title}</h3>
                    <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                      <span>{video.year}</span>
                      <span>{video.views.toLocaleString()} views</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {video.genres.slice(0, 3).map((genre, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-700 rounded text-xs">
                          {genre}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => loadVideoForEdit(video._id)}
                        className="flex-1 py-2.5 bg-blue-600/20 hover:bg-blue-600 rounded-lg transition-all text-sm font-semibold"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(video._id)}
                        className="flex-1 py-2.5 bg-red-600/20 hover:bg-red-600 rounded-lg transition-all text-sm font-semibold"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}
