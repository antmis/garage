import { useEffect, type RefObject } from 'react'

/**
 * Publishes the element's height as a CSS variable on <html> (default `--app-header-h`) so sticky
 * content below a sticky element can use `top-[var(--app-header-h)]`. Reports 0 while `display: none`.
 */
export function useStickyOffset(ref: RefObject<HTMLElement | null>, name = '--app-header-h') {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const root = document.documentElement
    const publish = () => root.style.setProperty(name, `${el.getBoundingClientRect().height}px`)
    // Set now too: ResizeObserver only reports on a rendered frame, which a hidden tab never gets.
    publish()
    const observer = new ResizeObserver(publish)
    observer.observe(el)
    return () => {
      observer.disconnect()
      root.style.removeProperty(name)
    }
  }, [ref, name])
}
