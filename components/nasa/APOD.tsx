'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Download, ExternalLink, Star, Camera, AlertTriangle, Globe, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface APOD {
  date: string;
  title: string;
  explanation: string;
  url: string;
  hdurl: string;
  media_type: string;
  copyright?: string;
}

export default function NASAPage() {
  const [apod, setApod] = useState<APOD | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [apiStatus, setApiStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');

  useEffect(() => {
    fetchAPOD();
  }, []);

  const fetchAPOD = async (date?: string) => {
    setApiStatus('loading');
    try {
      const apiKey = process.env.NEXT_PUBLIC_NASA_API_KEY || 'DEMO_KEY';
      const url = date 
        ? `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&date=${date}`
        : `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: APOD = await response.json();
      setApod(data);
      setApiStatus('success');
      toast.success('Data APOD berhasil dimuat!');
    } catch (error: any) {
      console.error('APOD Error:', error);
      setApiStatus('error');
      
      // Fallback data jika API error
      setApod({
        date: new Date().toISOString().split('T')[0],
        title: 'Astronomy Picture of the Day',
        explanation: 'Gagal memuat data dari NASA API. Silakan coba lagi nanti atau periksa API key Anda.',
        url: 'https://apod.nasa.gov/apod/image/2402/OrionDragon_Horalek_960.jpg',
        hdurl: 'https://apod.nasa.gov/apod/image/2402/OrionDragon_Horalek_2048.jpg',
        media_type: 'image',
        copyright: 'NASA'
      });
      
      toast.error('Gagal mengambil data APOD. Menggunakan data contoh.');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleSearch = () => {
    if (selectedDate) {
      fetchAPOD(selectedDate);
    }
  };

  const handleRefresh = () => {
    fetchAPOD();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Render loading skeleton
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-8 w-96" />
          <Skeleton className="h-96 w-full rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-2">
                <Globe className="h-8 w-8 text-blue-400" />
                NASA Astronomy Picture of the Day
              </h1>
              <p className="text-gray-400">Gambar astronomi pilihan NASA setiap hari</p>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-800">
                <div className={`h-2 w-2 rounded-full ${
                  apiStatus === 'success' ? 'bg-green-500' :
                  apiStatus === 'loading' ? 'bg-yellow-500 animate-pulse' :
                  apiStatus === 'error' ? 'bg-red-500' : 'bg-gray-500'
                }`}></div>
                <span className="text-sm text-gray-300">
                  {apiStatus === 'success' ? 'API Connected' :
                   apiStatus === 'loading' ? 'Loading...' :
                   apiStatus === 'error' ? 'API Error' : 'Idle'}
                </span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="border-gray-700 hover:bg-gray-800"
                disabled={apiStatus === 'loading'}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${apiStatus === 'loading' ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Date Picker */}
          <Card className="border-gray-800 bg-gray-900/50 mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-400" />
                  <span className="text-gray-300">Pilih tanggal lain:</span>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    max={new Date().toISOString().split('T')[0]}
                    min="1995-06-16" // APOD started on June 16, 1995
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm"
                  />
                  
                  <Button 
                    onClick={handleSearch}
                    disabled={!selectedDate || apiStatus === 'loading'}
                    className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
                  >
                    Tampilkan Gambar
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setSelectedDate('');
                      fetchAPOD();
                    }}
                    disabled={apiStatus === 'loading'}
                    className="border-gray-700 hover:bg-gray-800 whitespace-nowrap"
                  >
                    Hari Ini
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* APOD Content */}
        <Card className="border-gray-800 bg-gray-900/50 mb-8 overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <CardTitle className="text-2xl text-white mb-1">
                  {apod?.title || 'Astronomy Picture of the Day'}
                </CardTitle>
                <CardDescription className="text-gray-400 flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  {apod ? formatDate(apod.date) : formatDate(new Date().toISOString())}
                  {apod?.copyright && ` • © ${apod.copyright}`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Image/Video */}
            <div className="rounded-xl overflow-hidden mb-6 border border-gray-800">
              {apod?.media_type === 'image' ? (
                <div className="relative bg-gradient-to-br from-purple-900/10 to-blue-900/10">
                  <img
                    src={apod?.url || 'https://apod.nasa.gov/apod/image/2402/OrionDragon_Horalek_960.jpg'}
                    alt={apod?.title || 'NASA APOD'}
                    className="w-full h-auto max-h-[70vh] object-contain"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="aspect-video">
                  <iframe
                    src={apod?.url}
                    title={apod?.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
            </div>
            
            {/* Explanation */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">📖</span> Penjelasan
              </h3>
              <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-line">
                {apod?.explanation || 'Loading description...'}
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {apod?.hdurl && (
                <Button 
                  asChild
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <a 
                    href={apod.hdurl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Lihat Gambar HD
                  </a>
                </Button>
              )}
              
              <Button 
                asChild
                variant="outline"
                className="border-gray-700 hover:bg-gray-800"
              >
                <a 
                  href={apod?.url || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </a>
              </Button>
              
              <Button 
                asChild
                variant="outline"
                className="border-gray-700 hover:bg-gray-800"
              >
                <a 
                  href="https://apod.nasa.gov/apod/archivepix.html" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Arsip APOD
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Box */}
        <Card className="border-gray-800 bg-blue-900/20 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-blue-600/30 flex items-center justify-center">
                  <Globe className="h-6 w-6 text-blue-400" />
                </div>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Tentang NASA APOD</h3>
                <p className="text-gray-300 text-sm">
                  Astronomy Picture of the Day (APOD) adalah layanan yang disediakan oleh NASA dan Michigan Technological University (MTU). 
                  Setiap hari gambar atau foto yang berbeda dari alam semesta kita ditampilkan, bersama dengan penjelasan singkat yang ditulis oleh astronom profesional.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-gray-800 bg-gray-900/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-purple-600/20 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Dimulai Sejak</p>
                  <p className="text-white text-xl font-semibold">16 Juni 1995</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-gray-800 bg-gray-900/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-blue-600/20 flex items-center justify-center">
                  <Camera className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total Gambar</p>
                  <p className="text-white text-xl font-semibold">10,000+</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-gray-800 bg-gray-900/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-green-600/20 flex items-center justify-center">
                  <Star className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Diperbarui</p>
                  <p className="text-white text-xl font-semibold">Setiap Hari</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}