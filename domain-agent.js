  import Agent, { getAgent } from 'npm:@knowlearning/agents/deno.js'

  // TRANSLATION AGENT STUFF
  // const TRANSLATION_DOMAIN = 'f74e9cb3-2b53-4c85-9b0c-f1d61b032b3f.localhost:5889'
  const TRANSLATION_DOMAIN = 'translations.pilaproject.org'
  const TRANSLATABLE_TARGET_TYPE = 'application/json;type=translatable_target'

  const TranslationAgent = getAgent(TRANSLATION_DOMAIN)

  Agent.on('child', child => {
    child.on('mutate', async ({ id }) => {
      if (await isTranslatableItem(id)) {
        await handleTranslatableItem(id)
      }
    })
  })

  async function handleTranslatableItem(id) {
    const itemState = await TranslationAgent.state(id)
    const itemMetadata = await TranslationAgent.metadata(id)
    await Promise.all(itemState.translations.paths.map(async path => {
      const translatableTargetName = `translatable_target/${JSON.stringify([id, ...path])}`
      const translatableTargetMetadata = await TranslationAgent.metadata(translatableTargetName)

      if (translatableTargetMetadata.active_type !== TRANSLATABLE_TARGET_TYPE) {
        translatableTargetMetadata.active_type = TRANSLATABLE_TARGET_TYPE
      }

      const translatableTarget = await TranslationAgent.state(translatableTargetName)
      const source_string = resolvePath([...path], itemState)

      translatableTarget.source_language = itemState.translations.source_language
      translatableTarget.source_string = source_string || null
      translatableTarget.path = [id, ...path]
      translatableTarget.ii = itemMetadata.ii
    }))
  }

  function resolvePath(path, value) {
      while (path.length && value) value = value[path.shift()]
      return value
    }




  const sessions = {}
  async function isTranslatableItem(id) {
    if (sessions[id]) return false

    const state = await Agent.state(id)
    const { name } = await Agent.metadata(id)

    if (name === 'sessions') sessions[id] = true

    const translations = state.translations

    if (!translations) return false
    const { source_language, paths } = translations
    if (!source_language) return false
    if (!paths) return false
  
    const validSourceLang = typeof source_language === 'string' && source_language.length >= 2
    const validPaths = Array.isArray(paths) && paths.every(p => Array.isArray(p))
    return validSourceLang && validPaths
  }
  // END TRANSLATION AGENT STUFF


  const TAGGING_TYPE = 'application/json;type=tagging'

  const PUBLIC_TAGS_PARTITION = 'Public Tags'

  const ADMIN_TAG = "36e1b060-ed49-11ee-be89-5b04faf266ea"
  const TEACHER_TAG = "49bf66a0-ed49-11ee-be89-5b04faf266ea"
  const TRAINER_TAG = "8ae541e0-ed49-11ee-be89-5b04faf266ea"
  const THAI_TEACHER_LABEL = "bc66acf0-7249-11f0-a043-df27bf1150f5"
  const PILA_CONTENT_TAG = "1a53db50-e248-11ee-ab5f-07f4a7408770"
  const PILA_COMPETENCY_TAG = "f760dad0-f133-11ee-804e-27f76a81958c"

  Agent.on('child', child => {
    const { environment: { user } } = child

    child.on('mutate', async mutation => {
      const { scope, patch } = mutation

      if (scope === 'tags') {
        Agent.log('GOT TAGGING PATCH', patch)
        await Promise.all(patch.map(async ({ path, value: patchValue={} }) => {
          if (path.length === 2) {
            const [ tag, target ] = path
            const { partition=user, context=null, value=null } = patchValue || {}
            let contributor = user

            // The only agents able to overwrite contributor are trusted domains
            if (isTrustedDomain(user)) contributor = patchValue.contributor || user

            const apply = () => applyTagging(partition, tag, target, contributor, value, context)
            const reject = () => Agent.log(`User tagging rejected`, partition, user, contributor, tag)

            if (partition === contributor) apply()
            else if (partition === PUBLIC_TAGS_PARTITION) apply()
            else if (isPILAPartition(partition)) {
              if (isSuperAdmin(partition, contributor)) apply()
              //  users' PILA applications can tag users into RCT Buckets (admins may override)
              else if (
                isRCTBucketTag(tag)
                && (
                  target === contributor
                  || await isAdmin(partition, contributor)
                )
              ) apply()
              else if (tag === PILA_CONTENT_TAG || tag === THAI_TEACHER_LABEL) {
                if (await isAdmin(partition, contributor)) apply()
                else reject()
              }
              else if (tag === TRAINER_TAG || tag === TEACHER_TAG) {
                if (await isTrainer(partition, contributor)) apply()
                else reject()
              }
              else if (await hasTag(partition, PILA_COMPETENCY_TAG, tag)) {
                if (await isAdmin(partition, contributor)) apply()
                else if (await ownsTarget(contributor, target)) apply()
                else reject()
              }
              else reject()
            }
            else reject()
          }
        }))
      }
    })
  })

  function isTrustedDomain(domain) {
    const normalizedDomain = domain.toLowerCase().replace(/\.$/, '')
    const hostname = normalizedDomain.split(':')[0]

    return (
      hostname.endsWith('.pilaproject.org') ||
      [
        'dev.gforcesolution.com',
        'pila.gforcesolution.com',
        'tags.knowlearning.systems',
        'f74e9cb3-2b53-4c85-9b0c-f1d61b032b3f.localhost:9896',
        'f74e9cb3-2b53-4c85-9b0c-f1d61b032b3f.localhost:9898',
        'c0f3a481-d4d5-4133-a198-94a325aa4536.localhost:9898',
        '0c9c64fc-559e-40d4-916b-852f6d108a17.localhost:9898',
        'c0f3a481-d4d5-4133-a198-94a325aa4536.localhost:6061',
        '0c9c64fc-559e-40d4-916b-852f6d108a17.localhost:6061'
      ].includes(normalizedDomain)
    )
  }

  function isPILAPartition(partition) {
    return [
      'PILA',
      'PILA Thailand',
      'PILA Thailand Development',
      'PILA Cambodia',
      'PILA Testing',
      'PILA Tag Hierarchy',
      'PILA Poland RCT 2025',
      'PILA France RCT 2025',
      'PILA UI Development',
      'PILA Germany RCT 2026',
      'PILA Netherlands RCT 2026',
      'PILA Latvia RCT 2026',
      'PILA Slovakia RCT 2026'
    ].includes(partition)
  }

  function isSuperAdmin(partition, user) {
    if (isPILAPartition(partition)) {
      return [
        "f74e9cb3-2b53-4c85-9b0c-f1d61b032b3f",
        "c0f3a481-d4d5-4133-a198-94a325aa4536",
        "0c9c64fc-559e-40d4-916b-852f6d108a17", // OLD MATT
        "aabc6c9c-a4f8-405b-9de3-76588997d52f"  // EDU PILA
      ].includes(user)
    }
    else return false
  }

  function isRCTBucketTag(tag) {
    return [
      '41ad5640-ab69-11f0-b8c9-a1d0807d9f84', // Control
      '472a84d0-ab69-11f0-b8c9-a1d0807d9f84', // Treatment
      'b7589b90-adec-11f0-954c-d1e98d074ab4'  // Opt-Out
    ].includes(tag)
  }

  async function isAdmin(partition, user) {
    return (
      isSuperAdmin(partition, user) ||
      await hasTag(partition, ADMIN_TAG, user)
    )
  }

  async function isTrainer(partition, user) {
    return (
      await isAdmin(partition, user) ||
      await hasTag(partition, TRAINER_TAG, user)
    )
  }

  async function hasTag(partition, tag, user) {
    const tagging = await Agent.query('tagging-for-target', [partition, tag, user])
    return !!tagging?.[0]
  }

  async function applyTagging(partition, tag, target, contributor, value, context) {
    const taggingPathParts = [partition, tag, target]
    if (context) taggingPathParts.push(context)
    const id = `tagging/${JSON.stringify(taggingPathParts)}`
    const tagging = await Agent.state(id)
    const md = await Agent.metadata(id)

    if (md.active_type !== TAGGING_TYPE) md.active_type = TAGGING_TYPE

    //  TODO: consider making 'authority' the agent that specified contributor
    const taggingData = {
      tag,
      target,
      contributor,
      partition,
      value,
      context
    }

    Object.assign(tagging, taggingData)
  }

  async function ownsTarget(user, target) {
    const metadata = await Agent.metadata(target)
    return metadata.owner === user
  }
