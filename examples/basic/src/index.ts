import { greet, HelloFromLib } from '@repo/core'

export function run(name = 'example'): string {
  return `${HelloFromLib} ${greet(name)}`
}
