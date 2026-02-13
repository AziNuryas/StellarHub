const NASA_API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY'
const NASA_BASE_URL = 'https://api.nasa.gov'

export interface APODData {
  date: string
  title: string
  explanation: string
  url: string
  hdurl?: string
  media_type: 'image' | 'video'
  copyright?: string
}

export async function fetchAPOD(date?: string): Promise<APODData> {
  const url = new URL('/planetary/apod', NASA_BASE_URL)
  url.searchParams.set('api_key', NASA_API_KEY)
  if (date) url.searchParams.set('date', date)
  
  const response = await fetch(url.toString(), {
    next: { revalidate: 86400 } // Cache 24 jam
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch APOD')
  }
  
  return response.json()
}

export async function fetchNASANews(): Promise<any> {
  const url = new URL('/planetary/apod', NASA_BASE_URL)
  url.searchParams.set('api_key', NASA_API_KEY)
  url.searchParams.set('count', '5')
  
  const response = await fetch(url.toString(), {
    next: { revalidate: 3600 } // Cache 1 jam
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch NASA news')
  }
  
  return response.json()
}

export async function fetchMarsWeather(): Promise<any> {
  const url = new URL('/insight_weather/', NASA_BASE_URL.replace('api.', 'api.nasa.gov/'))
  url.searchParams.set('api_key', NASA_API_KEY)
  url.searchParams.set('feedtype', 'json')
  url.searchParams.set('ver', '1.0')
  
  const response = await fetch(url.toString(), {
    next: { revalidate: 3600 }
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch Mars weather')
  }
  
  return response.json()
}
