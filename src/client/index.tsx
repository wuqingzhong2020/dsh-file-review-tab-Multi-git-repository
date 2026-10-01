/**
 * File-review-tab plugin, browser half: TWO coexisting surfaces over the same
 * produced-file vocabulary —
 *
 * 1. the chat turn-tail row (the original dsh-file-review card: "Edited N
 *    files · +M -K / Undo / Review"), registered into the
 *    'conversation.chat.turnTail' list under its own id, alongside the built-in
 *    changed-files entry (the native deliverables registry stays enabled); and
 * 2. the 'file-review' better-sidebar tab (per-session change list + inline
 *    red/green diffs + per-turn/per-file undo).
 *
 * The Host half's undo/redo capability reaches both surfaces through the
 * package's Typert remote contribution, mounted here exactly like
 * dsh-file-review did. Every registration is wrapped in ctx.effect so fiber
 * disposal (HMR / plugin disable) unregisters cleanly.
 */
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import type {} from '@deepseek-ai/dsh-api-session-controller/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-chat/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from 'dsh-better-sidebar/client/service'
import type { ISessions } from '@deepseek-ai/dsh-api-session-controller/client'
import type { ConversationSnapshot } from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol'
import type { TabDescriptor } from 'dsh-better-sidebar/client/service'
import type { FileReviewRequest, FileReviewResult } from '../change-types.ts'
import { TYPERT_REMOTE } from '../remote.ts'
import { FileReviewTab } from './FileReviewTab.tsx'
import { ProducedFiles } from './ProducedFiles.tsx'
import { normalizeSnapshot } from './snapshot-compat.ts'
import { attachLocale, en, LOCALE_NS, t, zh } from './locales.ts'
import { publishFileReviewSeed } from './deep-link.ts'
import {
  en as chatEn, NS as CHAT_NS, zh as chatZh, type DeliverablesKey,
} from './chat-locales.ts'
import { countChangedFiles, deriveSessionChanges, splitArchivedTurns } from './session-changes.ts'
import {
  deliverablesDefinition, selectProducedFiles,
} from './turn-deliverables.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Turn-tail row copy (the chat-side surface). */
    'file-review': DeliverablesKey
  }
}

/**
 * Required services: the sidebar registry, session snapshots, locale, remote,
 * and the slot registry (turn-tail list). The plugin-owned Conversation
 * Definition uses its own key so it can coexist with DSH 0.2's built-in
 * `deliverables` definition and `chatFileMentions` service.
 */
export const inject = [
  'betterSidebar',
  'sessions',
  'locale',
  'remote',
  'slots',
  'uiConversation',
]

/** The tab icon: a modest line-diff glyph drawn at the host-given size. */
function FileReviewIcon({ size }: { readonly size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5.25 2.75h6l3.5 3.5v10a1 1 0 0 1-1 1h-8.5a1 1 0 0 1-1-1V3.75a1 1 0 0 1 1-1Z" />
      <path d="M11.25 2.75v3.5h3.5" />
      <path d="M7 10h2.5M10.5 10H12M7 13h5" />
    </svg>
  )
}

interface FileReviewRemote {
  status(request: FileReviewRequest): Promise<RemoteResult<FileReviewResult>>
  apply(request: FileReviewRequest): Promise<RemoteResult<FileReviewResult>>
}

/**
 * The tab-strip badge: the number of distinct files this session changed.
 * The sidebar re-renders the tab bar constantly (and streams publish a fresh
 * snapshot reference per event), so the derivation is memoized by a cheap
 * structural fingerprint per session — streaming token flushes keep the
 * fingerprint stable and skip the full re-derive.
 */
const badgeMemo = new Map<string, { fingerprint: string; count: number | null }>()

function snapshotFingerprint(snapshot: ConversationSnapshot | null): string {
  if (snapshot === null) return 'none'
  const view = normalizeSnapshot(snapshot)
  if (view === undefined) return 'none'
  let lastEnd = 0
  for (const endSeq of view.turnEnds.values()) lastEnd = endSeq
  return `${view.nodes.length}:${view.turnEnds.size}:${lastEnd}`
}

/** The slice of `ctx.uiConversation` the badge needs. */
interface BadgeConversationFace {
  binding(id: SessionId): { readonly snapshot: { getSnapshot(): ConversationSnapshot } }
}

function badgeCount(ctx: Context, sessionId: string): number | null {
  // DSH 0.2: the Conversation projection lives on the uiConversation
  // binding, not on the Session face (whose snapshot is session lifecycle).
  const uiConversation = (ctx as unknown as { get(name: string): unknown })
    .get('uiConversation') as BadgeConversationFace | undefined
  let snapshot: ConversationSnapshot | null = null
  try {
    snapshot = uiConversation?.binding(sessionId as SessionId).snapshot.getSnapshot() ?? null
  } catch {
    // No binding yet: no badge rather than a thrown tab-bar render.
    return null
  }
  const fingerprint = snapshotFingerprint(snapshot)
  const hit = badgeMemo.get(sessionId)
  if (hit !== undefined && hit.fingerprint === fingerprint) return hit.count
  // The badge counts the MAIN list only — auto-archived turns already read
  // their review and left the tab's active section (issue #5).
  const { main } = splitArchivedTurns(deriveSessionChanges(snapshot))
  const count = countChangedFiles(main)
  const value = count === 0 ? null : count
  badgeMemo.set(sessionId, { fingerprint, count: value })
  return value
}

