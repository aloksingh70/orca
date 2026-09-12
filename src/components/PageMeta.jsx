import { useEffect } from 'react'

/**
 * PageMeta
 * ---------------------------------------------------------------------------
 * Lightweight per-route document head manager without external dependencies.
 * Updates document.title, description, and Open Graph / Twitter tags dynamically.
 * ---------------------------------------------------------------------------
 */
export default function PageMeta({
  title = 'ORCA — Marine Fishing Zone Advisory | SIH26176',
  description = 'Operational marine harvesting advisory and explainable AI safety intelligence for coastal fishermen across the Bay of Bengal.',
  ogTitle = null,
  ogDescription = null,
  ogImage = '/og-image.png'
}) {
  useEffect(() => {
    // 1. Update Document Title
    const prevTitle = document.title
    document.title = title

    // Helper to get or create a meta tag
    const setMetaTag = (selector, attrName, attrValue, content) => {
      let el = document.querySelector(selector)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attrName, attrValue)
        document.head.appendChild(el)
      }
      el.setAttribute('content', content)
    }

    // 2. Standard Meta Description
    setMetaTag('meta[name="description"]', 'name', 'description', description)

    // 3. Open Graph Tags
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', ogTitle || title)
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', ogDescription || description)
    if (ogImage) {
      setMetaTag('meta[property="og:image"]', 'property', 'og:image', ogImage)
    }

    // 4. Twitter Card Tags
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', ogTitle || title)
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', ogDescription || description)
    if (ogImage) {
      setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', ogImage)
    }

    return () => {
      // Optional: restore previous title if needed
    }
  }, [title, description, ogTitle, ogDescription, ogImage])

  return null
}
