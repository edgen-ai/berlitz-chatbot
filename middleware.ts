import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { RouteLogOutput } from './lib/types'

export async function middleware(request: NextRequest) {
  const start = Date.now()
  const requestId = uuidv4()

  // Attach the start time and request ID to the request headers
  request.headers.set('x-start-time', start.toString())
  request.headers.set('x-request-id', requestId)
  const routeLog: RouteLogOutput =
    `${requestId} | ${start.toString()} | ${request.method} | ${request.nextUrl.pathname}` as RouteLogOutput
  console.log(routeLog)

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}