/**
 * Client plugin body: attach locale, mount the Typert remote, register the
 * chat turn-tail row AND the sidebar tab.
 * @param ctx - client root context.
 */
export function apply(ctx: Context): void {
  attachLocale(ctx.locale)
  ctx.effect(() => {
    const offZh = ctx.locale.register(LOCALE_NS, 'zh', zh)
    const offEn = ctx.locale.register(LOCALE_NS, 'en', en)
    return () => { offZh(); offEn() }
  }, 'file-review-tab: tab dictionaries')

  ctx.effect(
    () => ctx.locale.register(CHAT_NS, { zh: chatZh, en: chatEn }),
    'file-review-tab: chat dictionaries',
  )

  ctx.effect(() => {
    let disposed = false
    let disposeRemote: (() => Promise<void>) | undefined
    void ctx.remote.$mount(TYPERT_REMOTE).then((dispose) => {
      if (disposed) void dispose()
      else disposeRemote = dispose
    }).catch((error: unknown) => {
      console.error('[dsh-file-review-tab-multi-git-repository] remote mount error:', error)
    })
    return () => {
      disposed = true
      if (disposeRemote !== undefined) void disposeRemote()
    }
  }, 'file-review-tab: typert remote')

  // Plugin-owned Turn data uses a separate key from DSH 0.2's built-in
  // `deliverables` definition and its native file-mention service.
  ctx.effect(
    () => ctx.uiConversation.events.register(deliverablesDefinition),
    'file-review-tab: deliverables definition',
  )

  // DSH 0.2 exposes an ordered list: our review action lives alongside (not
  // instead of) the built-in changes card and better-sidebar contributions.
  ctx.effect(
    () => ctx.slots.inject('conversation.chat.turnTail', () => ctx.slots.register({
      name: 'conversation.chat.turnTail',
      id: 'dsh-file-review-tab-multi-git-repository',
      order: 110,
      locale: CHAT_NS,
      registrant: 'dsh-file-review-tab-multi-git-repository',
      inject: (sessionId: string) => {
        const sessions = (ctx as unknown as { readonly sessions: ISessions }).sessions
        const projectRoot = sessions.list.getSnapshot().byId[sessionId as SessionId]?.cwd
        const invoke = async (
          method: 'status' | 'apply',
          request: FileReviewRequest,
        ): Promise<FileReviewResult> => {
          const scope = sessions.scope(sessionId as SessionId)
          if (scope === undefined) throw new Error('Session is unavailable')
          // Session scopes are minted by the client runtime and cannot
          // statically inject namespaces contributed later by feature plugins.
          // `get()` is the Cordis escape hatch for an explicitly mounted
          // dynamic service; tracing still binds the Remote call to this
          // Session scope.
          const fileReview = scope.get('remote.fileReview') as FileReviewRemote | undefined
          if (fileReview === undefined) throw new Error('File review Remote is unavailable')
          const result = await fileReview[method](request)
          if (!result.ok) throw new Error(result.error.message)
          return result.value
        }
        return {
          projectRoot,
          inspectChanges: (request: FileReviewRequest) => invoke('status', request),
          applyChanges: (request: FileReviewRequest) => invoke('apply', request),
          // 审查 button / per-file chip: publish the target through the
          // plugin's own seed channel, then open (or focus) the sidebar tab by
          // type. better-sidebar 0.24.1 preserves an already-open tab's meta;
          // the seed channel reliably delivers repeated links to that tab. The native
          // open still reveals the right panel (revealIfOpened), and the
          // mounted/existing tab replays the newest seed.
          openInSidebarTab: (paths: readonly string[], turn?: number) => {
            const sidebar = ctx.betterSidebar
            if (sidebar === undefined || paths.length === 0) return
            publishFileReviewSeed(sessionId, paths, turn)
            const scope = { sessionId, ...(projectRoot !== undefined ? { cwd: projectRoot } : {}) }
            sidebar.openTab({ type: 'file-review' }, scope)
          },
        }
      },
    }, ({ turn, seq, openFile, projectRoot, inspectChanges, applyChanges, openInSidebarTab, t }) => {
      const matched = selectProducedFiles({ turn, seq, openFile })
      return matched === null ? null : (
        <ProducedFiles
          matched={matched}
          turn={turn}
          openFile={openFile}
          projectRoot={projectRoot}
          inspectChanges={inspectChanges}
          applyChanges={applyChanges}
          openInSidebarTab={openInSidebarTab}
          t={t}
        />
      )
    })),
    'file-review-tab: turn-tail row',
  )

  ctx.effect(() => ctx.betterSidebar.registerTab({
    id: 'file-review',
    title: () => t('tabTitle'),
    icon: (size: number) => <FileReviewIcon size={size} />,
    order: 35,
    single: true,
    badge: (badgeCtx, scope) => badgeCount(badgeCtx as unknown as Context, scope.sessionId),
    component: ({ ctx: tabCtx, scope, visible, tab }) => (
      <FileReviewTab
        ctx={tabCtx as unknown as Context}
        sessionId={scope.sessionId}
        cwd={scope.cwd}
        visible={visible}
        tab={tab}
      />
    ),
  } satisfies TabDescriptor), 'file-review-tab: register tab')
}
