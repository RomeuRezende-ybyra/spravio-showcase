import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './button'

describe('Button', () => {
  it('renders with children text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('applies default variant classes', () => {
    render(<Button>Default</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('bg-teal-600')
  })

  it('applies outline variant classes', () => {
    render(<Button variant="outline">Outline</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('border')
    expect(btn.className).toContain('bg-white')
  })

  it('applies destructive variant classes', () => {
    render(<Button variant="destructive">Delete</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('bg-red-600')
  })

  it('handles click events', async () => {
    const user = userEvent.setup()
    let clicked = false
    render(<Button onClick={() => { clicked = true }}>Press</Button>)

    await user.click(screen.getByRole('button'))
    expect(clicked).toBe(true)
  })

  it('is disabled when disabled prop is set', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('applies small size class', () => {
    render(<Button size="sm">Small</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('h-8')
  })

  it('merges custom className', () => {
    render(<Button className="my-custom">Styled</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('my-custom')
  })
})
