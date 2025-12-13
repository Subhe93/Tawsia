import { NextResponse } from 'next/server'
import { getCompanies } from '@/lib/database/queries'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') || undefined
    const country = searchParams.get('country') || undefined
    const city = searchParams.get('city') || undefined
    const category = searchParams.get('category') || undefined
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10) || 12, 1), 50) : 12

    const result = await getCompanies({ query, country, city, category, limit })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in /api/companies:', error)
    return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 })
  }
}


