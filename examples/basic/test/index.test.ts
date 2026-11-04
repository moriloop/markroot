import { describe, expect, it } from 'vitest'
import { run } from '../src'

describe('example', () => {
  it('consumes both workspace packages', () => {
    expect(run()).toBe('Hello, monorepo! Hello, example!')
  })
})
