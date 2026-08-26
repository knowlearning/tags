const latestMutation = new Map()
const RETRY_DELAYS = [250, 500, 1000, 2000, 4000]

const wait = milliseconds =>
  new Promise(resolve => setTimeout(resolve, milliseconds))

function mutationKey(partition, tag, target) {
  return JSON.stringify([partition, tag, target])
}

async function isApplied(partition, tag, target, shouldExist) {
  const rows = await Agent.query(
    'tagging-for-target',
    [partition, tag, target]
  )

  return Boolean(rows?.length) === shouldExist
}

function reportFailure({ action, partition, tag, target }) {
  window.dispatchEvent(new CustomEvent('tag-mutation-failed', {
    detail: {
      message: `Could not ${action} tag ${tag} on ${target} in ${partition}.`
    }
  }))
}

export async function mutateTag({
  partition,
  tag,
  target,
  value,
  onConfirmed,
  onFailed
}) {
  const key = mutationKey(partition, tag, target)
  const mutation = Symbol(key)

  latestMutation.set(key, mutation)

  const tags = await Agent.state('tags')

  // Apply the optimistic write immediately. Verification runs independently,
  // allowing additional tagging operations to proceed without waiting.
  if (!tags[tag]) tags[tag] = {}

  tags[tag][target] = {
    partition,
    value
  }

  void (async () => {
    const shouldExist = value !== null

    for (const delay of RETRY_DELAYS) {
      await wait(delay)

      // A newer mutation for this same tagging supersedes this verification.
      if (latestMutation.get(key) !== mutation) return

      try {
        if (await isApplied(partition, tag, target, shouldExist)) {
          latestMutation.delete(key)
          onConfirmed?.()
          return
        }
      } catch (error) {
        console.warn('Could not verify tagging mutation yet', error)
      }
    }

    // A newer mutation may have occurred during the final query.
    if (latestMutation.get(key) !== mutation) return

    latestMutation.delete(key)

    reportFailure({
      action: shouldExist ? 'add' : 'remove',
      partition,
      tag,
      target
    })

    onFailed?.()
  })()
}