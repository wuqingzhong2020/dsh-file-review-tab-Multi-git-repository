/**
 * File-review-tab plugin, browser half: TWO coexisting surfaces over the same
 * produced-file vocabulary —
 *
 * 1. the chat turn-tail row (the original dsh-file-review card: "Edited N
 *    files · +M -K / Undo / Review"), registered into the
 *    'conversation.chat.turnTail' list under its own id, alongside the built-in
 *    changed-files entry (the native deliverables registry stays enabled); and
 * 2. the native 'file-review' right-sidebar tab (per-session change list + inline
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
import type {} from '@deepseek-ai/dsh-client-ui-sidebar-right/client'
import type { ISessions } from '@deepseek-ai/dsh-api-session-controller/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol'
import type { FileReviewRequest, FileReviewResult } from '../change-types.ts'
import { TYPERT_REMOTE } from '../remote.ts'
import { registerNativeSidebar } from './native-sidebar.ts'
import { openReviewTab } from './sidebar-navigation.ts'
import { ProducedFiles } from './ProducedFiles.tsx'
import { attachLocale, en, LOCALE_NS, zh } from './locales.ts'
import { en as chatEn, NS as CHAT_NS, zh as chatZh, type DeliverablesKey } from './chat-locales.ts'
import { deliverablesDefinition, selectProducedFiles } from './turn-deliverables.ts'
import { registerReviewEnhancements } from './review-enhancements.tsx'

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
  'sidebarRight',
  'sidebarRightTabs',
  'sessions',
  'locale',
  'remote',
  'slots',
  'uiConversation',
  'conversation',
]

interface FileReviewRemote {
  status(request: FileReviewRequest): Promise<RemoteResult<FileReviewResult>>
  apply(request: FileReviewRequest): Promise<RemoteResult<FileReviewResult>>
}

/**
 * Client plugin body: attach locale, mount the Typert remote, register the
 * chat turn-tail row AND the sidebar tab.
 * @param ctx - client root context.
 */
export function apply(ctx: Context): void {
  ctx.effect(() => attachLocale(ctx.locale), 'file-review-tab: follow host language')
  ctx.effect(() => {
    const offZh = ctx.locale.register(LOCALE_NS, 'zh', zh)
    const offEn = ctx.locale.register(LOCALE_NS, 'en', en)
    return () => {
      offZh()
      offEn()
    }
  }, 'file-review-tab: tab dictionaries')

  ctx.effect(
    () => ctx.locale.register(CHAT_NS, { zh: chatZh, en: chatEn }),
    'file-review-tab: chat dictionaries',
  )

  ctx.effect(() => {
    let disposed = false
    let disposeRemote: (() => Promise<void>) | undefined
    void ctx.remote
      .$mount(TYPERT_REMOTE)
      .then(dispose => {
        if (disposed) void dispose()
        else disposeRemote = dispose
      })
      .catch((error: unknown) => {
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
  // instead of) the built-in changes card and other sidebar contributions.
  ctx.effect(
    () =>
      ctx.slots.inject('conversation.chat.turnTail', () =>
        ctx.slots.register(
          {
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
                openInSidebarTab: (paths: readonly string[], turn?: number) => {
                  openReviewTab(ctx.sidebarRight, sessionId, paths, turn)
                },
              }
            },
          },
          ({
            turn,
            seq,
            openFile,
            projectRoot,
            inspectChanges,
            applyChanges,
            openInSidebarTab,
            t,
          }) => {
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
          },
        ),
      ),
    'file-review-tab: turn-tail row',
  )

  ctx.effect(() => registerNativeSidebar(ctx), 'file-review-tab: native sidebar')
  registerReviewEnhancements(ctx)
}
