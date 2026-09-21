import { Platform } from '@ai-chat-beat/common'
import { AdaptError, AdaptResult, AdaptSuccess, AdapterResultStatus } from '../../types/adapter'

export function parseChatRequestBody(platform: Platform, body: unknown): any {
  if (typeof body === 'string') {
    return JSON.parse(body)
  }
  if (body instanceof Uint8Array) {
    const text = new TextDecoder().decode(body)
    return JSON.parse(text)
  }
  throw new Error(`unsupported body type for platform: ${platform}`)
}

export function createPlatformError(platform: Platform) {
  return function (message: unknown): AdaptError {
    return {
      status: AdapterResultStatus.error,
      message,
      platform,
    }
  }
}

export function createSuccess<T>(data: T): AdaptSuccess<T> {
  return {
    status: AdapterResultStatus.success,
    data,
  }
}

export function createAdapterErrorBoundary<T extends AdaptResult>(
  id: string,
  innerScript: (...args: any[]) => T,
) {
  return (...args: any[]) => {
    try {
      return innerScript(...args)
    } catch (err) {
      const errorResult = {
        status: AdapterResultStatus.error,
        message: `${id}: ${err}`,
      } as T

      return errorResult
    }
  }
}
