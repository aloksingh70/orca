/**
 * api.js
 * ---------------------------------------------------------------------------
 * Unified API Client for ORCA Marine Backend Services.
 *
 * Provides typed requests with graceful offline / backend reachability detection.
 * If backend is unreachable, methods return structured errors without crashing UI.
 * ---------------------------------------------------------------------------
 */

export async function request(endpoint, options = {}) {
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  }

  // Inject auth token from localStorage if present
  try {
    const token = localStorage.getItem('orca_jwt_token')
    if (token && !defaultHeaders['Authorization']) {
      defaultHeaders['Authorization'] = `Bearer ${token}`
    }
  } catch (e) {
    // LocalStorage unavailable
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || 8000)

    const res = await fetch(endpoint, {
      ...options,
      headers: defaultHeaders,
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!res.ok) {
      let errorDetail = `Request failed with status ${res.status}`
      try {
        const errJson = await res.json()
        errorDetail = errJson.detail || errorDetail
      } catch {
        // Not JSON
      }
      return { data: null, error: errorDetail, status: res.status, isLive: true }
    }

    // Check if returning blob or json
    const contentType = res.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      const data = await res.json()
      return { data, error: null, status: res.status, isLive: true }
    } else {
      const blob = await res.blob()
      return { data: blob, error: null, status: res.status, isLive: true }
    }
  } catch (err) {
    const isNetworkError = err.name === 'AbortError' || err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')
    return {
      data: null,
      error: isNetworkError ? 'Backend server unreachable. Verify FastAPI is active on port 8000.' : err.message,
      status: 0,
      isLive: false
    }
  }
}

// -----------------------------------------------------------------------------
// 5.1 Fisherman Catch Log API
// -----------------------------------------------------------------------------
export async function getCatchLogs(zoneId = null, limit = 20) {
  let url = `/api/catch-log?limit=${limit}`
  if (zoneId) url += `&zone_id=${encodeURIComponent(zoneId)}`
  return request(url)
}

export async function createCatchLog(payload) {
  return request('/api/catch-log', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

// -----------------------------------------------------------------------------
// 5.2 Officer Violation History Report API
// -----------------------------------------------------------------------------
export async function getViolations(zoneId = null, limit = 20) {
  let url = `/api/violations?limit=${limit}`
  if (zoneId) url += `&zone_id=${encodeURIComponent(zoneId)}`
  return request(url)
}

// -----------------------------------------------------------------------------
// 5.3 Scientist Real Scan Audit Export API
// -----------------------------------------------------------------------------
export async function exportScanAuditLog(options = {}) {
  const format = typeof options === 'string' ? options : (options.format || 'csv')
  const zoneId = options.zoneId || ''
  const startDate = options.startDate || ''
  const endDate = options.endDate || ''

  let url = `/api/scan-log/export?format=${format}`
  if (zoneId) url += `&zone_id=${encodeURIComponent(zoneId)}`
  if (startDate) url += `&start_date=${encodeURIComponent(startDate)}`
  if (endDate) url += `&end_date=${encodeURIComponent(endDate)}`

  const res = await request(url)
  if (res.data instanceof Blob) {
    const downloadUrl = window.URL.createObjectURL(res.data)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = `orca_scan_audit_log_${new Date().toISOString().slice(0, 10)}.${format}`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(downloadUrl)
  }
  return res
}

// -----------------------------------------------------------------------------
// 5.4 Port Operator Logged Landings API
// -----------------------------------------------------------------------------
export async function getLandingLogs(zoneId = null, startDate = null, endDate = null, limit = 20) {
  let url = `/api/landing-log?limit=${limit}`
  if (zoneId) url += `&zone_id=${encodeURIComponent(zoneId)}`
  if (startDate) url += `&start_date=${encodeURIComponent(startDate)}`
  if (endDate) url += `&end_date=${encodeURIComponent(endDate)}`
  return request(url)
}

export async function createLandingLog(payload) {
  return request('/api/landing-log', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
}

// Convenience Aliases for UI Decks
export const fetchCatchLogs = async (zoneId, limit) => {
  const res = await getCatchLogs(zoneId, limit)
  return res.data || []
}
export const submitCatchLog = createCatchLog

export const fetchViolations = async (zoneId, limit) => {
  const res = await getViolations(zoneId, limit)
  return res.data || []
}

export const fetchLandingLogs = async (zoneId, startDate, endDate, limit) => {
  const res = await getLandingLogs(zoneId, startDate, endDate, limit)
  return res.data || []
}
export const submitLandingLog = createLandingLog

import { getLiveVessels as getClientLiveVessels } from './vessels.js'

// -----------------------------------------------------------------------------
// 5.5 Live Maritime AIS Vessel Tracking API
// -----------------------------------------------------------------------------
export async function getLiveVessels(category = 'all', regionId = null, portId = null) {
  let url = '/api/vessels/live'
  const params = []
  if (category && category !== 'all') params.push(`category=${encodeURIComponent(category)}`)
  if (regionId) params.push(`region_id=${encodeURIComponent(regionId)}`)
  if (portId) params.push(`port_id=${encodeURIComponent(portId)}`)
  if (params.length > 0) url += `?${params.join('&')}`

  const res = await request(url)
  if (res.error || !res.data || res.data.length === 0) {
    // Graceful client fallback to deterministic AIS telemetry
    return { data: getClientLiveVessels({ regionId, portId, category }), error: null, status: 200, isLive: false }
  }
  return res
}

export const fetchLiveVessels = async (category = 'all', regionId = null, portId = null) => {
  const res = await getLiveVessels(category, regionId, portId)
  return res.data || []
}

// -----------------------------------------------------------------------------
// 5.6 Official Live Telemetry Verification API
// -----------------------------------------------------------------------------
export async function getLiveTelemetryVerification() {
  return request('/api/telemetry/live-verify')
}

export const fetchLiveVerification = async () => {
  const res = await getLiveTelemetryVerification()
  return res.data || null
}

