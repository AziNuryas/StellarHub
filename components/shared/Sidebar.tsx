'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, Users, Calendar, Telescope, 
  Satellite, Star, Globe, Rocket, Hash 
} from 'lucide-react'

export default function Sidebar() {
  const trendingTopics = [
    { name: 'Gerhana Bulan', count: 245 },
    { name: 'James Webb', count: 189 },
    { name: 'Bimasakti', count: 156 },
    { name: 'Planet Mars', count: 132 },
    { name: 'Astrofotografi', count: 98 },
  ]

  const upcomingEvents = [
    { title: 'Star Party Bandung', date: '15 Mar 2024' },
    { title: 'Workshop Astrofoto', date: '22 Mar 2024' },
    { title: 'Pengamatan Meteor', date: '5 Apr 2024' },
  ]

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card className="border-gray-800 bg-gray-900/50">
        <CardContent className="p-6">
          <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              + Buat Postingan
            </Button>
            <Button variant="outline" className="w-full border-gray-700 text-gray-300 hover:bg-gray-800">
              <Telescope className="mr-2 h-4 w-4" />
              Laporkan Observasi
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Community Stats */}
      <Card className="border-gray-800 bg-gray-900/50">
        <CardContent className="p-6">
          <h3 className="font-semibold text-white mb-4">📊 Stats Komunitas</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-400" />
                <span className="text-gray-300">Total Anggota</span>
              </div>
              <span className="text-white font-semibold">1,234</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-400" />
                <span className="text-gray-300">Postingan Hari Ini</span>
              </div>
              <span className="text-white font-semibold">47</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-green-400" />
                <span className="text-gray-300">Online Sekarang</span>
              </div>
              <span className="text-white font-semibold">89</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trending Topics */}
      <Card className="border-gray-800 bg-gray-900/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Trending Topics
            </h3>
            <Badge variant="outline" className="border-purple-700 text-purple-300">
              24 jam
            </Badge>
          </div>
          <div className="space-y-3">
            {trendingTopics.map((topic, index) => (
              <Link
                key={index}
                href={`/explore?tag=${topic.name.toLowerCase()}`}
                className="flex items-center justify-between p-2 hover:bg-gray-800 rounded transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <Hash className="h-3 w-3 text-gray-500 group-hover:text-purple-400" />
                  <span className="text-gray-300 group-hover:text-white">{topic.name}</span>
                </div>
                <Badge className="bg-gray-800 text-gray-300 group-hover:bg-purple-900">
                  {topic.count}
                </Badge>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card className="border-gray-800 bg-gray-900/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Upcoming Events
            </h3>
            <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300">
              Lihat semua
            </Button>
          </div>
          <div className="space-y-3">
            {upcomingEvents.map((event, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 hover:bg-gray-800 rounded transition-colors"
              >
                <div>
                  <p className="text-white text-sm font-medium">{event.title}</p>
                  <p className="text-gray-400 text-xs">{event.date}</p>
                </div>
                <Button size="sm" variant="outline" className="border-gray-700 hover:border-purple-600">
                  Join
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
