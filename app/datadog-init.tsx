'use client'

import { useEffect } from 'react'
import { datadogRum } from '@datadog/browser-rum'
import { nextjsPlugin } from '@datadog/browser-rum-nextjs'

export default function DatadogInit() {
  useEffect(() => {
    datadogRum.init({
      applicationId: 'c7765001-71a2-4df0-97d0-323889be2d51',
      clientToken: 'pub2d0bbd0682c28a9b9691c4f60cf6bced',
      site: 'datadoghq.com',
      service: 'deeplove-web',
      env: process.env.NODE_ENV,
      sessionSampleRate: 100,
      sessionReplaySampleRate: 20,
      trackResources: true,
      trackUserInteractions: true,
      trackLongTasks: true,
      plugins: [nextjsPlugin()],
    })
  }, [])

  return null
}
